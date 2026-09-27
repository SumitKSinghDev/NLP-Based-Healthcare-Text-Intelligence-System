import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-y border-amber-200/90 px-6 py-2.5 text-xs text-amber-950 flex items-center justify-between">
      <div className="max-w-[1700px] mx-auto w-full flex items-center space-x-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="flex-1 flex items-center flex-wrap gap-x-3 gap-y-1">
          <span className="font-bold text-amber-900">
            Educational NLP Research Prototype:
          </span>
          <span className="text-amber-800">
            Outputs are NLP-derived statistical patterns and not medical advice, diagnosis, or treatment recommendations.
          </span>
          <span className="text-amber-700/80 font-medium">
            Do not enter personally identifiable or confidential patient information.
          </span>
        </div>
      </div>
    </div>
  );
};
