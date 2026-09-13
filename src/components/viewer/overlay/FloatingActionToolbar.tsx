// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// FloatingActionToolbar.tsx - Floating Move & Delete action toolbar above selected elements

import React from 'react';
import { Move, Trash2 } from 'lucide-react';

interface FloatingActionToolbarProps {
  onStartDrag: (e: React.MouseEvent | React.TouchEvent) => void;
  onDelete: (e: React.MouseEvent | React.TouchEvent) => void;
  accentColor?: string;
  isBottom?: boolean;
}

export const FloatingActionToolbar: React.FC<FloatingActionToolbarProps> = ({
  onStartDrag,
  onDelete,
  accentColor = '#d946ef',
  isBottom = false,
}) => {
  return (
    <div
      className={`absolute ${
        isBottom ? '-bottom-9' : '-top-9'
      } right-0 flex items-center bg-slate-900/95 text-white rounded-lg shadow-xl px-2 py-0.5 z-50 select-none backdrop-blur-xs border border-slate-700/80 gap-1.5 animate-in fade-in zoom-in-95 duration-75`}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Drag Move Handle */}
      <div
        onMouseDown={onStartDrag}
        onTouchStart={onStartDrag}
        className="px-1.5 py-0.5 hover:bg-slate-700 active:scale-95 rounded text-slate-300 hover:text-white cursor-move transition-colors flex items-center gap-1 text-xs"
        title="คลิกลากเพื่อย้ายตำแหน่ง"
      >
        <Move className="w-3.5 h-3.5" style={{ color: accentColor }} />
        <span className="text-[11px] text-slate-300 font-medium">ย้าย</span>
      </div>

      <div className="w-[1px] h-3.5 bg-slate-700" />

      {/* Delete Button */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(e);
        }}
        className="px-1.5 py-0.5 hover:bg-red-600 active:scale-95 rounded text-red-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1 text-xs"
        title="ลบวัตถุนี้"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium">ลบ</span>
      </button>
    </div>
  );
};

