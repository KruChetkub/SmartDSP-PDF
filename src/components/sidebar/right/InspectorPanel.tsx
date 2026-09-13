// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// InspectorPanel.tsx - Document properties, metadata, and element property editor

import React from 'react';
import { 
  Settings as GearIcon, 
  PanelRightClose,
  Trash2, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  Shapes,
  RotateCw
} from 'lucide-react';
import { ThaiFontFamily, TextAlign, ExtractedTextBlock, TextAnnotation, ShapeAnnotation, PdfMetadata } from '../../../types';
import { AppLanguage } from '../../../types/settings';
import { t } from '../../../i18n/translations';

interface InspectorPanelProps {
  hasDocument: boolean;
  fileName?: string;
  totalPages: number;
  isModified: boolean;
  metadata?: PdfMetadata;
  toolProfileCount: number;
  language?: AppLanguage;
  onClose: () => void;

  selectedExtractedBlock: ExtractedTextBlock | null;
  selectedTextAnnotation: TextAnnotation | null;
  selectedShape?: ShapeAnnotation | null;

  onUpdateExtractedBlock: (block: ExtractedTextBlock) => void;
  onDeleteExtractedBlock: (id: string) => void;
  onUpdateTextAnnotation: (text: TextAnnotation) => void;
  onDeleteTextAnnotation: (id: string) => void;
  onUpdateShape?: (shape: ShapeAnnotation) => void;
  onDeleteShape?: (id: string) => void;
}

// Circular color palette
const PALETTE_ROW_1 = ['#000000', '#2563eb', '#7c3aed', '#c026d3', '#dc2626', '#ea580c', '#ca8a04', '#fef08a'];
const PALETTE_ROW_2 = ['#f472b6', '#334155', '#ffffff', '#059669', '#0d9488', '#0284c7', '#4f46e5', '#9333ea'];
const REDACT_FILL_COLORS = ['#000000', '#ef4444', '#334155', '#ffffff', '#2563eb', '#ea580c', '#ca8a04', '#059669'];

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  hasDocument,
  fileName,
  totalPages,
  isModified,
  metadata,
  toolProfileCount,
  language = 'th',
  onClose,
  selectedExtractedBlock,
  selectedTextAnnotation,
  selectedShape,
  onUpdateExtractedBlock,
  onDeleteExtractedBlock,
  onUpdateTextAnnotation,
  onDeleteTextAnnotation,
  onUpdateShape,
  onDeleteShape,
}) => {
  const currentItem = selectedExtractedBlock || selectedTextAnnotation;
  const isExtracted = !!selectedExtractedBlock;
  const hasElementSelected = !!currentItem || !!selectedShape;

  // Handlers for element properties
  const handleDelete = () => {
    if (!currentItem) return;
    if (isExtracted && selectedExtractedBlock) {
      onDeleteExtractedBlock(selectedExtractedBlock.id);
    } else if (selectedTextAnnotation) {
      onDeleteTextAnnotation(selectedTextAnnotation.id);
    }
  };

  const handleTextChange = (text: string) => {
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({ ...selectedExtractedBlock, text, isEdited: true });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({ ...selectedTextAnnotation, text });
    }
  };

  const handleFontFamilyChange = (fontFamily: ThaiFontFamily) => {
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({ ...selectedExtractedBlock, fontFamily, isEdited: true });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({ ...selectedTextAnnotation, fontFamily });
    }
  };

  const handleFontSizeChange = (fontSize: number) => {
    const validSize = Math.max(6, Math.min(144, fontSize));
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({ ...selectedExtractedBlock, fontSize: validSize, isEdited: true });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({ ...selectedTextAnnotation, fontSize: validSize });
    }
  };

  const handleToggleBold = () => {
    if (!selectedExtractedBlock) return;
    onUpdateExtractedBlock({ ...selectedExtractedBlock, isBold: !selectedExtractedBlock.isBold, isEdited: true });
  };

  const handleToggleItalic = () => {
    if (!selectedExtractedBlock) return;
    onUpdateExtractedBlock({ ...selectedExtractedBlock, isItalic: !selectedExtractedBlock.isItalic, isEdited: true });
  };

  const handleToggleUnderline = () => {
    if (!selectedExtractedBlock) return;
    onUpdateExtractedBlock({ ...selectedExtractedBlock, isUnderline: !selectedExtractedBlock.isUnderline, isEdited: true });
  };

  const handleToggleStrikethrough = () => {
    if (!selectedExtractedBlock) return;
    onUpdateExtractedBlock({ ...selectedExtractedBlock, isStrikethrough: !selectedExtractedBlock.isStrikethrough, isEdited: true });
  };

  const handleAlignChange = (textAlign: TextAlign) => {
    if (!selectedExtractedBlock) return;
    onUpdateExtractedBlock({ ...selectedExtractedBlock, textAlign, isEdited: true });
  };

  const handleColorChange = (color: string) => {
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({ ...selectedExtractedBlock, color, isEdited: true });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({ ...selectedTextAnnotation, color });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 select-none text-slate-800 dark:text-slate-100 transition-colors">
      {/* Panel Top Header Bar */}
      <div className="h-12 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
          {t('inspectorTab', language)}
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* CASE 1: No document loaded */}
        {!hasDocument && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-16">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <GearIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px]">
              {t('inspectorEmptyTip', language)}
            </p>
          </div>
        )}

        {/* CASE 2: Document loaded & No element selected */}
        {hasDocument && !hasElementSelected && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Section: Document Properties */}
            <div>
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                {t('docProperties', language)}
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">{t('docFieldDocument', language)}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px] text-right" title={fileName}>
                    {fileName || 'document.pdf'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('docFieldTotalPages', language)}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{totalPages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('docFieldModified', language)}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {isModified ? t('yes', language) : t('no', language)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('docFieldToolProfile', language)}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{toolProfileCount}</span>
                </div>
              </div>
            </div>

            {/* Section: Metadata Card */}
            <div className="pt-2">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2.5 uppercase tracking-wider">
                {t('docMetadata', language)}
              </h4>
              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">{t('docMetaAuthor', language)}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px] text-right">
                    {metadata?.author || '-'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">{t('docMetaKeywords', language)}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px] text-right">
                    {metadata?.keywords || '-'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">{t('docMetaSubject', language)}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px] text-right">
                    {metadata?.subject || '-'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">{t('docMetaTitle', language)}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px] text-right">
                    {metadata?.title || fileName || 'Untitled PDF'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE 3: Text Element Selected */}
        {hasDocument && currentItem && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Header with Title and Delete */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                  {isExtracted ? 'ข้อความในเอกสาร' : 'กล่องข้อความที่เพิ่ม'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="ลบข้อความนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">เนื้อหาข้อความ</label>
              <textarea
                value={currentItem.text}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-pink-500 focus:outline-hidden"
              />
            </div>

            {/* Font Family & Size */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">ฟอนต์</label>
                <select
                  value={currentItem.fontFamily || 'TH Sarabun New'}
                  onChange={(e) => handleFontFamilyChange(e.target.value as ThaiFontFamily)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="TH Sarabun New">TH Sarabun New</option>
                  <option value="TH Sarabun PSK">TH Sarabun PSK</option>
                  <option value="Noto Sans Thai">Noto Sans Thai</option>
                  <option value="Angsana New">Angsana New</option>
                  <option value="Cordia New">Cordia New</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">ขนาด (pt)</label>
                <input
                  type="number"
                  min={6}
                  max={144}
                  value={Math.round(currentItem.fontSize || 16)}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Formatting & Alignment (for extracted block) */}
            {isExtracted && selectedExtractedBlock && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleToggleBold}
                    className={`p-1.5 rounded text-xs ${selectedExtractedBlock.isBold ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleItalic}
                    className={`p-1.5 rounded text-xs ${selectedExtractedBlock.isItalic ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleUnderline}
                    className={`p-1.5 rounded text-xs ${selectedExtractedBlock.isUnderline ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleStrikethrough}
                    className={`p-1.5 rounded text-xs ${selectedExtractedBlock.isStrikethrough ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
                  <button
                    type="button"
                    onClick={() => handleAlignChange('left')}
                    className={`p-1.5 rounded text-xs ${selectedExtractedBlock.textAlign === 'left' ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlignChange('center')}
                    className={`p-1.5 rounded text-xs ${selectedExtractedBlock.textAlign === 'center' ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlignChange('right')}
                    className={`p-1.5 rounded text-xs ${selectedExtractedBlock.textAlign === 'right' ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlignChange('justify')}
                    className={`p-1.5 rounded text-xs ${selectedExtractedBlock.textAlign === 'justify' ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Color Palette */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">สีข้อความ</label>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  {PALETTE_ROW_1.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleColorChange(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${currentItem.color === c ? 'ring-2 ring-pink-500 scale-110 border-white' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  {PALETTE_ROW_2.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleColorChange(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${currentItem.color === c ? 'ring-2 ring-pink-500 scale-110 border-white' : 'border-slate-300 dark:border-slate-600'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Rotation for Text Annotation */}
            {selectedTextAnnotation && (
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-pink-500" />
                    {language === 'th' ? 'การหมุน (องศา)' : 'Rotation (Degrees)'}
                  </label>
                  <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                    {selectedTextAnnotation.rotation || 0}°
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => onUpdateTextAnnotation({ ...selectedTextAnnotation, rotation: deg })}
                      className={`py-1 text-xs rounded border transition-colors ${
                        (selectedTextAnnotation.rotation || 0) === deg
                          ? 'bg-pink-500 text-white border-pink-600 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>

                {/* Slider 0 - 360 */}
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={selectedTextAnnotation.rotation || 0}
                  onChange={(e) => onUpdateTextAnnotation({ ...selectedTextAnnotation, rotation: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
            )}
          </div>
        )}

        {/* CASE 4: Shape Element Selected */}
        {hasDocument && !currentItem && selectedShape && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shapes className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                  {selectedShape.type === 'redact'
                    ? (language === 'th' ? 'การปกปิดข้อมูล (Redaction)' : 'Redaction Mark')
                    : `คุณสมบัติรูปร่าง (${selectedShape.type})`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onDeleteShape?.(selectedShape.id)}
                className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                title="ลบวัตถุนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Redaction Notice Banner */}
            {selectedShape.type === 'redact' && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs space-y-1">
                <div className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{language === 'th' ? 'พื้นที่ทำเครื่องหมายปกปิด' : 'Redaction Area'}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {language === 'th'
                    ? 'สามารถคลิกลากเพื่อย้ายตำแหน่ง หรือใช้จุดมุมทั้ง 8 เพื่อปรับขนาดให้ครอบคลุมข้อมูลที่ต้องการปกปิด'
                    : 'Click and drag to reposition, or use the 8 resize handles to cover sensitive content.'}
                </p>
              </div>
            )}

            {/* 1. สีของการปกปิด / สีพื้นหลัง (Redaction Fill Color / Shape Fill Color) */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>
                    {selectedShape.type === 'redact'
                      ? (language === 'th' ? 'สีของการปกปิด (Fill Color)' : 'Redaction Color')
                      : (language === 'th' ? 'สีพื้นหลัง (Fill Color)' : 'Fill Color')}
                  </span>
                </label>
                {/* Active Color Preview Pill */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs shrink-0"
                    style={{ backgroundColor: selectedShape.fillColor || (selectedShape.type === 'redact' ? '#ef4444' : 'transparent') }}
                  />
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 font-medium">
                    {selectedShape.fillColor || (selectedShape.type === 'redact' ? '#ef4444' : (language === 'th' ? 'โปร่งใส' : 'None'))}
                  </span>
                </div>
              </div>

              {/* Quick Swatches Row */}
              <div className="flex items-center justify-between gap-1">
                {(selectedShape.type === 'redact' ? REDACT_FILL_COLORS : PALETTE_ROW_1).map((c) => {
                  const isSel = selectedShape.fillColor?.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onUpdateShape?.({ ...selectedShape, fillColor: c })}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                        isSel
                          ? 'ring-2 ring-pink-500 scale-110 border-white shadow-xs'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      title={c}
                    />
                  );
                })}
              </div>

              {/* Custom Color Input with Native Picker */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  <input
                    type="color"
                    value={selectedShape.fillColor && !selectedShape.fillColor.startsWith('rgba') && selectedShape.fillColor !== 'transparent' ? selectedShape.fillColor : (selectedShape.type === 'redact' ? '#ef4444' : '#ffffff')}
                    onChange={(e) => onUpdateShape?.({ ...selectedShape, fillColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-[10px]">{language === 'th' ? 'เลือกสีเอง (Custom Color)' : 'Custom Color'}</span>
                </label>

                {selectedShape.type !== 'redact' && (
                  <button
                    type="button"
                    onClick={() => onUpdateShape?.({ ...selectedShape, fillColor: 'transparent' })}
                    className={`px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer ${
                      !selectedShape.fillColor || selectedShape.fillColor === 'transparent'
                        ? 'bg-pink-600 text-white font-medium'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {language === 'th' ? 'โปร่งใส' : 'Transparent'}
                  </button>
                )}
              </div>
            </div>

            {/* 2. ความทึบของสี (Color Opacity) */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-[11px]">
                  {language === 'th' ? 'ความทึบของสี (Opacity)' : 'Color Opacity'}
                </span>
                <span className="font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 px-2 py-0.5 rounded text-[11px]">
                  {Math.round((selectedShape.opacity ?? 1) * 100)}%
                </span>
              </div>

              {/* Opacity Slider */}
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={Math.round((selectedShape.opacity ?? 1) * 100)}
                onChange={(e) => onUpdateShape?.({ ...selectedShape, opacity: Number(e.target.value) / 100 })}
                className="w-full accent-pink-500 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />

              {/* Quick Opacity Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {[
                  { label: '25%', val: 0.25, sub: language === 'th' ? 'จาง' : 'Light' },
                  { label: '50%', val: 0.50, sub: language === 'th' ? 'โปร่งแสง' : 'Medium' },
                  { label: '75%', val: 0.75, sub: language === 'th' ? 'กึ่งทึบ' : 'Semi' },
                  { label: '100%', val: 1.00, sub: language === 'th' ? 'ทึบสนิท' : 'Solid' },
                ].map(({ label, val, sub }) => {
                  const currentPercent = Math.round((selectedShape.opacity ?? 1) * 100);
                  const isCur = Math.abs(currentPercent - val * 100) < 5;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => onUpdateShape?.({ ...selectedShape, opacity: val })}
                      className={`flex flex-col items-center justify-center py-1 rounded text-xs transition-colors cursor-pointer ${
                        isCur
                          ? 'bg-pink-600 text-white font-bold shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-medium text-[11px] leading-tight">{label}</span>
                      <span className="text-[8px] opacity-75 leading-tight">{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. ความหนาเส้น (Border Width) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-[11px]">
                  {language === 'th' ? 'ความหนาเส้นขอบ' : 'Border Width'}
                </span>
                <span className="font-bold text-pink-600 dark:text-pink-400">{selectedShape.strokeWidth} px</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4, 6, 8].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onUpdateShape?.({ ...selectedShape, strokeWidth: w })}
                    className={`flex-1 py-1 text-xs rounded transition-colors cursor-pointer ${
                      selectedShape.strokeWidth === w
                        ? 'bg-pink-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {w === 0 ? (language === 'th' ? 'ไม่มี' : 'None') : `${w}px`}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. สีเส้นขอบ (Border Color) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {language === 'th' ? 'สีเส้นขอบ (Border Color)' : 'Border Color'}
                </label>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs shrink-0"
                    style={{ backgroundColor: selectedShape.color }}
                  />
                  <span className="text-[10px] font-mono text-slate-500">{selectedShape.color}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1">
                {PALETTE_ROW_1.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateShape?.({ ...selectedShape, color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                      selectedShape.color?.toLowerCase() === c.toLowerCase()
                        ? 'ring-2 ring-pink-500 scale-110 border-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    title={c}
                  />
                ))}
              </div>
              <div className="pt-0.5">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  <input
                    type="color"
                    value={selectedShape.color || '#ef4444'}
                    onChange={(e) => onUpdateShape?.({ ...selectedShape, color: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-[10px]">{language === 'th' ? 'เลือกสีเส้นขอบเอง' : 'Custom Border Color'}</span>
                </label>
              </div>
            </div>

            {/* 5. การหมุน (Rotation) */}
            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-pink-500" />
                  {language === 'th' ? 'การหมุน (องศา)' : 'Rotation (Degrees)'}
                </label>
                <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                  {selectedShape.rotation || 0}°
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => onUpdateShape?.({ ...selectedShape, rotation: deg })}
                    className={`py-1 text-xs rounded border transition-colors ${
                      (selectedShape.rotation || 0) === deg
                        ? 'bg-pink-500 text-white border-pink-600 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>

              {/* Slider 0 - 360 */}
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={selectedShape.rotation || 0}
                onChange={(e) => onUpdateShape?.({ ...selectedShape, rotation: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* 6. ขนาดและตำแหน่ง (Dimensions & Position) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>{language === 'th' ? 'ขนาดวัตถุ' : 'Dimensions'}:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {Math.round(selectedShape.width)} x {Math.round(selectedShape.height)} pt
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

