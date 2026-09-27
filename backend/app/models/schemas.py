from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TextInput(BaseModel):
    text: str = Field(..., description="Clinical note, medical record, or biomedical text", min_length=1)
    model_type: Optional[str] = Field("hybrid_gazetteer_ner", description="hybrid_gazetteer_ner or dictionary_baseline")

class SearchQueryInput(BaseModel):
    query: str = Field(..., description="Medical search query", min_length=1)
    method: Optional[str] = Field("bm25", description="bm25 or tfidf")
    top_k: Optional[int] = Field(5, description="Number of results to return")

class SimilarityInput(BaseModel):
    text: str = Field(..., description="Document text to match against corpus", min_length=1)
    method: Optional[str] = Field("tfidf_lsa", description="tfidf_lsa or tfidf")
    top_k: Optional[int] = Field(5, description="Number of matches")

class NegationInput(BaseModel):
    text: str = Field(..., description="Context sentence or clinical text")
    entity: str = Field(..., description="Entity mention text")

class EntityResponse(BaseModel):
    entity: str
    type: str
    start: int
    end: int
    status: str
    negation_cue: Optional[str] = None
    confidence: float

class SymptomResponse(BaseModel):
    text: str
    canonical_name: str
    category: str
    severity_weight: float
    start: int
    end: int
    type: str
    status: str
    negation_cue: Optional[str] = None
    confidence: float

class MedicineResponse(BaseModel):
    text: str
    type: str
    entity_category: str
    generic_name: Optional[str] = None
    drug_class: Optional[str] = None
    atc_code: Optional[str] = None
    common_indications: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    start: int
    end: int
    status: str
    confidence: float

class AssociationResponse(BaseModel):
    symptom_entity: str
    status: str
    associated_diseases: str
    top_predictions: List[str]
    association_score: float
    confidence: float
    evidence_count: int
    disclaimer: str

class SearchResultItem(BaseModel):
    rank: int
    pmid: Optional[str] = None
    source: Optional[str] = None
    title: str
    snippet: str
    full_abstract: Optional[str] = None
    score: float
    method: str

class SimilarDocItem(BaseModel):
    rank: int
    id: Optional[str] = None
    pmid: Optional[str] = None
    source: Optional[str] = None
    title: str
    snippet: str
    full_text: Optional[str] = None
    similarity_score: float
    method: str

class SummaryResponse(BaseModel):
    summary: str
    selected_sentences: Optional[List[str]] = None
    sentence_count: int
    reduction_ratio: float
    disclaimer: str

class AnalysisResponse(BaseModel):
    input_text: str
    summary: SummaryResponse
    entities: List[EntityResponse]
    symptoms: List[SymptomResponse]
    medicines: List[MedicineResponse]
    associations: List[AssociationResponse]
    similar_documents: List[SimilarDocItem]
    search_results: List[SearchResultItem]
    search_query_used: str
    safety_disclaimer: str
