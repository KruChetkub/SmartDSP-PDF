// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// CommentsPanel.tsx - Comments and markups list panel matching reference design

import React from 'react';
import { 
  FileText, 
  PanelRightClose, 
  Trash2, 
  StickyNote, 
  Highlighter, 
  Underline, 
  Strikethrough, 
  Square, 
  PenTool, 
  Stamp, 
  ArrowUpRight 
} from 'lucide-react';
import { TextAnnotation, ShapeAnnotation, DrawingAnnotation } from '../../../types';
import { AppLanguage } from '../../../types/settings';
import { t } from '../../../i18n/translations';

interface CommentsPanelProps {
  textAnnotations: TextAnnotation[];
  shapeAnnotations: ShapeAnnotation[];
  drawingAnnotations: DrawingAnnotation[];
  currentPageIndex: number;
  language?: AppLanguage;
  onClose: () => void;
  onSelectPage: (pageIndex: number) => void;
  onSelectTextAnnotation?: (id: string) => void;
  onSelectShape?: (id: string) => void;
  onDeleteTextAnnotation?: (id: string) => void;
  onDeleteShape?: (id: string) => void;
  onDeleteDrawing?: (id: string) => void;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  textAnnotations,
  shapeAnnotations,
  drawingAnnotations,
  currentPageIndex,
  language = 'th',
  onClose,
  onSelectPage,
  onSelectTextAnnotation,
  onSelectShape,
  onDeleteTextAnnotation,
  onDeleteShape,
  onDeleteDrawing,
}) => {
  const totalCount = textAnnotations.length + shapeAnnotations.length + drawingAnnotations.length;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'note': return <StickyNote className="w-3.5 h-3.5 text-amber-500" />;
      case 'highlight': return <Highlighter className="w-3.5 h-3.5 text-yellow-500" />;
      case 'underline': return <Underline className="w-3.5 h-3.5 text-blue-500" />;
      case 'strikethrough': return <Strikethrough className="w-3.5 h-3.5 text-red-500" />;
      case 'stamp': return <Stamp className="w-3.5 h-3.5 text-purple-500" />;
      case 'rect': return <Square className="w-3.5 h-3.5 text-pink-500" />;
      case 'arrow': return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />;
      case 'drawing': return <PenTool className="w-3.5 h-3.5 text-indigo-500" />;
      default: return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getItemTitle = (item: { type: string; text?: string }) => {
    if (item.text && item.text.trim()) return item.text.trim();
    switch (item.type) {
      case 'note': return language === 'th' ? 'โน้ตย่อ' : 'Note';
      case 'highlight': return language === 'th' ? 'ไฮไลต์' : 'Highlight';
      case 'underline': return language === 'th' ? 'ขีดเส้นใต้' : 'Underline';
      case 'strikethrough': return language === 'th' ? 'ขีดฆ่า' : 'Strikethrough';
      case 'stamp': return language === 'th' ? 'ตราประทับ' : 'Stamp';
      case 'rect': return language === 'th' ? 'สี่เหลี่ยม' : 'Rectangle';
      case 'circle': return language === 'th' ? 'วงกลม' : 'Circle';
      case 'arrow': return language === 'th' ? 'ลูกศร' : 'Arrow';
      case 'line': return language === 'th' ? 'เส้นตรง' : 'Line';
      case 'drawing': return language === 'th' ? 'เส้นวาดอิสระ' : 'Drawing';
      default: return language === 'th' ? 'ข้อความ' : 'Text';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 select-none text-slate-800 dark:text-slate-100 transition-colors">
      {/* Header */}
      <div className="h-12 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
          {t('commentsTab', language)}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="ปิด / Close"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Subheader: ความคิดเห็น with count badge */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between shrink-0">
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
          {t('commentsTab', language)}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {totalCount}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {totalCount === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-16">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3 stroke-[1.25]" />
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              {t('noCommentsMarkup', language)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* User Text Annotations */}
            {textAnnotations.map((tItem) => (
              <div
                key={tItem.id}
                onClick={() => {
                  onSelectPage(tItem.pageIndex);
                  onSelectTextAnnotation?.(tItem.id);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                  currentPageIndex === tItem.pageIndex
                    ? 'border-pink-300 dark:border-pink-900/60 bg-pink-50/40 dark:bg-pink-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <div className="mt-0.5">{getItemIcon('text')}</div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {t('pagePrefix', language)} {tItem.pageIndex + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 truncate mt-1">
                      {tItem.text || (language === 'th' ? '(ข้อความว่าง)' : '(Empty Text)')}
                    </p>
                  </div>
                </div>
                {onDeleteTextAnnotation && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTextAnnotation(tItem.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title={t('deleteComment', language)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {/* Shape Annotations (Notes, Highlights, Underline, Shapes) */}
            {shapeAnnotations.map((sItem) => (
              <div
                key={sItem.id}
                onClick={() => {
                  onSelectPage(sItem.pageIndex);
                  onSelectShape?.(sItem.id);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                  currentPageIndex === sItem.pageIndex
                    ? 'border-pink-300 dark:border-pink-900/60 bg-pink-50/40 dark:bg-pink-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <div className="mt-0.5">{getItemIcon(sItem.type)}</div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {t('pagePrefix', language)} {sItem.pageIndex + 1}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {sItem.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 truncate mt-1">
                      {getItemTitle(sItem)}
                    </p>
                  </div>
                </div>
                {onDeleteShape && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteShape(sItem.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title={t('deleteComment', language)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {/* Drawings */}
            {drawingAnnotations.map((dItem) => (
              <div
                key={dItem.id}
                onClick={() => onSelectPage(dItem.pageIndex)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                  currentPageIndex === dItem.pageIndex
                    ? 'border-pink-300 dark:border-pink-900/60 bg-pink-50/40 dark:bg-pink-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <div className="mt-0.5">{getItemIcon('drawing')}</div>
                  <div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {t('pagePrefix', language)} {dItem.pageIndex + 1}
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 mt-1">
                      {language === 'th' ? 'เส้นวาดอิสระ' : 'Drawing'} ({dItem.points.length} จุด)
                    </p>
                  </div>
                </div>
                {onDeleteDrawing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDrawing(dItem.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title={t('deleteComment', language)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

