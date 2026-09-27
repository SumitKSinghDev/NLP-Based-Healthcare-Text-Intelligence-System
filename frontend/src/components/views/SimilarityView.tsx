import React, { useState } from 'react';
import { Files, Search, Layers, Eye } from 'lucide-react';
import { SimilarDoc } from '../../types';
import { computeSimilarity } from '../../services/api';

interface SimilarityViewProps {
  inputText: string;
  onViewDoc: (doc: SimilarDoc) => void;
}

export const SimilarityView: React.FC<SimilarityViewProps> = ({ inputText, onViewDoc }) => {
  const [docText, setDocText] = useState(inputText || "The patient has fever, persistent cough and headache. No chest pain or shortness of breath. Paracetamol was prescribed.");
  const [method, setMethod] = useState<'tfidf_lsa' | 'tfidf'>('tfidf_lsa');
  const [results, setResults] = useState<SimilarDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleComputeSimilarity = async (targetMethod?: 'tfidf_lsa' | 'tfidf') => {
    const m = targetMethod || method;
    if (!docText.trim()) return;
    setIsLoading(true);
    try {
      const res = await computeSimilarity(docText, m, 5);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Files className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Biomedical Document Similarity Studio
            </h2>
            <p className="text-xs text-slate-500">
              Matches clinical notes against 2,677 PubMed abstracts using TF-IDF and Latent Semantic Analysis (TF-IDF + LSA TruncatedSVD).
            </p>
          </div>
        </div>
      </div>

      {/* Input & Method Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900">Input Document / Clinical Note:</label>
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => {
                setMethod('tfidf_lsa');
                handleComputeSimilarity('tfidf_lsa');
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                method === 'tfidf_lsa'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TF-IDF + LSA (128D)
            </button>
            <button
              onClick={() => {
                setMethod('tfidf');
                handleComputeSimilarity('tfidf');
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                method === 'tfidf'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard TF-IDF Cosine
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={docText}
          onChange={(e) => setDocText(e.target.value)}
          placeholder="Paste medical record or abstract..."
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={() => handleComputeSimilarity()}
            disabled={isLoading || !docText.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Computing Similarity...' : 'Find Similar Documents'}</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="font-bold text-sm text-slate-900">
          Ranked Matching PubMed Documents ({results.length})
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2 px-2 w-8">Rank</th>
                <th className="py-2 px-3">Title & Summary</th>
                <th className="py-2 px-3 text-right w-28">Similarity Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length > 0 ? (
                results.map((doc, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onViewDoc(doc)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-2 font-mono text-slate-400 font-bold">
                      #{doc.rank}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {doc.snippet}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {doc.similarity_score.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                    Click &quot;Find Similar Documents&quot; to calculate live cosine similarity against the corpus.
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
