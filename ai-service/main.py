import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from extractor import extract

app = FastAPI(title="GeoSanket AI Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class ExtractRequest(BaseModel):
    text: str


@app.get("/")
def health():
    return {"status": "GeoSanket AI service running", "endpoints": ["POST /extract", "POST /extract-pdf"]}


@app.post("/extract")
def extract_text(req: ExtractRequest):
    text = req.text.strip()
    if len(text) < 20:
        raise HTTPException(400, "text must be at least 20 characters")
    return extract(text[:20000])


@app.post("/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Upload a .pdf file")
    data = await file.read()
    try:
        reader = PdfReader(io.BytesIO(data))
        text = "\n".join((p.extract_text() or "") for p in reader.pages[:15])
    except Exception as e:
        raise HTTPException(400, f"Could not read PDF: {e}")
    if len(text.strip()) < 20:
        raise HTTPException(422, "No extractable text in PDF (scanned image PDFs need OCR)")
    return extract(text[:20000])
