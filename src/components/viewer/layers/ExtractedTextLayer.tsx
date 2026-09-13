// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// ExtractedTextLayer.tsx - Layer rendering extracted PDF text blocks for Direct PDF Editing, search highlighting, and text selection

import React from 'react';
import { ExtractedTextBlock, ToolMode } from '../../../types';
import { getFontFamilyCss } from '../viewerTypes';

interface ExtractedTextLayerProps {
  pageExtractedBlocks: ExtractedTextBlock[];
  selectedExtractedBlockId: string | null;
  editingExtractedId: string | null;
  toolMode: ToolMode;
  zoom: number;
  matchingBlockIds?: Set<string>;
  activeSearchBlockId?: string | null;
  disableLatinSpacing?: boolean;
  onSelectBlock: (id: string | null) => void;
  onStartEditing: (id: string | null) => void;
  onUpdateBlock: (block: ExtractedTextBlock) => void;
  onOpenInspector?: () => void;
}

export const ExtractedTextLayer: React.FC<ExtractedTextLayerProps> = ({
  pageExtractedBlocks,
  selectedExtractedBlockId,
  editingExtractedId,
  toolMode,
  zoom,
  matchingBlockIds,
  activeSearchBlockId,
  disableLatinSpacing = false,
  onSelectBlock,
  onStartEditing,
  onUpdateBlock,
  onOpenInspector,
}) => {
  const lastTapRef = React.useRef<{ id: string; time: number } | null>(null);

  if (pageExtractedBlocks.length === 0) return null;

  return (
    <>
      {pageExtractedBlocks.map((block) => {
        if (block.isDeleted) return null;
        const isSelected = selectedExtractedBlockId === block.id;
        const isEditing = editingExtractedId === block.id;
        const isEdited = !!block.isEdited;
        const isMatch = matchingBlockIds?.has(block.id);
        const isActiveMatch = isMatch && activeSearchBlockId === block.id;
        const textDeco = [
          block.isUnderline ? 'underline' : '',
          block.isStrikethrough ? 'line-through' : ''
        ].filter(Boolean).join(' ') || 'none';

        return (
          <div
            key={block.id}
            id={`block-${block.id}`}
            onClick={(e) => {
              if (toolMode !== 'editText') return;
              e.stopPropagation();
              onSelectBlock(block.id);
            }}
            onTouchStart={(e) => {
              if (toolMode !== 'editText') return;
              e.stopPropagation();
              onSelectBlock(block.id);

              const now = Date.now();
              if (lastTapRef.current && lastTapRef.current.id === block.id && now - lastTapRef.current.time < 350) {
                lastTapRef.current = null;
                onOpenInspector?.();
                onStartEditing(block.id);
              } else {
                lastTapRef.current = { id: block.id, time: now };
              }
            }}
            onDoubleClick={(e) => {
              if (toolMode !== 'editText') return;
              e.stopPropagation();
              onSelectBlock(block.id);
              onOpenInspector?.();
              onStartEditing(block.id);
            }}
            className={`absolute transition-colors ${
              isActiveMatch
                ? 'outline outline-2 outline-amber-500 bg-amber-300/80 shadow-md ring-2 ring-amber-400 z-35 pointer-events-auto'
                : isMatch
                  ? 'outline outline-1 outline-amber-400 bg-yellow-300/60 rounded-xs z-30 pointer-events-auto'
                  : toolMode === 'editText'
                    ? isSelected
                      ? 'outline outline-2 outline-pink-500 outline-offset-1 bg-pink-500/10 ring-2 ring-pink-200 z-30'
                      : 'outline outline-1 outline-dashed outline-pink-300 hover:outline-pink-500 hover:bg-pink-500/10 z-20 cursor-pointer'
                    : toolMode === 'selectText'
                      ? 'z-20 select-text cursor-text pointer-events-auto'
                      : isEdited
                        ? 'z-20 pointer-events-auto'
                        : 'pointer-events-none'
            }`}
            style={{
              left: `${block.x * zoom}px`,
              top: `${block.y * zoom}px`,
              minWidth: `${block.width * zoom}px`,
              minHeight: `${block.height * zoom}px`,
              opacity: block.opacity ?? 1,
            }}
          >
            {/* Opaque white background to hide original PDF text underneath when edited or editing */}
            {(isEdited || isEditing) && (
              <div className="absolute inset-0 bg-white" style={{ zIndex: -1 }} />
            )}

            {isEditing ? (
              <textarea
                autoFocus
                rows={block.text.split('\n').length || 1}
                value={block.text}
                onChange={(e) =>
                  onUpdateBlock({ ...block, text: e.target.value, isEdited: true })
                }
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
                  fontSize: `${block.fontSize * zoom}px`,
                  color: block.color,
                  fontFamily: getFontFamilyCss(block.fontFamily),
                  fontWeight: block.isBold ? 'bold' : 'normal',
                  fontStyle: block.isItalic ? 'italic' : 'normal',
                  textDecoration: textDeco,
                  lineHeight: block.lineHeight ?? 1.2,
                  textAlign: block.textAlign ?? 'left',
                  letterSpacing: disableLatinSpacing ? 'normal' : undefined,
                  wordSpacing: disableLatinSpacing ? '0.04em' : undefined,
                }}
              />
            ) : isEdited ? (
              <span
                style={{
                  fontSize: `${block.fontSize * zoom}px`,
                  color: block.color,
                  fontFamily: getFontFamilyCss(block.fontFamily),
                  fontWeight: block.isBold ? 'bold' : 'normal',
                  fontStyle: block.isItalic ? 'italic' : 'normal',
                  textDecoration: textDeco,
                  lineHeight: block.lineHeight ?? 1.2,
                  textAlign: block.textAlign ?? 'left',
                  letterSpacing: disableLatinSpacing ? 'normal' : undefined,
                  wordSpacing: disableLatinSpacing ? '0.04em' : undefined,
                  display: 'inline-block',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {block.text}
              </span>
            ) : toolMode === 'selectText' ? (
              <span
                style={{
                  fontSize: `${block.fontSize * zoom}px`,
                  color: 'transparent',
                  fontFamily: getFontFamilyCss(block.fontFamily),
                  lineHeight: block.lineHeight ?? 1.2,
                  textAlign: block.textAlign ?? 'left',
                  display: 'inline-block',
                  whiteSpace: 'pre-wrap',
                  userSelect: 'text',
                }}
              >
                {block.text}
              </span>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

