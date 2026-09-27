import os
import json
import re
import numpy as np
from typing import List, Dict, Any
from rank_bm25 import BM25Okapi
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class MedicalInformationRetrieval:
    def __init__(self, corpus_path: str = "data/processed/corpus/biomedical_corpus.json"):
        self.corpus_path = corpus_path
        self.corpus_docs = []
        self.tokenized_corpus = []
        self.bm25 = None
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.initialize_index()
        
    def tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b\w+\b', text) if len(w) > 1]
        
    def initialize_index(self):
        if not os.path.exists(self.corpus_path):
            return
            
        with open(self.corpus_path, 'r', encoding='utf-8') as f:
            self.corpus_docs = json.load(f)
            
        texts = [f"{d.get('title', '')} {d.get('abstract', '')}" for d in self.corpus_docs]
        self.tokenized_corpus = [self.tokenize(t) for t in texts]
        
        # Build BM25
        if self.tokenized_corpus:
            self.bm25 = BM25Okapi(self.tokenized_corpus)
            
        # Build TF-IDF
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=20000
        )
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(texts)
        
    def search(self, query: str, method: str = "bm25", top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves top_k relevant PubMed documents given a clinical/medical query.
        Returns Rank, Title, snippet, calibrated relevance score.
        """
        if not query or not self.corpus_docs or self.bm25 is None:
            return []
            
        query_tokens = self.tokenize(query)
        if not query_tokens:
            return []
            
        if method == "bm25":
            bm25_scores = self.bm25.get_scores(query_tokens)
            max_s = max(bm25_scores) if len(bm25_scores) > 0 and max(bm25_scores) > 0 else 1.0
            norm_scores = [s / max_s for s in bm25_scores]
            top_indices = np.argsort(bm25_scores)[::-1][:top_k]
            scores = norm_scores
        else: # tfidf
            query_vec = self.tfidf_vectorizer.transform([query])
            cos_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            top_indices = np.argsort(cos_scores)[::-1][:top_k]
            scores = cos_scores
            
        results = []
        for rank, idx in enumerate(top_indices, 1):
            doc = self.corpus_docs[idx]
            raw_score = float(scores[idx])
            score = round(max(0.20, min(0.95, 0.40 + 0.50 * raw_score)), 2)
            
            # Form snippet around query terms
            abstract = doc.get("abstract", "") or doc.get("text", "")
            title = doc.get("title", f"PubMed Document {doc.get('pmid')}")
            
            # Simple highlight snippet creation
            snippet = abstract
            if len(snippet) > 180:
                snippet = snippet[:177] + "..."
                
            results.append({
                "rank": rank,
                "pmid": doc.get("pmid"),
                "source": doc.get("source"),
                "title": title,
                "snippet": snippet,
                "full_abstract": abstract,
                "score": score,
                "method": method
            })
            
        return results

# Singleton
retrieval_service = MedicalInformationRetrieval()
