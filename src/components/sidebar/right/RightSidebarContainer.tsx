// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// RightSidebarContainer.tsx - Multi-tab collapsible container for the 5 right sidebar panels

import React from 'react';
import { 
  RightSidebarTab, 
  ExtractedTextBlock, 
  TextAnnotation, 
  ShapeAnnotation, 
  DrawingAnnotation, 
  PdfMetadata, 
  HistoryItem 
} from '../../../types';
import { AppLanguage } from '../../../types/settings';
import { InspectorPanel } from './InspectorPanel';
import { CommentsPanel } from './CommentsPanel';
import { SearchPanel } from './SearchPanel';
import { SecurityPanel } from './SecurityPanel';
import { HistoryPanel } from './HistoryPanel';

interface RightSidebarContainerProps {
  isOpen: boolean;
  activeTab: RightSidebarTab | null;
  onClose: () => void;
  language?: AppLanguage;
  hasDocument: boolean;
  fileName?: string;
  totalPages: number;
  isModified: boolean;
  metadata?: PdfMetadata;
  toolProfileCount: number;

  // Inspector element props
  selectedExtractedBlock: ExtractedTextBlock | null;
  selectedTextAnnotation: TextAnnotation | null;
  selectedShape?: ShapeAnnotation | null;
  onUpdateExtractedBlock: (block: ExtractedTextBlock) => void;
  onDeleteExtractedBlock: (id: string) => void;
  onUpdateTextAnnotation: (text: TextAnnotation) => void;
  onDeleteTextAnnotation: (id: string) => void;
  onUpdateShape?: (shape: ShapeAnnotation) => void;
  onDeleteShape?: (id: string) => void;

  // Comments props
  textAnnotations: TextAnnotation[];
  shapeAnnotations: ShapeAnnotation[];
  drawingAnnotations: DrawingAnnotation[];
  currentPageIndex: number;
  onSelectPage: (pageIndex: number) => void;
  onSelectTextAnnotation?: (id: string) => void;
  onSelectShape?: (id: string) => void;
  onDeleteDrawing?: (id: string) => void;

  // Search props
  extractedTextBlocks: ExtractedTextBlock[];
  onSelectMatch: (blockId: string, pageIndex: number) => void;

  // Security props
  onOpenPolicy?: () => void;
  isEncrypted?: boolean;
  signaturesCount?: number;
  onOpenEncrypt?: () => void;
  onOpenDecrypt?: () => void;
  onOpenSignature?: () => void;

  // History props
  history: HistoryItem[];
  onClearHistory: () => void;
}

export const RightSidebarContainer: React.FC<RightSidebarContainerProps> = ({
  isOpen,
  activeTab,
  onClose,
  language = 'th',
  hasDocument,
  fileName,
  totalPages,
  isModified,
  metadata,
  toolProfileCount,
  selectedExtractedBlock,
  selectedTextAnnotation,
  selectedShape,
  onUpdateExtractedBlock,
  onDeleteExtractedBlock,
  onUpdateTextAnnotation,
  onDeleteTextAnnotation,
  onUpdateShape,
  onDeleteShape,
  textAnnotations,
  shapeAnnotations,
  drawingAnnotations,
  currentPageIndex,
  onSelectPage,
  onSelectTextAnnotation,
  onSelectShape,
  onDeleteDrawing,
  extractedTextBlocks,
  onSelectMatch,
  onOpenPolicy,
  isEncrypted,
  signaturesCount,
  onOpenEncrypt,
  onOpenDecrypt,
  onOpenSignature,
  history,
  onClearHistory,
}) => {
  if (!isOpen || !activeTab) return null;

  return (
    <aside className="w-72 md:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full z-20 shadow-lg shrink-0 transition-colors animate-in slide-in-from-right-4 duration-150">
      {activeTab === 'inspector' && (
        <InspectorPanel
          hasDocument={hasDocument}
          fileName={fileName}
          totalPages={totalPages}
          isModified={isModified}
          metadata={metadata}
          toolProfileCount={toolProfileCount}
          language={language}
          onClose={onClose}
          selectedExtractedBlock={selectedExtractedBlock}
          selectedTextAnnotation={selectedTextAnnotation}
          selectedShape={selectedShape}
          onUpdateExtractedBlock={onUpdateExtractedBlock}
          onDeleteExtractedBlock={onDeleteExtractedBlock}
          onUpdateTextAnnotation={onUpdateTextAnnotation}
          onDeleteTextAnnotation={onDeleteTextAnnotation}
          onUpdateShape={onUpdateShape}
          onDeleteShape={onDeleteShape}
        />
      )}

      {activeTab === 'comments' && (
        <CommentsPanel
          textAnnotations={textAnnotations}
          shapeAnnotations={shapeAnnotations}
          drawingAnnotations={drawingAnnotations}
          currentPageIndex={currentPageIndex}
          language={language}
          onClose={onClose}
          onSelectPage={onSelectPage}
          onSelectTextAnnotation={onSelectTextAnnotation}
          onSelectShape={onSelectShape}
          onDeleteTextAnnotation={onDeleteTextAnnotation}
          onDeleteShape={onDeleteShape}
          onDeleteDrawing={onDeleteDrawing}
        />
      )}

      {activeTab === 'search' && (
        <SearchPanel
          extractedTextBlocks={extractedTextBlocks}
          currentPageIndex={currentPageIndex}
          language={language}
          onClose={onClose}
          onSelectMatch={onSelectMatch}
        />
      )}

      {activeTab === 'security' && (
        <SecurityPanel
          hasDocument={hasDocument}
          language={language}
          onClose={onClose}
          onOpenPolicy={onOpenPolicy}
          isEncrypted={isEncrypted}
          signaturesCount={signaturesCount}
          onOpenEncrypt={onOpenEncrypt}
          onOpenDecrypt={onOpenDecrypt}
          onOpenSignature={onOpenSignature}
        />
      )}

      {activeTab === 'history' && (
        <HistoryPanel
          history={history}
          language={language}
          onClose={onClose}
          onClearHistory={onClearHistory}
        />
      )}
    </aside>
  );
};

