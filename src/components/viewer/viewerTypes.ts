// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// viewerTypes.ts - Internal types and configurations for PdfViewer

import React from 'react';
import { ThaiFontFamily } from '../../types';

export type ResizeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface ResizeHandleConfig {
  handle: ResizeHandleType;
  cursor: string;
  style: React.CSSProperties;
}

export const RESIZE_HANDLES: ResizeHandleConfig[] = [
  { handle: 'nw', cursor: 'nwse-resize', style: { top: -6, left: -6 } },
  { handle: 'n', cursor: 'ns-resize', style: { top: -6, left: 'calc(50% - 6px)' } },
  { handle: 'ne', cursor: 'nesw-resize', style: { top: -6, right: -6 } },
  { handle: 'e', cursor: 'ew-resize', style: { top: 'calc(50% - 6px)', right: -6 } },
  { handle: 'se', cursor: 'nwse-resize', style: { bottom: -6, right: -6 } },
  { handle: 's', cursor: 'ns-resize', style: { bottom: -6, left: 'calc(50% - 6px)' } },
  { handle: 'sw', cursor: 'nesw-resize', style: { bottom: -6, left: -6 } },
  { handle: 'w', cursor: 'ew-resize', style: { top: 'calc(50% - 6px)', left: -6 } },
];

export interface DragItemState {
  id: string;
  type: 'text' | 'image' | 'shape';
  mouseStartX: number;
  mouseStartY: number;
  origX: number;
  origY: number;
  hasMoved?: boolean;
}

export interface ResizeItemState {
  id: string;
  type: 'shape' | 'image';
  handle: ResizeHandleType;
  mouseStartX: number;
  mouseStartY: number;
  origX: number;
  origY: number;
  origWidth: number;
  origHeight: number;
}

export interface RotateItemState {
  id: string;
  type: 'text' | 'image' | 'shape';
  centerX: number;
  centerY: number;
  initialAngle: number;
  origRotation: number;
}

export interface SnapshotBoxState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const getFontFamilyCss = (font: ThaiFontFamily): string => {
  switch (font) {
    case 'TH Sarabun PSK':
    case 'TH Sarabun New':
      return '"TH Sarabun New", "TH Sarabun PSK", Sarabun, sans-serif';
    case 'Noto Sans Thai':
      return '"Noto Sans Thai", sans-serif';
    case 'Angsana New':
      return '"Angsana New", "AngsanaUPC", sans-serif';
    case 'Cordia New':
      return '"Cordia New", "CordiaUPC", sans-serif';
    case 'Helvetica':
    default:
      return 'Helvetica, Arial, sans-serif';
  }
};

