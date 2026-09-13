// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// FloatingActionToolbar.tsx - Floating action toolbar with Move, Rotate, Edit, and Delete triggers

import React from 'react';
import { Move, Trash2, Pencil, RotateCw } from 'lucide-react';

interface FloatingActionToolbarProps {
  onStartDrag?: (e: React.MouseEvent | React.TouchEvent) => void;
  onRotate?: (e: React.MouseEvent | React.TouchEvent) => void;
  onEdit?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDelete: (e: React.MouseEvent | React.TouchEvent) => void;
  accentColor?: string;
  isBottom?: boolean;
  rotation?: number;
  itemWidth?: number;
  itemHeight?: number;
  pageTopY?: number;
}

export const FloatingActionToolbar: React.FC<FloatingActionToolbarProps> = ({
  onStartDrag,
  onRotate,
  onEdit,
  onDelete,
  accentColor = '#d946ef',
  isBottom = false,
  rotation = 0,
  itemWidth = 100,
  itemHeight = 40,
  pageTopY,
}) => {
  const rot = rotation || 0;
  const rad = (rot * Math.PI) / 180;

  // Calculate visual half-height of the rotated bounding box in screen pixels
  const halfW = (itemWidth || 100) / 2;
  const halfH = (itemHeight || 40) / 2;
  const visualHalfHeight =
    Math.abs(halfW * Math.sin(rad)) + Math.abs(halfH * Math.cos(rad));

  // Visual top edge of the rotated box relative to the PDF page top
  const topEdgeOnPage =
    pageTopY !== undefined
      ? pageTopY + halfH - visualHalfHeight
      : 100;

  // Only flip to below the box if it is touching the top border of the page (< 8px)
  const shouldFlipToBottom = isBottom || topEdgeOnPage < 8;

  const offsetY = shouldFlipToBottom
    ? Math.round(visualHalfHeight + 10)
    : -Math.round(visualHalfHeight + 38);

  return (
    <div
      className="absolute flex items-center bg-slate-900/95 text-white rounded-lg shadow-xl px-2 py-0.5 z-50 select-none backdrop-blur-xs border border-slate-700/80 gap-1.5 animate-in fade-in zoom-in-95 duration-75 whitespace-nowrap pointer-events-auto"
      style={{
        left: '50%',
        top: '50%',
        transform: `rotate(${-rot}deg) translate(-50%, ${offsetY}px)`,
        transformOrigin: '0 0',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Drag Move Handle */}
      {onStartDrag && (
        <div
          onMouseDown={onStartDrag}
          onTouchStart={onStartDrag}
          className="px-1.5 py-0.5 hover:bg-slate-700 active:scale-95 rounded text-slate-300 hover:text-white cursor-move transition-colors flex items-center gap-1 text-xs"
          title="คลิกลากเพื่อย้ายตำแหน่ง"
        >
          <Move className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-[11px] text-slate-300 font-medium">ย้าย</span>
        </div>
      )}

      {/* Rotate Button (Rotates by 90 degrees) */}
      {onRotate && (
        <>
          {onStartDrag && <div className="w-[1px] h-3.5 bg-slate-700" />}
          <button
            type="button"
            style={{ touchAction: 'manipulation' }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRotate(e);
            }}
            className="px-1.5 py-0.5 hover:bg-slate-700 active:scale-95 rounded text-amber-400 hover:text-amber-300 cursor-pointer transition-colors flex items-center gap-1 text-xs"
            title="หมุนกล่อง 90° ตามเข็มนาฬิกา"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-amber-300">หมุน</span>
          </button>
        </>
      )}

      {/* Edit Button */}
      {onEdit && (
        <>
          {(onStartDrag || onRotate) && <div className="w-[1px] h-3.5 bg-slate-700" />}
          <button
            type="button"
            style={{ touchAction: 'manipulation' }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(e);
            }}
            className="px-1.5 py-0.5 hover:bg-slate-700 active:scale-95 rounded text-pink-400 hover:text-pink-300 cursor-pointer transition-colors flex items-center gap-1 text-xs"
            title="แก้ไขคุณสมบัติ / เปิดแผงแก้ไข"
          >
            <Pencil className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[11px] font-medium text-pink-300">แก้ไข</span>
          </button>
        </>
      )}

      <div className="w-[1px] h-3.5 bg-slate-700" />

      {/* Delete Button */}
      <button
        type="button"
        style={{ touchAction: 'manipulation' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
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
