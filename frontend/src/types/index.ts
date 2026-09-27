export interface MedicalEntity {
  entity: string;
  type: string;
  start: number;
  end: number;
  status: 'PRESENT' | 'NEGATED' | 'UNKNOWN';
  negation_cue?: string | null;
  confidence: number;
}

export interface SymptomItem {
  text: string;
  canonical_name: string;
  category: string;
  severity_weight: number;
  start: number;
  end: number;
  type: string;
  status: string;
  negation_cue?: string | null;
  confidence: number;
}

export interface MedicineItem {
  text: string;
  type: string;
  entity_category: string;
  generic_name?: string | null;
  drug_class?: string | null;
  atc_code?: string | null;
  common_indications?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  route?: string | null;
  start: number;
  end: number;
  status: string;
  confidence: number;
}

export interface AssociationItem {
  symptom_entity: string;
  status: string;
  associated_diseases: string;
  top_predictions: string[];
  association_score: number;
  confidence?: number;
  evidence_count: number;
  disclaimer: string;
}

export interface SearchResult {
  rank: number;
  pmid?: string;
  source?: string;
  title: string;
  snippet: string;
  full_abstract?: string;
  score: number;
  method: string;
}

export interface SimilarDoc {
  rank: number;
  id?: string;
  pmid?: string;
  source?: string;
  title: string;
  snippet: string;
  full_text?: string;
  similarity_score: number;
  method: string;
}

export interface SummaryData {
  summary: string;
  selected_sentences?: string[];
  sentence_count: number;
  reduction_ratio: number;
  disclaimer: string;
}

export interface AnalysisResult {
  input_text: string;
  summary: SummaryData;
  entities: MedicalEntity[];
  symptoms: SymptomItem[];
  medicines: MedicineItem[];
  associations: AssociationItem[];
  similar_documents: SimilarDoc[];
  search_results: SearchResult[];
  search_query_used: string;
  safety_disclaimer: string;
}

export interface MetricValues {
  precision: number;
  recall: number;
  f1: number;
  tp?: number;
  fp?: number;
  fn?: number;
}

export interface MetricsData {
  metadata: {
    title: string;
    group: string;
    evaluated_at: string;
    duration_seconds: number;
  };
  summary_kpis: {
    precision: number;
    recall: number;
    f1_score: number;
    source?: string;
  };
  ner_bc5cdr: {
    evaluation_source?: string;
    test_docs_evaluated: number;
    hybrid_gazetteer_ner: Record<string, MetricValues>;
    dictionary_baseline: Record<string, MetricValues>;
  };
  ner_ncbi: MetricValues & { evaluation_source?: string; test_docs_evaluated: number };
  negation: {
    evaluation_source?: string;
    sample_count: number;
    negex_engine: {
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      tp: number;
      fp: number;
      fn: number;
      tn: number;
    };
    keyword_baseline: {
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      tp: number;
      fp: number;
      fn: number;
      tn: number;
    };
  };
  retrieval: {
    evaluation_source?: string;
    query_count: number;
    bm25: {
      precision_at_1: number;
      precision_at_3: number;
      precision_at_5: number;
      mrr: number;
    };
    tfidf: {
      precision_at_1: number;
      precision_at_3: number;
      precision_at_5: number;
      mrr: number;
    };
  };
  summarization: {
    evaluation_source?: string;
    samples_evaluated: number;
    rouge_1: number;
    rouge_2: number;
    rouge_l: number;
  };
  relation_extraction?: {
    status: string;
    dataset_support?: string;
  };
  task_performance_chart_data: Array<{
    task: string;
    precision: number;
    recall: number;
    f1: number;
  }>;
}

export interface DatasetStats {
  metadata: {
    title: string;
    group: string;
    datasets_processed: string[];
    corpus_total_documents: number;
    generated_at: string;
  };
  bc5cdr: {
    description: string;
    total_documents: number;
    total_sentences: number;
    total_entities: number;
    total_relations: number;
    splits: Record<string, any>;
  };
  ncbi_disease: {
    description: string;
    total_documents: number;
    total_sentences: number;
    total_entities: number;
    total_relations: number;
    splits: Record<string, any>;
  };
  biored: {
    description: string;
    total_documents: number;
    total_sentences: number;
    total_entities: number;
    total_relations: number;
    splits: Record<string, any>;
  };
}
