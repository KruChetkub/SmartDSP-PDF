// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// HistoryPanel.tsx - Edit action history log panel

import React from 'react';
import { Clock, PanelRightClose, Trash2, History } from 'lucide-react';
import { HistoryItem } from '../../../types';
import { AppLanguage } from '../../../types/settings';
import { t } from '../../../i18n/translations';

interface HistoryPanelProps {
  history: HistoryItem[];
  language?: AppLanguage;
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  language = 'th',
  onClose,
  onClearHistory,
}) => {
  const formatTime = (d: Date) => {
    try {
      return d.toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 select-none text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <div className="h-12 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
          {t('historyTab', language)}
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

      {/* Subheader */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between shrink-0">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
          {t('historyTitle', language)}
        </span>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-[11px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            {t('clearHistory', language)}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-16">
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3 stroke-[1.25]" />
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              {t('noHistory', language)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-start gap-2.5"
              >
                <div className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                  <History className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {item.action}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

