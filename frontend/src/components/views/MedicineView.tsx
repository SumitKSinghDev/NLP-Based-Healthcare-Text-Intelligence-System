import React, { useState } from 'react';
import {
  Pill,
  Sparkles,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Layers,
  Activity,
  BookmarkCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { MedicineItem } from '../../types';

interface MedicineViewProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  modelType: string;
  setModelType: (type: string) => void;
  medicines: MedicineItem[];
}

const MEDICATION_PRESETS = [
  {
    name: 'Cardiology Post-MI Regimen',
    text: 'Initiate Aspirin 81 mg oral daily, Atorvastatin 40 mg oral at bedtime, Metoprolol succinate 50 mg BID, and Nitroglycerin 0.4 mg SL PRN for acute angina.'
  },
  {
    name: 'Type 2 Diabetes & Hypertension',
    text: 'Metformin 1000 mg oral BID with meals, Lisinopril 20 mg once daily, and Insulin glargine 15 units subcutaneous at night. Avoid NSAIDs like ibuprofen.'
  },
  {
    name: 'Infectious Disease & Sepsis',
    text: 'Administer Ceftriaxone 2 g IV every 24 hours plus Azithromycin 500 mg IV once daily. Add Paracetamol 650 mg PO Q6H for temperature > 38.5C.'
  },
  {
    name: 'Oncology Chemotherapy Protocol',
    text: 'Cisplatin 75 mg/m2 IV infusion on day 1, with Ondansetron 8 mg IV BID for chemotherapy-induced nausea. Dexamethasone 10 mg IV premedication.'
  }
];

const ATC_LEXICON_DATABASE: Record<string, { generic: string; atc: string; drugClass: string; indications: string; typicalDosage: string }> = {
  metformin: { generic: 'Metformin Hydrochloride', atc: 'A10BA02', drugClass: 'Biguanides / Oral Antidiabetic', indications: 'Type 2 Diabetes Mellitus', typicalDosage: '500 mg - 1000 mg BID' },
  atorvastatin: { generic: 'Atorvastatin Calcium', atc: 'C10AA05', drugClass: 'HMG-CoA Reductase Inhibitor (Statin)', indications: 'Hypercholesterolemia, Atherosclerosis', typicalDosage: '10 mg - 80 mg daily' },
  aspirin: { generic: 'Acetylsalicylic Acid', atc: 'B01AC06', drugClass: 'Platelet Aggregation Inhibitor / NSAID', indications: 'Thromboembolism prevention, ACS, Pain', typicalDosage: '81 mg - 325 mg daily' },
  lisinopril: { generic: 'Lisinopril', atc: 'C09AA03', drugClass: 'ACE Inhibitor', indications: 'Hypertension, Heart Failure', typicalDosage: '10 mg - 40 mg daily' },
  metoprolol: { generic: 'Metoprolol Tartrate/Succinate', atc: 'C07AB02', drugClass: 'Beta-1 Adrenergic Receptor Blocker', indications: 'Hypertension, Angina, Heart Failure', typicalDosage: '25 mg - 100 mg BID' },
  ceftriaxone: { generic: 'Ceftriaxone Sodium', atc: 'J01DD04', drugClass: 'Third-Generation Cephalosporin Antibiotic', indications: 'Bacterial Meningitis, Sepsis, Pneumonia', typicalDosage: '1 g - 2 g IV daily' },
  azithromycin: { generic: 'Azithromycin', atc: 'J01FA10', drugClass: 'Macrolide Antibacterial', indications: 'Atypical Pneumonia, Pharyngitis', typicalDosage: '250 mg - 500 mg daily' },
  paracetamol: { generic: 'Acetaminophen / Paracetamol', atc: 'N02BE01', drugClass: 'Anilide Analgesic & Antipyretic', indications: 'Mild-moderate pain, Fever reduction', typicalDosage: '500 mg - 1000 mg Q4-6H' },
  ciprofloxacin: { generic: 'Ciprofloxacin', atc: 'J01MA02', drugClass: 'Fluoroquinolone Antibacterial', indications: 'Complicated UTI, Gastrointestinal infections', typicalDosage: '250 mg - 750 mg BID' },
  omeprazole: { generic: 'Omeprazole', atc: 'A02BC01', drugClass: 'Proton Pump Inhibitor (PPI)', indications: 'GERD, Peptic Ulcer Disease', typicalDosage: '20 mg - 40 mg daily' },
  heparin: { generic: 'Heparin Sodium', atc: 'B01AB01', drugClass: 'Glycosaminoglycan Anticoagulant', indications: 'DVT, Pulmonary Embolism, Thrombosis', typicalDosage: '5000 units SC BID/TID or IV drip' },
  cisplatin: { generic: 'Cisplatin', atc: 'L01XA01', drugClass: 'Platinum-Based Alkylating Antineoplastic', indications: 'Testicular, Ovarian, Bladder, Lung Cancer', typicalDosage: '50 - 100 mg/m2 IV q3-4w' }
};

export const MedicineView: React.FC<MedicineViewProps> = ({
  inputText,
  setInputText,
  onAnalyze,
  isLoading,
  medicines
}) => {
  const [lexiconSearch, setLexiconSearch] = useState('');

  const candidatesCount = medicines.filter((m) => m.entity_category === 'MEDICINE CANDIDATE').length;
  const chemicalsCount = medicines.filter((m) => m.entity_category !== 'MEDICINE CANDIDATE').length;
  const withDosageCount = medicines.filter((m) => m.dosage && m.dosage !== '—').length;

  const searchedAtcEntry = Object.entries(ATC_LEXICON_DATABASE).find(([k]) =>
    lexiconSearch.trim() && (k.includes(lexiconSearch.toLowerCase().trim()) || lexiconSearch.toLowerCase().trim().includes(k))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-100 text-cyan-700 rounded-xl">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Pharmacology & Rx Prescription Extraction Studio
                </h2>
                <span className="text-[11px] font-semibold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">
                  ATC & Regex Parser
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Distinguishes prescribed therapeutic medicine candidates from general chemical mentions, maps WHO-ATC classifications, and parses dosages, routes, and frequencies.
              </p>
            </div>
          </div>

          {/* Stat Counter Pills */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 self-start md:self-auto">
            <div className="px-3 py-1 bg-white rounded border border-slate-200 text-center shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Mentions</div>
              <div className="text-sm font-extrabold text-slate-800">{medicines.length}</div>
            </div>
            <div className="px-3 py-1 bg-cyan-50 rounded border border-cyan-200 text-center">
              <div className="text-[10px] uppercase font-bold text-cyan-700">Rx Candidates</div>
              <div className="text-sm font-extrabold text-cyan-800">{candidatesCount}</div>
            </div>
            <div className="px-3 py-1 bg-emerald-50 rounded border border-emerald-200 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Dosages Parsed</div>
              <div className="text-sm font-extrabold text-emerald-800">{withDosageCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Prescription Text Input Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-bold text-slate-900">
              Prescription Order & Clinical Pharmacology Text
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Works for any custom medication orders or notes
          </span>
        </div>

        {/* Medication Presets */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-500">Clinical Presets:</span>
          {MEDICATION_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(preset.text)}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-cyan-100 hover:text-cyan-900 text-slate-700 rounded-md border border-slate-200 transition-colors font-medium"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter clinical prescription order, medication reconciliation list, or physician treatment plan..."
            className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3.5 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-sans resize-none leading-relaxed"
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
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extracting Pharmacology...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extract & Parse Medications</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extracted Pharmacological Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-600" />
            <span>Extracted Medication Cards ({medicines.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Structured Dosage & Route Attributes</span>
        </div>

        {medicines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-cyan-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 capitalize">
                        {med.text}
                      </h4>
                      {med.generic_name && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          Generic: {med.generic_name}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        med.entity_category === 'MEDICINE CANDIDATE'
                          ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {med.entity_category}
                    </span>
                  </div>

                  {/* ATC Code & Drug Class */}
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Drug Class:</span>
                      <span className="font-semibold text-slate-800 text-right truncate max-w-[150px]">
                        {med.drug_class || 'General Chemical'}
                      </span>
                    </div>
                    {med.atc_code && med.atc_code !== 'N/A' && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">ATC Code:</span>
                        <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                          {med.atc_code}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dosage, Route, Frequency Badges */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-center">
                  <div className="p-1.5 bg-slate-50 rounded">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Dosage</div>
                    <div className="text-[11px] font-bold text-slate-800 font-mono truncate">
                      {med.dosage && med.dosage !== '—' ? med.dosage : '—'}
                    </div>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Route</div>
                    <div className="text-[11px] font-bold text-slate-800 truncate">
                      {med.route && med.route !== '—' ? med.route : '—'}
                    </div>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Freq</div>
                    <div className="text-[11px] font-bold text-slate-800 truncate">
                      {med.frequency && med.frequency !== '—' ? med.frequency : '—'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">
              No medications or chemicals extracted
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enter prescription text above or choose a preset to parse pharmacology.
            </p>
          </div>
        )}
      </div>

      {/* Comprehensive Structured Table */}
      {medicines.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-bold text-slate-900">
                Detailed Pharmacology & Regimen Extraction Table
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Corpus-Aligned Regex & ATC Mapping
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Medication Mention</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">ATC Code & Class</th>
                  <th className="py-2.5 px-3">Dosage / Strength</th>
                  <th className="py-2.5 px-3">Administration Route</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 capitalize">{med.text}</div>
                      {med.generic_name && (
                        <div className="text-[10px] text-slate-400">
                          {med.generic_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          med.entity_category === 'MEDICINE CANDIDATE'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {med.entity_category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">
                        {med.drug_class || 'General Chemical'}
                      </div>
                      {med.atc_code && med.atc_code !== 'N/A' && (
                        <span className="text-[10px] font-mono text-cyan-700 font-semibold">
                          ATC: {med.atc_code}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {med.dosage && med.dosage !== '—' ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                          {med.dosage}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {med.route && med.route !== '—' ? med.route : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {med.frequency && med.frequency !== '—' ? med.frequency : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                      {(med.confidence * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ATC Drug Lexicon Explorer Tool */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-bold text-slate-900">
              WHO-ATC Pharmacological Classification Lexicon Lookup
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Standard Reference Pharmacopeia
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Search standard ATC classifications, generic formulations, indications, and recommended clinical dosage intervals.
        </p>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={lexiconSearch}
            onChange={(e) => setLexiconSearch(e.target.value)}
            placeholder="Search drug by generic or brand name (e.g. Metformin, Atorvastatin, Aspirin, Ceftriaxone, Lisinopril, Cisplatin)..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-sans"
          />
          {lexiconSearch && (
            <button
              onClick={() => setLexiconSearch('')}
              className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Drug Buttons */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Select:</span>
          {Object.keys(ATC_LEXICON_DATABASE).slice(0, 8).map((drug, idx) => (
            <button
              key={idx}
              onClick={() => setLexiconSearch(drug)}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-cyan-100 hover:text-cyan-800 text-slate-600 rounded border border-slate-200 transition-colors capitalize font-medium"
            >
              {drug}
            </button>
          ))}
        </div>

        {/* Searched Lexicon Details Card */}
        {searchedAtcEntry && (
          <div className="mt-3 p-4 bg-cyan-50/70 rounded-xl border border-cyan-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-cyan-950 capitalize">
                  {searchedAtcEntry[0]} ({searchedAtcEntry[1].generic})
                </h4>
                <span className="text-[11px] text-cyan-800 font-medium">
                  {searchedAtcEntry[1].drugClass}
                </span>
              </div>
              <span className="font-mono font-bold text-xs bg-cyan-200 text-cyan-900 px-2.5 py-1 rounded border border-cyan-300">
                ATC: {searchedAtcEntry[1].atc}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-cyan-200/60">
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Indications:</span>
                <span className="text-slate-600">{searchedAtcEntry[1].indications}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Standard Regimen / Dosage:</span>
                <span className="text-slate-600 font-mono font-semibold">{searchedAtcEntry[1].typicalDosage}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
