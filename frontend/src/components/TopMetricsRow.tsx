import React from 'react';
import { FileText, Database, Plus, Search } from 'lucide-react';
import { MetricsData } from '../types';

interface TopMetricsRowProps {
  metrics?: MetricsData | null;
}

export const TopMetricsRow: React.FC<TopMetricsRowProps> = ({ metrics }) => {
  const nerF1 = metrics?.ner_bc5cdr?.hybrid_gazetteer_ner?.overall?.f1 !== undefined
    ? metrics.ner_bc5cdr.hybrid_gazetteer_ner.overall.f1.toFixed(4)
    : '0.7218';
  const diseaseF1 = metrics?.ner_ncbi?.f1 !== undefined
    ? metrics.ner_ncbi.f1.toFixed(4)
    : '0.6840';
  const negationF1 = metrics?.negation?.negex_engine?.f1 !== undefined
    ? metrics.negation.negex_engine.f1.toFixed(4)
    : '0.9756';
  const irMrr = metrics?.retrieval?.bm25?.mrr !== undefined
    ? metrics.retrieval.bm25.mrr.toFixed(4)
    : '0.8000';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Medical NER */}
      <div className="bg-gradient-to-br from-[#e0f2fe]/90 via-[#f0f9ff] to-white border border-[#bae6fd] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between h-[122px]">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-900">Medical NER</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">(BC5CDR Overall F1)</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight font-sans">
              {nerF1}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[10px] text-[#0369a1] font-semibold relative z-10">
          <span>↗</span>
          <span>vs. 0.5826 (Baseline)</span>
        </div>

        {/* Decorative background wave */}
        <svg
          className="absolute right-0 bottom-0 h-14 w-28 text-[#38bdf8]/30 pointer-events-none"
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          <path
            d="M0,35 Q25,10 50,25 T100,10 L100,50 L0,50 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Card 2: Disease Extraction */}
      <div className="bg-gradient-to-br from-[#dcfce7]/80 via-[#f0fdf4] to-white border border-[#bbf7d0] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between h-[122px]">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-900">Disease Extraction</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">(NCBI F1)</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight font-sans">
              {diseaseF1}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#16a34a] text-white flex items-center justify-center shadow-xs">
            <Database className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[10px] text-[#15803d] font-semibold relative z-10">
          <span>◆</span>
          <span>100 test documents</span>
        </div>

        {/* Decorative background wave */}
        <svg
          className="absolute right-0 bottom-0 h-14 w-28 text-[#4ade80]/30 pointer-events-none"
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 Q30,15 60,30 T100,15 L100,50 L0,50 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Card 3: Negation Detection */}
      <div className="bg-gradient-to-br from-[#f3e8ff]/80 via-[#faf5ff] to-white border border-[#e9d5ff] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between h-[122px]">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-900">Negation Detection</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">(F1, n=30)</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight font-sans">
              {negationF1}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#9333ea] text-white flex items-center justify-center shadow-xs">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[10px] text-[#7e22ce] font-semibold relative z-10">
          <span>◆</span>
          <span>Custom evaluation set</span>
        </div>

        {/* Decorative background wave */}
        <svg
          className="absolute right-0 bottom-0 h-14 w-28 text-[#c084fc]/30 pointer-events-none"
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 Q35,5 70,25 T100,5 L100,50 L0,50 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Card 4: Information Retrieval */}
      <div className="bg-gradient-to-br from-[#ffedd5]/80 via-[#fff7ed] to-white border border-[#fed7aa] rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between h-[122px]">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-900">Information Retrieval</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">(BM25 MRR, n=5)</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight font-sans">
              {irMrr}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#ea580c] text-white flex items-center justify-center shadow-xs">
            <Search className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[10px] text-[#c2410c] font-semibold relative z-10">
          <span>◆</span>
          <span>vs. 0.7500 (TF-IDF)</span>
        </div>

        {/* Decorative background wave */}
        <svg
          className="absolute right-0 bottom-0 h-14 w-28 text-[#fb923c]/30 pointer-events-none"
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          <path
            d="M0,35 Q25,12 50,28 T100,12 L100,50 L0,50 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};
