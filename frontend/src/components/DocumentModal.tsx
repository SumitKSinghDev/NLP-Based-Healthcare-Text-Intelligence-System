import React from 'react';
import { X, ExternalLink, BookOpen, Tag } from 'lucide-react';
import { SearchResult, SimilarDoc } from '../types';

interface DocumentModalProps {
  doc: SearchResult | SimilarDoc | null;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ doc, onClose }) => {
  if (!doc) return null;

  const fullText = (doc as SearchResult).full_abstract || (doc as SimilarDoc).full_text || doc.snippet;
  const pmid = doc.pmid || ('id' in doc && doc.id ? String(doc.id).replace('BC5CDR_', '').replace('NCBI_', '').replace('BioRED_', '') : 'N/A');

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                PubMed Document Details
              </h3>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                <span>PMID: <strong className="font-mono text-slate-700">{pmid}</strong></span>
                <span>•</span>
                <span>Source: {doc.source || 'PubMed Clinical Abstract'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {doc.title}
            </h4>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
            <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2">
              Full Abstract & Findings
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
              {fullText}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 font-medium block">Retrieval Method</span>
              <span className="font-bold text-slate-800 uppercase font-mono">{doc.method}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 font-medium block">Relevance / Similarity Score</span>
              <span className="font-bold text-blue-700 font-mono text-sm">
                {('score' in doc ? (doc as SearchResult).score : (doc as SimilarDoc).similarity_score).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] italic">
            Educational NLP Case Study — Group 6
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors shadow-xs"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
