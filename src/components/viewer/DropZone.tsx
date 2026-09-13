import React, { useState } from 'react';
import { UploadCloud, FileText, ShieldCheck, Type, Combine } from 'lucide-react';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  language?: AppLanguage;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, language = 'th' }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileSelected(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center py-10 px-6 select-none bg-slate-100 dark:bg-slate-950 transition-colors">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-xl p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 shadow-sm ${
          isDragging
            ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-pink-400'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4 shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          {t('dropTitle', language)}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          {t('dropSubtitle', language)}
        </p>

        <label className="cursor-pointer">
          <input
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="hidden"
          />
          <span className="px-6 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer">
            <FileText className="w-4 h-4" />
            {t('dropSelectBtn', language)}
          </span>
        </label>
      </div>

      {/* Feature highlights */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full text-center">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('featureSecure', language)}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('featureSecureDesc', language)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-2">
            <Type className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('featureThai', language)}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('featureThaiDesc', language)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
            <Combine className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t('featureTools', language)}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('featureToolsDesc', language)}
          </p>
        </div>
      </div>
    </div>
  );
};

