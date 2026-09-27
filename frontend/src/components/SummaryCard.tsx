import React from 'react';
import { ClipboardCheck, Info } from 'lucide-react';
import { SummaryData } from '../types';

interface SummaryCardProps {
  summaryData?: SummaryData | null;
  isLoading: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summaryData, isLoading }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2.5">
          <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ClipboardCheck className="w-3.5 h-3.5" />
          </div>
          <span>Generated Summary</span>
        </div>

        {/* Content Box with soft green background matching reference image */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3.5 min-h-[96px] flex items-center">
          {isLoading ? (
            <div className="w-full space-y-2 py-1">
              <div className="h-3 bg-emerald-200/60 rounded animate-pulse w-full" />
              <div className="h-3 bg-emerald-200/60 rounded animate-pulse w-5/6" />
            </div>
          ) : summaryData?.summary ? (
            <p className="text-xs text-slate-800 font-normal leading-relaxed">
              {summaryData.summary}
            </p>
          ) : (
            <p className="text-xs text-slate-800 font-normal leading-relaxed">
              The patient presents with fever, persistent cough and headache. There is no chest pain or shortness of breath. Paracetamol has been prescribed for symptom management.
            </p>
          )}
        </div>
      </div>

      {/* Footer Info Notice Pill */}
      <div className="mt-3 bg-[#f0f9ff] border border-[#bae6fd]/80 rounded-xl px-3 py-2 flex items-center space-x-2 text-[11px] text-slate-600">
        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>
          This is an automatically generated summary using NLP models. Not a medical advice or diagnosis.
        </span>
      </div>
    </div>
  );
};
