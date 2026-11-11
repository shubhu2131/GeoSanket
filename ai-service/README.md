# GeoSanket AI Service
FastAPI service that converts unstructured government text / PDFs into structured project records.

    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
    python evaluate.py          # dev-set metrics
    python -c "import evaluate; evaluate.run('holdout.json', True)"

Deploy (Render → New Web Service): Root Directory `ai-service`, Build `pip install -r requirements.txt`,
Start `uvicorn main:app --host 0.0.0.0 --port $PORT`, env `PYTHON_VERSION=3.11.9`.
