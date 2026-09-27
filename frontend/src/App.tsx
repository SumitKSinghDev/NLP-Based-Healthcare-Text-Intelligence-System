import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { SafetyBanner } from './components/SafetyBanner';
import { TopMetricsRow } from './components/TopMetricsRow';
import { InputCard, SAMPLE_TEXTS } from './components/InputCard';
import { SummaryCard } from './components/SummaryCard';
import { EntitiesTable } from './components/EntitiesTable';
import { AssociationsCard } from './components/AssociationsCard';
import { RelevantDocsCard } from './components/RelevantDocsCard';
import { SimilarDocsCard } from './components/SimilarDocsCard';
import { ModelComparisonCard } from './components/ModelComparisonCard';
import { EvaluationSection } from './components/EvaluationSection';
import { DocumentModal } from './components/DocumentModal';
import { DatasetView } from './components/DatasetView';

// Dedicated View Modules
import { NERView } from './components/views/NERView';
import { SymptomView } from './components/views/SymptomView';
import { MedicineView } from './components/views/MedicineView';
import { NegationView } from './components/views/NegationView';
import { AssociationsView } from './components/views/AssociationsView';
import { SimilarityView } from './components/views/SimilarityView';
import { SearchView } from './components/views/SearchView';
import { SummarizationView } from './components/views/SummarizationView';

import {
  AnalysisResult,
  MetricsData,
  DatasetStats,
  SearchResult,
  SimilarDoc
} from './types';

import {
  analyzeText,
  getEvaluationMetrics,
  runLiveEvaluation,
  getDatasetStats,
  searchCorpus
} from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [modelType, setModelType] = useState('hybrid_gazetteer_ner');
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SearchResult | SimilarDoc | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const [metrics, stats] = await Promise.allSettled([
          getEvaluationMetrics(),
          getDatasetStats()
        ]);
        if (metrics.status === 'fulfilled') setMetricsData(metrics.value);
        if (stats.status === 'fulfilled') setDatasetStats(stats.value);
      } catch (err) {
        console.error('Initialization error:', err);
      }
      
      handleAnalyze(SAMPLE_TEXTS[0].text, 'hybrid_gazetteer_ner');
    };

    initApp();
  }, []);

  const handleAnalyze = async (textToAnalyze?: string, selectedModel?: string) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : inputText;
    const model = selectedModel || modelType;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeText(text, model);
      setAnalysisResult(res);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunLiveBenchmark = async () => {
    setIsEvaluating(true);
    try {
      const res = await runLiveEvaluation();
      setMetricsData(res);
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Dedicated Tab Routing
  const renderContent = () => {
    if (activeTab === 'datasets') {
      return <DatasetView stats={datasetStats} />;
    }

    if (activeTab === 'evaluation') {
      return (
        <div className="space-y-6 animate-fadeIn">
          <EvaluationSection
            metrics={metricsData}
            isLoading={isEvaluating}
            onRunLiveEvaluation={handleRunLiveBenchmark}
          />
        </div>
      );
    }

    if (activeTab === 'ner') {
      return (
        <NERView
          inputText={inputText}
          setInputText={setInputText}
          onAnalyze={() => handleAnalyze()}
          isLoading={isAnalyzing}
          modelType={modelType}
          setModelType={setModelType}
          entities={analysisResult?.entities || []}
        />
      );
    }

    if (activeTab === 'symptoms') {
      return (
        <SymptomView
          inputText={inputText}
          setInputText={setInputText}
          onAnalyze={() => handleAnalyze()}
          isLoading={isAnalyzing}
          modelType={modelType}
          setModelType={setModelType}
          symptoms={analysisResult?.symptoms || []}
        />
      );
    }

    if (activeTab === 'medicines') {
      return (
        <MedicineView
          inputText={inputText}
          setInputText={setInputText}
          onAnalyze={() => handleAnalyze()}
          isLoading={isAnalyzing}
          modelType={modelType}
          setModelType={setModelType}
          medicines={analysisResult?.medicines || []}
        />
      );
    }

    if (activeTab === 'negation') {
      return <NegationView inputText={inputText} />;
    }

    if (activeTab === 'associations') {
      return (
        <AssociationsView
          associations={analysisResult?.associations || []}
          isLoading={isAnalyzing}
        />
      );
    }

    if (activeTab === 'search') {
      return (
        <SearchView
          onViewDoc={(doc) => setSelectedDoc(doc)}
        />
      );
    }

    if (activeTab === 'similarity') {
      return (
        <SimilarityView
          inputText={inputText}
          onViewDoc={(doc) => setSelectedDoc(doc)}
        />
      );
    }

    if (activeTab === 'summarization') {
      return (
        <SummarizationView
          inputText={inputText}
          setInputText={setInputText}
          onAnalyze={() => handleAnalyze()}
          isLoading={isAnalyzing}
          modelType={modelType}
          setModelType={setModelType}
          summaryData={analysisResult?.summary}
        />
      );
    }

    // Default: Main Unified Dashboard matching reference image exactly
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Row 1: Top 4 KPI Metric Cards */}
        <TopMetricsRow metrics={metricsData} />

        {/* Row 2: Input Medical Text & Generated Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <InputCard
            inputText={inputText}
            setInputText={setInputText}
            onAnalyze={() => handleAnalyze()}
            isLoading={isAnalyzing}
            modelType={modelType}
            setModelType={setModelType}
          />
          <SummaryCard
            summaryData={analysisResult?.summary}
            isLoading={isAnalyzing}
          />
        </div>

        {/* Row 3: Extracted Medical Entities (NER) & Symptom-Disease Association */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <EntitiesTable
            entities={analysisResult?.entities || []}
            isLoading={isAnalyzing}
            onViewAll={() => setActiveTab('ner')}
          />
          <AssociationsCard
            associations={analysisResult?.associations || []}
            isLoading={isAnalyzing}
            onViewAll={() => setActiveTab('associations')}
          />
        </div>

        {/* Row 4: Relevant Docs, Similar Docs & Model Performance Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-5">
            <RelevantDocsCard
              searchResults={analysisResult?.search_results || []}
              isLoading={isAnalyzing}
              onViewDoc={(doc) => setSelectedDoc(doc)}
              onViewAll={() => setActiveTab('search')}
            />
          </div>
          <div className="lg:col-span-3">
            <SimilarDocsCard
              similarDocs={analysisResult?.similar_documents || []}
              isLoading={isAnalyzing}
              onViewDoc={(doc) => setSelectedDoc(doc)}
              onViewAll={() => setActiveTab('similarity')}
            />
          </div>
          <div className="lg:col-span-4">
            <ModelComparisonCard metrics={metricsData} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
      <Header
        onSearchQuery={(q) => {
          setActiveTab('search');
        }}
      />
      <SafetyBanner />

      <div className="flex-1 flex max-w-[1750px] w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-5 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Full Document Reader Modal */}
      {selectedDoc && (
        <DocumentModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
};
