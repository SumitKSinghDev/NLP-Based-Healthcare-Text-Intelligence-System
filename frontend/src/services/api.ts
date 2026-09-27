import { AnalysisResult, MetricsData, DatasetStats, MedicalEntity, SymptomItem, MedicineItem, AssociationItem, SearchResult, SimilarDoc, SummaryData } from '../types';

const API_BASE = '/api';

export async function analyzeText(text: string, modelType: string = 'biomedical_ml'): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_type: modelType })
  });
  if (!response.ok) {
    throw new Error(`Analysis failed with status ${response.status}`);
  }
  return response.json();
}

export async function extractNER(text: string, modelType: string = 'biomedical_ml'): Promise<MedicalEntity[]> {
  const response = await fetch(`${API_BASE}/ner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_type: modelType })
  });
  if (!response.ok) throw new Error('NER failed');
  return response.json();
}

export async function extractSymptoms(text: string): Promise<SymptomItem[]> {
  const response = await fetch(`${API_BASE}/symptoms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('Symptom extraction failed');
  return response.json();
}

export async function extractMedicines(text: string): Promise<MedicineItem[]> {
  const response = await fetch(`${API_BASE}/medicines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('Medicine extraction failed');
  return response.json();
}

export async function searchCorpus(query: string, method: string = 'bm25', top_k: number = 5): Promise<SearchResult[]> {
  const response = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, method, top_k })
  });
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export async function computeSimilarity(text: string, method: string = 'tfidf', top_k: number = 5): Promise<SimilarDoc[]> {
  const response = await fetch(`${API_BASE}/similarity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, method, top_k })
  });
  if (!response.ok) throw new Error('Similarity search failed');
  return response.json();
}

export async function summarizeText(text: string): Promise<SummaryData> {
  const response = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('Summarization failed');
  return response.json();
}

export async function getEvaluationMetrics(): Promise<MetricsData> {
  const response = await fetch(`${API_BASE}/metrics`);
  if (!response.ok) throw new Error('Failed to fetch evaluation metrics');
  return response.json();
}

export async function runLiveEvaluation(): Promise<MetricsData> {
  const response = await fetch(`${API_BASE}/evaluate`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to run live evaluation');
  return response.json();
}

export async function getDatasetStats(): Promise<DatasetStats> {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) throw new Error('Failed to fetch dataset stats');
  return response.json();
}
