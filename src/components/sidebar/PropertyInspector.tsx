// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// PropertyInspector.tsx - Right Sidebar inspector matching Lyncub PDF design

import React from 'react';
import { 
  Trash2, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Superscript,
  Subscript,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  RotateCcw,
  PanelRightClose,
  Type,
  Shapes
} from 'lucide-react';
import { ThaiFontFamily, TextAlign, ExtractedTextBlock, TextAnnotation, ShapeAnnotation } from '../../types';

interface PropertyInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Either an extracted text block, user text annotation, or shape annotation
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

// Circular color palette matching Lyncub PDF
const PALETTE_ROW_1 = [
  '#000000', // Black
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#c026d3', // Magenta
  '#dc2626', // Red
  '#ea580c', // Orange
  '#ca8a04', // Yellow
  '#fef08a', // Pale yellow
];

const PALETTE_ROW_2 = [
  '#f472b6', // Pink
  '#334155', // Slate dark
  '#ffffff', // White
  '#059669', // Emerald
  '#0d9488', // Teal
  '#0284c7', // Sky
  '#4f46e5', // Indigo
  '#9333ea', // Violet
];

const getShapeTitle = (type?: ShapeAnnotation['type']) => {
  switch (type) {
    case 'rect': return 'สี่เหลี่ยม (Rectangle)';
    case 'circle': return 'วงกลม (Circle)';
    case 'ellipse': return 'วงรี (Ellipse)';
    case 'arrow': return 'ลูกศร (Arrow)';
    case 'line': return 'เส้นตรง (Line)';
    case 'stamp': return 'ตราประทับ (Stamp)';
    case 'note': return 'โน้ตย่อ (Note)';
    case 'highlight': return 'ไฮไลต์ (Highlight)';
    case 'underline': return 'ขีดเส้นใต้ (Underline)';
    case 'strikethrough': return 'ขีดฆ่า (Strikethrough)';
    default: return 'รูปร่างและคำอธิบาย';
  }
};

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  isOpen,
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

  // Hide inspector completely if not open or if neither text nor shape is selected
  if (!isOpen || (!currentItem && !selectedShape)) return null;

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

  const handleResetFont = () => {
    handleFontFamilyChange('TH Sarabun PSK');
  };

  const handleFontSizeChange = (fontSize: number) => {
    const validSize = Math.max(6, Math.min(144, fontSize));
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({ ...selectedExtractedBlock, fontSize: validSize, isEdited: true });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({ ...selectedTextAnnotation, fontSize: validSize });
    }
  };

  const handleLineHeightChange = (lineHeight: number) => {
    const valid = Math.max(0.8, Math.min(3.0, Number(lineHeight.toFixed(2))));
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({ ...selectedExtractedBlock, lineHeight: valid, isEdited: true });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({ ...selectedTextAnnotation, lineHeight: valid });
    }
  };

  const handleToggleBold = () => {
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({
        ...selectedExtractedBlock,
        isBold: !selectedExtractedBlock.isBold,
        isEdited: true,
      });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({
        ...selectedTextAnnotation,
        isBold: !selectedTextAnnotation.isBold,
      });
    }
  };

  const handleToggleItalic = () => {
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({
        ...selectedExtractedBlock,
        isItalic: !selectedExtractedBlock.isItalic,
        isEdited: true,
      });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({
        ...selectedTextAnnotation,
        isItalic: !selectedTextAnnotation.isItalic,
      });
    }
  };

  const handleToggleUnderline = () => {
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({
        ...selectedExtractedBlock,
        isUnderline: !selectedExtractedBlock.isUnderline,
        isEdited: true,
      });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({
        ...selectedTextAnnotation,
        isUnderline: !selectedTextAnnotation.isUnderline,
      });
    }
  };

  const handleToggleStrikethrough = () => {
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({
        ...selectedExtractedBlock,
        isStrikethrough: !selectedExtractedBlock.isStrikethrough,
        isEdited: true,
      });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({
        ...selectedTextAnnotation,
        isStrikethrough: !selectedTextAnnotation.isStrikethrough,
      });
    }
  };

  const handleToggleVerticalAlign = (align: 'super' | 'sub') => {
    const next = currentItem?.verticalAlign === align ? 'baseline' : align;
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({
        ...selectedExtractedBlock,
        verticalAlign: next,
        isEdited: true,
      });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({
        ...selectedTextAnnotation,
        verticalAlign: next,
      });
    }
  };

  const handleTextAlignChange = (textAlign: TextAlign) => {
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({ ...selectedExtractedBlock, textAlign, isEdited: true });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({ ...selectedTextAnnotation, textAlign });
    }
  };

  const handleOpacityChange = (opacityPercent: number) => {
    const opacity = Math.max(0, Math.min(1, opacityPercent / 100));
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({ ...selectedExtractedBlock, opacity, isEdited: true });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({ ...selectedTextAnnotation, opacity });
    }
  };

  const handleColorChange = (color: string) => {
    if (isExtracted && selectedExtractedBlock) {
      onUpdateExtractedBlock({ ...selectedExtractedBlock, color, isEdited: true });
    } else if (selectedTextAnnotation) {
      onUpdateTextAnnotation({ ...selectedTextAnnotation, color });
    }
  };

  const currentOpacity = Math.round(((currentItem?.opacity ?? 1)) * 100);
  const currentLineHeight = currentItem?.lineHeight ?? 1.2;
  const currentTextAlign = currentItem?.textAlign ?? 'left';

  return (
    <aside className="w-80 bg-white text-slate-700 border-l border-slate-200 flex flex-col z-25 select-none shadow-lg h-full overflow-y-auto font-sans">
      {/* Header */}
      <div className="h-12 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-800 tracking-wide">
          {selectedShape ? (
            <Shapes className="w-4 h-4 text-pink-600" />
          ) : (
            <Type className="w-4 h-4 text-pink-600" />
          )}
          <span>{selectedShape ? 'ตัวตรวจสอบรูปร่าง' : 'ตัวตรวจสอบข้อความ'}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          title="ปิดตัวตรวจสอบ"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 flex-1">
        {currentItem ? (
          <>
            {/* Section Header: คุณสมบัติข้อความ + Delete */}
            <div className="flex items-center justify-between pb-1">
              <span className="font-semibold text-sm text-slate-800">คุณสมบัติข้อความ</span>
              <button
                onClick={handleDelete}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                title="ลบกล่องข้อความนี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Card */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[12px] text-slate-600 leading-relaxed shadow-xs">
              ดับเบิลคลิกกล่องข้อความบนหน้าเพื่อแก้ไข กด Enter หรือ Esc เพื่อจบการแก้ไข และกด Shift+Enter เพื่อขึ้นบรรทัดใหม่
            </div>

            {/* Direct text editor input area */}
            <div className="space-y-1.5">
              <textarea
                value={currentItem.text}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-pink-500 focus:border-pink-500 bg-white text-slate-800 resize-none font-sans shadow-2xs"
                placeholder="พิมพ์ข้อความ..."
              />
            </div>

            {/* Row 1: Font and Font Size */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] text-slate-600 font-medium">ฟอนต์</label>
                  <button 
                    onClick={handleResetFont} 
                    className="text-slate-400 hover:text-slate-700" 
                    title="รีเซ็ตฟอนต์"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
                <select
                  value={currentItem.fontFamily}
                  onChange={(e) => handleFontFamilyChange(e.target.value as ThaiFontFamily)}
                  className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 bg-white focus:outline-pink-500 text-slate-800 shadow-2xs"
                >
                  <option value="TH Sarabun PSK">TH Sarabun PSK</option>
                  <option value="TH Sarabun New">TH Sarabun New</option>
                  <option value="Noto Sans Thai">Noto Sans Thai</option>
                  <option value="Angsana New">Angsana New</option>
                  <option value="Cordia New">Cordia New</option>
                  <option value="Helvetica">Standard (Arial)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] text-slate-600 font-medium">ขนาดฟอนต์</label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <input
                    type="number"
                    value={currentItem.fontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="w-full text-xs py-1.5 px-2 text-center bg-transparent text-slate-800 outline-none"
                    min="6"
                    max="120"
                  />
                  <div className="flex flex-col border-l border-slate-300 text-[9px] text-slate-500 bg-slate-50">
                    <button
                      onClick={() => handleFontSizeChange(currentItem.fontSize + 1)}
                      className="px-1.5 py-0.5 hover:bg-slate-200 hover:text-slate-900"
                      title="เพิ่มขนาด"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleFontSizeChange(currentItem.fontSize - 1)}
                      className="px-1.5 py-0.5 hover:bg-slate-200 hover:text-slate-900"
                      title="ลดขนาด"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Line Spacing (ระยะห่างบรรทัด) */}
            <div className="space-y-1.5">
              <label className="text-[12px] text-slate-600 font-medium">ระยะห่างบรรทัด</label>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                <select
                  value={currentLineHeight.toFixed(2)}
                  onChange={(e) => handleLineHeightChange(parseFloat(e.target.value))}
                  className="w-full text-xs py-2 px-2.5 bg-transparent text-slate-800 outline-none cursor-pointer"
                >
                  <option value="1.00">1.00 em</option>
                  <option value="1.15">1.15 em</option>
                  <option value="1.20">1.20 em</option>
                  <option value="1.35">1.35 em</option>
                  <option value="1.50">1.50 em</option>
                  <option value="1.75">1.75 em</option>
                  <option value="2.00">2.00 em</option>
                </select>
                <div className="flex flex-col border-l border-slate-300 text-[9px] text-slate-500 bg-slate-50">
                  <button
                    onClick={() => handleLineHeightChange(currentLineHeight + 0.1)}
                    className="px-1.5 py-0.5 hover:bg-slate-200 hover:text-slate-900"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleLineHeightChange(currentLineHeight - 0.1)}
                    className="px-1.5 py-0.5 hover:bg-slate-200 hover:text-slate-900"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: Styling buttons (B, I, U, S, x², x₂) */}
            <div className="grid grid-cols-6 gap-1 pt-1">
              <button
                onClick={handleToggleBold}
                className={`py-2 rounded-lg border text-xs font-bold flex items-center justify-center transition-colors ${
                  currentItem.isBold
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="ตัวหนา (Bold)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleToggleItalic}
                className={`py-2 rounded-lg border text-xs italic flex items-center justify-center transition-colors ${
                  currentItem.isItalic
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="ตัวเอียง (Italic)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleToggleUnderline}
                className={`py-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  currentItem.isUnderline
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="ขีดเส้นใต้ (Underline)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleToggleStrikethrough}
                className={`py-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  currentItem.isStrikethrough
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="ขีดฆ่า (Strikethrough)"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleToggleVerticalAlign('super')}
                className={`py-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  currentItem.verticalAlign === 'super'
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="ตัวยก (Superscript)"
              >
                <Superscript className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleToggleVerticalAlign('sub')}
                className={`py-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  currentItem.verticalAlign === 'sub'
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="ตัวห้อย (Subscript)"
              >
                <Subscript className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Row 4: Text Alignment (Left, Center, Right, Justify) */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => handleTextAlignChange('left')}
                className={`py-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  currentTextAlign === 'left'
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="ชิดซ้าย"
              >
                <AlignLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleTextAlignChange('center')}
                className={`py-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  currentTextAlign === 'center'
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="กึ่งกลาง"
              >
                <AlignCenter className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleTextAlignChange('right')}
                className={`py-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  currentTextAlign === 'right'
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="ชิดขวา"
              >
                <AlignRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleTextAlignChange('justify')}
                className={`py-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  currentTextAlign === 'justify'
                    ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="กระจายข้อความ"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            {/* Row 5: Opacity (ความทึบ) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[12px] text-slate-600">
                <span>ความทึบ</span>
                <span className="font-mono text-slate-500">{currentOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentOpacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Row 6: Color Palette */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[12px] text-slate-600 font-medium">จานสี</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-mono uppercase">
                    {currentItem.color}
                  </span>
                  <input
                    type="color"
                    value={currentItem.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-5 h-5 rounded-full cursor-pointer border border-slate-300 bg-transparent"
                    title="เลือกสีแบบกำหนดเอง"
                  />
                </div>
              </div>

              {/* Row 1 Colors */}
              <div className="grid grid-cols-8 gap-1.5 pt-1">
                {PALETTE_ROW_1.map((col) => {
                  const isSelected = currentItem.color.toLowerCase() === col.toLowerCase();
                  return (
                    <button
                      key={col}
                      onClick={() => handleColorChange(col)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white scale-110 shadow-xs'
                          : 'hover:scale-105 border border-slate-200 shadow-2xs'
                      }`}
                      style={{ backgroundColor: col }}
                      title={col}
                    >
                      {col === '#ffffff' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Row 2 Colors */}
              <div className="grid grid-cols-8 gap-1.5 pt-1">
                {PALETTE_ROW_2.map((col) => {
                  const isSelected = currentItem.color.toLowerCase() === col.toLowerCase();
                  return (
                    <button
                      key={col}
                      onClick={() => handleColorChange(col)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white scale-110 shadow-xs'
                          : 'hover:scale-105 border border-slate-200 shadow-2xs'
                      }`}
                      style={{ backgroundColor: col }}
                      title={col}
                    >
                      {col === '#ffffff' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {isExtracted && (
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[11px] text-pink-600 font-medium flex items-center gap-1.5 bg-pink-50 border border-pink-100 p-2 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <span>โหมดแก้ไขข้อความเดิม (Direct Edit)</span>
                </div>
              </div>
            )}
          </>
        ) : selectedShape ? (
          <>
            {/* Section Header: Shape Title + Delete */}
            <div className="flex items-center justify-between pb-1">
              <span className="font-semibold text-sm text-slate-800">
                {getShapeTitle(selectedShape.type)}
              </span>
              <button
                onClick={() => onDeleteShape?.(selectedShape.id)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                title="ลบวัตถุนี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Card */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[12px] text-slate-600 leading-relaxed shadow-xs">
              ลากจุดจับสีชมพูรอบวัตถุเพื่อย่อ-ขยาย หรือคลิกและลากที่ตัววัตถุเพื่อย้ายตำแหน่ง
            </div>

            {/* If stamp or note: Text field */}
            {(selectedShape.type === 'stamp' || selectedShape.type === 'note') && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-medium">ข้อความ</label>
                <textarea
                  value={selectedShape.text || ''}
                  onChange={(e) => onUpdateShape?.({ ...selectedShape, text: e.target.value })}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-pink-500 focus:border-pink-500 bg-white text-slate-800 resize-none font-sans shadow-2xs"
                  placeholder="พิมพ์ข้อความ..."
                />
              </div>
            )}

            {/* Stroke Color (Border/Line Color) */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">สีเส้นขอบ / สีหลัก</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                    style={{ backgroundColor: selectedShape.color }}
                  />
                  <span className="text-xs text-slate-500 uppercase font-mono">
                    {selectedShape.color}
                  </span>
                </div>
              </div>
              {/* Row 1 Colors */}
              <div className="grid grid-cols-8 gap-1.5">
                {PALETTE_ROW_1.map((col) => {
                  const isSel = selectedShape.color.toLowerCase() === col.toLowerCase();
                  return (
                    <button
                      key={col}
                      onClick={() => onUpdateShape?.({ ...selectedShape, color: col })}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        isSel
                          ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white scale-110 shadow-xs'
                          : 'hover:scale-105 border border-slate-200 shadow-2xs'
                      }`}
                      style={{ backgroundColor: col }}
                      title={col}
                    >
                      {col === '#ffffff' && <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    </button>
                  );
                })}
              </div>
              {/* Row 2 Colors */}
              <div className="grid grid-cols-8 gap-1.5 pt-1">
                {PALETTE_ROW_2.map((col) => {
                  const isSel = selectedShape.color.toLowerCase() === col.toLowerCase();
                  return (
                    <button
                      key={col}
                      onClick={() => onUpdateShape?.({ ...selectedShape, color: col })}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        isSel
                          ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white scale-110 shadow-xs'
                          : 'hover:scale-105 border border-slate-200 shadow-2xs'
                      }`}
                      style={{ backgroundColor: col }}
                      title={col}
                    >
                      {col === '#ffffff' && <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fill Color */}
            {(selectedShape.type === 'rect' || selectedShape.type === 'circle' || selectedShape.type === 'ellipse' || selectedShape.type === 'stamp' || selectedShape.type === 'note' || selectedShape.type === 'highlight') && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">สีพื้นหลัง (Fill)</span>
                  <button
                    onClick={() => onUpdateShape?.({ ...selectedShape, fillColor: 'transparent' })}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                      !selectedShape.fillColor || selectedShape.fillColor === 'transparent'
                        ? 'bg-pink-600 text-white font-medium shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    โปร่งใส
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {PALETTE_ROW_1.map((col) => {
                    const isSel = selectedShape.fillColor?.toLowerCase() === col.toLowerCase();
                    return (
                      <button
                        key={col}
                        onClick={() => onUpdateShape?.({ ...selectedShape, fillColor: col })}
                        className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                          isSel
                            ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white scale-110 shadow-xs'
                            : 'hover:scale-105 border border-slate-200 shadow-2xs'
                        }`}
                        style={{ backgroundColor: col }}
                        title={col}
                      >
                        {col === '#ffffff' && <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stroke Width */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>ความหนาเส้นขอบ</span>
                <span className="text-pink-600 font-mono font-medium">{selectedShape.strokeWidth} px</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4, 6, 8].map((w) => (
                  <button
                    key={w}
                    onClick={() => onUpdateShape?.({ ...selectedShape, strokeWidth: w })}
                    className={`flex-1 py-1 text-xs rounded transition-colors ${
                      selectedShape.strokeWidth === w
                        ? 'bg-pink-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {w === 0 ? '0' : `${w}px`}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>ความโปร่งใส (Opacity)</span>
                <span className="text-pink-600 font-mono font-medium">
                  {Math.round((selectedShape.opacity ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={Math.round((selectedShape.opacity ?? 1) * 100)}
                onChange={(e) =>
                  onUpdateShape?.({
                    ...selectedShape,
                    opacity: Number(e.target.value) / 100,
                  })
                }
                className="w-full accent-pink-500 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Size info badge */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>ขนาดวัตถุ:</span>
              <span className="font-mono text-slate-700">
                {Math.round(selectedShape.width)} x {Math.round(selectedShape.height)} pt
              </span>
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
};
