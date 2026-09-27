import React, { useState } from 'react';
import {
  FileText,
  FileCheck,
  Sparkles,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  Activity,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SummaryData } from '../../types';

interface SummarizationViewProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  modelType: string;
  setModelType: (type: string) => void;
  summaryData?: SummaryData | null;
}

const SUMMARIZATION_PRESETS = [
  {
    name: 'Hospital Discharge Summary',
    text: 'The patient is a 64-year-old female admitted with acute exacerbation of COPD, presenting with severe dyspnea, productive purulent cough, and low-grade fever. Chest radiography revealed hyperinflation with bilateral basilar infiltrates. She was treated with intravenous methylprednisolone 40 mg daily, nebulized ipratropium/albuterol, and oral azithromycin 500 mg for 5 days. Her oxygenation improved substantially from 88% on room air to 95% on 2L nasal cannula. At discharge, she reports complete resolution of wheezing and minimal dry cough. Vital signs are stable with blood pressure 128/78 mmHg and pulse 76 bpm. She is instructed to follow up in pulmonary clinic in 2 weeks and continue maintenance inhalers.'
  },
  {
    name: 'Emergency Room Consultation',
    text: '45-year-old male presented to the emergency department complaining of sudden-onset, severe epigastric pain radiating to the back for 6 hours. Associated with multiple episodes of non-bilious vomiting and mild diaphoresis. He denies fever, hematemesis, or melena. Physical examination revealed marked epigastric tenderness with voluntary guarding and normal bowel sounds. Laboratory workup showed serum lipase markedly elevated at 1450 U/L and mild leukocytosis of 13,200/uL. Abdominal CT scan confirmed acute interstitial edematous pancreatitis without necrosis or pseudocyst. The patient was admitted to the step-down unit, made NPO, and aggressive IV fluid hydration with Lactated Ringer solution was initiated.'
  },
  {
    name: 'PubMed Clinical Trial Abstract',
    text: 'We evaluated the long-term renal and cardiovascular efficacy of novel SGLT2 inhibitors in patients with type 2 diabetes mellitus and chronic kidney disease. A total of 4,304 participants were randomized across 34 clinical sites to receive either active oral drug or matching placebo once daily. The primary outcome was a composite of sustained decline in estimated GFR, end-stage kidney disease, or cardiovascular death. Over a median follow-up period of 2.6 years, the primary endpoint occurred in 9.2% of the treatment group compared to 14.5% of the placebo group (HR 0.61; 95% CI 0.51-0.72; p < 0.001). Adverse events including ketoacidosis and severe hypoglycemia were rare and balanced across both study cohorts. SGLT2 inhibition significantly slows progression of diabetic nephropathy.'
  }
];

export const SummarizationView: React.FC<SummarizationViewProps> = ({
  inputText,
  setInputText,
  onAnalyze,
  isLoading,
  summaryData
}) => {
  const [copied, setCopied] = useState(false);

  // Split input into individual sentences for the visual salience breakdown
  const rawSentences = inputText
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const selectedSet = new Set(
    (summaryData?.selected_sentences || []).map((s) => s.trim().toLowerCase())
  );

  const handleCopy = () => {
    if (summaryData?.summary) {
      navigator.clipboard.writeText(summaryData.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const summaryWordCount = summaryData?.summary ? summaryData.summary.trim().split(/\s+/).length : 0;
  const reductionPercent = inputWordCount > 0 && summaryWordCount > 0
    ? Math.round((1 - summaryWordCount / inputWordCount) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Extractive Clinical Summarization Engine
                </h2>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Zero Hallucination
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranks clinical sentences via TF-IDF importance weights and clinical entity density. Extracts exact verbatim sentences without generative fabrication.
              </p>
            </div>
          </div>

          {/* Compression Stat Badges */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 self-start md:self-auto">
            <div className="px-3 py-1 bg-white rounded border border-slate-200 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Source Words</div>
              <div className="text-sm font-extrabold text-slate-800">{inputWordCount}</div>
            </div>
            <div className="px-3 py-1 bg-emerald-50 rounded border border-emerald-200 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Summary Words</div>
              <div className="text-sm font-extrabold text-emerald-800">{summaryWordCount}</div>
            </div>
            <div className="px-3 py-1 bg-emerald-100 rounded border border-emerald-300 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-800">Reduction</div>
              <div className="text-sm font-extrabold text-emerald-900">
                {reductionPercent > 0 ? `-${reductionPercent}%` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Clinical Note Text Input */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">
              Clinical Narrative or Multi-Paragraph Medical Document
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Works for any custom length text
          </span>
        </div>

        {/* Narrative Presets */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-500">Document Presets:</span>
          {SUMMARIZATION_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(preset.text)}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 rounded-md border border-slate-200 transition-colors font-medium"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste a complete clinical note, discharge summary, case report, or clinical trial abstract..."
            className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3.5 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500">
            Sentences detected: <span className="font-semibold text-slate-700">{rawSentences.length}</span> |{' '}
            Words: <span className="font-semibold text-slate-700">{inputWordCount}</span>
          </div>
          <button
            onClick={onAnalyze}
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Extractive Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Left = Summary Result, Right = Sentence Salience Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Formatted Summary Card */}
        <div className="lg:col-span-6 bg-[#f2faf7] border border-emerald-200 rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>Generated Extractive Clinical Summary</span>
              </div>
              <div className="flex items-center space-x-2">
                {summaryData && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                    {summaryData.sentence_count} Sentences
                  </span>
                )}
                {summaryData?.summary && (
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-emerald-700 hover:bg-emerald-200/60 rounded border border-emerald-300 transition-colors"
                    title="Copy Summary"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-white/95 rounded-xl border border-emerald-100 min-h-[140px] shadow-xs">
              {summaryData?.summary ? (
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {summaryData.summary}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Click &quot;Generate Extractive Summary&quot; above to process the clinical narrative.
                </p>
              )}
            </div>

            {/* Individual Extracted Sentence Cards */}
            {summaryData?.selected_sentences && summaryData.selected_sentences.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                  Verbatim Sentences Selected:
                </span>
                <div className="space-y-2">
                  {summaryData.selected_sentences.map((sent, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-200 text-xs text-slate-800 flex items-start space-x-2"
                    >
                      <span className="font-mono font-bold text-emerald-700 mt-0.5 bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="leading-relaxed">{sent}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-emerald-200/60 flex items-start space-x-2 text-[11px] text-emerald-900">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>
              <strong>Extractive Methodology:</strong> Sentences are selected directly from the source text based on TF-IDF salience and clinical entity density. No synthetic hallucination is possible.
            </span>
          </div>
        </div>

        {/* Right Column: Sentence-by-Sentence Salience Heatmap */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-900">
                Sentence-by-Sentence Salience Heatmap ({rawSentences.length})
              </span>
            </div>
            <span className="text-xs text-slate-400">Algorithmic Breakdown</span>
          </div>

          <p className="text-xs text-slate-500">
            Green highlighting indicates sentences selected for the summary based on clinical keyword salience:
          </p>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
            {rawSentences.length > 0 ? (
              rawSentences.map((sent, idx) => {
                const isSelected = selectedSet.has(sent.toLowerCase());
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Sentence {idx + 1}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Selected in Summary</span>
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed">{sent}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                Enter text above to see sentence ranking heatmap.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
