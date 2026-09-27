import os
import json
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from backend.app.models.schemas import (
    TextInput, SearchQueryInput, SimilarityInput, NegationInput,
    EntityResponse, SymptomResponse, MedicineResponse, AssociationResponse,
    SearchResultItem, SimilarDocItem, SummaryResponse, AnalysisResponse
)
from backend.app.services.ner import biomedical_ner
from backend.app.services.symptom import symptom_extractor
from backend.app.services.medicine import medicine_extractor
from backend.app.services.negation import negation_detector
from backend.app.services.relation import relation_service
from backend.app.services.similarity import similarity_service
from backend.app.services.retrieval import retrieval_service
from backend.app.services.summarization import summarizer
from backend.app.services.evaluation import evaluation_engine

router = APIRouter()

DISCLAIMER = "Educational NLP research prototype. Outputs are NLP-derived associations based on corpus statistics and not medical advice, diagnosis, or treatment recommendations. Do not enter personally identifiable or confidential patient information."

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_clinical_text(payload: TextInput):
    """
    Unified end-to-end NLP intelligence pipeline:
    1. Extractive Summarization
    2. Hybrid Gazetteer/Rule-Based Biomedical NER (Disease, Symptom, Chemical, Medicine, Procedure)
    3. Clinical Negation Detection (NegEx)
    4. Symptom Extraction & Categorization
    5. Medicine Candidate & Dosage Extraction
    6. Symptom-Disease Literature Association (PMI / Corpus Co-occurrence)
    7. Document Similarity against PubMed Corpus (TF-IDF + LSA)
    8. Contextual Biomedical IR Retrieval (BM25)
    """
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
        
    model_type = payload.model_type or "hybrid_gazetteer_ner"
    
    # 1. Summarization
    sum_res = summarizer.summarize(text)
    
    # 2. NER with Negation
    entities = biomedical_ner.extract_entities(text, model_type=model_type)
    
    # 3. Symptoms
    symptoms = symptom_extractor.extract_symptoms(text)
    
    # 4. Medicines & Dosages
    medicines = medicine_extractor.extract_medicines(text)
    
    # 5. Symptom-Disease Associations
    associations = relation_service.get_associations(symptoms)
    
    # 6. Similar Documents (TF-IDF + LSA)
    similar_docs = similarity_service.find_similar_documents(text, method="tfidf_lsa", top_k=5)
    
    # 7. Medical Information Retrieval Query Construction
    active_terms = [s["canonical_name"] for s in symptoms if s["status"] == "PRESENT"]
    active_chems = [m["text"] for m in medicines if m["type"] == "MEDICINE/CHEMICAL"]
    active_dis = [e["entity"] for e in entities if e["type"] == "DISEASE" and e["status"] == "PRESENT"]
    
    query_parts = active_terms + active_chems + active_dis
    if not query_parts:
        query_parts = [e["entity"] for e in entities[:3]]
    if not query_parts:
        query_parts = ["fever", "cough", "respiratory", "infection"]
        
    search_query = " ".join(query_parts)
    search_res = retrieval_service.search(search_query, method="bm25", top_k=5)
    
    return {
        "input_text": text,
        "summary": sum_res,
        "entities": entities,
        "symptoms": symptoms,
        "medicines": medicines,
        "associations": associations,
        "similar_documents": similar_docs,
        "search_results": search_res,
        "search_query_used": search_query,
        "safety_disclaimer": DISCLAIMER
    }

@router.post("/ner", response_model=List[EntityResponse])
def extract_ner(payload: TextInput):
    entities = biomedical_ner.extract_entities(payload.text, model_type=payload.model_type or "hybrid_gazetteer_ner")
    return entities

@router.post("/symptoms", response_model=List[SymptomResponse])
def extract_symptoms(payload: TextInput):
    return symptom_extractor.extract_symptoms(payload.text)

@router.post("/medicines", response_model=List[MedicineResponse])
def extract_medicines(payload: TextInput):
    return medicine_extractor.extract_medicines(payload.text)

@router.post("/negation")
def detect_negation(payload: NegationInput):
    res = negation_detector.detect_negation(payload.text, payload.entity)
    return res

@router.post("/relations", response_model=List[AssociationResponse])
def get_symptom_disease_relations(payload: TextInput):
    text = payload.text.strip()
    symptoms = symptom_extractor.extract_symptoms(text)
    if not symptoms and text:
        symptoms = [{
            "text": text,
            "canonical_name": text.title(),
            "category": "General",
            "severity_weight": 1.0,
            "start": 0,
            "end": len(text),
            "type": "SYMPTOM",
            "status": "PRESENT",
            "negation_cue": None,
            "confidence": 0.85
        }]
    return relation_service.get_associations(symptoms)

@router.get("/symptom-associations/{symptom_name}")
def lookup_symptom_associations(symptom_name: str):
    return relation_service.lookup_symptom(symptom_name)

@router.post("/search", response_model=List[SearchResultItem])
def search_corpus(payload: SearchQueryInput):
    return retrieval_service.search(payload.query, method=payload.method or "bm25", top_k=payload.top_k or 5)

@router.post("/similarity", response_model=List[SimilarDocItem])
def compute_similarity(payload: SimilarityInput):
    return similarity_service.find_similar_documents(payload.text, method=payload.method or "tfidf_lsa", top_k=payload.top_k or 5)

@router.post("/summarize", response_model=SummaryResponse)
def summarize_text(payload: TextInput):
    return summarizer.summarize(payload.text)

@router.post("/evaluate")
def run_evaluation():
    metrics = evaluation_engine.run_all_evaluations()
    return metrics

@router.get("/metrics")
def get_cached_metrics():
    metrics_path = "results/metrics.json"
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return evaluation_engine.run_all_evaluations()

@router.get("/stats")
def get_dataset_stats():
    stats_path = "results/dataset_statistics.json"
    if os.path.exists(stats_path):
        with open(stats_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Dataset statistics not found. Please run preprocessing first.")
