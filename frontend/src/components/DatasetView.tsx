import React from 'react';
import { Database, FileText, Layers, CheckCircle, Activity, BookOpen } from 'lucide-react';
import { DatasetStats } from '../types';

interface DatasetViewProps {
  stats?: DatasetStats | null;
}

export const DatasetView: React.FC<DatasetViewProps> = ({ stats }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Biomedical Datasets & Corpus Statistics
            </h2>
            <p className="text-xs text-slate-500">
              Verified ground truth corpora: BC5CDR, NCBI Disease Corpus, and BioRED.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Corpus Docs</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {stats?.metadata?.corpus_total_documents || 2677}
            </div>
            <span className="text-[11px] text-blue-600 font-medium">PubMed Abstracts Indexed</span>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 uppercase">BC5CDR Entities</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {stats?.bc5cdr?.total_entities || 28550}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Chemicals & Diseases</span>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 uppercase">NCBI Disease Mentions</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {stats?.ncbi_disease?.total_entities || 6892}
            </div>
            <span className="text-[11px] text-purple-600 font-medium">Disease Concept Mentions</span>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 uppercase">BioRED Relations</span>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {stats?.biored?.total_relations || 6503}
            </div>
            <span className="text-[11px] text-rose-600 font-medium">Biomedical Interactions</span>
          </div>
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BC5CDR Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <h3 className="font-bold text-slate-900 text-sm">BC5CDR (BioCreative V)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Primary dataset for Chemical and Disease named entity recognition, plus Chemical-Induced Disease (CID) relation extraction.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Training Split:</span>
              <span className="font-semibold text-slate-800 font-mono">500 docs / 9,296 entities</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Development Split:</span>
              <span className="font-semibold text-slate-800 font-mono">500 docs / 9,502 entities</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Test Split:</span>
              <span className="font-semibold text-slate-800 font-mono">500 docs / 9,752 entities</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Entity Types:</span>
              <span className="font-semibold text-blue-700">Chemical, Disease</span>
            </div>
          </div>
        </div>

        {/* NCBI Disease Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
            <h3 className="font-bold text-slate-900 text-sm">NCBI Disease Corpus</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Gold standard disease mention corpus annotated with SpecificDisease, DiseaseClass, Modifier, and Composite mentions mapped to MeSH & OMIM.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Training Split:</span>
              <span className="font-semibold text-slate-800 font-mono">593 docs / 5,145 mentions</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Development Split:</span>
              <span className="font-semibold text-slate-800 font-mono">100 docs / 787 mentions</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Test Split:</span>
              <span className="font-semibold text-slate-800 font-mono">100 docs / 960 mentions</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Entity Types:</span>
              <span className="font-semibold text-purple-700">Disease (Specific/Class/Mod)</span>
            </div>
          </div>
        </div>

        {/* BioRED Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <h3 className="font-bold text-slate-900 text-sm">BioRED Dataset</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Comprehensive multi-entity biomedical relation dataset covering 6 entity types and 8 relation types (Association, Bind, Positive Correlation, etc.).
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Training Split:</span>
              <span className="font-semibold text-slate-800 font-mono">400 docs / 4,178 relations</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Development Split:</span>
              <span className="font-semibold text-slate-800 font-mono">100 docs / 1,162 relations</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Test Split:</span>
              <span className="font-semibold text-slate-800 font-mono">100 docs / 1,163 relations</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total Relations:</span>
              <span className="font-semibold text-rose-700">6,503 annotated pairs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
