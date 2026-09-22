// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// RibbonHeader.tsx - Office/Lyncub PDF style Top Ribbon Header

import React, { useState } from 'react';
import { 
  Undo2, 
  Redo2, 
  FilePlus, 
  FolderOpen, 
  Save, 
  Download, 
  Printer, 
  Share2, 
  MousePointer2, 
  Hand, 
  TextCursor, 
  Camera, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Edit3,
  Type,
  Baseline,
  ArrowUpDown,
  Image as ImageIcon,
  Split,
  Combine,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
  PenTool,
  Square,
  Circle,
  Minus,
  Highlighter,
  Maximize,
  StickyNote,
  Underline,
  Strikethrough,
  ArrowUpRight,
  Stamp,
  Eraser,
  EyeOff,
  Check,
  Lock,
  Unlock,
  PenLine,
  Info,
  Minimize2
} from 'lucide-react';
import { t } from '../../i18n/translations';
import type { RibbonHeaderProps, RibbonTabType } from './ribbon/ribbonTypes';
import { getRibbonTabs } from './ribbon/ribbonTabs';
import { useRibbonFileInputs } from './ribbon/useRibbonFileInputs';

export type { RibbonTabType } from './ribbon/ribbonTypes';

export const RibbonHeader: React.FC<RibbonHeaderProps> = ({
  fileName,
  hasDocument,
  toolMode,
  language = 'th',
  activeTab: controlledActiveTab,
  onActiveTabChange,
  onSelectTool,
  onOpenFile,
  onNewFile,
  onSavePdf,
  onSaveAsPdf,
  onPrint,
  onExportPdf,
  isExporting,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onAddImage,
  onOpenMergeModal,
  onOpenSplitModal,
  onRotateLeft,
  onRotateRight,
  onDuplicatePage,
  onDeletePage,
  onAddBlankPage,
  onReversePages,
  onTogglePresentation,
  onClearAnnotations,
  onAddCommentItem,
  isSearchOpen,
  onToggleSearch,
  onOpenToolbox,
  onOpenAboutModal,
  onMarkRedaction,
  onApplyRedaction,
  onOpenEncryptModal,
  onOpenDecryptModal,
  onOpenSignatureModal,
  onOpenMetadataModal,
  onOpenCompressModal,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<RibbonTabType>('home');
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const {
    fileInputRef,
    imageInputRef,
    handleFileInputChange,
    handleImageInputChange,
  } = useRibbonFileInputs(onOpenFile, onAddImage);

  const handleTabChange = (tab: RibbonTabType) => {
    setInternalActiveTab(tab);
    onActiveTabChange?.(tab);
  };

  const tabs = getRibbonTabs(language);

  return (
    <header className="z-30 transition-colors">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageInputChange}
        accept="image/*"
        className="hidden"
      />

      <div className="hidden md:block bg-[#f8f9fa] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 select-none shadow-xs">
        {/* Row 1: Ribbon Tab Bar */}
        <div className="flex items-center justify-between px-3 pt-1 border-b border-slate-200/80 dark:border-slate-800 bg-[#f8f9fa] dark:bg-slate-900">
        <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden no-scrollbar" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                data-tour-id={`ribbon-tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                aria-selected={isActive}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-t-md transition-colors relative cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-t-2 border-l border-r border-t-transparent border-slate-200 dark:border-slate-700 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white dark:bg-slate-800 z-10" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Area: File Name */}
        {fileName && (
          <div className="flex items-center gap-2 pb-1">
            <span className="text-[11px] text-slate-400 max-w-[150px] truncate hidden md:inline-block" title={fileName}>
              {fileName}
            </span>
          </div>
        )}
      </div>

      {/* Row 2: Ribbon Toolbar Actions for Active Tab */}
      <div className="h-16 px-3 flex items-center gap-2 overflow-x-auto no-scrollbar bg-[#f8f9fa] dark:bg-slate-900">
        {/* ===================== TAB: หน้าหลัก (HOME) ===================== */}
        {activeTab === 'home' && (
          <>
            {/* Group 1: ประวัติ (History) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1 my-auto">
                <button
                  type="button"
                  onClick={() => {}}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center w-12 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                  title={`${t('undo', language)} (Ctrl+Z)`}
                >
                  <Undo2 className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('undo', language)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {}}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center w-12 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                  title={`${t('redo', language)} (Ctrl+Y)`}
                >
                  <Redo2 className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('redo', language)}</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">{t('groupHistory', language)}</span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800 self-center mx-1" />

            {/* Group 2: ไฟล์ (File) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1 my-auto">
                {/* สร้างใหม่ - Always enabled */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-new"
                  onClick={onNewFile}
                  className="flex flex-col items-center justify-center w-12 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title={t('newFile', language)}
                >
                  <FilePlus className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('newFile', language)}</span>
                </button>

                {/* เปิด - Always enabled */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-open"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-12 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title={t('openFile', language)}
                >
                  <FolderOpen className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('openFile', language)}</span>
                </button>

                {/* บันทึก */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-save"
                  onClick={onSavePdf}
                  disabled={!hasDocument || isExporting}
                  className="flex flex-col items-center justify-center w-12 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                  title={t('save', language)}
                >
                  <Save className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('save', language)}</span>
                </button>

                {/* บันทึกเป็น */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-save-as"
                  onClick={onSaveAsPdf}
                  disabled={!hasDocument || isExporting}
                  className="flex flex-col items-center justify-center w-13 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                  title={t('saveAs', language)}
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('saveAs', language)}</span>
                </button>

                {/* พิมพ์ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-print"
                  onClick={onPrint}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center w-12 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                  title={t('print', language)}
                >
                  <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('print', language)}</span>
                </button>

                {/* ส่งออก */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-export"
                  onClick={onExportPdf}
                  disabled={!hasDocument || isExporting}
                  className="flex flex-col items-center justify-center w-12 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                  title={t('export', language)}
                >
                  <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('export', language)}</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">{t('groupFile', language)}</span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800 self-center mx-1" />

            {/* Group 3: นำทาง (Navigation / Selection Tools) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1.5 my-auto">
                {/* เลือก */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-select"
                  onClick={() => onSelectTool('select')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-3 h-11 rounded-2xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'select'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('select', language)}
                >
                  <MousePointer2 className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'select' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] font-medium leading-none ${hasDocument && toolMode === 'select' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('select', language)}
                  </span>
                </button>

                {/* เลื่อนหน้า (Hand tool) */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-pan"
                  onClick={() => onSelectTool('pan')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2.5 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'pan'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('pan', language)}
                >
                  <Hand className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'pan' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'pan' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>{t('pan', language)}</span>
                </button>

                {/* เลือกข้อความ (Select Text) */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-select-text"
                  onClick={() => onSelectTool('selectText')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'selectText'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('selectText', language)}
                >
                  <TextCursor className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'selectText' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'selectText' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>{t('selectText', language)}</span>
                </button>

                {/* สแนปช็อต (Snapshot) */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-snapshot"
                  onClick={() => onSelectTool('snapshot')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'snapshot'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('snapshot', language)}
                >
                  <Camera className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'snapshot' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'snapshot' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>{t('snapshot', language)}</span>
                </button>

                {/* ค้นหา (Search) */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-search"
                  onClick={onToggleSearch}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && isSearchOpen
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('search', language)}
                >
                  <Search className={`w-4 h-4 mb-0.5 ${hasDocument && isSearchOpen ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && isSearchOpen ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>{t('search', language)}</span>
                </button>

                {/* ขยาย (Zoom in) */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-zoom-in"
                  onClick={onZoomIn}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-2 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('zoomIn', language)}
                >
                  <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('zoomIn', language)}</span>
                </button>

                {/* ย่อ (Zoom out) */}
                <button
                  type="button"
                  data-tour-id="tour-tool-home-zoom-out"
                  onClick={onZoomOut}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-2 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('zoomOut', language)}
                >
                  <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('zoomOut', language)}</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">{t('groupNavigation', language)}</span>
            </div>
          </>
        )}

        {/* ===================== TAB: แก้ไข (EDIT) ===================== */}
        {activeTab === 'edit' && (
          <>
            {/* Group 1: เนื้อหา (Content) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1.5 my-auto">
                {/* แก้ไขข้อความ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-edit-edit-text"
                  onClick={() => onSelectTool('editText')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-3 h-11 rounded-2xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'editText'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('editText', language)}
                >
                  <Baseline className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'editText' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] font-medium leading-none ${hasDocument && toolMode === 'editText' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('editText', language)}
                  </span>
                </button>

                {/* เพิ่มข้อความ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-edit-add-text"
                  onClick={() => onSelectTool('text')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-3 h-11 rounded-2xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'text'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('addText', language)}
                >
                  <Type className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'text' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] font-medium leading-none ${hasDocument && toolMode === 'text' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('addText', language)}
                  </span>
                </button>

                {/* แทรกรูปภาพ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-edit-insert-image"
                  onClick={() => {
                    if (hasDocument) imageInputRef.current?.click();
                  }}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-3 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer border border-transparent"
                  title={t('insertImage', language)}
                >
                  <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('insertImage', language)}</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">{t('groupEditContent', language)}</span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800 self-center mx-1" />

            {/* Group 2: จัดการหน้า (Page Management) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1.5 my-auto">
                {/* หมุนซ้าย */}
                <button
                  type="button"
                  data-tour-id="tour-tool-edit-rotate-left"
                  onClick={onRotateLeft}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-2.5 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('rotateLeft', language)}
                >
                  <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('rotateLeft', language)}</span>
                </button>

                {/* หมุนขวา */}
                <button
                  type="button"
                  data-tour-id="tour-tool-edit-rotate-right"
                  onClick={onRotateRight}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-2.5 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('rotateRight', language)}
                >
                  <RotateCw className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('rotateRight', language)}</span>
                </button>

                {/* ทำซ้ำ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-edit-duplicate-page"
                  onClick={onDuplicatePage}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-2.5 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('duplicate', language)}
                >
                  <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('duplicate', language)}</span>
                </button>

                {/* ลบ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-edit-delete-page"
                  onClick={onDeletePage}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-2.5 h-11 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('deletePage', language)}
                >
                  <Trash2 className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5 hover:text-red-600 dark:hover:text-red-400" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none hover:text-red-600 dark:hover:text-red-400">{t('deletePage', language)}</span>
                </button>

                {/* เพิ่มหน้าว่าง */}
                <button
                  type="button"
                  data-tour-id="tour-tool-edit-blank-page"
                  onClick={onAddBlankPage}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-2.5 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('blankPage', language)}
                >
                  <FilePlus className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('blankPage', language)}</span>
                </button>

                {/* กลับลำดับหน้า */}
                <button
                  type="button"
                  data-tour-id="tour-tool-edit-reverse-pages"
                  onClick={onReversePages}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-2.5 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('reverse', language)}
                >
                  <ArrowUpDown className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('reverse', language)}</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">{t('groupPageManagement', language)}</span>
            </div>
          </>
        )}

        {/* ===================== TAB: ความคิดเห็น (COMMENT) ===================== */}
        {activeTab === 'comment' && (
          <>
            {/* Group 1: มาร์กอัป (Markup) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1.5 my-auto">
                {/* โน้ต */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-note"
                  onClick={() => onAddCommentItem ? onAddCommentItem('note') : onSelectTool('note')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-3 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'note'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('note', language)}
                >
                  <StickyNote className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'note' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'note' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('note', language)}
                  </span>
                </button>

                {/* ไฮไลต์ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-highlight"
                  onClick={() => onAddCommentItem ? onAddCommentItem('highlight') : onSelectTool('highlight')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-3 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'highlight'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('highlight', language)}
                >
                  <Highlighter className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'highlight' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'highlight' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('highlight', language)}
                  </span>
                </button>

                {/* ขีดเส้นใต้ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-underline"
                  onClick={() => onAddCommentItem ? onAddCommentItem('underline') : onSelectTool('underline')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2.5 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'underline'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('underline', language)}
                >
                  <Underline className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'underline' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'underline' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('underline', language)}
                  </span>
                </button>

                {/* ขีดฆ่า */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-strikethrough"
                  onClick={() => onAddCommentItem ? onAddCommentItem('strikethrough') : onSelectTool('strikethrough')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-3 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'strikethrough'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('strikethrough', language)}
                >
                  <Strikethrough className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'strikethrough' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'strikethrough' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('strikethrough', language)}
                  </span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">{t('groupMarkup', language)}</span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800 self-center mx-1" />

            {/* Group 2: รูปร่าง (Shapes) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1.5 my-auto">
                {/* สี่เหลี่ยม */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-rectangle"
                  onClick={() => onAddCommentItem ? onAddCommentItem('rect') : onSelectTool('rect')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2.5 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'rect'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('rectangle', language)}
                >
                  <Square className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'rect' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'rect' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('rectangle', language)}
                  </span>
                </button>

                {/* วงกลม */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-circle"
                  onClick={() => onAddCommentItem ? onAddCommentItem('circle') : onSelectTool('circle')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2.5 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'circle'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('circle', language)}
                >
                  <Circle className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'circle' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'circle' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('circle', language)}
                  </span>
                </button>

                {/* วงรี */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-ellipse"
                  onClick={() => onAddCommentItem ? onAddCommentItem('ellipse') : onSelectTool('ellipse')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2.5 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'ellipse'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={language === 'th' ? 'วงรี' : 'Ellipse'}
                >
                  <svg
                    className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'ellipse' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <ellipse cx="12" cy="12" rx="6.5" ry="9.5" />
                  </svg>
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'ellipse' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {language === 'th' ? 'วงรี' : 'Ellipse'}
                  </span>
                </button>

                {/* ลูกศร */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-arrow"
                  onClick={() => onAddCommentItem ? onAddCommentItem('arrow') : onSelectTool('arrow')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2.5 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'arrow'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('arrow', language)}
                >
                  <ArrowUpRight className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'arrow' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'arrow' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('arrow', language)}
                  </span>
                </button>

                {/* ตราประทับ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-stamp"
                  onClick={() => onAddCommentItem ? onAddCommentItem('stamp') : onSelectTool('stamp')}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-2.5 h-11 rounded-xl transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    hasDocument && toolMode === 'stamp'
                      ? 'border border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                  title={t('stamp', language)}
                >
                  <Stamp className={`w-4 h-4 mb-0.5 ${hasDocument && toolMode === 'stamp' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-300'}`} />
                  <span className={`text-[10px] leading-none ${hasDocument && toolMode === 'stamp' ? 'text-pink-600 dark:text-pink-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {t('stamp', language)}
                  </span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">{t('groupShapes', language)}</span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800 self-center mx-1" />

            {/* Group 3: ล้างข้อมูล (Clear data) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1.5 my-auto">
                {/* ลบคำอธิบายประกอบ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-comment-clear-all"
                  onClick={onClearAnnotations}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-3 h-11 rounded-xl transition-all cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 border border-transparent disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700"
                  title={t('clearAll', language)}
                >
                  <Eraser className="w-4 h-4 mb-0.5 text-slate-600 dark:text-slate-300" />
                  <span className="text-[10px] leading-none text-slate-600 dark:text-slate-300">
                    {t('clearAll', language)}
                  </span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">{language === 'th' ? 'ล้างข้อมูล' : 'Clear Data'}</span>
            </div>
          </>
        )}

        {/* ===================== TAB: มุมมอง (VIEW) ===================== */}
        {activeTab === 'view' && (
          <>
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1.5 my-auto">
                <button
                  type="button"
                  data-tour-id="tour-tool-view-actual-size"
                  onClick={onResetZoom}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-3 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={language === 'th' ? 'ขนาด 100%' : 'Actual Size 100%'}
                >
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">100%</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{language === 'th' ? 'ขนาดจริง' : 'Actual Size'}</span>
                </button>
                <button
                  type="button"
                  data-tour-id="tour-tool-view-presentation"
                  onClick={onTogglePresentation}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-3 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('presentation', language)}
                >
                  <Maximize className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">{t('presentation', language)}</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">{t('groupDisplay', language)}</span>
            </div>
          </>
        )}

        {/* ===================== SECURITY TAB (ความปลอดภัย) ===================== */}
        {activeTab === 'security' && (
          <>
            {/* Group 1: ปกปิดข้อมูล (Redaction) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1.5 my-auto">
                {/* ทำเครื่องหมาย */}
                <button
                  type="button"
                  data-tour-id="tour-tool-security-mark-redaction"
                  onClick={onMarkRedaction}
                  disabled={!hasDocument}
                  className={`flex flex-col items-center justify-center px-3 h-11 rounded-xl transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    toolMode === 'redact'
                      ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                  title={t('markRedaction', language)}
                >
                  <EyeOff className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">
                    {t('markRedaction', language)}
                  </span>
                </button>

                {/* ใช้ */}
                <button
                  type="button"
                  data-tour-id="tour-tool-security-apply-redaction"
                  onClick={onApplyRedaction}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-3 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('applyRedaction', language)}
                >
                  <Check className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">
                    {t('applyRedaction', language)}
                  </span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">
                {t('groupRedaction', language)}
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800 self-center mx-1" />

            {/* Group 2: การป้องกัน (Protection) */}
            <div className="flex flex-col items-center justify-between h-full py-1">
              <div className="flex items-center gap-1.5 my-auto">
                {/* เข้ารหัส */}
                <button
                  type="button"
                  data-tour-id="tour-tool-security-encrypt"
                  onClick={onOpenEncryptModal}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-3 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('encrypt', language)}
                >
                  <Lock className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">
                    {t('encrypt', language)}
                  </span>
                </button>

                {/* ถอดรหัส */}
                <button
                  type="button"
                  data-tour-id="tour-tool-security-decrypt"
                  onClick={onOpenDecryptModal}
                  disabled={!hasDocument}
                  className="flex flex-col items-center justify-center px-3 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                  title={t('decrypt', language)}
                >
                  <Unlock className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">
                    {t('decrypt', language)}
                  </span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">
                {t('groupProtection', language)}
              </span>
            </div>
          </>
        )}

        {/* ===================== TAB: ตรวจสอบ (REVIEW) ===================== */}
        {activeTab === 'review' && (
          <div className="flex flex-col items-center justify-between h-full py-1">
            <div className="flex items-center gap-1.5 my-auto">
              {/* ดูข้อมูลเมทาดาทา */}
              <button
                type="button"
                data-tour-id="tour-tool-review-metadata"
                onClick={onOpenMetadataModal}
                disabled={!hasDocument}
                className="flex flex-col items-center justify-center px-3 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                title={t('viewMetadata', language)}
              >
                <Info className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">
                  {t('viewMetadata', language)}
                </span>
              </button>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">
              {t('groupInspect', language)}
            </span>
          </div>
        )}

        {/* ===================== TAB: เครื่องมือ (TOOLS) ===================== */}
        {activeTab === 'tools' && (
          <div className="flex flex-col items-center justify-between h-full py-1">
            <div className="flex items-center gap-1.5 my-auto">
              {/* ลดขนาดไฟล์ PDF */}
              <button
                type="button"
                data-tour-id="tour-tool-tools-compress"
                onClick={onOpenCompressModal}
                disabled={!hasDocument}
                className="flex flex-col items-center justify-center px-3 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                title={t('compressPdf', language)}
              >
                <Minimize2 className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">
                  {t('compressPdf', language)}
                </span>
              </button>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">
              {t('groupCompress', language)}
            </span>
          </div>
        )}

        {/* ===================== TAB: ฟอร์ม (FORMS) ===================== */}
        {activeTab === 'forms' && (
          <div className="flex flex-col items-center justify-between h-full py-1">
            <div className="flex items-center gap-1.5 my-auto">
              {/* ลายเซ็น */}
              <button
                type="button"
                data-tour-id="tour-tool-forms-signature"
                onClick={onOpenSignatureModal}
                disabled={!hasDocument}
                className="flex flex-col items-center justify-center px-3 h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
                title={t('groupSignature', language)}
              >
                <PenLine className="w-4 h-4 text-slate-600 dark:text-slate-300 mb-0.5" />
                <span className="text-[10px] text-slate-600 dark:text-slate-300 leading-none">
                  {t('groupSignature', language)}
                </span>
              </button>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none tracking-tight">
              {t('groupSignature', language)}
            </span>
          </div>
        )}
      </div>
      </div>
    </header>
  );
};

