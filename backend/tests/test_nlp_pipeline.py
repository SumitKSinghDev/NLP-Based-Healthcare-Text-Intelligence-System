import os
import json
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.ner import biomedical_ner
from backend.app.services.symptom import symptom_extractor
from backend.app.services.medicine import medicine_extractor
from backend.app.services.negation import negation_detector
from backend.app.services.relation import relation_service
from backend.app.services.similarity import similarity_service
from backend.app.services.retrieval import retrieval_service
from backend.app.services.summarization import summarizer
from backend.app.services.evaluation import evaluation_engine

client = TestClient(app)

SAMPLE_CLINICAL_NOTE = (
    "The patient has fever, persistent cough and headache. "
    "No chest pain or shortness of breath. "
    "Paracetamol was prescribed."
)

def test_dataset_loading():
    """1. Test that processed dataset files exist and are valid JSON."""
    for ds_path in [
        "data/processed/bc5cdr/train.json",
        "data/processed/ncbi_disease/train.json",
        "data/processed/biored/train.json",
        "data/processed/corpus/biomedical_corpus.json"
    ]:
        assert os.path.exists(ds_path), f"Missing dataset file: {ds_path}"
        with open(ds_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            assert len(data) > 0

def test_bc5cdr_preprocessing_structure():
    """2. Test BC5CDR document structure."""
    with open("data/processed/bc5cdr/train.json", 'r', encoding='utf-8') as f:
        docs = json.load(f)
        sample = docs[0]
        assert "pmid" in sample
        assert "title" in sample
        assert "abstract" in sample
        assert "entities" in sample
        assert "relations" in sample

def test_ncbi_preprocessing_structure():
    """3. Test NCBI Disease document structure."""
    with open("data/processed/ncbi_disease/train.json", 'r', encoding='utf-8') as f:
        docs = json.load(f)
        sample = docs[0]
        assert "pmid" in sample
        assert "title" in sample
        assert "entities" in sample

def test_biored_preprocessing_structure():
    """4. Test BioRED document structure."""
    with open("data/processed/biored/train.json", 'r', encoding='utf-8') as f:
        docs = json.load(f)
        sample = docs[0]
        assert "pmid" in sample
        assert "entities" in sample
        assert "relations" in sample

def test_ner_output():
    """5. Test Hybrid Gazetteer NER extraction produces valid entities with spans and types."""
    entities = biomedical_ner.extract_entities(SAMPLE_CLINICAL_NOTE, model_type="hybrid_gazetteer_ner")
    assert len(entities) > 0
    types = [e["type"] for e in entities]
    assert "SYMPTOM" in types or "DISEASE" in types
    for e in entities:
        assert "start" in e and "end" in e
        assert "confidence" in e
        assert "status" in e

def test_symptom_extraction():
    """6. Test symptom extractor detects multi-word and single-word symptoms."""
    symptoms = symptom_extractor.extract_symptoms(SAMPLE_CLINICAL_NOTE)
    sym_texts = [s["text"].lower() for s in symptoms]
    assert "fever" in sym_texts
    assert "persistent cough" in sym_texts or "cough" in sym_texts
    assert "headache" in sym_texts
    status_map = {s["text"].lower(): s["status"] for s in symptoms}
    assert status_map.get("fever") == "PRESENT"
    if "chest pain" in status_map:
        assert status_map["chest pain"] == "NEGATED"

def test_medicine_extraction():
    """7. Test medicine extractor distinguishes chemicals and extracts candidates."""
    text = "Paracetamol 500 mg was prescribed orally twice daily."
    meds = medicine_extractor.extract_medicines(text)
    assert len(meds) > 0
    paracetamol = next((m for m in meds if "paracetamol" in m["text"].lower()), None)
    assert paracetamol is not None
    assert paracetamol["entity_category"] == "MEDICINE CANDIDATE"
    assert paracetamol.get("dosage") is not None or any(m["type"] == "DOSAGE" for m in meds)

def test_negation_detection():
    """8. Test transparent clinical NegEx negation detection."""
    neg1 = negation_detector.detect_negation("No chest pain or shortness of breath.", "chest pain")
    assert neg1["status"] == "NEGATED"
    assert neg1["cue"] == "no"
    
    pos1 = negation_detector.detect_negation("The patient has fever and cough.", "fever")
    assert pos1["status"] == "PRESENT"
    
    neg2 = negation_detector.detect_negation("Patient denies headache.", "headache")
    assert neg2["status"] == "NEGATED"
    assert "denies" in neg2["cue"]

def test_similarity():
    """9. Test TF-IDF and TF-IDF+LSA similarity return ranked documents with scores."""
    sims = similarity_service.find_similar_documents(SAMPLE_CLINICAL_NOTE, method="tfidf_lsa", top_k=3)
    assert len(sims) == 3
    assert all("similarity_score" in s for s in sims)
    assert sims[0]["similarity_score"] >= sims[1]["similarity_score"]

def test_retrieval():
    """10. Test BM25 and TF-IDF medical information retrieval."""
    results = retrieval_service.search("fever cough respiratory infection", method="bm25", top_k=3)
    assert len(results) == 3
    assert all("title" in r for r in results)
    assert all("score" in r for r in results)

def test_summarization():
    """11. Test extractive summarization."""
    res = summarizer.summarize(SAMPLE_CLINICAL_NOTE)
    assert "summary" in res
    assert len(res["summary"]) > 0
    assert "disclaimer" in res

def test_api_endpoints():
    """12. Test FastAPI endpoints end-to-end."""
    res = client.post("/api/analyze", json={"text": SAMPLE_CLINICAL_NOTE})
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "entities" in data
    assert "symptoms" in data
    assert "medicines" in data
    assert "associations" in data
    assert "similar_documents" in data
    assert "search_results" in data
    assert "safety_disclaimer" in data
    
    ner_res = client.post("/api/ner", json={"text": SAMPLE_CLINICAL_NOTE})
    assert ner_res.status_code == 200
    
    search_res = client.post("/api/search", json={"query": "fever cough infection", "method": "bm25", "top_k": 3})
    assert search_res.status_code == 200
    
    metrics_res = client.get("/api/metrics")
    assert metrics_res.status_code == 200
    
    stats_res = client.get("/api/stats")
    assert stats_res.status_code == 200
