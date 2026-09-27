import React from 'react';
import { FileText, Search } from 'lucide-react';

interface InputCardProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  modelType?: string;
  setModelType?: (type: string) => void;
}

export const SAMPLE_TEXTS = [
  {
    label: 'Respiratory infection',
    text: 'The patient has fever, persistent cough and headache.\nNo chest pain or shortness of breath.\nParacetamol was prescribed.'
  },
  {
    label: 'Diabetes case',
    text: 'Patient diagnosed with type 2 diabetes and hypertension. Reports polyuria and polydipsia. Denies blurred vision or chest pain. Metformin 1000 mg prescribed.'
  },
  {
    label: 'Hypertension',
    text: '58-year-old male with essential hypertension and occasional dizziness. No syncope or palpitations. Started on Lisinopril 20 mg once daily.'
  }
];

export const InputCard: React.FC<InputCardProps> = ({
  inputText,
  setInputText,
  onAnalyze,
  isLoading
}) => {
  const maxLength = 2000;

  const handleTryExample = () => {
    setInputText(SAMPLE_TEXTS[0].text);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span>Input Medical Text</span>
          </div>

          <button
            onClick={handleTryExample}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Try an example
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-2.5">
          Enter a clinical note, medical record or biomedical text:
        </p>

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={4}
            maxLength={maxLength}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="The patient has fever, persistent cough and headache. No chest pain or shortness of breath. Paracetamol was prescribed."
            className="w-full text-xs text-slate-800 bg-white border border-slate-200/90 rounded-xl p-3 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-sans"
          />
          <div className="absolute right-3 bottom-2.5 text-[10px] text-slate-400 font-mono pointer-events-none">
            {inputText.length}/{maxLength}
          </div>
        </div>
      </div>

      {/* Bottom Row: Examples and Action Button */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium mr-0.5">Example:</span>
          {SAMPLE_TEXTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(sample.text)}
              className="text-[11px] px-2.5 py-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg border border-slate-200/80 transition-colors font-medium"
            >
              {sample.label}
            </button>
          ))}
        </div>

        <button
          onClick={onAnalyze}
          disabled={isLoading || !inputText.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          <span>{isLoading ? 'Analyzing...' : 'Analyze Text'}</span>
        </button>
      </div>
    </div>
  );
};
