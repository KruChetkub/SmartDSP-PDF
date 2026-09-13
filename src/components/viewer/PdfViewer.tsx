// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// PdfViewer.tsx - Main PDF Viewer component orchestrating render canvas, tool modes, and modular layers

import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ToolMode, 
  ThaiFontFamily, 
  TextAnnotation, 
  ImageAnnotation, 
  ShapeAnnotation, 
  DrawingAnnotation, 
  DrawingPoint,
  PageInfo, 
  ExtractedTextBlock 
} from '../../types';
import { PdfRenderService } from '../../services/pdfRenderService';
import { Copy, Check } from 'lucide-react';
import { SnapshotBoxState, ResizeHandleType } from './viewerTypes';
import { usePanScroll } from './hooks/usePanScroll';
import { useAnnotationInteraction } from './hooks/useAnnotationInteraction';
import { DrawingCanvasLayer } from './layers/DrawingCanvasLayer';
import { ImageAnnotationLayer } from './layers/ImageAnnotationLayer';
import { TextAnnotationLayer } from './layers/TextAnnotationLayer';
import { ShapeAnnotationLayer } from './layers/ShapeAnnotationLayer';
import { ExtractedTextLayer } from './layers/ExtractedTextLayer';
import { SnapshotSelectionBox } from './overlay/SnapshotSelectionBox';
import { SnapshotDpi, AppLanguage } from '../../types/settings';

interface PdfViewerProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPageIndex: number; // 0-based
  pages: PageInfo[];
  zoom: number;
  toolMode: ToolMode;
  fontFamily: ThaiFontFamily;
  fontSize: number;
  color: string;
  strokeWidth: number;
  
  textAnnotations: TextAnnotation[];
  imageAnnotations: ImageAnnotation[];
  shapeAnnotations: ShapeAnnotation[];
  drawingAnnotations: DrawingAnnotation[];
  
  extractedTextBlocks: ExtractedTextBlock[];
  selectedExtractedBlockId: string | null;
  onSelectExtractedBlock: (id: string | null) => void;
  onUpdateExtractedBlock: (block: ExtractedTextBlock) => void;
  onDeleteExtractedBlock: (id: string) => void;

  selectedTextAnnotationId: string | null;
  onSelectTextAnnotation: (id: string | null) => void;

  onAddText: (text: TextAnnotation) => void;
  onUpdateText: (text: TextAnnotation) => void;
  onDeleteText: (id: string) => void;

  onUpdateImage: (img: ImageAnnotation) => void;
  onDeleteImage: (id: string) => void;

  selectedShapeId?: string | null;
  onSelectShape?: (id: string | null) => void;

  onAddShape: (shape: ShapeAnnotation) => void;
  onUpdateShape: (shape: ShapeAnnotation) => void;
  onDeleteShape: (id: string) => void;

  onAddDrawing: (drawing: DrawingAnnotation) => void;
  onSelectTool?: (mode: ToolMode) => void;

  searchQuery?: string;
  activeSearchBlockId?: string | null;
  matchingBlockIds?: Set<string>;

  snapshotDpi?: SnapshotDpi;
  disableLatinSpacing?: boolean;
  language?: AppLanguage;
  onZoomChange?: (newZoom: number) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfDoc,
  currentPageIndex,
  pages,
  zoom,
  toolMode,
  fontFamily,
  fontSize,
  color,
  strokeWidth,
  textAnnotations,
  imageAnnotations,
  shapeAnnotations,
  drawingAnnotations,
  extractedTextBlocks,
  selectedExtractedBlockId,
  onSelectExtractedBlock,
  onUpdateExtractedBlock,
  onDeleteExtractedBlock,
  selectedTextAnnotationId,
  onSelectTextAnnotation,
  selectedShapeId,
  onSelectShape,
  onAddText,
  onUpdateText,
  onDeleteText,
  onUpdateImage,
  onDeleteImage,
  onAddShape,
  onUpdateShape,
  onDeleteShape,
  onAddDrawing,
  onSelectTool,
  searchQuery,
  activeSearchBlockId,
  matchingBlockIds,
  snapshotDpi = 150,
  disableLatinSpacing = false,
  language = 'th',
  onZoomChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  // Pan scroll hook
  const { scrollContainerRef, isPanning, handlePanMouseDown, handlePanTouchStart } = usePanScroll(toolMode);

  // Touch Pinch-to-zoom support
  const touchPinchRef = useRef<{ initialDistance: number; initialZoom: number } | null>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !onZoomChange) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchPinchRef.current = { initialDistance: dist, initialZoom: zoom };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchPinchRef.current) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchPinchRef.current.initialDistance > 0) {
          const factor = dist / touchPinchRef.current.initialDistance;
          const newZoom = Math.min(2.5, Math.max(0.4, Number((touchPinchRef.current.initialZoom * factor).toFixed(2))));
          onZoomChange(newZoom);
        }
      }
    };

    const handleTouchEnd = () => {
      touchPinchRef.current = null;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [zoom, onZoomChange]);

  // Drag moving & 8-point resizing hook
  const { setDragItem, setResizeItem } = useAnnotationInteraction({
    zoom,
    textAnnotations,
    imageAnnotations,
    shapeAnnotations,
    onUpdateText,
    onUpdateImage,
    onUpdateShape,
  });

  // Local editing states
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingExtractedId, setEditingExtractedId] = useState<string | null>(null);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);

  // Shape drawing state
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeCurrent, setShapeCurrent] = useState<{ x: number; y: number } | null>(null);

  // Snapshot tool state
  const [snapshotBox, setSnapshotBox] = useState<SnapshotBoxState | null>(null);
  const [snapshotNotice, setSnapshotNotice] = useState<string | null>(null);

  // Text selection snippet popup (selectText tool)
  const [selectedTextSnippet, setSelectedTextSnippet] = useState<{ text: string; x: number; y: number } | null>(null);

  const currentPage = pages[currentPageIndex];

  // Render PDF page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !currentPage) return;

    const { promise, cancel } = PdfRenderService.renderPage(
      pdfDoc,
      currentPage.originalPageIndex + 1,
      canvasRef.current,
      zoom,
      currentPage.rotation
    );

    promise.catch((err) => {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Render page error:', err);
      }
    });

    return () => {
      cancel();
    };
  }, [pdfDoc, currentPageIndex, zoom, currentPage?.rotation]);

  // Page annotations
  const pageTexts = textAnnotations.filter((t) => t.pageIndex === currentPageIndex);
  const pageImages = imageAnnotations.filter((i) => i.pageIndex === currentPageIndex);
  const pageShapes = shapeAnnotations.filter((s) => s.pageIndex === currentPageIndex);
  const pageDrawings = drawingAnnotations.filter((d) => d.pageIndex === currentPageIndex);
  const pageExtractedBlocks = extractedTextBlocks.filter((b) => b.pageIndex === currentPageIndex);

  // Selection change listener for "เลือกข้อความ" (selectText tool)
  useEffect(() => {
    if (toolMode !== 'selectText') {
      setSelectedTextSnippet(null);
      window.getSelection()?.removeAllRanges();
      return;
    }

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelectedTextSnippet(null);
        return;
      }
      const text = sel.toString().trim();
      if (text.length > 0) {
        try {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setSelectedTextSnippet({
              text,
              x: rect.left + rect.width / 2,
              y: rect.top - 8,
            });
            return;
          }
        } catch {
          // Range detached
        }
      }
      setSelectedTextSnippet(null);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [toolMode]);

  // Auto scroll to active search match
  useEffect(() => {
    if (activeSearchBlockId) {
      const el = document.getElementById(`block-${activeSearchBlockId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSearchBlockId]);

  // Keyboard shortcut for deleting selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (isInputFocused) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTextAnnotationId) {
          onDeleteText(selectedTextAnnotationId);
          onSelectTextAnnotation(null);
          setEditingTextId(null);
        } else if (selectedImageId) {
          onDeleteImage(selectedImageId);
          setSelectedImageId(null);
        } else if (selectedExtractedBlockId) {
          onDeleteExtractedBlock(selectedExtractedBlockId);
          onSelectExtractedBlock(null);
          setEditingExtractedId(null);
        } else if (selectedShapeId) {
          onDeleteShape(selectedShapeId);
          onSelectShape?.(null);
          setEditingShapeId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedTextAnnotationId,
    selectedImageId,
    selectedExtractedBlockId,
    selectedShapeId,
    onDeleteText,
    onDeleteImage,
    onDeleteExtractedBlock,
    onDeleteShape,
    onSelectTextAnnotation,
    onSelectExtractedBlock,
    onSelectShape,
  ]);

  // Handle overlay mouse down
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (toolMode === 'pan' || toolMode === 'selectText') return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoom;
    const clickY = (e.clientY - rect.top) / zoom;

    if (toolMode === 'snapshot') {
      setSnapshotBox({ startX: clickX, startY: clickY, currentX: clickX, currentY: clickY });
      return;
    } else if (toolMode === 'text') {
      const newText: TextAnnotation = {
        id: `text-${Date.now()}`,
        pageIndex: currentPageIndex,
        text: 'เพิ่มข้อความ',
        x: Math.round(clickX),
        y: Math.round(clickY),
        fontSize: fontSize || 14,
        color: color || '#000000',
        fontFamily: fontFamily || 'TH Sarabun PSK',
        lineHeight: 1.2,
        opacity: 1.0,
        textAlign: 'left',
      };
      onAddText(newText);
      onSelectTextAnnotation(newText.id);
      onSelectExtractedBlock(null);
      setSelectedImageId(null);
      setEditingTextId(null);
      onSelectTool?.('select');
    } else if (toolMode === 'note') {
      const newNote: TextAnnotation = {
        id: `text-${Date.now()}`,
        pageIndex: currentPageIndex,
        text: 'โน้ต: ข้อความบันทึก',
        x: Math.round(clickX),
        y: Math.round(clickY),
        fontSize: 14,
        color: '#854d0e',
        fontFamily: 'TH Sarabun New',
        lineHeight: 1.2,
        opacity: 1.0,
        textAlign: 'left',
      };
      onAddText(newNote);
      onSelectTextAnnotation(newNote.id);
      onSelectExtractedBlock(null);
      setSelectedImageId(null);
      setEditingTextId(null);
      onSelectTool?.('select');
    } else if (toolMode === 'stamp') {
      const newStamp: TextAnnotation = {
        id: `text-${Date.now()}`,
        pageIndex: currentPageIndex,
        text: '[ ตรวจสอบแล้ว / APPROVED ]',
        x: Math.round(clickX),
        y: Math.round(clickY),
        fontSize: 16,
        color: '#dc2626',
        fontFamily: 'TH Sarabun New',
        isBold: true,
        lineHeight: 1.2,
        opacity: 0.9,
        textAlign: 'center',
      };
      onAddText(newStamp);
      onSelectTextAnnotation(newStamp.id);
      onSelectExtractedBlock(null);
      setSelectedImageId(null);
      setEditingTextId(null);
      onSelectTool?.('select');
    } else if (toolMode === 'draw') {
      setIsDrawing(true);
      setCurrentStroke([{ x: clickX, y: clickY }]);
    } else if (
      toolMode === 'rect' ||
      toolMode === 'circle' ||
      toolMode === 'ellipse' ||
      toolMode === 'line' ||
      toolMode === 'arrow' ||
      toolMode === 'redact'
    ) {
      setShapeStart({ x: clickX, y: clickY });
      setShapeCurrent({ x: clickX, y: clickY });
    } else if (toolMode === 'select' || toolMode === 'editText') {
      window.getSelection()?.removeAllRanges();
      setSelectedTextSnippet(null);
      if (e.target === containerRef.current || e.target === drawCanvasRef.current) {
        onSelectTextAnnotation(null);
        onSelectExtractedBlock(null);
        setSelectedImageId(null);
        onSelectShape?.(null);
        setEditingTextId(null);
        setEditingExtractedId(null);
        setEditingShapeId(null);
      }
    }
  };

  // Handle overlay mouse move
  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / zoom;
    const currentY = (e.clientY - rect.top) / zoom;

    if (isDrawing && toolMode === 'draw') {
      setCurrentStroke((prev) => [...prev, { x: currentX, y: currentY }]);
    } else if (snapshotBox && toolMode === 'snapshot') {
      setSnapshotBox((prev) => (prev ? { ...prev, currentX, currentY } : null));
    } else if (shapeStart) {
      setShapeCurrent({ x: currentX, y: currentY });
    }
  };

  // Handle overlay mouse up
  const handleOverlayMouseUp = (e: React.MouseEvent) => {
    if (isDrawing && toolMode === 'draw') {
      setIsDrawing(false);
      if (currentStroke.length > 1) {
        onAddDrawing({
          id: `draw-${Date.now()}`,
          pageIndex: currentPageIndex,
          points: currentStroke,
          color: color,
          strokeWidth: strokeWidth,
        });
      }
      setCurrentStroke([]);
    }

    if (snapshotBox && toolMode === 'snapshot') {
      const minX = Math.min(snapshotBox.startX, snapshotBox.currentX);
      const minY = Math.min(snapshotBox.startY, snapshotBox.currentY);
      const w = Math.abs(snapshotBox.currentX - snapshotBox.startX);
      const h = Math.abs(snapshotBox.currentY - snapshotBox.startY);

      if (w >= 10 && h >= 10 && canvasRef.current) {
        const canvas = canvasRef.current;
        const pixelRatio = window.devicePixelRatio || 1;
        const srcX = Math.max(0, minX * zoom * pixelRatio);
        const srcY = Math.max(0, minY * zoom * pixelRatio);
        const srcW = Math.min(canvas.width - srcX, w * zoom * pixelRatio);
        const srcH = Math.min(canvas.height - srcY, h * zoom * pixelRatio);

        if (srcW > 0 && srcH > 0) {
          // Calculate high-quality scaling based on target snapshotDpi
          const targetDpi = snapshotDpi || 150;
          const dpiFactor = targetDpi / 72;
          const targetW = Math.max(1, Math.round(w * dpiFactor));
          const targetH = Math.max(1, Math.round(h * dpiFactor));

          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = targetW;
          cropCanvas.height = targetH;
          const ctx = cropCanvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
            cropCanvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob }),
                  ]);
                  setSnapshotNotice(
                    language === 'th'
                      ? `คัดลอกรูปภาพสแนปช็อต (${targetDpi} DPI) ลงคลิปบอร์ดแล้ว`
                      : `Snapshot (${targetDpi} DPI) copied to clipboard`
                  );
                } catch (err) {
                  console.warn('Clipboard write error:', err);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `snapshot_page_${currentPageIndex + 1}_${targetDpi}dpi.png`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setSnapshotNotice(
                    language === 'th'
                      ? `บันทึกรูปภาพสแนปช็อต (${targetDpi} DPI) แล้ว`
                      : `Snapshot (${targetDpi} DPI) saved`
                  );
                }
                setTimeout(() => setSnapshotNotice(null), 3000);
              }
            }, 'image/png');
          }
        }
      }
      setSnapshotBox(null);
    }

    if (
      shapeStart &&
      (toolMode === 'rect' ||
        toolMode === 'circle' ||
        toolMode === 'ellipse' ||
        toolMode === 'line' ||
        toolMode === 'arrow' ||
        toolMode === 'redact')
    ) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const endX = (e.clientX - rect.left) / zoom;
      const endY = (e.clientY - rect.top) / zoom;

      const isRedact = toolMode === 'redact';
      let x = Math.min(shapeStart.x, endX);
      let y = Math.min(shapeStart.y, endY);
      let width = Math.abs(endX - shapeStart.x);
      let height = Math.abs(endY - shapeStart.y);

      // If user single-clicked on document without dragging (width & height <= 5)
      if (width <= 5 && height <= 5) {
        if (isRedact) {
          width = 200;
          height = 45;
          x = Math.max(0, shapeStart.x - width / 2);
          y = Math.max(0, shapeStart.y - height / 2);
        } else {
          setShapeStart(null);
          setShapeCurrent(null);
          return;
        }
      }

      const newShapeId = isRedact ? `redact-${Date.now()}` : `shape-${Date.now()}`;
      onAddShape({
        id: newShapeId,
        pageIndex: currentPageIndex,
        type: toolMode,
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
        color: isRedact ? '#ef4444' : color,
        fillColor: isRedact ? '#ef4444' : undefined,
        strokeWidth: isRedact ? 2 : strokeWidth,
        text: isRedact ? (language === 'en' ? 'REDACT' : 'ปกปิด') : undefined,
        opacity: isRedact ? 0.5 : 1,
      });
      onSelectShape?.(newShapeId);
      onSelectTool?.('select');
      setShapeStart(null);
      setShapeCurrent(null);
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      className={`flex-1 overflow-auto bg-slate-200/80 dark:bg-slate-950 p-2 sm:p-4 md:p-8 pb-24 md:pb-8 flex justify-center items-start transition-colors ${
        toolMode === 'pan'
          ? isPanning
            ? 'cursor-grabbing select-none'
            : 'cursor-grab select-none'
          : toolMode === 'selectText'
            ? 'cursor-text select-text'
            : 'select-none'
      }`}
      onMouseDown={(e) => {
        if (handlePanMouseDown(e)) return;
        if (toolMode !== 'selectText') {
          window.getSelection()?.removeAllRanges();
          setSelectedTextSnippet(null);
        }
        if (e.target === e.currentTarget) {
          onSelectTextAnnotation(null);
          onSelectExtractedBlock(null);
          setSelectedImageId(null);
          onSelectShape?.(null);
          setEditingTextId(null);
          setEditingExtractedId(null);
          setEditingShapeId(null);
        }
      }}
      onTouchStart={(e) => {
        handlePanTouchStart(e);
      }}
    >
      <div
        ref={containerRef}
        onMouseDown={handleOverlayMouseDown}
        onMouseMove={handleOverlayMouseMove}
        onMouseUp={handleOverlayMouseUp}
        className="relative bg-white shadow-xl dark:shadow-2xl dark:shadow-black/60 rounded-sm transition-transform duration-75 origin-top"
        style={{
          cursor:
            toolMode === 'pan'
              ? isPanning ? 'grabbing' : 'grab'
              : toolMode === 'snapshot' || toolMode === 'redact'
                ? 'crosshair'
                : toolMode === 'text'
                  ? 'text'
                  : toolMode === 'selectText'
                    ? 'text'
                    : toolMode === 'draw'
                      ? 'crosshair'
                      : 'default',
        }}
      >
        {/* PDF Render Canvas */}
        <canvas ref={canvasRef} className="block pointer-events-none" />

        {/* Freehand Drawing Overlay Canvas */}
        <DrawingCanvasLayer
          drawCanvasRef={drawCanvasRef}
          pageDrawings={pageDrawings}
          currentStroke={currentStroke}
          color={color}
          strokeWidth={strokeWidth}
          zoom={zoom}
          width={canvasRef.current?.width ? canvasRef.current.width / (window.devicePixelRatio || 1) : 600}
          height={canvasRef.current?.height ? canvasRef.current.height / (window.devicePixelRatio || 1) : 800}
        />

        {/* Extracted Text Blocks Layer (for Direct PDF Editing like Lyncub PDF) */}
        <ExtractedTextLayer
          pageExtractedBlocks={pageExtractedBlocks}
          selectedExtractedBlockId={selectedExtractedBlockId}
          editingExtractedId={editingExtractedId}
          toolMode={toolMode}
          zoom={zoom}
          matchingBlockIds={matchingBlockIds}
          activeSearchBlockId={activeSearchBlockId}
          disableLatinSpacing={disableLatinSpacing}
          onSelectBlock={(id) => {
            if (toolMode === 'editText') {
              onSelectExtractedBlock(id);
              onSelectTextAnnotation(null);
              setSelectedImageId(null);
            }
          }}
          onStartEditing={(id) => {
            if (toolMode === 'editText') {
              setEditingExtractedId(id);
            }
          }}
          onUpdateBlock={onUpdateExtractedBlock}
        />

        {/* Text Annotations Layer (Add New Text) */}
        <TextAnnotationLayer
          pageTexts={pageTexts}
          selectedTextAnnotationId={selectedTextAnnotationId}
          editingTextId={editingTextId}
          toolMode={toolMode}
          zoom={zoom}
          onSelectText={(id) => {
            onSelectTextAnnotation(id);
            onSelectExtractedBlock(null);
            setSelectedImageId(null);
          }}
          onStartEditing={(id) => setEditingTextId(id)}
          onUpdateText={onUpdateText}
          onDeleteText={onDeleteText}
          onStartDrag={(e, item) => {
            setDragItem({
              id: item.id,
              type: 'text',
              mouseStartX: e.clientX,
              mouseStartY: e.clientY,
              origX: item.x,
              origY: item.y,
              hasMoved: false,
            });
          }}
        />

        {/* Image Annotations Layer */}
        <ImageAnnotationLayer
          pageImages={pageImages}
          selectedImageId={selectedImageId}
          toolMode={toolMode}
          zoom={zoom}
          onSelectImage={(id) => {
            setSelectedImageId(id);
            onSelectTextAnnotation(null);
            onSelectExtractedBlock(null);
            onSelectShape?.(null);
          }}
          onDeleteImage={onDeleteImage}
          onStartDrag={(e, img) => {
            setDragItem({
              id: img.id,
              type: 'image',
              mouseStartX: e.clientX,
              mouseStartY: e.clientY,
              origX: img.x,
              origY: img.y,
              hasMoved: false,
            });
          }}
          onStartResize={(e, img, handle) => {
            setResizeItem({
              id: img.id,
              type: 'image',
              handle,
              mouseStartX: e.clientX,
              mouseStartY: e.clientY,
              origX: img.x,
              origY: img.y,
              origWidth: img.width,
              origHeight: img.height,
            });
          }}
        />

        {/* Shape & Comment Annotations Layer */}
        <ShapeAnnotationLayer
          pageShapes={pageShapes}
          selectedShapeId={selectedShapeId}
          editingShapeId={editingShapeId}
          toolMode={toolMode}
          zoom={zoom}
          language={language}
          onSelectShape={(id) => {
            onSelectShape?.(id);
            onSelectTextAnnotation(null);
            onSelectExtractedBlock(null);
            setSelectedImageId(null);
          }}
          onStartEditingShape={(id) => setEditingShapeId(id)}
          onUpdateShape={onUpdateShape}
          onDeleteShape={onDeleteShape}
          onStartDrag={(e, shape) => {
            setDragItem({
              id: shape.id,
              type: 'shape',
              mouseStartX: e.clientX,
              mouseStartY: e.clientY,
              origX: shape.x,
              origY: shape.y,
              hasMoved: false,
            });
          }}
          onStartResize={(e, shape, handle) => {
            setResizeItem({
              id: shape.id,
              type: 'shape',
              handle,
              mouseStartX: e.clientX,
              mouseStartY: e.clientY,
              origX: shape.x,
              origY: shape.y,
              origWidth: shape.width,
              origHeight: shape.height,
            });
          }}
        />

        {/* Snapshot selection drag box */}
        <SnapshotSelectionBox box={snapshotBox} zoom={zoom} />

        {/* Live Redaction dragging preview */}
        {shapeStart && shapeCurrent && toolMode === 'redact' && (
          <div
            className="absolute border-2 border-dashed border-red-500 bg-red-500/20 pointer-events-none z-40 flex items-center justify-center select-none"
            style={{
              left: `${Math.min(shapeStart.x, shapeCurrent.x) * zoom}px`,
              top: `${Math.min(shapeStart.y, shapeCurrent.y) * zoom}px`,
              width: `${Math.abs(shapeCurrent.x - shapeStart.x) * zoom}px`,
              height: `${Math.abs(shapeCurrent.y - shapeStart.y) * zoom}px`,
            }}
          >
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest bg-white/90 dark:bg-black/90 px-1.5 py-0.5 rounded shadow-xs border border-red-300 dark:border-red-900">
              {language === 'th' ? 'ปกปิด' : 'REDACT'}
            </span>
          </div>
        )}
      </div>

      {/* Floating text selection tooltip for selectText tool */}
      {selectedTextSnippet && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full mb-2 bg-slate-900/90 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: selectedTextSnippet.x, top: selectedTextSnippet.y }}
        >
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(selectedTextSnippet.text);
              setSnapshotNotice('คัดลอกข้อความแล้ว: ' + (selectedTextSnippet.text.length > 25 ? selectedTextSnippet.text.slice(0, 25) + '...' : selectedTextSnippet.text));
              setTimeout(() => setSnapshotNotice(null), 2500);
              window.getSelection()?.removeAllRanges();
              setSelectedTextSnippet(null);
            }}
            className="px-2 py-0.5 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <Copy className="w-3.5 h-3.5 text-pink-400" />
            <span>คัดลอก (Copy)</span>
          </button>
        </div>
      )}

      {/* Temporary Toast / Notice banner */}
      {snapshotNotice && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{snapshotNotice}</span>
        </div>
      )}
    </div>
  );
};
