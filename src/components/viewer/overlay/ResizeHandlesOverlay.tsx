// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// ResizeHandlesOverlay.tsx - 8-point resize handles overlay plus top rotation handle for shapes, text, and images

import React from 'react';
import { RotateCw } from 'lucide-react';
import { RESIZE_HANDLES, ResizeHandleType } from '../viewerTypes';

interface ResizeHandlesOverlayProps {
  onStartResize: (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandleType) => void;
  onStartRotate?: (e: React.MouseEvent | React.TouchEvent) => void;
  color?: string;
}

export const ResizeHandlesOverlay: React.FC<ResizeHandlesOverlayProps> = ({
  onStartResize,
  onStartRotate,
  color = '#d946ef',
}) => {
  return (
    <>
      {/* 1. Top Rotation Handle & Connecting Stem */}
      {onStartRotate && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-7 flex flex-col items-center z-40 pointer-events-auto">
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartRotate(e);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              onStartRotate(e);
            }}
            title="ลากเพื่อหมุนกล่องวัตถุ (Rotate Box)"
            className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border-2 border-pink-500 text-pink-600 dark:text-pink-400 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-125 active:scale-125 transition-transform select-none"
          >
            <RotateCw className="w-2.5 h-2.5" />
          </div>
          <div className="w-[1.5px] h-2 bg-pink-500/80 pointer-events-none" />
        </div>
      )}

      {/* 2. 8-Point Resize Handles */}
      {RESIZE_HANDLES.map(({ handle, cursor, style }) => (
        <div
          key={handle}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartResize(e, handle);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onStartResize(e, handle);
          }}
          style={{ ...style, cursor, backgroundColor: color }}
          className="absolute w-3.5 h-3.5 border-2 border-white rounded-full shadow-md z-40 hover:scale-125 active:scale-125 transition-transform select-none"
        />
      ))}
    </>
  );
};
