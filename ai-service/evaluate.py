"""
Field-level evaluation of the extractor against a labelled set.
Run:  python evaluate.py
Reports per-field precision / recall / F1 and overall micro-F1.
"""
import json
from extractor import extract

FIELDS = ["name", "projectType", "budgetSanctioned", "budgetSpent", "completionPercentage",
          "leaderName", "scheme", "department", "status"]


def norm(s): return " ".join(str(s).lower().replace(".", "").split())


def match(field, pred, gold):
    if field in ("budgetSanctioned", "budgetSpent"):
        return abs(pred - gold) <= 0.01 * gold
    if field == "completionPercentage":
        return abs(pred - gold) < 0.5
    if field in ("name", "leaderName", "scheme", "department"):
        p, g = norm(pred), norm(gold)
        return p == g or p in g or g in p
    return norm(pred) == norm(gold)


def run(path="dataset.json", verbose=False):
    data = json.load(open(path, encoding="utf-8"))
    stats = {f: {"tp": 0, "fp": 0, "fn": 0} for f in FIELDS}
    for i, row in enumerate(data):
        pred = extract(row["text"])["fields"]
        for f in FIELDS:
            g, p = row["gold"].get(f), pred.get(f)
            if g is None and p is None: continue
            if g is None: continue  # unlabelled field: not scored
            if p is None: stats[f]["fn"] += 1; 
            elif match(f, p, g): stats[f]["tp"] += 1
            else:
                stats[f]["fp"] += 1; stats[f]["fn"] += 1
                if verbose: print(f"  [doc {i}] {f}: predicted={p!r} gold={g!r}")
    print(f"\n{'Field':<22}{'Prec':>7}{'Rec':>7}{'F1':>7}{'Support':>9}")
    print("-" * 52)
    TP = FP = FN = 0
    for f, s in stats.items():
        tp, fp, fn = s["tp"], s["fp"], s["fn"]
        p = tp / (tp + fp) if tp + fp else 0
        r = tp / (tp + fn) if tp + fn else 0
        f1 = 2 * p * r / (p + r) if p + r else 0
        print(f"{f:<22}{p:>7.2f}{r:>7.2f}{f1:>7.2f}{tp + fn:>9}")
        TP += tp; FP += fp; FN += fn
    P = TP / (TP + FP) if TP + FP else 0
    R = TP / (TP + FN) if TP + FN else 0
    F = 2 * P * R / (P + R) if P + R else 0
    print("-" * 52)
    print(f"{'MICRO AVERAGE':<22}{P:>7.2f}{R:>7.2f}{F:>7.2f}{TP + FN:>9}")
    return F


if __name__ == "__main__":
    run(verbose=True)
