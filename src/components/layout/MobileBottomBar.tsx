// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// MobileBottomBar.tsx - Touch-optimized bottom action bar for smartphone screens (< 768px)

import React from 'react';
import { 
  FileText, 
  MousePointer2, 
  Hand, 
  PenTool, 
  Type, 
  Stamp, 
  Maximize2, 
  Download, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ToolMode } from '../../types';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';

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
  language = 'th',
}) => {
  if (!hasDocument) return null;

  return (
    <div 
      style={{ touchAction: 'manipulation' }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-between shadow-lg select-none"
    >
      {/* 1. Page navigation & Thumbnails Drawer trigger */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={currentPageIndex <= 0}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="หน้าก่อนหน้า"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onOpenThumbnails}
          className="h-9 px-2.5 flex items-center gap-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-semibold text-xs border border-pink-200 dark:border-pink-800/60 shadow-2xs active:scale-95 transition-all cursor-pointer"
          title="ดูหน้าทั้งหมด"
        >
          <FileText className="w-4 h-4" />
          <span>{currentPageIndex + 1}/{totalPages}</span>
        </button>

        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPageIndex >= totalPages - 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="หน้าถัดไป"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Quick Active Tools (Select, Pan, Draw, Text, Stamp) */}
      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
        <button
          type="button"
          onClick={() => onSelectTool('select')}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
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
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
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
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
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
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
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
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            toolMode === 'stamp'
              ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="ตรายาง"
        >
          <Stamp className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Fit Width, Save, and More */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onFitWidth}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
          title="ปรับพอดีหน้าจอ"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onSavePdf}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-pink-600 hover:bg-pink-700 text-white shadow-xs transition-colors active:scale-95 cursor-pointer"
          title="บันทึกเอกสาร PDF"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenMoreMenu}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
          title="เครื่องมือเพิ่มเติม"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

