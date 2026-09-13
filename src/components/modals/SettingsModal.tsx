// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// SettingsModal.tsx - Settings dialog with General, Theme, and Advanced preferences tabs

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Sliders, 
  Globe, 
  Check, 
  ChevronDown, 
  Monitor, 
  Sun, 
  Moon,
  X
} from 'lucide-react';
import { 
  AppSettings, 
  AppLanguage, 
  AppTheme, 
  PaperSize, 
  SnapshotDpi, 
  PAPER_SIZES 
} from '../../types/settings';
import { t } from '../../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  systemPrefersDark: boolean;
}

type TabKey = 'general' | 'theme' | 'advanced';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  systemPrefersDark,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [draft, setDraft] = useState<AppSettings>(settings);
  const initialSettingsRef = React.useRef<AppSettings>(settings);

  // Dropdown states
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isPaperSizeOpen, setIsPaperSizeOpen] = useState(false);
  const [isDpiOpen, setIsDpiOpen] = useState(false);

  // Sync draft when opened
  useEffect(() => {
    if (isOpen) {
      initialSettingsRef.current = settings;
      setDraft(settings);
      setIsLangOpen(false);
      setIsPaperSizeOpen(false);
      setIsDpiOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTheme = (newTheme: AppTheme) => {
    const updated: AppSettings = { ...draft, theme: newTheme };
    setDraft(updated);
    onSaveSettings(updated);
  };

  const handleSelectLanguage = (newLang: AppLanguage) => {
    const updated: AppSettings = { ...draft, language: newLang };
    setDraft(updated);
    onSaveSettings(updated);
    setIsLangOpen(false);
  };

  const handleSelectPaperSize = (size: PaperSize) => {
    const updated: AppSettings = { ...draft, newPageSize: size };
    setDraft(updated);
    onSaveSettings(updated);
    setIsPaperSizeOpen(false);
  };

  const handleSelectDpi = (dpi: SnapshotDpi) => {
    const updated: AppSettings = { ...draft, snapshotDpi: dpi };
    setDraft(updated);
    onSaveSettings(updated);
    setIsDpiOpen(false);
  };

  const handleToggleLatinSpacing = () => {
    const updated: AppSettings = { ...draft, disableLatinSpacing: !draft.disableLatinSpacing };
    setDraft(updated);
    onSaveSettings(updated);
  };

  const handleConfirm = () => {
    onSaveSettings(draft);
    onClose();
  };

  const handleCancel = () => {
    onSaveSettings(initialSettingsRef.current);
    setDraft(initialSettingsRef.current);
    onClose();
  };

  const lang = draft.language;

  const dpiOptions: { dpi: SnapshotDpi; labelTh: string; labelEn: string }[] = [
    { dpi: 72, labelTh: '72 DPI (มาตรฐานเว็บ)', labelEn: '72 DPI (Web Standard)' },
    { dpi: 96, labelTh: '96 DPI (หน้าจอ)', labelEn: '96 DPI (Screen)' },
    { dpi: 150, labelTh: '150 DPI (ปานกลาง)', labelEn: '150 DPI (Medium)' },
    { dpi: 300, labelTh: '300 DPI (ความละเอียดสูง - ช้ากว่า)', labelEn: '300 DPI (High Resolution - Slower)' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 select-none">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={() => {
          setIsLangOpen(false);
          setIsPaperSizeOpen(false);
          setIsDpiOpen(false);
        }}
      >
        {/* Main Body: Two Columns */}
        <div className="flex flex-1 overflow-hidden min-h-[460px]">
          {/* Left Column: Sidebar Navigation */}
          <div className="w-60 bg-[#fafafa] dark:bg-slate-950/50 border-r border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between shrink-0">
            <div>
              {/* Header Title & Subtitle */}
              <div className="mb-6">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  {t('settingsTitle', lang)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t('settingsSubtitle', lang)}
                </p>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'general'
                      ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>{t('tabGeneral', lang)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('theme')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'theme'
                      ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Palette className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>{t('tabTheme', lang)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('advanced')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'advanced'
                      ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>{t('tabAdvanced', lang)}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <span>SmartDSP PDF Web v1.0</span>
            </div>
          </div>

          {/* Right Column: Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-900 relative">
            {/* Close Button top right */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ===================== TAB: ทั่วไป (GENERAL) ===================== */}
            {activeTab === 'general' && (
              <div>
                <h4 className="font-bold text-base md:text-lg text-slate-800 dark:text-slate-100">
                  {t('generalHeading', lang)}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('generalSubheading', lang)}
                </p>

                <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-4" />

                {/* App Language Selection */}
                <div className="space-y-1.5 max-w-md">
                  <label className="block text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t('appLanguage', lang)}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {t('appLanguageDesc', lang)}
                  </p>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLangOpen((prev) => !prev);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 shadow-2xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>{draft.language === 'th' ? t('langThai', lang) : t('langEnglish', lang)}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLangOpen && (
                      <div 
                        className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-20 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectLanguage('th')}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer"
                        >
                          <span>{t('langThai', lang)}</span>
                          {draft.language === 'th' && <Check className="w-4 h-4 text-pink-600" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectLanguage('en')}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer"
                        >
                          <span>{t('langEnglish', lang)}</span>
                          {draft.language === 'en' && <Check className="w-4 h-4 text-pink-600" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB: ธีม (THEME) ===================== */}
            {activeTab === 'theme' && (
              <div>
                <h4 className="font-bold text-base md:text-lg text-slate-800 dark:text-slate-100">
                  {t('themeHeading', lang)}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('themeSubheading', lang)}
                </p>

                <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-4" />

                {/* 3 Cards: System, Light, Dark */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  {/* Card 1: ระบบ (System) */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('system')}
                    className={`flex items-start justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                      draft.theme === 'system'
                        ? 'border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 shadow-xs ring-1 ring-pink-500/50'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs mt-0.5">
                        <Monitor className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {t('themeSystem', lang)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('themeCurrent', lang)}
                          {systemPrefersDark ? t('themeDark', lang) : t('themeLight', lang)}
                        </div>
                      </div>
                    </div>
                    {draft.theme === 'system' && (
                      <Check className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {/* Card 2: สว่าง (Light) */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('light')}
                    className={`flex items-start justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                      draft.theme === 'light'
                        ? 'border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 shadow-xs ring-1 ring-pink-500/50'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs mt-0.5">
                        <Sun className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {t('themeLight', lang)}
                        </div>
                      </div>
                    </div>
                    {draft.theme === 'light' && (
                      <Check className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {/* Card 3: มืด (Dark) */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('dark')}
                    className={`flex items-start justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                      draft.theme === 'dark'
                        ? 'border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 shadow-xs ring-1 ring-pink-500/50'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs mt-0.5">
                        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {t('themeDark', lang)}
                        </div>
                      </div>
                    </div>
                    {draft.theme === 'dark' && (
                      <Check className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ===================== TAB: ขั้นสูง (ADVANCED) ===================== */}
            {activeTab === 'advanced' && (
              <div className="space-y-6 pb-2">
                <div>
                  <h4 className="font-bold text-base md:text-lg text-slate-800 dark:text-slate-100">
                    {t('advancedHeading', lang)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('advancedSubheading', lang)}
                  </p>
                </div>

                <div className="h-px bg-slate-200/80 dark:bg-slate-800" />

                {/* 1. ขนาดหน้าเปล่าใหม่ */}
                <div className="space-y-1.5">
                  <div className="font-semibold text-xs md:text-sm text-slate-800 dark:text-slate-200">
                    {t('newPageSizeTitle', lang)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('newPageSizeDesc', lang)}
                  </p>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-1">
                    {t('paperSizeLabel', lang)}
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPaperSizeOpen((prev) => !prev);
                        setIsDpiOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold">{PAPER_SIZES[draft.newPageSize].name}</span>
                        <span className="text-slate-400">
                          {lang === 'th'
                            ? `${PAPER_SIZES[draft.newPageSize].labelTh} · ${PAPER_SIZES[draft.newPageSize].dimensionTh}`
                            : `${PAPER_SIZES[draft.newPageSize].labelEn} · ${PAPER_SIZES[draft.newPageSize].dimensionEn}`}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isPaperSizeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isPaperSizeOpen && (
                      <div
                        className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-20 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(Object.keys(PAPER_SIZES) as PaperSize[]).map((key) => {
                          const size = PAPER_SIZES[key];
                          const isSelected = draft.newPageSize === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleSelectPaperSize(key)}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs md:text-sm text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-pink-50/50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 font-medium'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="font-bold min-w-[50px]">{size.name}</span>
                                <span className="text-slate-400 text-xs">
                                  {lang === 'th' ? `${size.labelTh} · ${size.dimensionTh}` : `${size.labelEn} · ${size.dimensionEn}`}
                                </span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-pink-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. ความละเอียดภาพสแนปชอต (DPI) */}
                <div className="space-y-1.5 pt-2">
                  <div className="font-semibold text-xs md:text-sm text-slate-800 dark:text-slate-200">
                    {t('snapshotDpiTitle', lang)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('snapshotDpiDesc', lang)}
                  </p>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDpiOpen((prev) => !prev);
                        setIsPaperSizeOpen(false);
                      }}
                      className="w-full sm:w-72 flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs md:text-sm text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs transition-all cursor-pointer"
                    >
                      <span className="font-medium">
                        {draft.snapshotDpi} DPI
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDpiOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDpiOpen && (
                      <div
                        className="absolute left-0 w-full sm:w-72 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-20 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {dpiOptions.map((opt) => (
                          <button
                            key={opt.dpi}
                            type="button"
                            onClick={() => handleSelectDpi(opt.dpi)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs md:text-sm text-left transition-colors cursor-pointer ${
                              draft.snapshotDpi === opt.dpi
                                ? 'bg-pink-50/50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 font-medium'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <span>{lang === 'th' ? opt.labelTh : opt.labelEn}</span>
                            {draft.snapshotDpi === opt.dpi && <Check className="w-4 h-4 text-pink-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. ปิดใช้งานการกระจายระยะห่างระหว่างตัวอักษรสำหรับข้อความละติน */}
                <div className="pt-2">
                  <div
                    onClick={handleToggleLatinSpacing}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-all flex items-start gap-3.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={draft.disableLatinSpacing}
                      onChange={handleToggleLatinSpacing}
                      className="mt-1 w-4 h-4 rounded-md text-pink-600 focus:ring-pink-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <div>
                      <div className="font-semibold text-xs md:text-sm text-slate-800 dark:text-slate-100 leading-snug">
                        {t('latinSpacingTitle', lang)}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {t('latinSpacingDesc', lang)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bar: ยกเลิก & ยืนยัน */}
        <div className="border-t border-slate-200/80 dark:border-slate-800 bg-[#f8f9fa] dark:bg-slate-900/90 px-6 py-3 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs md:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
          >
            {t('btnCancel', lang)}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-1.5 rounded-full bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white text-xs md:text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            {t('btnConfirm', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

