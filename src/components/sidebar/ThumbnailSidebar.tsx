// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// ThumbnailSidebar.tsx - Left sidebar showing page thumbnails with full right-click context menu (Merge, Split, Extract)

import React, { useState, useRef, useEffect } from 'react';
import { PageInfo } from '../../types';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';
import { 
  PanelLeftClose, 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  Plus, 
  FilePlus, 
  Copy, 
  Scissors, 
  FileDown, 
  Download, 
  Settings,
  Split,
  GripVertical
} from 'lucide-react';

interface ThumbnailSidebarProps {
  pages: PageInfo[];
  currentPageIndex: number;
  language?: AppLanguage;
  onSelectPage: (index: number) => void;
  onRotatePageLeft?: (index: number) => void;
  onRotatePageRight?: (index: number) => void;
  onDuplicatePage?: (index: number) => void;
  onInsertBlankPage?: (afterIndex: number) => void;
  onDeletePage: (index: number) => void;
  onInsertPdf?: (file: File, afterIndex: number) => void;
  onOpenSplit?: (index: number) => void;
  onExtractPage?: (index: number) => void;
  onReorderPages?: (fromIndex: number, toIndex: number) => void;
  thumbnails: Record<number, string>;
  isOpen: boolean;
  onToggleOpen: () => void;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  pageIndex: number;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPageIndex,
  language = 'th',
  onSelectPage,
  onRotatePageLeft,
  onRotatePageRight,
  onDuplicatePage,
  onInsertBlankPage,
  onDeletePage,
  onInsertPdf,
  onOpenSplit,
  onExtractPage,
  onReorderPages,
  thumbnails,
  isOpen,
  onToggleOpen,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    pageIndex: 0,
  });

  const insertPdfInputRef = useRef<HTMLInputElement>(null);
  const targetInsertIndexRef = useRef<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };

    if (contextMenu.isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen]);

  if (!isOpen) return null;

  // Handle right-click on a page card
  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Select this page as well
    onSelectPage(index);

    // Calculate position with viewport boundaries (menu width ~220px, height ~380px)
    const menuWidth = 220;
    const menuHeight = 380;
    const clientX = e.clientX;
    const clientY = e.clientY;

    const posX = clientX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : clientX;
    const posY = clientY + menuHeight > window.innerHeight ? Math.max(10, window.innerHeight - menuHeight - 10) : clientY;

    setContextMenu({
      isOpen: true,
      x: posX,
      y: posY,
      pageIndex: index,
    });
  };

  // Trigger insert PDF file picker
  const handleTriggerInsertPdf = (afterIndex: number) => {
    targetInsertIndexRef.current = afterIndex;
    if (insertPdfInputRef.current) {
      insertPdfInputRef.current.value = '';
      insertPdfInputRef.current.click();
    }
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleInsertPdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0] && onInsertPdf) {
      onInsertPdf(files[0], targetInsertIndexRef.current);
    }
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex === null || draggedIndex === index) {
      if (dragOverIndex !== null) setDragOverIndex(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'before' : 'after';

    if (dragOverIndex !== index || dropPosition !== position) {
      setDragOverIndex(index);
      setDropPosition(position);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || !onReorderPages) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    const fromIndex = draggedIndex;
    let toIndex = targetIndex;

    if (fromIndex < targetIndex) {
      toIndex = dropPosition === 'before' ? targetIndex - 1 : targetIndex;
    } else if (fromIndex > targetIndex) {
      toIndex = dropPosition === 'after' ? targetIndex + 1 : targetIndex;
    }

    if (fromIndex !== toIndex && toIndex >= 0 && toIndex < pages.length) {
      onReorderPages(fromIndex, toIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  return (
    <>
      {/* Backdrop for Mobile & Tablet */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-150"
        onClick={onToggleOpen}
      />
      <aside className="fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:relative lg:w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col select-none transition-all shadow-2xl lg:shadow-none animate-in slide-in-from-left duration-200">
        {/* Hidden PDF file input for inserting PDF */}
      <input
        type="file"
        ref={insertPdfInputRef}
        onChange={handleInsertPdfFileChange}
        accept=".pdf"
        className="hidden"
      />

      {/* Header: หน้า with [+] and [Close] buttons matching reference */}
      <div className="h-11 px-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {t('sidebarPages', language)}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
            {pages.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Add Blank Page Button */}
          <button
            type="button"
            onClick={() => onInsertBlankPage && onInsertBlankPage(currentPageIndex >= 0 ? currentPageIndex : pages.length - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer shadow-sm"
            title={t('insertBlankPage', language)}
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Close Sidebar Button */}
          <button
            type="button"
            onClick={onToggleOpen}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer shadow-sm"
            title="ปิดแถบข้าง"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Thumbnails List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {pages.map((page, index) => {
          const isSelected = currentPageIndex === index;
          const isBeingDragged = draggedIndex === index;
          const isOver = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;
          const thumbUrl = thumbnails[page.originalPageIndex];
          const widthPt = Math.round(page.width);
          const heightPt = Math.round(page.height);

          return (
            <div key={`${page.originalPageIndex}-${index}`} className="flex flex-col">
              {/* Drop Indicator Before */}
              {isOver && dropPosition === 'before' && (
                <div className="h-1 bg-pink-500 dark:bg-pink-400 rounded-full mb-1 shadow-xs transition-all animate-pulse" />
              )}

              <div
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  onSelectPage(index);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    onToggleOpen();
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, index)}
                className={`group relative flex items-center gap-2.5 p-2 rounded-2xl transition-all cursor-grab active:cursor-grabbing border select-none ${
                  isBeingDragged
                    ? 'opacity-40 scale-[0.98] border-dashed border-pink-400 dark:border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 shadow-inner'
                    : isSelected
                    ? 'bg-pink-50/70 dark:bg-pink-950/40 border-pink-400 dark:border-pink-500/80 shadow-sm'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
                title={language === 'th' ? 'คลิกเลือกหน้า หรือคลิกซ้ายค้างเพื่อลากย้ายสลับหน้า' : 'Click to select, or drag to reorder'}
              >
                {/* Drag Handle Grip */}
                <div className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 shrink-0 pl-0.5 pointer-events-none">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Thumbnail Box */}
                <div 
                  className="w-14 h-20 bg-white dark:bg-slate-800 rounded-md overflow-hidden flex items-center justify-center relative shadow-sm shrink-0 border border-slate-200 dark:border-slate-700 pointer-events-none"
                  style={{
                    transform: `rotate(${page.rotation}deg)`,
                    transition: 'transform 0.2s ease-in-out',
                  }}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={`หน้า ${index + 1}`}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600">
                      <div className="w-6 h-8 border border-dashed border-slate-300 dark:border-slate-600 rounded-xs" />
                    </div>
                  )}
                </div>

                {/* Page Information: หน้า {X} and {width} · {height} pt */}
                <div className="flex flex-col min-w-0 flex-1 pointer-events-none">
                  <span className={`font-bold text-xs truncate ${
                    isSelected ? 'text-pink-700 dark:text-pink-300' : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    หน้า {index + 1}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {widthPt} · {heightPt} pt
                  </span>
                </div>

                {/* Hover Quick Action Buttons */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0">
                  <button
                    type="button"
                    draggable={false}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRotatePageRight) onRotatePageRight(index);
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-750 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="หมุนขวา 90°"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      draggable={false}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(index);
                      }}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 rounded text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="ลบหน้านี้"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Drop Indicator After */}
              {isOver && dropPosition === 'after' && (
                <div className="h-1 bg-pink-500 dark:bg-pink-400 rounded-full mt-1 shadow-xs transition-all animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Right-Click Context Menu */}
      {contextMenu.isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100 select-none"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          {/* Header indicator */}
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between mb-1">
            <span>หน้า {contextMenu.pageIndex + 1}</span>
            <span>{Math.round(pages[contextMenu.pageIndex]?.width || 0)} · {Math.round(pages[contextMenu.pageIndex]?.height || 0)} pt</span>
          </div>

          {/* 1. แทรกหน้าใหม่ */}
          <button
            type="button"
            onClick={() => {
              if (onInsertBlankPage) onInsertBlankPage(contextMenu.pageIndex);
              setContextMenu((prev) => ({ ...prev, isOpen: false }));
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-left cursor-pointer"
          >
            <FilePlus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('insertBlankPage', language)}</span>
          </button>

          {/* 2. ทำสำเนา */}
          <button
            type="button"
            onClick={() => {
              if (onDuplicatePage) onDuplicatePage(contextMenu.pageIndex);
              setContextMenu((prev) => ({ ...prev, isOpen: false }));
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-left cursor-pointer"
          >
            <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('duplicatePage', language)}</span>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100 dark:border-slate-750" />

          {/* 3. รวมเอกสาร / แทรก PDF... */}
          <button
            type="button"
            onClick={() => handleTriggerInsertPdf(contextMenu.pageIndex)}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium transition-colors text-left cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t('insertPdf', language)}</span>
          </button>

          {/* 4. แยกเอกสาร... */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSplit) onOpenSplit(contextMenu.pageIndex);
              setContextMenu((prev) => ({ ...prev, isOpen: false }));
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium transition-colors text-left cursor-pointer"
          >
            <Scissors className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('splitPdfAt', language)}</span>
          </button>

          {/* 5. ดึงหน้านี้ออกเป็น PDF */}
          <button
            type="button"
            onClick={() => {
              if (onExtractPage) onExtractPage(contextMenu.pageIndex);
              setContextMenu((prev) => ({ ...prev, isOpen: false }));
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium transition-colors text-left cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('extractPage', language)}</span>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100 dark:border-slate-750" />

          {/* 6. หมุนซ้าย */}
          <button
            type="button"
            onClick={() => {
              if (onRotatePageLeft) onRotatePageLeft(contextMenu.pageIndex);
              setContextMenu((prev) => ({ ...prev, isOpen: false }));
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-left cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('rotateLeft', language)}</span>
          </button>

          {/* 7. หมุนขวา */}
          <button
            type="button"
            onClick={() => {
              if (onRotatePageRight) onRotatePageRight(contextMenu.pageIndex);
              setContextMenu((prev) => ({ ...prev, isOpen: false }));
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-left cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('rotateRight', language)}</span>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100 dark:border-slate-750" />

          {/* 8. ลบหน้านี้ */}
          <button
            type="button"
            disabled={pages.length <= 1}
            onClick={() => {
              onDeletePage(contextMenu.pageIndex);
              setContextMenu((prev) => ({ ...prev, isOpen: false }));
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors text-left cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>{t('deletePageAction', language)}</span>
          </button>
        </div>
      )}
    </aside>
    </>
  );
};
