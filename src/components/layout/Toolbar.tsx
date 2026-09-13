import React, { useRef } from 'react';
import { 
  MousePointer, 
  Type, 
  Edit3,
  Image as ImageIcon, 
  PenTool, 
  Square, 
  Circle, 
  Minus,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { ToolMode, ThaiFontFamily } from '../../types';

interface ToolbarProps {
  toolMode: ToolMode;
  onSelectTool: (mode: ToolMode) => void;
  isInspectorOpen?: boolean;
  onToggleInspector?: () => void;
  fontFamily: ThaiFontFamily;
  onChangeFontFamily: (font: ThaiFontFamily) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  color: string;
  onChangeColor: (color: string) => void;
  strokeWidth: number;
  onChangeStrokeWidth: (width: number) => void;
  onAddImage: (file: File) => void;
  
  // Page operations
  currentPage: number; // 1-based
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;

  // Zoom
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;

  hasDocument: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  toolMode,
  onSelectTool,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
  color,
  onChangeColor,
  strokeWidth,
  onChangeStrokeWidth,
  onAddImage,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  onRotateLeft,
  onRotateRight,
  onDuplicatePage,
  onDeletePage,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  hasDocument,
  isInspectorOpen,
  onToggleInspector
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAddImage(files[0]);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-xs select-none text-slate-700">
      <input 
        type="file" 
        ref={imageInputRef} 
        onChange={handleImageChange} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />

      {/* Group 1: Tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelectTool('select')}
          disabled={!hasDocument}
          className={`p-1.5 rounded transition-colors ${
            toolMode === 'select'
              ? 'bg-sky-100 text-sky-700 font-semibold'
              : 'hover:bg-slate-100 text-slate-600 disabled:opacity-40'
          }`}
          title="เลือก / ย้ายออบเจ็กต์ (Select)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Edit existing text (Lyncub PDF style) */}
        <button
          onClick={() => onSelectTool('editText')}
          disabled={!hasDocument}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-xs ${
            toolMode === 'editText'
              ? 'bg-pink-100 text-pink-700 font-bold border border-pink-300 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700 disabled:opacity-40'
          }`}
          title="แก้ไขข้อความเดิมในเอกสาร PDF (Edit Text)"
        >
          <Edit3 className="w-4 h-4 text-pink-600" />
          <span className="hidden sm:inline">แก้ไขข้อความ</span>
        </button>

        <button
          onClick={() => {
            onSelectTool('text');
            if (onToggleInspector && !isInspectorOpen) {
              onToggleInspector();
            }
          }}
          disabled={!hasDocument}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors text-xs ${
            toolMode === 'text'
              ? 'bg-pink-100 text-pink-700 font-bold border border-pink-300 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700 disabled:opacity-40'
          }`}
          title="เพิ่มข้อความใหม่ (Add Text)"
        >
          <Type className="w-4 h-4 text-pink-600" />
          <span className="hidden sm:inline font-medium">เพิ่มข้อความ</span>
        </button>

        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={!hasDocument}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
          title="แทรกรูปภาพ (Add Image)"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool('draw')}
          disabled={!hasDocument}
          className={`p-1.5 rounded transition-colors ${
            toolMode === 'draw'
              ? 'bg-sky-100 text-sky-700 font-semibold'
              : 'hover:bg-slate-100 text-slate-600 disabled:opacity-40'
          }`}
          title="ปากกาวาดเขียน (Draw / Pen)"
        >
          <PenTool className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Shapes */}
        <button
          onClick={() => onSelectTool('rect')}
          disabled={!hasDocument}
          className={`p-1.5 rounded transition-colors ${
            toolMode === 'rect'
              ? 'bg-sky-100 text-sky-700 font-semibold'
              : 'hover:bg-slate-100 text-slate-600 disabled:opacity-40'
          }`}
          title="วาดสี่เหลี่ยม (Rectangle)"
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool('circle')}
          disabled={!hasDocument}
          className={`p-1.5 rounded transition-colors ${
            toolMode === 'circle'
              ? 'bg-sky-100 text-sky-700 font-semibold'
              : 'hover:bg-slate-100 text-slate-600 disabled:opacity-40'
          }`}
          title="วาดวงกลม (Circle)"
        >
          <Circle className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool('line')}
          disabled={!hasDocument}
          className={`p-1.5 rounded transition-colors ${
            toolMode === 'line'
              ? 'bg-sky-100 text-sky-700 font-semibold'
              : 'hover:bg-slate-100 text-slate-600 disabled:opacity-40'
          }`}
          title="วาดเส้นตรง (Line)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1.5" />

        {/* Dynamic Properties based on tool */}
        {toolMode === 'text' && (
          <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <select
              value={fontFamily}
              onChange={(e) => onChangeFontFamily(e.target.value as ThaiFontFamily)}
              className="text-xs bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-sky-500"
            >
              <option value="TH Sarabun New">TH Sarabun New</option>
              <option value="Noto Sans Thai">Noto Sans Thai</option>
              <option value="Helvetica">Standard</option>
            </select>

            <select
              value={fontSize}
              onChange={(e) => onChangeFontSize(Number(e.target.value))}
              className="text-xs bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-sky-500"
            >
              {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
                <option key={size} value={size}>
                  {size} pt
                </option>
              ))}
            </select>

            <input
              type="color"
              value={color}
              onChange={(e) => onChangeColor(e.target.value)}
              className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
              title="สีข้อความ"
            />
          </div>
        )}

        {(toolMode === 'draw' || toolMode === 'rect' || toolMode === 'circle' || toolMode === 'line') && (
          <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <span className="text-xs text-slate-500">ขนาด:</span>
            <input
              type="range"
              min="1"
              max="12"
              value={strokeWidth}
              onChange={(e) => onChangeStrokeWidth(Number(e.target.value))}
              className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="color"
              value={color}
              onChange={(e) => onChangeColor(e.target.value)}
              className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
              title="สีเส้น"
            />
          </div>
        )}
      </div>

      {/* Group 2: Page Operations & Navigation */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onRotateLeft}
          disabled={!hasDocument}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
          title="หมุนซ้าย 90° (Ctrl+L)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onRotateRight}
          disabled={!hasDocument}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
          title="หมุนขวา 90° (Ctrl+R)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={onDuplicatePage}
          disabled={!hasDocument}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
          title="ทำสำเนาหน้านี้ (Ctrl+D)"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          onClick={onDeletePage}
          disabled={!hasDocument || totalPages <= 1}
          className="p-1.5 rounded hover:bg-red-50 text-red-600 disabled:opacity-40 transition-colors"
          title="ลบหน้านี้ (Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Page Switcher */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={onPreviousPage}
            disabled={!hasDocument || currentPage <= 1}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-medium text-slate-700 px-1">
            {hasDocument ? `${currentPage} / ${totalPages}` : '- / -'}
          </span>

          <button
            onClick={onNextPage}
            disabled={!hasDocument || currentPage >= totalPages}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            disabled={!hasDocument || zoom <= 0.5}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40"
            title="ย่อมุมมอง"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-slate-600 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={onZoomIn}
            disabled={!hasDocument || zoom >= 2.5}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40"
            title="ขยายมุมมอง"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={onResetZoom}
            disabled={!hasDocument}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40"
            title="พอดีหน้าจอ"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {onToggleInspector && (
          <>
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <button
              onClick={onToggleInspector}
              className={`p-1.5 rounded transition-colors flex items-center gap-1.5 text-xs ${
                isInspectorOpen
                  ? 'bg-pink-100 text-pink-700 font-semibold border border-pink-200'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="เปิด/ปิด แผงตัวตรวจสอบ (Inspector)"
            >
              <SlidersHorizontal className="w-4 h-4 text-pink-600" />
              <span className="hidden lg:inline">ตัวตรวจสอบ</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

