---
title: Healthcare NLP Text Intelligence
emoji: 🏥
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
pinned: false
---

# NLP-Based Healthcare Text Intelligence System for Medical Entity Extraction, Symptom Analysis and Clinical Information Retrieval

**Academic Case Study — Group 6**  
*Natural Language Processing (NLP) / Biomedical Text Intelligence*

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement & Objectives](#problem-statement--objectives)
3. [System Architecture](#system-architecture)
4. [NLP Concepts & Techniques Used](#nlp-concepts--techniques-used)
5. [Datasets & Corpus Statistics](#datasets--corpus-statistics)
6. [Pipeline Modules & Implementation Details](#pipeline-modules--implementation-details)
7. [Audited Evaluation Methodology & Results](#audited-evaluation-methodology--results)
8. [Installation & Setup](#installation--setup)
9. [Running the Application](#running-the-application)
10. [API Documentation](#api-documentation)
11. [Presentation & Viva Defense Guide](#presentation--viva-defense-guide)
12. [Ethical Considerations & Limitations](#ethical-considerations--limitations)
13. [References](#references)

---

## 1. Project Overview

The **Healthcare Text Intelligence System** is an end-to-end NLP case study built to extract, analyze, structure, and retrieve clinical insights from unstructured biomedical abstracts and clinical notes.

The system uses transparent, deterministic, and statistical NLP methods:
- **Hybrid Gazetteer/Rule-Based Biomedical NER** leveraging vocabularies learned from BC5CDR, NCBI Disease, and BioRED training partitions with morphological filtering.
- **Symptom Extraction & Categorization** via multi-word phrase matching and anatomical classification.
- **Medicine & Chemical Entity Extraction** with regex-based dosage, route, and frequency parsing.
- **Clinical Negation Detection** via NegEx / ConText directional scope analysis.
- **Symptom-Disease Literature Association** via corpus co-occurrence and Pointwise Mutual Information (PMI).
- **Document Similarity** using TF-IDF and Latent Semantic Analysis (TruncatedSVD / LSA).
- **Biomedical Information Retrieval (IR)** using Okapi BM25 and TF-IDF rankers over 2,677 indexed PubMed abstracts.
- **Extractive Clinical Summarization** using TF-IDF sentence salience scoring.

---

## 2. Problem Statement & Objectives

### Problem Statement
Unstructured clinical text (EHRs, progress notes, discharge summaries) represents over 80% of clinical data. Extracting structured clinical entities, identifying negated conditions, and finding related biomedical literature requires transparent NLP pipelines without unverified claims or diagnostic assertions.

### Main Objectives
1. **Medical Named Entity Recognition (Medical NER):** Extract mentions of Diseases, Symptoms, Chemicals, Medicine Candidates, and Procedures with exact character spans.
2. **Symptom Extraction & Categorization:** Identify multi-word symptoms and classify them into anatomical categories (*Respiratory*, *Cardiovascular*, *Neurological*, *Gastrointestinal*, *General*).
3. **Medicine & Chemical Extraction:** Disambiguate chemical annotations, identify medicine candidates, and extract dosage patterns (`500 mg`, `10 ml`), frequencies, and routes.
4. **Clinical Negation Detection:** Determine `PRESENT` vs. `NEGATED` status using NegEx scope analysis.
5. **Symptom-Disease Association:** Provide literature-based co-occurrence/PMI scores with explicit non-diagnostic disclaimers.
6. **Document Similarity:** Compute cosine similarity between query notes and PubMed abstracts using TF-IDF and TF-IDF + LSA.
7. **Biomedical Information Retrieval:** Retrieve relevant PubMed abstracts using Okapi BM25.
8. **Extractive Summarization:** Summarize clinical text purely from source sentences without hallucination.
9. **Rigorous & Honest Evaluation:** Quantify performance using exact held-out test splits and explicit custom test set descriptions.

---

## 3. System Architecture

```
                                CLINICAL TEXT INPUT
                                         │
                                         ▼
                            PREPROCESSING & TOKENIZATION
                                         │
                                         ▼
                     HYBRID GAZETTEER / RULE-BASED NER
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
            SYMPTOMS                 DISEASES               CHEMICALS /
        (Multi-word Match)      (BC5CDR / NCBI / BioRED)     MEDICINES
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         ▼
                             CLINICAL NEGATION ENGINE
                         (NegEx / ConText Scope Analysis)
                                         │
                                         ▼
                            SYMPTOM-DISEASE ASSOCIATION
                         (Corpus PMI & Co-occurrence KB)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
         DOCUMENT SIMILARITY                           INFORMATION RETRIEVAL
      (TF-IDF + LSA SVD Space)                           (BM25 Ranking Engine)
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                             EXTRACTIVE SUMMARIZATION
                         (TF-IDF Sentence Salience Ranker)
                                         │
                                         ▼
                              INTERACTIVE REACT UI
                    (Dashboard / Charts / Full Doc Modal)
```

---

## 4. NLP Concepts & Techniques Used

| NLP Concept | Implementation Details | Academic Role / Purpose |
| :--- | :--- | :--- |
| **Tokenization & N-grams** | Regular-expression token boundary tracking with character offset mapping $(0 \le \text{start} < \text{end})$ | Preserves exact span boundaries for highlighting in clinical text. |
| **Hybrid Gazetteer / Rule NER** | Vocabulary extracted from training partitions combined with morphological affix analysis (`-itis`, `-emia`, `-oma`, `-olol`, `-statin`) and token n-gram matchers | Identifies Disease, Chemical, Medicine, Symptom, and Procedure entities without neural model dependencies. |
| **Clinical Negation (NegEx)** | Rule-based engine with pre-cues (*"no"*, *"denies"*), post-cues (*"absent"*, *"resolved"*), and conjunction scope delimiters (*"but"*, *"however"*) | Distinguishes affirmative findings from ruled-out conditions. |
| **PMI & Co-occurrence** | $\text{PMI}(s, d) = \log_2 \frac{P(s, d)}{P(s)P(d)}$ | Discovers statistical associations between symptoms and diseases across indexed PubMed literature. |
| **BM25 Retrieval** | Okapi BM25 ranking with term frequency saturation ($k_1=1.5$) and document length normalization ($b=0.75$) | Retrieves ranked biomedical abstracts from local PubMed corpus. |
| **Vector Space & LSA** | TF-IDF term weighting and Truncated SVD (Latent Semantic Analysis) with Cosine Similarity | Matches semantically similar clinical documents. |
| **Extractive Summarization** | TF-IDF word salience weighting and clinical keyword density scoring | Selects salient clinical sentences without factual hallucination. |

---

## 5. Datasets & Corpus Statistics

All statistics are generated directly from the original local datasets without modification:

| Dataset | Focus Area | Train Docs | Dev Docs | Test Docs | Total Entities | Total Relations |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **BC5CDR** | Chemical & Disease NER / CID Relations | 500 | 500 | 500 | **28,550** | **3,116** |
| **NCBI Disease** | Disease Mention Concepts | 593 | 100 | 100 | **6,892** | N/A |
| **BioRED** | Multi-Entity Biomedical Relations | 400 | 100 | 100 | **20,419** | **6,503** |
| **Unified Corpus** | Indexed PubMed Abstracts for IR & Similarity | — | — | — | **2,677 Docs** | **73 Symptoms** |

---

## 6. Pipeline Modules & Implementation Details

### 1. Medical NER (`backend/app/services/ner.py`)
- Learns gazetteer vocabularies from BC5CDR, NCBI Disease, and BioRED **training splits only**.
- Applies token n-gram indexing (1 to 6 grams) with character start/end tracking.
- Uses morphological affix filters (`-itis`, `-emia`, `-oma`, `-cillin`, `-statin`) and stopword pruning to maximize precision.
- Compared against a Naive Exact Dictionary Baseline on identical test sets.

### 2. Symptom Extractor (`backend/app/services/symptom.py`)
- Configured via `data/resources/symptom_lexicon.csv`.
- Extracts multi-word symptoms (*persistent cough*, *shortness of breath*, *substernal chest pain*).
- Maps symptoms to anatomical categories (*Respiratory*, *Cardiovascular*, *Neurological*, *Gastrointestinal*, *General*) and severity weights.

### 3. Medicine & Chemical Extractor (`backend/app/services/medicine.py`)
- Configured via `data/resources/medicine_lexicon.csv`.
- Maps generic drug names, ATC codes, and clinical indications.
- Distinguishes **CHEMICAL**, **MEDICINE CANDIDATE**, and **DOSAGE** using regex quantity patterns (`500 mg`, `10 ml`, `2 tablets`), routes, and frequencies.

### 4. Negation Detection Engine (`backend/app/services/negation.py`)
- Implements transparent NegEx clinical logic.
- Evaluates pre-negation cues (*"no"*, *"denies"*, *"without"*), post-negation cues (*"absent"*, *"resolved"*), pseudo-negations (*"no change"*), and scope termination conjunctions (*"but"*, *"however"*, *"except"*).

### 5. Document Similarity & Information Retrieval (`similarity.py` & `retrieval.py`)
- **Document Similarity:** Uses TF-IDF and TF-IDF + LSA (TruncatedSVD) with Cosine Similarity.
- **Search:** Uses Okapi BM25 ranking over 2,677 indexed biomedical abstracts.

### 6. Extractive Summarization (`backend/app/services/summarization.py`)
- TF-IDF sentence salience scoring with chronological reordering.
- Strictly extractive: no synthetic findings or hallucinated medications.

---

## 7. Audited Evaluation Methodology & Results

### Evaluation Scope Summary:
- **BC5CDR NER:** Quantitative benchmark on held-out test split (500 documents, 9,752 entities; exact span + entity-type match).
- **NCBI Disease NER:** Disease mention extraction evaluation on held-out test split (100 documents, 960 mentions).
- **Clinical Negation:** Custom 30-case negation evaluation set ($n = 30$ clinical test sentences).
- **Information Retrieval:** Custom 5-query retrieval evaluation ($n = 5$ queries, keyword relevance judgments).
- **Summarization:** Constructed-reference ROUGE evaluation ($n = 50$ abstracts; reference = title + first sentence; not a human-written clinical summary).
- **Relation Extraction:** Implemented dataset support (BioRED 6,503 relations & BC5CDR 3,116 CID relations indexed for co-occurrence); quantitative relation extraction evaluation not yet performed.

---

### Detailed Quantitative Results:

#### 1. BC5CDR NER Performance (Held-out Test Set: 500 Docs, 9,752 Entities)
| Model / Configuration | Precision | Recall | F1 Score |
| :--- | :---: | :---: | :---: |
| **Hybrid Gazetteer NER (Chemical)** | **0.8680** | **0.6103** | **0.7167** |
| **Hybrid Gazetteer NER (Disease)** | **0.7504** | **0.7057** | **0.7273** |
| **Hybrid Gazetteer NER (OVERALL)** | **0.8067** | **0.6531** | **0.7218** |
| Naive Dictionary Baseline (OVERALL) | 0.5859 | 0.5793 | 0.5826 |

#### 2. NCBI Disease Test Set (Disease Mention Extraction Evaluation: 100 Docs, 960 Mentions)
| Metric | Value |
| :--- | :---: |
| **Precision** | **0.7296** |
| **Recall** | **0.6438** |
| **F1 Score** | **0.6840** |

#### 3. Clinical Negation Detection (Custom 30-Case Evaluation Set, $n = 30$)
| Method | Accuracy | Precision | Recall | F1 Score |
| :--- | :---: | :---: | :---: | :---: |
| **NegEx Clinical Engine** | **0.9667** | **0.9524** | **1.0000** | **0.9756** |
| Simple Keyword Baseline | 0.7000 | 0.7895 | 0.7500 | 0.7692 |

#### 4. Medical Information Retrieval (Custom 5-Query Evaluation, $n = 5$ Queries)
| Method | Precision@1 | Precision@3 | Precision@5 | Mean Reciprocal Rank (MRR) |
| :--- | :---: | :---: | :---: | :---: |
| **BM25 Search** | **0.6000** | **0.6667** | **0.6000** | **0.8000** |
| TF-IDF Search | 0.6000 | 0.5333 | 0.6000 | 0.7500 |

*Note: In accordance with academic retrieval standards, Information Retrieval is evaluated using Precision@K and MRR; artificial F1 numbers combining P@3 and P@5 are omitted.*

#### 5. Extractive Summarization (Constructed-Reference ROUGE Evaluation, $n = 50$)
- **ROUGE-1 F1:** `0.3608`
- **ROUGE-2 F1:** `0.2435`
- **ROUGE-L F1:** `0.3317`  
*(Gold reference is constructed as title + first abstract sentence; not human-written clinical summary).*

---

## 8. Installation & Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.11 - 3.14)
- Node.js 18+ & npm

### 1. Install Backend Dependencies
```bash
python -m pip install -r backend/requirements.txt
```

### 2. Install Frontend Dependencies & Build
```bash
cd frontend
npm install
npm run build
cd ..
```

---

## 9. Running the Application

### Option A: 1-Click Python Launcher (Recommended)
```bash
python run_app.py
```
*Automatically checks dependencies, verifies frontend build assets, launches FastAPI on `http://localhost:8000`, and opens the browser.*

### Option B: Windows 1-Click Batch Scripts
- Double-click **`run_app.bat`** to start the application.
- Double-click **`run_tests.py`** to execute all automated test suites and view audited metrics.
- Double-click **`run_full_rebuild.bat`** to run end-to-end dataset preprocessing, corpus indexing, and frontend recompilation.

### Option C: Manual Step-by-Step Commands
```bash
# 1. Preprocess Datasets & Build Search Corpus
python scripts/preprocess_all.py
python scripts/build_corpus.py

# 2. Run Full Benchmark Evaluation Suite
python scripts/evaluate.py

# 3. Run Automated Tests
python -m pytest backend/tests/test_nlp_pipeline.py -v

# 4. Start Application Server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
Open browser at: **`http://localhost:8000`**

---

## 10. API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/analyze` | `POST` | Executes unified end-to-end NLP pipeline on input text |
| `/api/ner` | `POST` | Extracts entities with character offsets, type, and confidence |
| `/api/symptoms` | `POST` | Extracts symptoms and maps categories and severity |
| `/api/medicines` | `POST` | Extracts chemicals, medicines, dosage, and route |
| `/api/negation` | `POST` | Evaluates NegEx status for entity in sentence |
| `/api/relations` | `POST` | Computes symptom-disease association scores |
| `/api/search` | `POST` | Searches PubMed corpus using BM25 or TF-IDF |
| `/api/similarity`| `POST` | Finds top matching documents using TF-IDF + LSA |
| `/api/summarize` | `POST` | Produces extractive clinical summary |
| `/api/evaluate`  | `POST` | Runs live benchmark evaluation across test sets |
| `/api/metrics`   | `GET`  | Returns cached evaluation metrics |
| `/api/stats`     | `GET`  | Returns dataset statistics |

---

## 11. Presentation & Viva Defense Guide

### Key Explanations for Examination / Viva:
1. **Why is it termed "Hybrid Gazetteer/Rule-Based NER" rather than a deep learning / neural model?**
   *Answer:* The NER module extracts entity gazetteers from the official training partitions of BC5CDR and NCBI Disease, and uses character-offset token n-gram matchers, stopword filtering, and morphological affix analysis (`-itis`, `-emia`, `-olol`, `-statin`). It is deterministic, fast, and does not require neural weights or GPUs.
2. **What does the "Association Score" represent?**
   *Answer:* The Association Score is a statistical metric derived from corpus co-occurrence frequency, Pointwise Mutual Information (PMI), and Jaccard overlap across 2,677 PubMed abstracts. It is not a clinical diagnosis or probabilistic diagnostic prediction.
3. **How does NegEx handle scope boundaries?**
   *Answer:* NegEx searches for pre-cues (*"denies"*, *"no"*) within a 6-word window preceding an entity mention, but halts the scope if a conjunction boundary (*"but"*, *"however"*, *"although"*) or semicolon is encountered. This prevents negation from spilling across clauses (e.g., *"denies fever, but complains of severe chest pain"*).
4. **How is Document Similarity implemented?**
   *Answer:* It uses TF-IDF term vectors reduced to 128 dense dimensions using Truncated Singular Value Decomposition (Latent Semantic Analysis / LSA), followed by cosine similarity ranking.

---

## 12. Ethical Considerations & Limitations

1. **Educational Prototype:** This system is an academic NLP prototype for Group 6. Outputs are NLP-derived associations and do not constitute clinical diagnoses or treatment advice.
2. **Privacy:** No personally identifiable health information (PHI/PII) is stored or transmitted.
3. **Lexicon Scope:** Curated symptom and medicine lexicons represent targeted subsets and are not comprehensive medical vocabularies.

---

## 13. References
- Leaman, R., et al. (2016). *BC5CDR: Disease and chemical entity recognition in PubMed abstracts*. BioCreative V.
- Dogan, R. I., et al. (2014). *NCBI disease corpus: a resource for disease name recognition and concept normalization*. Journal of Biomedical Informatics.
- Luo, L., et al. (2022). *BioRED: A rich biomedical relation extraction dataset*. Briefings in Bioinformatics.
- Chapman, W. W., et al. (2001). *A simple algorithm for identifying negated findings and diseases in discharge summaries (NegEx)*. Journal of Biomedical Informatics.
- Robertson, S., & Zaragoza, H. (2009). *The Probabilistic Relevance Framework: BM25 and Beyond*. Foundations and Trends in Information Retrieval.
