import React from 'react';
import { Heart, Plus, Search, Bell } from 'lucide-react';

interface HeaderProps {
  onSearchQuery?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchQuery }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs px-6 py-3">
      <div className="max-w-[1750px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Branding and Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 relative">
            <Heart className="w-5 h-5 fill-white text-white" />
            <Plus className="w-2.5 h-2.5 text-blue-600 absolute stroke-[3]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              Healthcare Text Intelligence
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              NLP-Based Medical Entity Extraction, Symptom Analysis &amp; Clinical Information Retrieval
            </p>
          </div>
        </div>

        {/* Center-Right: Search bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents, symptoms, diseases..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearchQuery) {
                  onSearchQuery((e.target as HTMLInputElement).value);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-full pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-slate-600" />
          </div>
        </div>

        {/* Right: Notification Bell & Group 6 User Badge */}
        <div className="flex items-center space-x-3">
          {/* Bell icon */}
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* User badge */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
              G6
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Group 6
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-tight">
                NLP Case Study
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
