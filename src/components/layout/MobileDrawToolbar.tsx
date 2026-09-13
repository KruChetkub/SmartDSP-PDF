// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// MobileDrawToolbar.tsx - Bottom toolbar for pen color, thickness, and actions on mobile

import React from 'react';
import { Undo2, Trash2, Check, Palette } from 'lucide-react';
import { AppLanguage } from '../../types/settings';

interface MobileDrawToolbarProps {
  isOpen: boolean;
  color: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndoStroke?: () => void;
  onClearStrokes?: () => void;
  onClose: () => void;
  canUndo?: boolean;
  language?: AppLanguage;
}

const INK_COLORS = [
  { hex: '#000000', label: 'ดำ' },
  { hex: '#1d4ed8', label: 'น้ำเงิน' },
  { hex: '#dc2626', label: 'แดง' },
  { hex: '#16a34a', label: 'เขียว' },
  { hex: '#7c3aed', label: 'ม่วง' },
  { hex: '#ea580c', label: 'ส้ม' },
  { hex: '#db2777', label: 'ชมพู' },
];

const STROKE_WIDTHS = [
  { width: 1.5, label: 'บาง' },
  { width: 3, label: 'ปกติ' },
  { width: 5, label: 'หนา' },
  { width: 8, label: 'ไฮไลต์' },
];

export const MobileDrawToolbar: React.FC<MobileDrawToolbarProps> = ({
  isOpen,
  color,
  strokeWidth,
  onColorChange,
  onStrokeWidthChange,
  onUndoStroke,
  onClearStrokes,
  onClose,
  canUndo = false,
  language = 'th',
}) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{ touchAction: 'manipulation' }}
      className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex flex-col gap-2 shadow-2xl select-none animate-in slide-in-from-bottom duration-200"
    >
      {/* Row 1: Pen Colors */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 mr-1">
          {language === 'th' ? 'สีหมึก:' : 'Ink:'}
        </span>

        <div className="flex items-center gap-2">
          {INK_COLORS.map((c) => {
            const isSelected = color.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => onColorChange(c.hex)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isSelected 
                    ? 'ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-xs' 
                    : 'hover:scale-105 active:scale-95 opacity-90'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              >
                {isSelected && (
                  <Check 
                    className={`w-3.5 h-3.5 ${
                      c.hex === '#000000' || c.hex === '#1d4ed8' || c.hex === '#dc2626' || c.hex === '#7c3aed' 
                        ? 'text-white' 
                        : 'text-slate-900'
                    }`} 
                  />
                )}
              </button>
            );
          })}

          {/* Native HTML5 Color Picker */}
          <label 
            className="w-7 h-7 rounded-full border border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-500 flex items-center justify-center cursor-pointer relative shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 text-slate-500"
            title={language === 'th' ? 'เลือกสีอิสระ' : 'Custom Color'}
          >
            <Palette className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Done / Close drawing toolbar */}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto px-2 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{language === 'th' ? 'เสร็จสิ้น' : 'Done'}</span>
        </button>
      </div>

      {/* Row 2: Stroke Widths & Undo/Clear Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-1.5 gap-2">
        {/* Stroke thickness selectors */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          {STROKE_WIDTHS.map((s) => {
            const isSelected = strokeWidth === s.width;
            return (
              <button
                key={s.width}
                type="button"
                onClick={() => onStrokeWidthChange(s.width)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span 
                  className="rounded-full inline-block bg-current" 
                  style={{ width: `${Math.max(3, s.width)}px`, height: `${Math.max(3, s.width)}px` }} 
                />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Undo and Clear page drawings */}
        <div className="flex items-center gap-1">
          {onUndoStroke && (
            <button
              type="button"
              onClick={onUndoStroke}
              disabled={!canUndo}
              className="h-7 px-2 flex items-center gap-1 rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs transition-colors cursor-pointer"
              title={language === 'th' ? 'ย้อนกลับเส้นล่าสุด' : 'Undo Stroke'}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">{language === 'th' ? 'ย้อนกลับ' : 'Undo'}</span>
            </button>
          )}

          {onClearStrokes && (
            <button
              type="button"
              onClick={onClearStrokes}
              disabled={!canUndo}
              className="h-7 px-2 flex items-center gap-1 rounded-lg text-red-600 dark:text-red-400 disabled:opacity-30 disabled:pointer-events-none hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs transition-colors cursor-pointer"
              title={language === 'th' ? 'ล้างเส้นวาดทั้งหมดในหน้านี้' : 'Clear Drawings'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">{language === 'th' ? 'ล้าง' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
