"""
GeoSanket NLP extractor — turns unstructured government press-release text
into the structured project schema used by the admin panel.

Hybrid pipeline:
  1. Rule/pattern layer  (money, percentages, titles, schemes, departments)
  2. Lexicon layer       (known schemes, agencies, project-type keywords)
  3. Context scoring     (sanctioned-vs-spent, completion-vs-other-percent)
Each field returns a value and a confidence score.
"""
import re
from typing import Optional

UNITS = {
    "crore": 1e7, "cr": 1e7, "lakh": 1e5, "lac": 1e5,
    "million": 1e6, "mn": 1e6, "billion": 1e9, "bn": 1e9, "thousand": 1e3,
    # Hindi / Marathi units
    "करोड़": 1e7, "करोड": 1e7, "लाख": 1e5, "हज़ार": 1e3, "हजार": 1e3,
}

MONEY = re.compile(
    r"(?:₹|Rs\.?|INR|रु\.?|रुपये)\s*(\d[\d,]*(?:\.\d+)?)\s*(crore|cr|lakh|lac|million|mn|billion|bn|thousand|करोड़|करोड|लाख|हज़ार|हजार)?\b"
    r"|(\d[\d,]*(?:\.\d+)?)\s*(crore|lakh|करोड़|करोड|लाख)s?\s*(?:rupees|रुपये)?",
    re.I,
)
SPENT_KW = ("spent", "incurred", "utilised", "utilized", "expenditure", "disbursed", "released", "खर्च", "व्यय")
SANC_KW = ("sanctioned", "allocated", "approved", "estimated", "budget", "cost", "outlay", "worth", "investment", "स्वीकृत", "लागत", "बजट", "राशि")

PERCENT = re.compile(r"(\d{1,3}(?:\.\d+)?)\s*(?:%|per\s?cent|percent|प्रतिशत|फीसदी)", re.I)
PROGRESS_KW = ("complete", "completion", "done", "progress", "finished", "work", "construction", "physical", "पूर्ण", "पूरा", "प्रगति", "निर्माण")

TITLES = (
    r"(?:Deputy Chief Minister|Chief Minister|Prime Minister|Union Minister|Minister of State|"
    r"Lieutenant Governor|Governor|Mayor|Minister|Chairman|Commissioner|Secretary|Director|MLA|MP)"
)
NAME = r"((?:(?:Shri|Smt\.?|Dr\.?|Mr\.?|Ms\.?|Mrs\.?|Sh\.?)\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})"
LEADER_A = re.compile(rf"\b({TITLES}(?:\s+of\s+[A-Z][a-z]+)?),?\s+{NAME}")
LEADER_B = re.compile(rf"{NAME},\s+(?:the\s+)?({TITLES}(?:\s+of\s+[A-Z][a-z]+)?)")

KNOWN_SCHEMES = [
    "Pradhan Mantri Awas Yojana", "PMAY", "Smart Cities Mission", "AMRUT", "Swachh Bharat",
    "Ayushman Bharat", "PM Gati Shakti", "Bharatmala", "Sagarmala", "Jal Jeevan Mission",
    "Samagra Shiksha", "Digital India", "UDAN", "PMGSY", "Namami Gange", "Mohalla Clinic",
    "Atal Mission", "Mission Karmayogi", "Khelo India", "Make in India",
]
SCHEME_RX = re.compile(
    r"(?:under|via|through|as part of)\s+(?:the\s+)?((?:[A-Z][\w\-&]*\s+){1,6}?)"
    r"((?i:scheme|yojana|mission|abhiyan|programme|program|initiative))\b"
)

DEPT_RX = re.compile(
    r"((?:Department|Ministry|Directorate)\s+of\s+[A-Z][\w&]*(?:\s*(?:&|and|of)?\s*[A-Z][\w&]*){0,4})"
)
DEPT_RX2 = re.compile(r"((?:[A-Z][a-z]+\s+){1,3}Department)\b")
AGENCIES = ["PWD", "DMRC", "MCD", "NHAI", "CPWD", "DDA", "DJB", "NDMC", "BRO", "RVNL", "NBCC", "DSIIDC", "AIIMS"]

NAME_RX = re.compile(
    r"((?:(?:[A-Z0-9][\w&.'\-]*|of|and|&)\s+){0,6}"
    r"(?:Trauma Centre|Trauma Center|Medical College|Hospital|Flyover|Underpass|Bridge|Metro Station|"
    r"Railway Station|Station|School|College|University|Stadium|Park|Expressway|Highway|Road|Airport|"
    r"Terminal|Plant|Corridor|Centre|Center|Complex|Dam|Canal|Market))"
    r"(?:\s+(?:Expansion|Extension|Upgradation|Project))?"
)

TYPE_KW = [
    ("hospital", ("hospital", "trauma", "medical", "clinic", "aiims", "dispensary")),
    ("bridge", ("bridge", "flyover", "underpass", "overbridge")),
    ("road", ("road", "highway", "expressway", "corridor")),
    ("college", ("school", "college", "university", "campus", "institute")),
    ("park", ("park", "garden", "stadium", "playground")),
    ("water", ("water", "pipeline", "sewage", "sewer", "stp", "dam", "canal", "drain")),
]

IN_PROGRESS_RX = re.compile(r"under construction|in progress|ongoing|will be completed|to be completed|expected to be (?:completed|ready)|being (?:built|constructed)|निर्माणाधीन|प्रगति पर|पूरा होगा", re.I)
PLANNED_RX = re.compile(r"\bproposed\b|\bplanned\b|to be built|will be built|\bapproved for\b|प्रस्तावित|योजना", re.I)
COMPLETED_RX = re.compile(r"inaugurat|\bcompleted\b|\bopened\b|dedicated to the nation|commissioned|handed over|उद्घाटन|पूर्ण|पूरा हुआ|लोकार्पित", re.I)
YEAR_RX = re.compile(r"\b(?:in|by|since|during)\s+((?:19|20)\d{2})\b")


def _money_items(text):
    out = []
    for m in MONEY.finditer(text):
        num = m.group(1) or m.group(3)
        unit = (m.group(2) or m.group(4) or "").lower()
        val = float(num.replace(",", "")) * UNITS.get(unit, 1)
        out.append((m.start(), m.end(), val))
    return out


def _classify_money(text, items):
    sanctioned = spent = None
    for s, e, val in items:
        pre = text[max(0, s - 60):s].lower()
        post = text[e:e + 45].lower()
        best_kind, best_pos = None, -1
        if any(k in post[:30] for k in SPENT_KW):
            best_kind, best_pos = "spent", 10**6
        for kw in SPENT_KW:
            p = pre.rfind(kw)
            if p > best_pos: best_kind, best_pos = "spent", p
        for kw in SANC_KW:
            p = pre.rfind(kw)
            if p > best_pos: best_kind, best_pos = "sanc", p
        if best_kind is None:
            if any(k in post for k in SPENT_KW): best_kind = "spent"
            else: best_kind = "sanc"
        if best_kind == "spent" and spent is None: spent = val
        elif best_kind == "sanc" and sanctioned is None: sanctioned = val
    if sanctioned is None and items and spent is None:
        sanctioned = items[0][2]
    return sanctioned, spent


def _completion(text):
    for m in PERCENT.finditer(text):
        ctx = text[max(0, m.start() - 70):m.end() + 70].lower()
        if any(k in ctx for k in PROGRESS_KW):
            v = float(m.group(1))
            if 0 <= v <= 100:
                return v
    return None


def _leader(text):
    m = LEADER_A.search(text)
    if m:
        return m.group(2).strip(), m.group(1).strip(), 0.9
    m = LEADER_B.search(text)
    if m:
        return m.group(1).strip(), m.group(2).strip(), 0.85
    return None, None, 0.0


def _scheme(text):
    low = text.lower()
    for s in KNOWN_SCHEMES:
        if s.lower() in low:
            m = SCHEME_RX.search(text)
            if m and s.lower() in (m.group(1) + m.group(2)).lower():
                full = (m.group(1) + (m.group(2) if m.group(2).lower() in ("mission", "yojana", "abhiyan") else "")).strip()
                return full, 0.95
            return s, 0.95
    m = SCHEME_RX.search(text)
    if m:
        kw = m.group(2)
        name = m.group(1).strip()
        if kw.lower() in ("mission", "yojana", "abhiyan"):
            name = f"{name} {kw.capitalize()}"
        return name, 0.75
    return None, 0.0


def _department(text):
    m = DEPT_RX.search(text)
    if m:
        return m.group(1).strip().rstrip(".,"), 0.9
    m = DEPT_RX2.search(text)
    if m:
        return m.group(1).strip(), 0.7
    for a in AGENCIES:
        if re.search(rf"\b{a}\b", text):
            return a, 0.6
    return None, 0.0


def _project_name(text):
    m = NAME_RX.search(text)
    if not m:
        return None, 0.0
    name = re.sub(r"^(?:(?:The|A|An|of|and|&)\s+)+", "", m.group(0).strip())
    return name, 0.8


def _type(text, name):
    low = (name or "").lower() + " " + text.lower()
    for t, kws in TYPE_KW:
        if any(re.search(rf"\b{k}", low) for k in kws):
            return t
    return "other"


def _status(text, pct):
    if IN_PROGRESS_RX.search(text): return "in_progress"
    if PLANNED_RX.search(text): return "planned"
    if COMPLETED_RX.search(text): return "completed"
    if pct is not None: return "completed" if pct >= 100 else "in_progress"
    return "in_progress"


def extract(text: str) -> dict:
    text = re.sub(r"\s+", " ", text).strip()
    name, c_name = _project_name(text)
    items = _money_items(text)
    sanctioned, spent = _classify_money(text, items)
    pct = _completion(text)
    leader, designation, c_lead = _leader(text)
    scheme, c_sch = _scheme(text)
    dept, c_dep = _department(text)
    ptype = _type(text, name)
    status = _status(text, pct)
    if pct is None and status == "completed":
        pct = 100.0
    y = YEAR_RX.search(text)

    fields = {
        "name": name,
        "projectType": ptype,
        "budgetSanctioned": sanctioned,
        "budgetSpent": spent,
        "completionPercentage": pct,
        "status": status,
        "leaderName": leader,
        "leaderDesignation": designation,
        "scheme": scheme,
        "department": dept,
        "year": int(y.group(1)) if y else None,
    }
    confidence = {
        "name": c_name,
        "projectType": 0.85 if ptype != "other" else 0.4,
        "budgetSanctioned": 0.9 if sanctioned is not None else 0.0,
        "budgetSpent": 0.85 if spent is not None else 0.0,
        "completionPercentage": 0.9 if pct is not None else 0.0,
        "status": 0.8,
        "leaderName": c_lead,
        "scheme": c_sch,
        "department": c_dep,
    }

    cr = (sanctioned or 0) / 1e7
    body_parts = []
    if sanctioned: body_parts.append(f"₹{cr:.0f} Cr")
    # Add a check so it doesn't break if only Hindi text is provided
    if pct is not None: body_parts.append(f"{pct:.0f}% complete")
    if leader: body_parts.append(leader)
    form_fields = {
        "nameEn": name or "",
        "projectType": ptype,
        "leaderName": leader or "",
        "leaderDesignation": designation or "",
        "budgetSanctioned": f"{cr:.2f}".rstrip("0").rstrip(".") if sanctioned else "",
        "budgetSpent": f"{(spent or 0) / 1e7:.2f}".rstrip("0").rstrip(".") if spent else "",
        "completionPercentage": int(round(pct)) if pct is not None else 0,
        "status": status,
        "scheme": scheme or "",
        "department": dept or "",
        "notifTitleEn": name or "",
        "notifBodyEn": " · ".join(body_parts),
    }
    return {"fields": fields, "confidence": confidence, "formFields": form_fields}
