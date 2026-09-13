// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// ShapeAnnotationLayer.tsx - Layer rendering shapes, notes, stamps, highlights, and comments

import React from 'react';
import { ShapeAnnotation, ToolMode, AppLanguage } from '../../../types';
import { ResizeHandleType } from '../viewerTypes';
import { FloatingActionToolbar } from '../overlay/FloatingActionToolbar';
import { ResizeHandlesOverlay } from '../overlay/ResizeHandlesOverlay';

interface ShapeAnnotationLayerProps {
  pageShapes: ShapeAnnotation[];
  selectedShapeId?: string | null;
  editingShapeId: string | null;
  toolMode: ToolMode;
  zoom: number;
  language?: AppLanguage;
  onSelectShape?: (id: string | null) => void;
  onStartEditingShape: (id: string | null) => void;
  onUpdateShape: (shape: ShapeAnnotation) => void;
  onDeleteShape: (id: string) => void;
  onStartDrag: (e: React.MouseEvent | React.TouchEvent, shape: ShapeAnnotation) => void;
  onStartResize: (e: React.MouseEvent | React.TouchEvent, shape: ShapeAnnotation, handle: ResizeHandleType) => void;
  onStartRotate?: (e: React.MouseEvent | React.TouchEvent, shape: ShapeAnnotation) => void;
  onOpenInspector?: () => void;
}

export const ShapeAnnotationLayer: React.FC<ShapeAnnotationLayerProps> = ({
  pageShapes,
  selectedShapeId,
  editingShapeId,
  toolMode,
  zoom,
  language = 'th',
  onSelectShape,
  onStartEditingShape,
  onUpdateShape,
  onDeleteShape,
  onStartDrag,
  onStartResize,
  onStartRotate,
  onOpenInspector,
}) => {
  const lastTapRef = React.useRef<{ id: string; time: number } | null>(null);

  return (
    <>
      {pageShapes.map((shape) => {
        const isSelected = selectedShapeId === shape.id;
        const isEditing = editingShapeId === shape.id;

        return (
          <div
            key={shape.id}
            id={`shape-${shape.id}`}
            onMouseDown={(e) => {
              if (toolMode === 'pan' || toolMode === 'selectText') return;
              e.stopPropagation();
              onSelectShape?.(shape.id);
              if (!isEditing) {
                onStartDrag(e, shape);
              }
            }}
            onTouchStart={(e) => {
              if (toolMode === 'pan' || toolMode === 'selectText') return;
              e.stopPropagation();
              onSelectShape?.(shape.id);

              const now = Date.now();
              // Double-tap detector: 2 taps on same shape within 350ms opens inspector bottom sheet
              if (lastTapRef.current && lastTapRef.current.id === shape.id && now - lastTapRef.current.time < 350) {
                lastTapRef.current = null;
                onOpenInspector?.();
                if (shape.type === 'note' || shape.type === 'stamp') {
                  onStartEditingShape(shape.id);
                }
              } else {
                lastTapRef.current = { id: shape.id, time: now };
                if (!isEditing) {
                  onStartDrag(e, shape);
                }
              }
            }}
            onDoubleClick={(e) => {
              if (toolMode === 'pan' || toolMode === 'selectText') return;
              e.stopPropagation();
              onSelectShape?.(shape.id);
              onOpenInspector?.();
              if (shape.type === 'note' || shape.type === 'stamp') {
                onStartEditingShape(shape.id);
              }
            }}
            className={`absolute select-none ${
              toolMode === 'pan' || toolMode === 'selectText'
                ? 'pointer-events-none'
                : 'cursor-move'
            } ${
              isSelected
                ? 'outline-2 outline-dashed outline-[#d946ef] z-30 shadow-md ring-2 ring-[#d946ef]/20'
                : 'hover:outline-1 hover:outline-dashed hover:outline-slate-400 z-20'
            }`}
            style={{
              left: `${shape.x * zoom}px`,
              top: `${shape.y * zoom}px`,
              width: `${shape.width * zoom}px`,
              height: `${shape.height * zoom}px`,
              opacity: shape.opacity ?? 1,
              transform: `rotate(${shape.rotation || 0}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Shape Body Rendering */}
            {shape.type === 'rect' && (
              <div
                className="w-full h-full"
                style={{
                  border: `${shape.strokeWidth * zoom}px solid ${shape.color}`,
                  backgroundColor: shape.fillColor || 'transparent',
                }}
              />
            )}

            {shape.type === 'circle' && (
              <div
                className="w-full h-full rounded-full"
                style={{
                  border: `${shape.strokeWidth * zoom}px solid ${shape.color}`,
                  backgroundColor: shape.fillColor || 'transparent',
                }}
              />
            )}

            {shape.type === 'ellipse' && (
              <div
                className="w-full h-full"
                style={{
                  border: `${shape.strokeWidth * zoom}px solid ${shape.color}`,
                  backgroundColor: shape.fillColor || 'transparent',
                  borderRadius: '50%',
                }}
              />
            )}

            {shape.type === 'line' && (
              <svg className="w-full h-full overflow-visible pointer-events-none">
                <line
                  x1="0"
                  y1="0"
                  x2={shape.width * zoom}
                  y2={shape.height * zoom}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth * zoom}
                  strokeLinecap="round"
                />
              </svg>
            )}

            {shape.type === 'arrow' && (
              <svg className="w-full h-full overflow-visible pointer-events-none">
                <defs>
                  <marker
                    id={`arrowhead-${shape.id}`}
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill={shape.color} />
                  </marker>
                </defs>
                <line
                  x1="0"
                  y1="0"
                  x2={shape.width * zoom}
                  y2={shape.height * zoom}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth * zoom}
                  strokeLinecap="round"
                  markerEnd={`url(#arrowhead-${shape.id})`}
                />
              </svg>
            )}

            {shape.type === 'note' && (
              <div
                className="w-full h-full p-2.5 rounded-lg shadow-lg border border-amber-300 flex flex-col justify-start overflow-hidden transition-all bg-amber-100/95"
                style={{
                  backgroundColor: shape.fillColor || '#fef3c7',
                  borderWidth: `${Math.max(1, shape.strokeWidth)}px`,
                  borderColor: shape.color || '#f59e0b',
                }}
              >
                <div className="flex items-center justify-between border-b border-amber-300/80 pb-1 mb-1.5 text-amber-900 font-bold text-xs select-none">
                  <span>โน้ต</span>
                  <span className="text-[9px] text-amber-700 font-normal">ดับเบิลคลิกเพื่อพิมพ์</span>
                </div>
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={shape.text || ''}
                    onChange={(e) => onUpdateShape({ ...shape, text: e.target.value })}
                    onBlur={() => onStartEditingShape(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') onStartEditingShape(null);
                    }}
                    className="w-full flex-1 bg-transparent text-amber-950 text-xs resize-none outline-none border-none p-0 leading-relaxed font-sans"
                    placeholder="พิมพ์ข้อความโน้ตย่อ..."
                  />
                ) : (
                  <p className="text-amber-950 text-xs leading-relaxed break-words whitespace-pre-wrap flex-1 select-none overflow-y-auto font-sans">
                    {shape.text || 'โน้ตย่อ...'}
                  </p>
                )}
              </div>
            )}

            {shape.type === 'stamp' && (
              <div
                className="w-full h-full flex items-center justify-center p-2 rounded-lg border-2 border-dashed font-bold tracking-wider uppercase text-center shadow-md bg-white/90"
                style={{
                  borderColor: shape.color || '#dc2626',
                  color: shape.color || '#dc2626',
                  backgroundColor: shape.fillColor || 'rgba(255,255,255,0.95)',
                  fontSize: `${(shape.fontSize || 14) * zoom}px`,
                }}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    type="text"
                    value={shape.text || ''}
                    onChange={(e) => onUpdateShape({ ...shape, text: e.target.value })}
                    onBlur={() => onStartEditingShape(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Escape') onStartEditingShape(null);
                    }}
                    className="w-full text-center bg-transparent outline-none border-b border-current font-bold"
                  />
                ) : (
                  <span className="break-words select-none">{shape.text || 'APPROVED'}</span>
                )}
              </div>
            )}

            {shape.type === 'highlight' && (
              <div
                className="w-full h-full rounded-xs mix-blend-multiply"
                style={{
                  backgroundColor: shape.fillColor || shape.color || '#fef08a',
                  opacity: shape.opacity ?? 0.45,
                }}
              />
            )}

            {shape.type === 'underline' && (
              <div
                className="w-full h-full border-b-2"
                style={{
                  borderColor: shape.color || '#2563eb',
                  borderBottomWidth: `${Math.max(2, shape.strokeWidth * zoom)}px`,
                }}
              />
            )}

            {shape.type === 'strikethrough' && (
              <div className="w-full h-full relative flex items-center">
                <div
                  className="w-full"
                  style={{
                    height: `${Math.max(2, shape.strokeWidth * zoom)}px`,
                    backgroundColor: shape.color || '#dc2626',
                  }}
                />
              </div>
            )}

            {shape.type === 'redact' && (
              <div
                className="w-full h-full relative border-2 border-dashed flex items-center justify-center overflow-hidden select-none rounded-xs pointer-events-auto"
                style={{
                  borderWidth: `${Math.max(1, (shape.strokeWidth ?? 2) * zoom)}px`,
                  borderColor: shape.strokeWidth > 0 ? (shape.color || '#ef4444') : 'transparent',
                  backgroundColor: shape.fillColor || '#ef4444',
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-wider bg-white/95 dark:bg-slate-900/95 px-2 py-0.5 rounded-sm shadow-xs border border-slate-300 dark:border-slate-700 pointer-events-none select-none flex items-center gap-1"
                  style={{
                    color: shape.fillColor === '#ffffff' ? '#dc2626' : (shape.color || '#dc2626'),
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: shape.fillColor === '#ffffff' ? '#dc2626' : (shape.color || '#dc2626') }}
                  />
                  {shape.text || (language === 'en' ? 'REDACT' : 'ปกปิด')}
                </span>
              </div>
            )}

            {/* Floating Action Toolbar: Move and Delete */}
            {/* Floating Action Toolbar: Move, Rotate, Edit, and Delete */}
            {isSelected && toolMode !== 'pan' && (
              <FloatingActionToolbar
                onStartDrag={(e) => onStartDrag(e, shape)}
                onRotate={() => {
                  onUpdateShape({
                    ...shape,
                    rotation: ((shape.rotation || 0) + 90) % 360,
                  });
                }}
                onEdit={() => {
                  onOpenInspector?.();
                }}
                onDelete={() => {
                  onDeleteShape(shape.id);
                  onSelectShape?.(null);
                  onStartEditingShape(null);
                }}
                accentColor="#d946ef"
                rotation={shape.rotation || 0}
                itemWidth={shape.width * zoom}
                itemHeight={shape.height * zoom}
                pageTopY={shape.y * zoom}
              />
            )}

            {/* 8 Circular Magenta Resize Handles + Top Rotate Handle */}
            {isSelected && toolMode !== 'pan' && (
              <ResizeHandlesOverlay
                onStartResize={(e, handle) => onStartResize(e, shape, handle)}
                onStartRotate={(e) => onStartRotate?.(e, shape)}
                color="#d946ef"
              />
            )}
          </div>
        );
      })}
    </>
  );
};

