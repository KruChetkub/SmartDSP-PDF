// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// SnapshotSelectionBox.tsx - Drag selection rectangle for Snapshot screen capture

import React from 'react';
import { SnapshotBoxState } from '../viewerTypes';

interface SnapshotSelectionBoxProps {
  box: SnapshotBoxState | null;
  zoom: number;
}

export const SnapshotSelectionBox: React.FC<SnapshotSelectionBoxProps> = ({ box, zoom }) => {
  if (!box) return null;

  const left = Math.min(box.startX, box.currentX) * zoom;
  const top = Math.min(box.startY, box.currentY) * zoom;
  const width = Math.abs(box.currentX - box.startX) * zoom;
  const height = Math.abs(box.currentY - box.startY) * zoom;

  return (
    <div
      className="absolute border-2 border-dashed border-sky-500 bg-sky-400/20 pointer-events-none z-45 flex items-end justify-end p-1 shadow-sm"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <span className="text-[10px] bg-sky-600 text-white px-1.5 py-0.5 rounded font-mono shadow-xs">
        {Math.round(Math.abs(box.currentX - box.startX))} × {Math.round(Math.abs(box.currentY - box.startY))}
      </span>
    </div>
  );
};

