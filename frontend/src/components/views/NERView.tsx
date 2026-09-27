import React, { useState } from 'react';
import { Stethoscope, Tag, CheckCircle2, XCircle, Filter, Sparkles, RefreshCw, Eye } from 'lucide-react';
import { MedicalEntity } from '../../types';

interface NERViewProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  modelType: string;
  setModelType: (type: string) => void;
  entities: MedicalEntity[];
}

export const NERView: React.FC<NERViewProps> = ({
  inputText,
  setInputText,
  onAnalyze,
  isLoading,
  modelType,
  setModelType,
  entities
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  const filteredEntities = selectedTypeFilter === 'ALL'
    ? entities
    : entities.filter(e => e.type.toUpperCase().includes(selectedTypeFilter));

  const countByType = entities.reduce((acc, ent) => {
    const key = ent.type.includes('CHEM') || ent.type.includes('MED') ? 'CHEMICAL/MED' : ent.type;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const renderVisualHighlights = () => {
    if (!inputText) return <p className="text-slate-400 italic text-xs">No text provided.</p>;
    if (entities.length === 0) return <p className="text-slate-700 text-xs leading-relaxed">{inputText}</p>;

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;
    const sorted = [...entities].sort((a, b) => a.start - b.start);

    sorted.forEach((ent, idx) => {
      if (ent.start > lastIdx) {
        elements.push(
          <span key={`txt-${idx}`}>{inputText.slice(lastIdx, ent.start)}</span>
        );
      }

      let color = 'bg-slate-200 text-slate-800 border-slate-300';
      if (ent.type === 'SYMPTOM') color = 'bg-amber-100 text-amber-950 border-amber-300';
      else if (ent.type === 'DISEASE') color = 'bg-rose-100 text-rose-950 border-rose-300';
      else if (ent.type.includes('MED') || ent.type.includes('CHEM')) color = 'bg-cyan-100 text-cyan-950 border-cyan-300';
      else if (ent.type === 'DOSAGE') color = 'bg-emerald-100 text-emerald-950 border-emerald-300';
      else if (ent.type === 'PROCEDURE') color = 'bg-purple-100 text-purple-950 border-purple-300';

      elements.push(
        <mark
          key={`mark-${idx}`}
          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border mx-0.5 inline-block ${color}`}
        >
          {inputText.slice(ent.start, ent.end)}
          <span className="ml-1 text-[9px] font-mono uppercase opacity-75">[{ent.type.slice(0, 4)}]</span>
        </mark>
      );

      lastIdx = Math.max(lastIdx, ent.end);
    });

    if (lastIdx < inputText.length) {
      elements.push(<span key="end-txt">{inputText.slice(lastIdx)}</span>);
    }

    return <div className="leading-loose text-xs font-sans">{elements}</div>;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Medical Named Entity Recognition (NER) Studio
            </h2>
            <p className="text-xs text-slate-500">
              Hybrid Gazetteer & Morphological token n-gram extractor with exact span character tracking.
            </p>
          </div>
        </div>

        {/* Model Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-700 self-start md:self-auto">
          <button
            onClick={() => setModelType('hybrid_gazetteer_ner')}
            className={`px-3 py-1 rounded-md transition-all ${
              modelType === 'hybrid_gazetteer_ner' || modelType === 'biomedical_ml'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hybrid Gazetteer NER
          </button>
          <button
            onClick={() => setModelType('dictionary_baseline')}
            className={`px-3 py-1 rounded-md transition-all ${
              modelType === 'dictionary_baseline'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Naive Dict Baseline
          </button>
        </div>
      </div>

      {/* Main Two-Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Input & Actions */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Clinical Text Input
              </label>
              <span className="text-[11px] text-slate-400">Type or paste below</span>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste patient note, pathology report, or PubMed abstract..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans resize-none"
            />

            {/* Quick Presets */}
            <div className="flex items-center flex-wrap gap-1 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
              <button
                onClick={() => setInputText("The patient has fever, persistent cough and headache. No chest pain or shortness of breath. Paracetamol was prescribed.")}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-600 rounded border border-slate-200"
              >
                Respiratory Note
              </button>
              <button
                onClick={() => setInputText("Patient presented with acute substernal chest pain and severe diaphoresis. Denies palpitations or syncope. Aspirin 300 mg administered.")}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-600 rounded border border-slate-200"
              >
                Cardiac Case
              </button>
              <button
                onClick={() => setInputText("Biopsy revealed colon adenocarcinoma. Patient denies weight loss or abdominal pain. Ciprofloxacin 500 mg orally prescribed.")}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 text-slate-600 rounded border border-slate-200"
              >
                Oncology Case
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onAnalyze}
              disabled={isLoading || !inputText.trim()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Entities...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Medical NER</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live Interactive Visual Markup */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Visual Span Highlighting ({entities.length} Mentions)</span>
              </span>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 text-[10px] font-semibold">
                {['ALL', 'SYMPTOM', 'DISEASE', 'CHEM', 'DOSAGE', 'PROCEDURE'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedTypeFilter(f)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      selectedTypeFilter === f
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 min-h-[140px]">
              {renderVisualHighlights()}
            </div>
          </div>

          {/* Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200/80">
              <span className="text-[10px] text-amber-800 font-bold uppercase block">Symptoms</span>
              <span className="text-sm font-black text-slate-900 font-mono">{countByType['SYMPTOM'] || 0}</span>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg border border-rose-200/80">
              <span className="text-[10px] text-rose-800 font-bold uppercase block">Diseases</span>
              <span className="text-sm font-black text-slate-900 font-mono">{countByType['DISEASE'] || 0}</span>
            </div>
            <div className="p-2 bg-cyan-50 rounded-lg border border-cyan-200/80">
              <span className="text-[10px] text-cyan-800 font-bold uppercase block">Chemicals/Med</span>
              <span className="text-sm font-black text-slate-900 font-mono">{countByType['CHEMICAL/MED'] || 0}</span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200/80">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">Dosages</span>
              <span className="text-sm font-black text-slate-900 font-mono">{countByType['DOSAGE'] || 0}</span>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200/80">
              <span className="text-[10px] text-purple-800 font-bold uppercase block">Procedures</span>
              <span className="text-sm font-black text-slate-900 font-mono">{countByType['PROCEDURE'] || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Entity Extraction Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-slate-900">
            Extracted Entity Mentions ({filteredEntities.length})
          </span>
          <span className="text-xs text-slate-400">
            {modelType === 'hybrid_gazetteer_ner' ? 'Hybrid Gazetteer/Rule-Based NER' : 'Naive Dictionary Baseline'}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2 px-3">Entity Mention</th>
                <th className="py-2 px-3">Entity Type</th>
                <th className="py-2 px-3">Span Offsets</th>
                <th className="py-2 px-3">Negation Status</th>
                <th className="py-2 px-3">Negation Cue</th>
                <th className="py-2 px-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntities.map((e, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{e.entity}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase font-mono">
                      {e.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    [{e.start}, {e.end}]
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      e.status === 'NEGATED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {e.negation_cue ? `"${e.negation_cue}"` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                    {e.confidence.toFixed(2)}
                  </td>
                </tr>
              ))}
              {filteredEntities.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No matching entities found. Click &quot;Run Medical NER&quot; above.
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
