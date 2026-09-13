// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// ResizeHandlesOverlay.tsx - 8-point resize handles overlay for shapes, text, and images

import React from 'react';
import { RESIZE_HANDLES, ResizeHandleType } from '../viewerTypes';

interface ResizeHandlesOverlayProps {
  onStartResize: (e: React.MouseEvent, handle: ResizeHandleType) => void;
  color?: string;
}

export const ResizeHandlesOverlay: React.FC<ResizeHandlesOverlayProps> = ({
  onStartResize,
  color = '#d946ef',
}) => {
  return (
    <>
      {RESIZE_HANDLES.map(({ handle, cursor, style }) => (
        <div
          key={handle}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartResize(e, handle);
          }}
          style={{ ...style, cursor, backgroundColor: color }}
          className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md z-40 hover:scale-125 transition-transform select-none"
        />
      ))}
    </>
  );
};

