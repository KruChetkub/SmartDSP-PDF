// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// LeftSidebarStrip.tsx - Left vertical icon strip matching Lyncub PDF reference

import React from 'react';
import { 
  FileText, 
  Bookmark, 
  Layers, 
  Paperclip 
} from 'lucide-react';

import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';

export type LeftSidebarTab = 'thumbnails' | 'bookmarks' | 'layers' | 'attachments';

interface LeftSidebarStripProps {
  hasDocument: boolean;
  activeTab: LeftSidebarTab | null;
  language?: AppLanguage;
  onToggleTab: (tab: LeftSidebarTab) => void;
  onOpenToolbox?: () => void;
}

export const LeftSidebarStrip: React.FC<LeftSidebarStripProps> = ({
  hasDocument,
  activeTab,
  language = 'th',
  onToggleTab,
}) => {
  return (
    <aside className="w-11 bg-[#f8f9fa] dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between py-3 select-none z-20 shrink-0 transition-colors">
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-2">
        {/* Thumbnails / Pages toggle */}
        <button
          type="button"
          onClick={() => onToggleTab('thumbnails')}
          disabled={!hasDocument}
          className={`w-8 h-8 flex items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            hasDocument && activeTab === 'thumbnails'
              ? 'rounded-full border border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-semibold shadow-2xs'
              : 'rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={t('tabThumbnails', language)}
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Bookmarks */}
        <button
          type="button"
          onClick={() => onToggleTab('bookmarks')}
          disabled={!hasDocument}
          className={`w-8 h-8 flex items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            hasDocument && activeTab === 'bookmarks'
              ? 'rounded-full border border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-semibold shadow-2xs'
              : 'rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={t('tabBookmarks', language)}
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* Layers */}
        <button
          type="button"
          onClick={() => onToggleTab('layers')}
          disabled={!hasDocument}
          className={`w-8 h-8 flex items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            hasDocument && activeTab === 'layers'
              ? 'rounded-full border border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-semibold shadow-2xs'
              : 'rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={t('tabLayers', language)}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Attachments */}
        <button
          type="button"
          onClick={() => onToggleTab('attachments')}
          disabled={!hasDocument}
          className={`w-8 h-8 flex items-center justify-center transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            hasDocument && activeTab === 'attachments'
              ? 'rounded-full border border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-semibold shadow-2xs'
              : 'rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
          title={t('tabAttachments', language)}
        >
          <Paperclip className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom spacer */}
      <div />
    </aside>
  );
};
