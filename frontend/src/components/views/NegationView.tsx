import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Layers,
  Scan
} from 'lucide-react';

interface NegationViewProps {
  inputText: string;
}

const PRESET_NEGATION_EXAMPLES = [
  { text: "No chest pain or shortness of breath.", entity: "chest pain", expected: "NEGATED" },
  { text: "Patient denies fever, but complains of severe migraine.", entity: "fever", expected: "NEGATED" },
  { text: "Patient denies fever, but complains of severe migraine.", entity: "migraine", expected: "PRESENT" },
  { text: "CT scan rules out intracranial hemorrhage.", entity: "intracranial hemorrhage", expected: "NEGATED" },
  { text: "There is no evidence of pneumonia on chest x-ray.", entity: "pneumonia", expected: "NEGATED" },
  { text: "The patient does not report headache.", entity: "headache", expected: "NEGATED" },
  { text: "Shortness of breath and palpitations are absent.", entity: "palpitations", expected: "NEGATED" },
  { text: "Patient presented with severe abdominal pain and nausea.", entity: "abdominal pain", expected: "PRESENT" },
  { text: "No significant change; patient continues to have diarrhea.", entity: "diarrhea", expected: "PRESENT" },
  { text: "Patient was without acute distress.", entity: "acute distress", expected: "NEGATED" }
];

export const NegationView: React.FC<NegationViewProps> = ({ inputText }) => {
  const [customText, setCustomText] = useState(
    inputText || "The patient has fever, persistent cough and headache. No chest pain or shortness of breath. Paracetamol was prescribed."
  );
  const [customEntity, setCustomEntity] = useState("chest pain");
  const [result, setResult] = useState<{ status: string; cue: string | null; scope: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scanned entities from full text
  const [scannedEntities, setScannedEntities] = useState<any[] | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Auto-run on mount
  useEffect(() => {
    handleTestNegation(customText, customEntity);
    handleScanAllEntities(customText);
  }, []);

  const handleTestNegation = async (testSent?: string, testEnt?: string) => {
    const s = testSent !== undefined ? testSent : customText;
    const e = testEnt !== undefined ? testEnt : customEntity;
    if (!s.trim() || !e.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/negation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: s, entity: e })
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanAllEntities = async (textToScan?: string) => {
    const t = textToScan !== undefined ? textToScan : customText;
    if (!t.trim()) return;
    setIsScanning(true);
    try {
      const res = await fetch('/api/ner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t, model_type: 'hybrid_gazetteer_ner' })
      });
      if (res.ok) {
        const data = await res.json();
        setScannedEntities(data);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Clinical Negation Detection Studio (NegEx Engine)
                </h2>
                <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Rule-Based Scope Parser
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic clinical negation engine analyzing pre-cues, post-cues, pseudo-negations, and conjunction scope boundaries.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 self-start md:self-auto">
            <div className="px-3 py-1 bg-white rounded border border-slate-200 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Benchmark Cases</div>
              <div className="text-sm font-extrabold text-slate-800">n = 30</div>
            </div>
            <div className="px-3 py-1 bg-blue-50 rounded border border-blue-200 text-center">
              <div className="text-[10px] uppercase font-bold text-blue-700">Conjunctions</div>
              <div className="text-sm font-extrabold text-blue-800">Scope-Aware</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Testing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Input & Entity Form */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">
              Test Any Clinical Sentence & Entity Mention
            </span>
            <span className="text-xs text-slate-400">Live Evaluation</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Clinical Text / Sentence:
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter clinical sentence..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Target Clinical Entity to Evaluate:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customEntity}
                onChange={(e) => setCustomEntity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestNegation()}
                placeholder="e.g. chest pain, fever, pneumonia, headache..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
              />
              <button
                onClick={() => {
                  handleTestNegation();
                  handleScanAllEntities();
                }}
                disabled={isLoading || !customText.trim() || !customEntity.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all shrink-0"
              >
                {isLoading ? 'Analyzing...' : 'Evaluate Status'}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">
              Benchmark Clinical Test Scenarios (Click to Load):
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {PRESET_NEGATION_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomText(ex.text);
                    setCustomEntity(ex.entity);
                    handleTestNegation(ex.text, ex.entity);
                    handleScanAllEntities(ex.text);
                  }}
                  className="w-full text-left p-2 rounded bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 transition-all text-[11px] flex items-center justify-between group"
                >
                  <span className="truncate max-w-[320px] text-slate-700 group-hover:text-blue-700">
                    &quot;{ex.text}&quot; <strong className="text-slate-900 font-mono">({ex.entity})</strong>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ex.expected === 'NEGATED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ex.expected}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Evaluation Result Box */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="font-bold text-sm text-slate-900 mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>NegEx Scope & Status Analysis</span>
            </div>

            {result ? (
              <div className="space-y-3.5">
                {/* Status Hero Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    result.status === 'NEGATED'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Assertion Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-xs ${
                        result.status === 'NEGATED'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-medium">
                    Entity Mention: <strong className="text-slate-900 font-bold">"{customEntity}"</strong>
                  </div>
                </div>

                {/* Cue Token */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                  <span className="text-slate-500 font-semibold block mb-1">
                    Detected Negation Cue Phrase:
                  </span>
                  <div className="font-mono text-xs font-bold text-blue-800">
                    {result.cue ? `"${result.cue}"` : 'None (No negation cue detected in syntactic scope)'}
                  </div>
                </div>

                {/* Scope Sentence */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                  <span className="text-slate-500 font-semibold block mb-1">
                    Syntactic Sentence Scope:
                  </span>
                  <div className="text-slate-800 italic leading-relaxed">
                    &quot;{result.scope}&quot;
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
                <FileCheck2 className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">
                  Click &quot;Evaluate Status&quot; or select a preset example to analyze negation cues and scope.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Engine: NegEx algorithm with conjunction boundary resolution (*&quot;but&quot;*, *&quot;however&quot;*, *&quot;except&quot;*).
          </div>
        </div>
      </div>

      {/* Full Entity Negation Scan Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scan className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">
              Complete Entity-by-Entity Negation Scan for Input Text
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {scannedEntities ? `${scannedEntities.length} entities scanned` : 'Auto-analyzed'}
          </span>
        </div>

        {scannedEntities && scannedEntities.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Entity Mention</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">Assertion Status</th>
                  <th className="py-2.5 px-3 text-center">Trigger Cue</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scannedEntities.map((ent, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 capitalize">
                      {ent.entity}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {ent.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {ent.status === 'NEGATED' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>NEGATED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>PRESENT</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-600">
                      {ent.negation_cue ? `"${ent.negation_cue}"` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setCustomEntity(ent.entity);
                          handleTestNegation(customText, ent.entity);
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
                      >
                        Inspect Scope
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 italic">
            Enter text in the box above to scan entities and detect negation.
          </div>
        )}
      </div>
    </div>
  );
};
