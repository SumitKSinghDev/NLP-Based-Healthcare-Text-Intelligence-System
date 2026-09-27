import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

class ClinicalSummarizer:
    """
    Extractive clinical text summarization engine.
    Extracts key clinical sentences without hallucination or invention of data.
    """
    
    def split_sentences(self, text: str) -> List[str]:
        # Split text into clean sentences
        raw_sents = re.split(r'(?<=[.!?\n])\s+', text.strip())
        sents = [s.strip() for s in raw_sents if len(s.strip()) > 3]
        return sents if sents else [text.strip()]
        
    def summarize(self, text: str, max_sentences: int = 3, ratio: float = 0.6) -> Dict[str, Any]:
        """
        Generates an extractive clinical summary using TF-IDF sentence scoring
        and clinical entity density weighting.
        """
        if not text or len(text.strip()) < 10:
            return {
                "summary": text.strip(),
                "sentence_count": 1,
                "reduction_ratio": 1.0,
                "disclaimer": "Automatically generated summary — not medical advice or diagnosis."
            }
            
        sentences = self.split_sentences(text)
        if len(sentences) <= 2:
            return {
                "summary": " ".join(sentences),
                "sentence_count": len(sentences),
                "reduction_ratio": 1.0,
                "disclaimer": "Automatically generated summary — not medical advice or diagnosis."
            }
            
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(sentences)
            # Sentence importance = sum of TF-IDF word weights normalized by sentence length
            sentence_scores = []
            for i, sent in enumerate(sentences):
                score = tfidf_matrix[i].sum() / (len(sent.split()) ** 0.5 + 1e-5)
                # Boost if sentence contains clinical action / finding terms
                s_low = sent.lower()
                if any(w in s_low for w in ["prescribed", "diagnosed", "fever", "pain", "history", "treatment", "reports"]):
                    score *= 1.2
                sentence_scores.append((score, i, sent))
                
            num_to_keep = max(1, min(max_sentences, int(len(sentences) * ratio)))
            top_ranked = sorted(sentence_scores, key=lambda x: x[0], reverse=True)[:num_to_keep]
            
            # Reorder sentences chronologically according to original text
            top_ranked.sort(key=lambda x: x[1])
            summary_sentences = [item[2] for item in top_ranked]
            summary_text = " ".join(summary_sentences)
            
            reduction = round(len(summary_text) / (len(text) + 1e-5), 2)
            
            return {
                "summary": summary_text,
                "selected_sentences": summary_sentences,
                "sentence_count": len(summary_sentences),
                "reduction_ratio": reduction,
                "disclaimer": "Automatically generated summary using NLP — not medical advice or diagnosis."
            }
        except Exception as e:
            return {
                "summary": " ".join(sentences[:2]),
                "sentence_count": min(2, len(sentences)),
                "reduction_ratio": 0.8,
                "disclaimer": "Automatically generated summary using NLP — not medical advice or diagnosis."
            }

# Singleton
summarizer = ClinicalSummarizer()
