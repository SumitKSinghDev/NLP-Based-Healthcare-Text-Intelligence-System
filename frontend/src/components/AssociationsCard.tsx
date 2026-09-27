import React from 'react';
import { GitFork, AlertCircle } from 'lucide-react';
import { AssociationItem } from '../types';

interface AssociationsCardProps {
  associations: AssociationItem[];
  isLoading: boolean;
  onViewAll?: () => void;
}

export const AssociationsCard: React.FC<AssociationsCardProps> = ({
  associations,
  isLoading,
  onViewAll
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-[#991b1b] font-bold text-sm">
            <div className="w-5 h-5 rounded bg-rose-100 text-rose-700 flex items-center justify-center">
              <GitFork className="w-3.5 h-3.5" />
            </div>
            <span>Symptom-Disease Association</span>
          </div>

          <button
            onClick={onViewAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            View All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-rose-50/40 border-y border-rose-100 text-[11px] font-bold text-slate-700">
                <th className="py-2 px-3">Symptom / Entity</th>
                <th className="py-2 px-3">Associated Disease (Top Predictions)</th>
                <th className="py-2 px-3 text-right">Association Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-24"></div></td>
                    <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-48"></div></td>
                    <td className="py-2 px-3 text-right"><div className="h-3 bg-slate-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : associations.length > 0 ? (
                associations.map((item, idx) => {
                  const score =
                    item.association_score !== undefined
                      ? item.association_score
                      : item.confidence ?? 0.5;
                  return (
                    <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-800 capitalize">
                        {item.symptom_entity}
                      </td>
                      <td className="py-2 px-3 text-slate-700 font-normal text-xs">
                        {item.associated_diseases}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600 font-medium">
                        {score.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                    No symptom-disease associations computed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Notice Box with soft orange background matching reference image */}
      <div className="mt-3 bg-[#fff7ed] border border-[#fed7aa] rounded-xl px-3 py-2 flex items-start space-x-2 text-[11px] text-[#9a3412]">
        <AlertCircle className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
        <span className="leading-snug">
          These are possible associations based on biomedical literature using NLP models. Not a diagnosis or medical recommendation.
        </span>
      </div>
    </div>
  );
};
