import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Brain,
  Utensils,
  Zap,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
  Stethoscope
} from 'lucide-react';
import { SymptomItem } from '../../types';

interface SymptomViewProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  modelType: string;
  setModelType: (type: string) => void;
  symptoms: SymptomItem[];
}

const SYMPTOM_PRESETS = [
  {
    name: 'Respiratory & Infection',
    category: 'Respiratory',
    text: 'Patient presents with persistent productive cough, high fever, shortness of breath, and pleuritic chest pain. Denies hemoptysis or wheezing.'
  },
  {
    name: 'Cardiovascular & Angina',
    category: 'Cardiovascular',
    text: '58-year-old male experiencing crushing substernal chest pain, diaphoresis, palpitations, and acute dyspnea. No syncope or nausea.'
  },
  {
    name: 'Neurological & Cephalea',
    category: 'Neurological',
    text: 'Patient reports severe throbbing headache, dizziness, photophobia, blurred vision, and neck stiffness. Denies seizures or focal weakness.'
  },
  {
    name: 'Gastrointestinal & Hepatic',
    category: 'Gastrointestinal',
    text: 'Patient reports sharp epigastric abdominal pain, persistent vomiting, diarrhea, anorexia, and mild jaundice. No hematemesis or melena.'
  }
];

const ORGAN_SYSTEMS = [
  {
    name: 'Respiratory',
    icon: Wind,
    color: 'sky',
    border: 'border-sky-200',
    bg: 'bg-sky-50',
    badge: 'bg-sky-100 text-sky-800',
    desc: 'Lungs, airways, and gas exchange pathways'
  },
  {
    name: 'Cardiovascular',
    icon: Heart,
    color: 'rose',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    badge: 'bg-rose-100 text-rose-800',
    desc: 'Heart, circulation, perfusion, and rhythm'
  },
  {
    name: 'Neurological',
    icon: Brain,
    color: 'purple',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800',
    desc: 'Brain, central and peripheral nervous system'
  },
  {
    name: 'Gastrointestinal',
    icon: Utensils,
    color: 'amber',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-800',
    desc: 'Digestive tract, stomach, liver, and intestines'
  },
  {
    name: 'General',
    icon: Zap,
    color: 'emerald',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800',
    desc: 'Constitutional and systemic manifestations'
  }
];

export const SymptomView: React.FC<SymptomViewProps> = ({
  inputText,
  setInputText,
  onAnalyze,
  isLoading,
  symptoms
}) => {
  const [lexiconQuery, setLexiconQuery] = useState('');
  const [liveAssocResults, setLiveAssocResults] = useState<any[] | null>(null);
  const [isSearchingLexicon, setIsSearchingLexicon] = useState(false);

  const presentSymptoms = symptoms.filter((s) => s.status === 'PRESENT');
  const negatedSymptoms = symptoms.filter((s) => s.status === 'NEGATED');

  const getSystemCount = (sysName: string) => {
    return symptoms.filter(
      (s) => s.category.toLowerCase() === sysName.toLowerCase()
    ).length;
  };

  const getSymptomsForSystem = (sysName: string) => {
    return symptoms.filter(
      (s) => s.category.toLowerCase() === sysName.toLowerCase()
    );
  };

  const handleLexiconLookup = async (queryTerm?: string) => {
    const term = (queryTerm !== undefined ? queryTerm : lexiconQuery).trim();
    if (!term) return;
    setIsSearchingLexicon(true);
    try {
      const res = await fetch(`/api/symptom-associations/${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        setLiveAssocResults(data);
      } else {
        setLiveAssocResults([]);
      }
    } catch (err) {
      console.error('Lexicon search error:', err);
      setLiveAssocResults([]);
    } finally {
      setIsSearchingLexicon(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Clinical Symptom Extraction & Anatomical System Explorer
                </h2>
                <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Lexicon & NegEx
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Extracts multi-word clinical symptoms, assigns severity weights, maps 5 anatomical organ systems, and resolves clinical negation scope.
              </p>
            </div>
          </div>

          {/* Quick Stat Pill Counter */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 self-start md:self-auto">
            <div className="px-3 py-1 bg-white rounded border border-slate-200 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Found</div>
              <div className="text-sm font-extrabold text-slate-800">{symptoms.length}</div>
            </div>
            <div className="px-3 py-1 bg-emerald-50 rounded border border-emerald-200 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Present</div>
              <div className="text-sm font-extrabold text-emerald-800">{presentSymptoms.length}</div>
            </div>
            <div className="px-3 py-1 bg-rose-50 rounded border border-rose-200 text-center">
              <div className="text-[10px] uppercase font-bold text-rose-700">Negated</div>
              <div className="text-sm font-extrabold text-rose-800">{negatedSymptoms.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Clinical Note Input Area */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-slate-900">
              Clinical Note & Symptom Presentation Input
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Works for any custom patient text
          </span>
        </div>

        {/* Clinical Presets */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-500">Case Presets:</span>
          {SYMPTOM_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(preset.text);
              }}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded-md border border-slate-200 transition-colors font-medium flex items-center space-x-1"
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste any clinical examination note, history of present illness (HPI), or patient symptom narrative..."
            className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3.5 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-sans resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500">
            Length: <span className="font-semibold text-slate-700">{inputText.length}</span> characters |{' '}
            <span className="font-semibold text-slate-700">{inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</span> words
          </div>
          <button
            onClick={onAnalyze}
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extracting Symptoms...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Clinical Symptoms</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Anatomical Organ Systems Breakdown Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Anatomical Organ System Distribution</span>
          </h3>
          <span className="text-xs text-slate-500">5 Mapped Systems</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {ORGAN_SYSTEMS.map((sys, idx) => {
            const Icon = sys.icon;
            const count = getSystemCount(sys.name);
            const sysSymptoms = getSymptomsForSystem(sys.name);

            return (
              <div
                key={idx}
                className={`bg-white rounded-xl border ${
                  count > 0 ? sys.border : 'border-slate-200'
                } p-4 shadow-sm flex flex-col justify-between transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${sys.bg} text-${sys.color}-700`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        count > 0 ? sys.badge : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {count} {count === 1 ? 'mention' : 'mentions'}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900">{sys.name}</h4>
                  <p className="text-[10px] text-slate-400 mb-3">{sys.desc}</p>
                </div>

                {/* Badges of matched symptoms */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {sysSymptoms.length > 0 ? (
                    sysSymptoms.map((sym, sIdx) => (
                      <div
                        key={sIdx}
                        className={`text-[11px] px-2 py-1 rounded flex items-center justify-between ${
                          sym.status === 'NEGATED'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-slate-50 text-slate-800 border border-slate-200'
                        }`}
                      >
                        <span className="font-medium truncate max-w-[110px] capitalize">
                          {sym.canonical_name}
                        </span>
                        {sym.status === 'NEGATED' ? (
                          <span className="text-[9px] font-bold text-rose-600 uppercase">Neg</span>
                        ) : (
                          <span className="text-[9px] font-bold text-emerald-600 uppercase">
                            {sym.severity_weight > 1.0 ? 'High' : 'Active'}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-300 italic text-center py-2">
                      No mentions
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Extracted Symptoms Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-slate-900">
              Extracted Symptom Mentions & Severity Attributes ({symptoms.length})
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Exact Offset Spans & Clinical NegEx
          </span>
        </div>

        {symptoms.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Extracted Mention</th>
                  <th className="py-2.5 px-3">Canonical Concept</th>
                  <th className="py-2.5 px-3">Organ System</th>
                  <th className="py-2.5 px-3 text-center">Severity Factor</th>
                  <th className="py-2.5 px-3 text-center">Negation Status</th>
                  <th className="py-2.5 px-3 text-center">Trigger Cue</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {symptoms.map((sym, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900 font-mono">
                        "{sym.text}"
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-bold capitalize">
                      {sym.canonical_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {sym.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          sym.severity_weight > 1.1
                            ? 'bg-rose-100 text-rose-800'
                            : sym.severity_weight > 0.9
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sym.severity_weight.toFixed(1)}x
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {sym.status === 'NEGATED' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>NEGATED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>PRESENT</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-600">
                      {sym.negation_cue ? `"${sym.negation_cue}"` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                      {(sym.confidence * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">
              No symptoms extracted from current text
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enter clinical text above or click a Case Preset to extract symptoms.
            </p>
          </div>
        )}
      </div>

      {/* Symptom Lexicon & PubMed Literature Co-occurrence Lookup Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">
              Direct Symptom-to-Literature Association Lookup
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Searches 2,677 PubMed abstracts
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Query any symptom term to view literature-derived co-occurring disease entities, PMI scores, and PubMed abstract counts.
        </p>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={lexiconQuery}
            onChange={(e) => setLexiconQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLexiconLookup()}
            placeholder="Type any symptom (e.g. fever, headache, chest pain, nausea, tremor, rash, cough)..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
          />
          <button
            onClick={() => handleLexiconLookup()}
            disabled={isSearchingLexicon || !lexiconQuery.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
          >
            {isSearchingLexicon ? (
              <span>Searching...</span>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search Literature</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Click Badges */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Popular terms:</span>
          {['fever', 'chest pain', 'headache', 'cough', 'nausea', 'dyspnea', 'seizure', 'weakness'].map((t, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLexiconQuery(t);
                handleLexiconLookup(t);
              }}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-600 rounded border border-slate-200 transition-colors font-medium"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Live Lookup Results */}
        {liveAssocResults && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <span>PubMed Co-Occurring Pathologies for:</span>
              <span className="text-blue-700 font-mono">"{lexiconQuery}"</span>
            </div>

            {liveAssocResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {liveAssocResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 capitalize">
                        {item.disease}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PMI: <span className="font-mono font-semibold">{item.pmi ? item.pmi.toFixed(2) : '—'}</span> |{' '}
                        Co-occurrences: <span className="font-mono font-semibold">{item.cooccurrence_count}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                      Score: {((item.confidence || 0.8) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 text-center italic">
                No direct literature associations above co-occurrence threshold found for this query in the indexed corpus.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
