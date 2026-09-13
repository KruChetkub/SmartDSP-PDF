// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// TextAnnotationLayer.tsx - Layer rendering user created text annotations with inline editing & floating toolbar

import React from 'react';
import { RotateCw } from 'lucide-react';
import { TextAnnotation, ToolMode } from '../../../types';
import { getFontFamilyCss } from '../viewerTypes';
import { FloatingActionToolbar } from '../overlay/FloatingActionToolbar';

interface TextAnnotationLayerProps {
  pageTexts: TextAnnotation[];
  selectedTextAnnotationId: string | null;
  editingTextId: string | null;
  toolMode: ToolMode;
  zoom: number;
  onSelectText: (id: string | null) => void;
  onStartEditing: (id: string | null) => void;
  onUpdateText: (text: TextAnnotation) => void;
  onDeleteText: (id: string) => void;
  onStartDrag: (e: React.MouseEvent | React.TouchEvent, item: TextAnnotation) => void;
  onStartRotate?: (e: React.MouseEvent | React.TouchEvent, item: TextAnnotation) => void;
  onOpenInspector?: () => void;
}

export const TextAnnotationLayer: React.FC<TextAnnotationLayerProps> = ({
  pageTexts,
  selectedTextAnnotationId,
  editingTextId,
  toolMode,
  zoom,
  onSelectText,
  onStartEditing,
  onUpdateText,
  onDeleteText,
  onStartDrag,
  onStartRotate,
  onOpenInspector,
}) => {
  const lastTapRef = React.useRef<{ id: string; time: number } | null>(null);

  return (
    <>
      {pageTexts.map((item) => {
        const isSelected = selectedTextAnnotationId === item.id;
        const isEditing = editingTextId === item.id;
        const textDeco = [
          item.isUnderline ? 'underline' : '',
          item.isStrikethrough ? 'line-through' : ''
        ].filter(Boolean).join(' ') || 'none';

        return (
          <div
            key={item.id}
            id={`text-${item.id}`}
            onMouseDown={(e) => {
              if (toolMode === 'pan' || toolMode === 'selectText') return;
              e.stopPropagation();
              onSelectText(item.id);

              // Allow dragging by clicking anywhere on the text box when not typing in textarea
              if (!isEditing) {
                onStartDrag(e, item);
              }
            }}
            onTouchStart={(e) => {
              if (toolMode === 'pan' || toolMode === 'selectText') return;
              e.stopPropagation();
              onSelectText(item.id);

              const now = Date.now();
              // Double-tap detector: 2 taps on same item within 350ms opens editing tools
              if (lastTapRef.current && lastTapRef.current.id === item.id && now - lastTapRef.current.time < 350) {
                lastTapRef.current = null;
                onOpenInspector?.();
                onStartEditing(item.id);
              } else {
                lastTapRef.current = { id: item.id, time: now };
                // Single touch / hold to drag: do NOT open inspector, just drag
                if (!isEditing) {
                  onStartDrag(e, item);
                }
              }
            }}
            onDoubleClick={(e) => {
              if (toolMode === 'pan' || toolMode === 'selectText') return;
              e.stopPropagation();
              onSelectText(item.id);
              onOpenInspector?.();
              onStartEditing(item.id);
            }}
            className={`absolute transition-shadow ${
              toolMode === 'pan'
                ? 'pointer-events-none select-none'
                : toolMode === 'selectText'
                  ? 'select-text cursor-text pointer-events-auto'
                  : 'select-none'
            } ${
              isSelected
                ? 'outline outline-2 outline-pink-500 bg-pink-500/10 ring-2 ring-pink-200 z-30 shadow-md'
                : 'hover:outline hover:outline-1 hover:outline-dashed hover:outline-pink-400 hover:bg-pink-500/5 z-20 cursor-move'
            }`}
            style={{
              left: `${item.x * zoom}px`,
              top: `${item.y * zoom}px`,
              opacity: item.opacity ?? 1,
              transform: `rotate(${item.rotation || 0}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Top Rotation Knob */}
            {isSelected && !isEditing && toolMode !== 'pan' && onStartRotate && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-7 flex flex-col items-center z-40 pointer-events-auto">
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onStartRotate(e, item);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    onStartRotate(e, item);
                  }}
                  title="ลากเพื่อหมุนกล่องข้อความ (Rotate Text)"
                  className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border-2 border-pink-500 text-pink-600 dark:text-pink-400 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-125 active:scale-125 transition-transform select-none"
                >
                  <RotateCw className="w-2.5 h-2.5" />
                </div>
                <div className="w-[1.5px] h-2 bg-pink-500/80 pointer-events-none" />
              </div>
            )}

            {isEditing ? (
              <textarea
                autoFocus
                rows={item.text.split('\n').length || 1}
                value={item.text}
                onChange={(e) => onUpdateText({ ...item, text: e.target.value })}
                onBlur={() => onStartEditing(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onStartEditing(null);
                  } else if (e.key === 'Escape') {
                    onStartEditing(null);
                  }
                }}
                className="bg-white border border-pink-500 rounded px-1 outline-none shadow-xs w-full resize-none overflow-hidden"
                style={{
                  fontSize: `${item.fontSize * zoom}px`,
                  color: item.color,
                  fontFamily: getFontFamilyCss(item.fontFamily),
                  fontWeight: item.isBold ? 'bold' : 'normal',
                  fontStyle: item.isItalic ? 'italic' : 'normal',
                  textDecoration: textDeco,
                  lineHeight: item.lineHeight ?? 1.2,
                  textAlign: item.textAlign ?? 'left',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: `${item.fontSize * zoom}px`,
                  color: item.color,
                  fontFamily: getFontFamilyCss(item.fontFamily),
                  fontWeight: item.isBold ? 'bold' : 'normal',
                  fontStyle: item.isItalic ? 'italic' : 'normal',
                  textDecoration: textDeco,
                  lineHeight: item.lineHeight ?? 1.2,
                  textAlign: item.textAlign ?? 'left',
                  display: 'inline-block',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {item.text}
              </span>
            )}

            {/* Floating Action Toolbar: Move, Rotate, Edit, and Delete */}
            {isSelected && !isEditing && toolMode !== 'pan' && (
              <FloatingActionToolbar
                onStartDrag={(e) => onStartDrag(e, item)}
                onRotate={(e) => {
                  e.stopPropagation();
                  onUpdateText({
                    ...item,
                    rotation: ((item.rotation || 0) + 90) % 360,
                  });
                }}
                onEdit={() => {
                  onOpenInspector?.();
                }}
                onDelete={() => {
                  onDeleteText(item.id);
                  onSelectText(null);
                }}
                accentColor="#d946ef"
                rotation={item.rotation || 0}
                itemWidth={(() => {
                  const el = typeof document !== 'undefined' ? document.getElementById(`text-${item.id}`) : null;
                  return el ? el.offsetWidth : Math.max(80, item.text.length * item.fontSize * 0.6 * zoom);
                })()}
                itemHeight={(() => {
                  const el = typeof document !== 'undefined' ? document.getElementById(`text-${item.id}`) : null;
                  return el ? el.offsetHeight : item.fontSize * 1.5 * zoom;
                })()}
                pageTopY={item.y * zoom}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

