// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// RightSidebarStrip.tsx - Right vertical icon strip matching Lyncub PDF reference

import React from 'react';
import { 
  Info, 
  FileText, 
  Search, 
  Shield, 
  Clock 
} from 'lucide-react';

import { RightSidebarTab } from '../../types';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';

interface RightSidebarStripProps {
  hasDocument: boolean;
  activeTab: RightSidebarTab | null;
  language?: AppLanguage;
  onToggleTab: (tab: RightSidebarTab) => void;
}

export const RightSidebarStrip: React.FC<RightSidebarStripProps> = ({
  hasDocument,
  activeTab,
  language = 'th',
  onToggleTab,
}) => {
  return (
    <aside className="w-11 bg-[#f8f9fa] dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between py-3 select-none z-20 shrink-0 transition-colors">
      {/* Top 5 Icons */}
      <div className="flex flex-col items-center gap-2">
        {/* 1. ตัวตรวจสอบ (Inspector / Properties) */}
        <button
          type="button"
          onClick={() => onToggleTab('inspector')}
          disabled={!hasDocument}
          className={`w-8 h-8 flex items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            hasDocument && activeTab === 'inspector'
              ? 'rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 font-semibold shadow-2xs ring-1 ring-pink-500/30'
              : 'rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={t('inspectorTab', language)}
          aria-label={t('inspectorTab', language)}
        >
          <Info className="w-4 h-4" />
        </button>

        {/* 2. ความคิดเห็น (Comments) */}
        <button
          type="button"
          onClick={() => onToggleTab('comments')}
          disabled={!hasDocument}
          className={`w-8 h-8 flex items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            hasDocument && activeTab === 'comments'
              ? 'rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 font-semibold shadow-2xs ring-1 ring-pink-500/30'
              : 'rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={t('commentsTab', language)}
          aria-label={t('commentsTab', language)}
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* 3. ค้นหา (Search) */}
        <button
          type="button"
          onClick={() => onToggleTab('search')}
          disabled={!hasDocument}
          className={`w-8 h-8 flex items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            hasDocument && activeTab === 'search'
              ? 'rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 font-semibold shadow-2xs ring-1 ring-pink-500/30'
              : 'rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={`${t('searchTab', language)} (Ctrl+F)`}
          aria-label={t('searchTab', language)}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* 4. ความปลอดภัย (Security) */}
        <button
          type="button"
          onClick={() => onToggleTab('security')}
          disabled={!hasDocument}
          className={`w-8 h-8 flex items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            hasDocument && activeTab === 'security'
              ? 'rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 font-semibold shadow-2xs ring-1 ring-pink-500/30'
              : 'rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={t('securityTab', language)}
          aria-label={t('securityTab', language)}
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* 5. ประวัติ (History) */}
        <button
          type="button"
          onClick={() => onToggleTab('history')}
          disabled={!hasDocument}
          className={`w-8 h-8 flex items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            hasDocument && activeTab === 'history'
              ? 'rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 font-semibold shadow-2xs ring-1 ring-pink-500/30'
              : 'rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={t('historyTab', language)}
          aria-label={t('historyTab', language)}
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
