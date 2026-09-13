// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// TopHeaderBar.tsx - Top branding and window status bar with SmartDSP PDF logo, dark mode toggle, and settings trigger

import React from 'react';
import { Moon, Sun, Settings, LayoutGrid } from 'lucide-react';
import { AppLanguage, AppTheme } from '../../types/settings';
import { t } from '../../i18n/translations';

interface TopHeaderBarProps {
  fileName?: string;
  hasDocument: boolean;
  language: AppLanguage;
  theme: AppTheme;
  isDarkEffective: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenMobileTools?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  fileName,
  hasDocument,
  language,
  isDarkEffective,
  onToggleDarkMode,
  onOpenSettings,
  onOpenMobileTools,
}) => {
  return (
    <div className="relative z-40 h-11 px-2.5 sm:px-3 bg-[#fbfbfb] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none transition-colors">
      {/* Left: Logo & Branding */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          <img
            src="/DSPLogo.svg"
            alt="SmartDSP PDF Logo"
            className="w-7 h-7 object-contain drop-shadow-xs"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-tight tracking-tight whitespace-nowrap">
            {t('appTitle', language)}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight hidden sm:block">
            {t('appSubtitle', language)}
          </span>
        </div>
      </div>

      {/* Center: Document Title / Status */}
      <div className="flex items-center justify-center px-4 overflow-hidden max-w-[40%] md:max-w-[50%]">
        {hasDocument && fileName ? (
          <span
            className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
            title={fileName}
          >
            {fileName}
          </span>
        ) : (
          <span className="italic text-xs text-slate-400 dark:text-slate-500 font-normal">
            {t('noDocumentOpen', language)}
          </span>
        )}
      </div>

      {/* Right: Dark Mode Toggle & Settings Modal Button */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {hasDocument && onOpenMobileTools && (
          <button
            type="button"
            onClick={onOpenMobileTools}
            className="md:hidden w-8 h-8 rounded-full border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center active:scale-95 transition-all shadow-2xs cursor-pointer"
            title="เครื่องมือทั้งหมด"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 transition-all shadow-2xs cursor-pointer"
          title={t('toggleDarkMode', language)}
          aria-label={t('toggleDarkMode', language)}
        >
          {isDarkEffective ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-200 -rotate-12 hover:rotate-0" />
          )}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 active:scale-95 transition-all shadow-2xs cursor-pointer"
          title={t('settings', language)}
          aria-label={t('settings', language)}
        >
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

