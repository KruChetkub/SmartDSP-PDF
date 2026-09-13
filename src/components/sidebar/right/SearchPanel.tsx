// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// SearchPanel.tsx - In-document text search panel matching Screenshot 4

import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, PanelRightClose, X } from 'lucide-react';
import { ExtractedTextBlock } from '../../../types';
import { AppLanguage } from '../../../types/settings';
import { t } from '../../../i18n/translations';

interface SearchPanelProps {
  extractedTextBlocks: ExtractedTextBlock[];
  currentPageIndex: number;
  language?: AppLanguage;
  onClose: () => void;
  onSelectMatch: (blockId: string, pageIndex: number) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  extractedTextBlocks,
  currentPageIndex,
  language = 'th',
  onClose,
  onSelectMatch,
}) => {
  const [query, setQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);

  // Compute matching blocks
  const matches = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const searchTarget = matchCase ? trimmed : trimmed.toLowerCase();

    return extractedTextBlocks.filter((block) => {
      if (block.isDeleted) return false;
      const text = matchCase ? block.text : block.text.toLowerCase();
      return text.includes(searchTarget);
    });
  }, [extractedTextBlocks, query, matchCase]);

  // Helper to highlight matching keyword in snippet
  const renderHighlightedSnippet = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, matchCase ? 'g' : 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 select-none text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <div className="h-12 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
          {t('searchTab', language)}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="ปิด / Close"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Search Header & Match Case Pill */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
            {t('searchText', language)}
          </span>
          <button
            type="button"
            onClick={() => setMatchCase((prev) => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              matchCase
                ? 'bg-pink-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
            }`}
          >
            {t('matchCase', language)}
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder', language)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-pink-500 shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {!query.trim() ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-16">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              {t('searchPrompt', language)}
            </p>
          </div>
        ) : matches.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-16">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('searchNoMatches', language)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium">
              {language === 'th' ? `พบ ${matches.length} รายการ` : `Found ${matches.length} matches`}
            </div>

            {matches.map((block) => (
              <div
                key={block.id}
                onClick={() => onSelectMatch(block.id, block.pageIndex)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  currentPageIndex === block.pageIndex
                    ? 'border-pink-300 dark:border-pink-900/60 bg-pink-50/40 dark:bg-pink-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {t('pagePrefix', language)} {block.pageIndex + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {renderHighlightedSnippet(block.text, query)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

