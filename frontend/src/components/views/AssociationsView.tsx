import React, { useState, useEffect } from 'react';
import { GitFork, Search, AlertCircle, Sparkles, BookOpen, ShieldCheck, Database, Layers } from 'lucide-react';
import { AssociationItem } from '../../types';

interface AssociationsViewProps {
  associations: AssociationItem[];
  isLoading: boolean;
}

const COMMON_SYMPTOM_PRESETS = [
  "fever", "chest pain", "persistent cough", "headache", "shortness of breath",
  "abdominal pain", "dizziness", "rash", "nausea", "fatigue", "vomiting", "sore throat"
];

export const AssociationsView: React.FC<AssociationsViewProps> = ({ associations, isLoading }) => {
  const [lookupQuery, setLookupQuery] = useState("fever");
  const [lookupResult, setLookupResult] = useState<any[] | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    handleLookup("fever");
  }, []);

  const handleLookup = async (sym?: string) => {
    const q = sym !== undefined ? sym : lookupQuery;
    if (!q.trim()) return;
    setIsLookingUp(true);
    try {
      const relResponse = await fetch('/api/relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: q })
      });
      if (relResponse.ok) {
        const data = await relResponse.json();
        setLookupResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Symptom–Disease Literature Association Explorer
                </h2>
                <span className="text-[11px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  Corpus Co-occurrence & PMI
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Discovers statistical co-occurrences and Pointwise Mutual Information (PMI) derived from 2,677 indexed PubMed abstracts. Non-diagnostic.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 self-start md:self-auto">
            <div className="px-3 py-1 bg-white rounded border border-slate-200 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Indexed Abstracts</div>
              <div className="text-sm font-extrabold text-slate-800">2,677</div>
            </div>
            <div className="px-3 py-1 bg-rose-50 rounded border border-rose-200 text-center">
              <div className="text-[10px] uppercase font-bold text-rose-700">Metric</div>
              <div className="text-sm font-extrabold text-rose-800">Association Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lookup Tool Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span>Search Literature Associations for Any Symptom</span>
          </span>
          <span className="text-xs text-slate-400">Live Corpus Co-occurrence Query</span>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Type any symptom (e.g. chest pain, fever, rash, dyspnea, nausea, migraine, tremor)..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-sans"
          />
          <button
            onClick={() => handleLookup()}
            disabled={isLookingUp || !lookupQuery.trim()}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
          >
            {isLookingUp ? (
              <span>Querying...</span>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Explore Associations</span>
              </>
            )}
          </button>
        </div>

        {/* Quick presets */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Select:</span>
          {COMMON_SYMPTOM_PRESETS.map((sym, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLookupQuery(sym);
                handleLookup(sym);
              }}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded border border-slate-200/80 transition-colors font-medium capitalize"
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Lookup Results Cards */}
        {lookupResult && lookupResult.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-rose-950 uppercase tracking-wider">
                PubMed Literature Co-occurrence for: <span className="font-mono text-rose-700">"{lookupQuery}"</span>
              </span>
              <span className="text-[11px] text-rose-700 font-semibold">
                Derived from PubMed abstracts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lookupResult.map((res, i) => (
                <div key={i} className="p-3.5 bg-white rounded-lg border border-rose-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900 capitalize">{res.symptom_entity}</span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 font-mono border border-rose-200">
                      Association Score: {res.association_score.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Top Co-Occurring Diseases:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {res.top_predictions && res.top_predictions.length > 0 ? (
                        res.top_predictions.map((p: string, pIdx: number) => (
                          <span key={pIdx} className="text-[11px] font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 capitalize">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-700 font-medium">{res.associated_diseases}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current Analysis Note Associations Table */}
      <div className="bg-[#fff6f6] border border-rose-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-950 font-bold text-sm">
            <GitFork className="w-4 h-4 text-rose-700" />
            <span>Associations Extracted from Current Clinical Note ({associations.length})</span>
          </div>
          <span className="text-xs text-rose-700 font-semibold">
            Contextual Literature Links
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-rose-200 text-[11px] font-bold text-rose-900/70 uppercase tracking-wider">
                <th className="py-2.5 px-3">Symptom / Entity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Associated Pathologies in Literature</th>
                <th className="py-2.5 px-3 text-right">Association Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {associations.length > 0 ? (
                associations.map((item, idx) => (
                  <tr key={idx} className="hover:bg-rose-100/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <span className="bg-white px-2 py-0.5 rounded border border-rose-200 text-rose-950">
                        {item.symptom_entity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'NEGATED' ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {item.associated_diseases}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-900">
                      {(item.association_score || item.confidence || 0.50).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-rose-400 italic text-xs">
                    No symptoms found in current clinical note. Enter clinical text or use the lookup tool above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Disclaimer Notice */}
        <div className="pt-2 border-t border-rose-200/80 flex items-start space-x-2 text-[11px] text-rose-900">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
          <span>
            <strong>Association Disclaimer:</strong> NLP-derived association based on corpus statistics; not a diagnosis.
          </span>
        </div>
      </div>
    </div>
  );
};
