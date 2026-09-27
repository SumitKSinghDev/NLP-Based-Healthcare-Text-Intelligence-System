import React from 'react';
import { FileText } from 'lucide-react';
import { SearchResult } from '../types';

interface RelevantDocsCardProps {
  searchResults: SearchResult[];
  isLoading: boolean;
  onViewDoc: (doc: SearchResult) => void;
  onViewAll?: () => void;
}

export const RelevantDocsCard: React.FC<RelevantDocsCardProps> = ({
  searchResults,
  isLoading,
  onViewDoc,
  onViewAll
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Relevant Documents (Medical Information Retrieval)</span>
          </div>

          <button
            onClick={onViewAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors shrink-0 ml-2"
          >
            View All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-y border-slate-200/80 text-[11px] font-bold text-slate-700">
                <th className="py-2 px-2 w-7 text-center">#</th>
                <th className="py-2 px-2.5">Title (PubMed Abstract)</th>
                <th className="py-2 px-2.5 text-right w-16">Similarity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-2 px-2"><div className="h-3 bg-slate-200 rounded w-3 mx-auto"></div></td>
                    <td className="py-2 px-2.5"><div className="h-3 bg-slate-200 rounded w-4/5"></div></td>
                    <td className="py-2 px-2.5 text-right"><div className="h-3 bg-slate-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : searchResults.length > 0 ? (
                searchResults.slice(0, 5).map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onViewDoc(item)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-2 font-mono text-slate-400 font-medium text-center text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2.5">
                      <p className="text-slate-800 font-medium line-clamp-1 text-[11px] hover:text-blue-600">
                        {item.title}
                      </p>
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-slate-600 font-medium text-[11px]">
                      {item.score.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                    No matching documents found.
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
