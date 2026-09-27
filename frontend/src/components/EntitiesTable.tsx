import React from 'react';
import { Tag } from 'lucide-react';
import { MedicalEntity } from '../types';

interface EntitiesTableProps {
  entities: MedicalEntity[];
  isLoading: boolean;
  onViewAll?: () => void;
}

export const EntitiesTable: React.FC<EntitiesTableProps> = ({
  entities,
  isLoading,
  onViewAll
}) => {
  const getStatusBadge = (status: string) => {
    if (status === 'PRESENT' || status === 'Present') {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#dcfce7] text-[#15803d]">
          Present
        </span>
      );
    } else if (status === 'NEGATED' || status === 'Negated') {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fee2e2] text-[#b91c1c]">
          Negated
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
        Unknown
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <span>Extracted Medical Entities (NER)</span>
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
              <tr className="bg-slate-50/90 border-y border-slate-200/80 text-[11px] font-bold text-slate-700">
                <th className="py-2 px-3">Entity</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Status / Negation</th>
                <th className="py-2 px-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-24"></div></td>
                    <td className="py-2 px-3"><div className="h-3 bg-slate-200 rounded w-16"></div></td>
                    <td className="py-2 px-3"><div className="h-4 bg-slate-200 rounded w-14"></div></td>
                    <td className="py-2 px-3 text-right"><div className="h-3 bg-slate-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : entities.length > 0 ? (
                entities.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800 capitalize">
                      {item.entity}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-600 uppercase text-[11px]">
                      {item.type}
                    </td>
                    <td className="py-2 px-3">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600 font-medium">
                      {item.confidence.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                    No entities extracted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
