// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// MobileBottomBar.tsx - Touch-optimized swipeable bottom action bar for smartphone screens (< 768px)

import React from 'react';
import { 
  FileText, 
  MousePointer2, 
  Hand, 
  PenTool, 
  Type, 
  Stamp, 
  Highlighter,
  Square,
  Circle,
  ArrowRight,
  Maximize2, 
  Download, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ToolMode } from '../../types';
import { AppLanguage } from '../../types/settings';

interface MobileBottomBarProps {
  hasDocument: boolean;
  currentPageIndex: number;
  totalPages: number;
  toolMode: ToolMode;
  onSelectTool: (mode: ToolMode) => void;
  onOpenThumbnails: () => void;
  onFitWidth: () => void;
  onSavePdf: () => void;
  onOpenMoreMenu: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  language?: AppLanguage;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  hasDocument,
  currentPageIndex,
  totalPages,
  toolMode,
  onSelectTool,
  onOpenThumbnails,
  onFitWidth,
  onSavePdf,
  onOpenMoreMenu,
  onPrevPage,
  onNextPage,
}) => {
  if (!hasDocument) return null;

  return (
    <div 
      style={{ touchAction: 'manipulation', paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-between shadow-lg select-none gap-1 sm:gap-1.5"
    >
      {/* 1. Page navigation & Thumbnails Drawer trigger (Pinned left, shrink-0) */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={currentPageIndex <= 0}
          className="w-8.5 h-8.5 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="หน้าก่อนหน้า"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          type="button"
          onClick={onOpenThumbnails}
          className="h-8.5 px-2 flex items-center gap-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-semibold text-xs border border-pink-200 dark:border-pink-800/60 shadow-2xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          title="ดูหน้าทั้งหมด"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{currentPageIndex + 1}/{totalPages}</span>
        </button>

        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPageIndex >= totalPages - 1}
          className="w-8.5 h-8.5 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="หน้าถัดไป"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-0.5" />

      {/* 2. Scrollable / Swipeable Tools Strip (Smooth horizontal swipe, never squished) */}
      <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar touch-pan-x flex items-center gap-1 py-0.5 px-1 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl">
        <button
          type="button"
          onClick={() => onSelectTool('select')}
          className={`w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'select'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="เลือก / วัตถุ"
        >
          <MousePointer2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('pan')}
          className={`w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'pan'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="เลื่อนหน้าจอ (Hand)"
        >
          <Hand className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('draw')}
          className={`w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'draw'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="วาด / ปากกา"
        >
          <PenTool className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('text')}
          className={`w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'text'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="เพิ่มข้อความ"
        >
          <Type className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('stamp')}
          className={`w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'stamp'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="ตรายาง"
        >
          <Stamp className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('highlight')}
          className={`w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'highlight'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="เน้นข้อความ"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('rect')}
          className={`w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'rect'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="สี่เหลี่ยม"
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('circle')}
          className={`w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'circle'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="วงกลม"
        >
          <Circle className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('arrow')}
          className={`w-8.5 h-8.5 shrink-0 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'arrow'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="ลูกศร"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-0.5" />

      {/* 3. Fit Width, Save, and All Tools (Pinned right, shrink-0, always visible) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onFitWidth}
          className="w-8.5 h-8.5 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 transition-colors active:scale-95 cursor-pointer shadow-2xs"
          title="ปรับพอดีหน้าจอ"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onSavePdf}
          className="w-8.5 h-8.5 flex items-center justify-center rounded-lg bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white shadow-xs transition-colors active:scale-95 cursor-pointer"
          title="บันทึกเอกสาร PDF"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenMoreMenu}
          className="w-8.5 h-8.5 flex items-center justify-center rounded-lg border border-pink-200 dark:border-pink-800/70 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors active:scale-95 cursor-pointer shadow-2xs"
          title="เครื่องมือทั้งหมด"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
