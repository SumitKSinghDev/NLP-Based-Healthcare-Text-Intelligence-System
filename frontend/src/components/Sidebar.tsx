import React from 'react';
import {
  Home,
  FileText,
  Activity,
  Pill,
  Ban,
  GitFork,
  Files,
  Search,
  FileEdit,
  BarChart3,
  Stethoscope,
  Database
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'ner'
  | 'symptoms'
  | 'medicines'
  | 'negation'
  | 'associations'
  | 'similarity'
  | 'search'
  | 'summarization'
  | 'evaluation'
  | 'datasets';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'ner', label: 'Medical NER', icon: FileText },
    { id: 'symptoms', label: 'Symptom Analysis', icon: Activity },
    { id: 'medicines', label: 'Medicine Extraction', icon: Pill },
    { id: 'negation', label: 'Negation Detection', icon: Ban },
    { id: 'associations', label: 'Symptom-Disease Association', icon: GitFork },
    { id: 'similarity', label: 'Similar Documents', icon: Files },
    { id: 'search', label: 'Medical Search', icon: Search },
    { id: 'summarization', label: 'Summarization', icon: FileEdit },
    { id: 'evaluation', label: 'Evaluation', icon: BarChart3 },
    { id: 'datasets', label: 'Datasets & Stats', icon: Database },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
      {/* Navigation List */}
      <div className="py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#e0effe] text-[#1d4ed8] font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#1d4ed8]' : 'text-slate-500'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Promo Card matching reference image */}
      <div className="p-3">
        <div className="bg-[#edf5fe] border border-[#bfdbfe]/80 rounded-2xl p-4 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-white border border-[#bfdbfe] flex items-center justify-center text-blue-600 mb-2 shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 leading-snug">
            NLP for Better<br />Healthcare Insights
          </h4>
          <p className="text-[10px] text-slate-500 mt-2 leading-tight">
            Extract knowledge.<br />
            Support research.<br />
            Improve understanding.
          </p>
        </div>
      </div>
    </aside>
  );
};
