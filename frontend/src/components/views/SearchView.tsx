import React, { useState } from 'react';
import { Search, BookOpen, ExternalLink, Filter, Layers } from 'lucide-react';
import { SearchResult } from '../../types';
import { searchCorpus } from '../../services/api';

interface SearchViewProps {
  onViewDoc: (doc: SearchResult) => void;
}

const POPULAR_QUERIES = [
  "fever cough respiratory infection",
  "hypertension clonidine blood pressure",
  "myocardial infarction chest pain",
  "diabetes mellitus insulin glucose secretion",
  "breast cancer BRCA1 mutations",
  "migraine headache nausea"
];

export const SearchView: React.FC<SearchViewProps> = ({ onViewDoc }) => {
  const [query, setQuery] = useState("fever cough respiratory infection");
  const [method, setMethod] = useState<'bm25' | 'tfidf'>('bm25');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (targetQuery?: string, targetMethod?: 'bm25' | 'tfidf') => {
    const q = targetQuery || query;
    const m = targetMethod || method;
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const res = await searchCorpus(q, m, 8);
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
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Biomedical Information Retrieval Engine (PubMed Corpus)
            </h2>
            <p className="text-xs text-slate-500">
              Search 2,677 indexed PubMed clinical abstracts using Okapi BM25 and TF-IDF rankers with snippet extraction.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900">Clinical Query:</label>
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => {
                setMethod('bm25');
                handleSearch(query, 'bm25');
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                method === 'bm25'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Okapi BM25 Ranker
            </button>
            <button
              onClick={() => {
                setMethod('tfidf');
                handleSearch(query, 'tfidf');
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                method === 'tfidf'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TF-IDF Ranker
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search symptoms, diseases, medications, genes, or clinical conditions..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Searching...' : 'Search Index'}</span>
          </button>
        </div>

        {/* Quick query chips */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Suggested Queries:</span>
          {POPULAR_QUERIES.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(pq);
                handleSearch(pq, method);
              }}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded border border-slate-200/80 transition-colors font-medium"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-slate-900">
            Retrieved PubMed Documents ({results.length})
          </span>
          <span className="text-xs text-slate-400">
            Ranked by {method === 'bm25' ? 'Okapi BM25' : 'TF-IDF'}
          </span>
        </div>

        <div className="space-y-3">
          {results.length > 0 ? (
            results.map((doc, idx) => (
              <div
                key={idx}
                onClick={() => onViewDoc(doc)}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-mono font-bold text-blue-700">#{doc.rank}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono text-slate-500 font-semibold">PMID: {doc.pmid || 'N/A'}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 font-medium">{doc.source || 'PubMed'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                      {doc.title}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-mono font-bold text-xs border border-blue-200">
                    Score: {doc.score.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2.5 line-clamp-3">
                  {doc.snippet}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                  <span className="text-[11px] font-semibold text-blue-600 group-hover:underline flex items-center space-x-1">
                    <span>Read Full Abstract</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 italic text-xs">
              Enter a medical query and click &quot;Search Index&quot; to retrieve ranked PubMed documents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
