import os
import json
import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD

class DocumentSimilarityService:
    """
    Biomedical document similarity service using TF-IDF and TF-IDF + LSA (TruncatedSVD).
    """
    def __init__(self, corpus_path: str = "data/processed/corpus/biomedical_corpus.json"):
        self.corpus_path = corpus_path
        self.corpus_docs = []
        self.doc_texts = []
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.svd_model = None
        self.lsa_embeddings = None
        self.initialize_models()
        
    def initialize_models(self):
        if not os.path.exists(self.corpus_path):
            return
            
        with open(self.corpus_path, 'r', encoding='utf-8') as f:
            self.corpus_docs = json.load(f)
            
        self.doc_texts = [d.get("text", "") for d in self.corpus_docs]
        if not self.doc_texts:
            return
            
        # Method 1: TF-IDF Vectorizer
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=15000
        )
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.doc_texts)
        
        # Method 2: TF-IDF + LSA (Latent Semantic Analysis via TruncatedSVD)
        n_components = min(128, len(self.doc_texts) - 1)
        self.svd_model = TruncatedSVD(n_components=n_components, random_state=42)
        self.lsa_embeddings = self.svd_model.fit_transform(self.tfidf_matrix)
        norms = np.linalg.norm(self.lsa_embeddings, axis=1, keepdims=True) + 1e-9
        self.lsa_embeddings = self.lsa_embeddings / norms
        
    def find_similar_documents(self, input_text: str, method: str = "tfidf_lsa", top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Finds top_k similar documents from the corpus using 'tfidf' or 'tfidf_lsa'.
        Scores are calculated dynamically.
        """
        if not input_text or not self.doc_texts or self.tfidf_vectorizer is None:
            return []
            
        if method in ["tfidf"]:
            query_vec = self.tfidf_vectorizer.transform([input_text])
            scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            method_label = "TF-IDF Cosine"
        else: # tfidf_lsa
            query_tfidf = self.tfidf_vectorizer.transform([input_text])
            query_lsa = self.svd_model.transform(query_tfidf)
            norm = np.linalg.norm(query_lsa) + 1e-9
            query_lsa = query_lsa / norm
            scores = np.dot(self.lsa_embeddings, query_lsa.T).flatten()
            method_label = "TF-IDF + LSA Similarity"
            
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        results = []
        for rank, idx in enumerate(top_indices, 1):
            doc = self.corpus_docs[idx]
            raw_score = float(scores[idx])
            calibrated_score = round(max(0.10, min(0.98, raw_score)), 2)
            
            snippet = doc.get("abstract", "") or doc.get("text", "")
            if len(snippet) > 160:
                snippet = snippet[:157] + "..."
                
            results.append({
                "rank": rank,
                "id": doc.get("id"),
                "pmid": doc.get("pmid"),
                "source": doc.get("source"),
                "title": doc.get("title", f"PubMed Article {doc.get('pmid')}"),
                "snippet": snippet,
                "full_text": doc.get("text", ""),
                "similarity_score": calibrated_score,
                "method": method_label
            })
            
        return results

# Singleton
similarity_service = DocumentSimilarityService()
