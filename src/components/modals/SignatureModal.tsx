// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// SignatureModal.tsx - Draw, type, or upload digital signature modal

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  PenTool, 
  Type, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Check, 
  X, 
  Sparkles,
  FileSignature
} from 'lucide-react';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSignature: (dataUrl: string, width: number, height: number) => void;
  language?: AppLanguage;
}

type SignatureTab = 'draw' | 'type' | 'upload';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onInsertSignature,
  language = 'th',
}) => {
  const [activeTab, setActiveTab] = useState<SignatureTab>('draw');

  // Draw State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<string>('#000000');
  const [penWidth, setPenWidth] = useState<number>(3);

  // Type State
  const [typedName, setTypedName] = useState<string>('');
  const [typedFontIndex, setTypedFontIndex] = useState<number>(0);
  const [typedColor, setTypedColor] = useState<string>('#000000');

  const fontOptions = [
    { name: 'Cursive Elegant', font: '"Brush Script MT", "Segoe Script", cursive' },
    { name: 'Casual Hand', font: '"Segoe Script", "Comic Sans MS", cursive' },
    { name: 'Classic Calligraphy', font: 'Zapfino, "Apple Chancery", cursive' },
    { name: 'Thai / Modern Script', font: '"TH Sarabun New", "Noto Sans Thai", cursive, sans-serif' },
  ];

  // Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Redraw canvas on stroke changes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allStrokes = [...strokes];
    if (currentStroke.length > 0) {
      allStrokes.push({ points: currentStroke, color: penColor, width: penWidth });
    }

    allStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke, penColor, penWidth]);

  useEffect(() => {
    if (activeTab === 'draw') {
      redrawCanvas();
    }
  }, [strokes, currentStroke, redrawCanvas, activeTab]);

  // Drawing event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke((prev) => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes((prev) => [...prev, { points: currentStroke, color: penColor, width: penWidth }]);
    }
    setCurrentStroke([]);
  };

  const handleClearDraw = () => {
    setStrokes([]);
    setCurrentStroke([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleUndoDraw = () => {
    setStrokes((prev) => prev.slice(0, prev.length - 1));
  };

  // Image upload handler with optional background removal
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      if (!removeBg) {
        setUploadedImage(dataUrl);
        return;
      }

      // Process white background removal
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) {
          setUploadedImage(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Near-white detection threshold
          if (r > 225 && g > 225 && b > 225) {
            data[i + 3] = 0; // make transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setUploadedImage(offCanvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Helper: crop transparent borders of a canvas and return dataUrl + dimensions
  const cropCanvas = (sourceCanvas: HTMLCanvasElement): { dataUrl: string; width: number; height: number } => {
    const ctx = sourceCanvas.getContext('2d');
    if (!ctx) return { dataUrl: sourceCanvas.toDataURL('image/png'), width: 160, height: 60 };

    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (minX > maxX || minY > maxY) {
      // Empty canvas
      return { dataUrl: sourceCanvas.toDataURL('image/png'), width: 160, height: 60 };
    }

    const pad = 10;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(w - cropX, maxX - minX + pad * 2);
    const cropH = Math.min(h - cropY, maxY - minY + pad * 2);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (croppedCtx) {
      croppedCtx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    }

    // Scale down for PDF point placement if too large (standard signature box ~160x60 pt)
    const aspect = cropW / cropH;
    const targetWidth = Math.min(200, Math.max(120, cropW * 0.5));
    const targetHeight = targetWidth / aspect;

    return {
      dataUrl: croppedCanvas.toDataURL('image/png'),
      width: Math.round(targetWidth),
      height: Math.round(targetHeight),
    };
  };

  // Insert signature action
  const handleInsert = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || strokes.length === 0) return;
      const { dataUrl, width, height } = cropCanvas(canvas);
      onInsertSignature(dataUrl, width, height);
      onClose();
    } else if (activeTab === 'type') {
      if (!typedName.trim()) return;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 600;
      offCanvas.height = 200;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) return;

      ctx.font = `italic 54px ${fontOptions[typedFontIndex].font}`;
      ctx.fillStyle = typedColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 300, 100);

      const { dataUrl, width, height } = cropCanvas(offCanvas);
      onInsertSignature(dataUrl, width, height);
      onClose();
    } else if (activeTab === 'upload') {
      if (!uploadedImage) return;
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const { dataUrl, width, height } = cropCanvas(offCanvas);
          onInsertSignature(dataUrl, width, height);
        } else {
          onInsertSignature(uploadedImage, 160, 60);
        }
        onClose();
      };
      img.src = uploadedImage;
    }
  };

  if (!isOpen) return null;

  const isInsertDisabled = 
    (activeTab === 'draw' && strokes.length === 0) ||
    (activeTab === 'type' && !typedName.trim()) ||
    (activeTab === 'upload' && !uploadedImage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-xs">
              <FileSignature className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {t('signatureModalTitle', language)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('signatureModalSubtitle', language)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/70 dark:bg-slate-950/40 gap-2">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'draw'
                ? 'border-pink-600 text-pink-600 dark:text-pink-400 dark:border-pink-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{t('tabDrawSignature', language)}</span>
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'type'
                ? 'border-pink-600 text-pink-600 dark:text-pink-400 dark:border-pink-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{t('tabTypeSignature', language)}</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-pink-600 text-pink-600 dark:text-pink-400 dark:border-pink-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('tabUploadSignature', language)}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4">
          {/* TAB 1: DRAW */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('penColor', language)}:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {['#000000', '#1d4ed8', '#dc2626'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPenColor(c)}
                        className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                          penColor === c ? 'scale-125 ring-2 ring-pink-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                        }`}
                        style={{ backgroundColor: c, borderColor: 'rgba(0,0,0,0.2)' }}
                      />
                    ))}
                  </div>

                  <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('penThickness', language)}:
                  </span>
                  <div className="flex items-center gap-1">
                    {[2, 3, 5].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setPenWidth(w)}
                        className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                          penWidth === w
                            ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleUndoDraw}
                    disabled={strokes.length === 0}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title={t('undoSignature', language)}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDraw}
                    disabled={strokes.length === 0}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title={t('clearSignature', language)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawing Area */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={180}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-44 cursor-crosshair block"
                />
                {strokes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400 dark:text-slate-600 select-none">
                    {language === 'th' ? 'ลากเมาส์เพื่อวาดลายเซ็นที่นี่' : 'Draw your signature here'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TYPE */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('typeNamePlaceholder', language)}
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={language === 'th' ? 'เช่น สมชาย ใจดี หรือ S. Jaidee' : 'e.g. John Doe or J. Doe'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t('penColor', language)}:
                </span>
                <div className="flex items-center gap-1.5">
                  {['#000000', '#1d4ed8', '#dc2626'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTypedColor(c)}
                      className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                        typedColor === c ? 'scale-125 ring-2 ring-pink-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c, borderColor: 'rgba(0,0,0,0.2)' }}
                    />
                  ))}
                </div>
              </div>

              {/* Font Style Options */}
              <div className="space-y-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t('fontStyle', language)}:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {fontOptions.map((opt, idx) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setTypedFontIndex(idx)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        typedFontIndex === idx
                          ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/30 ring-1 ring-pink-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 mb-1">{opt.name}</div>
                      <div
                        className="text-lg truncate"
                        style={{ fontFamily: opt.font, color: typedColor }}
                      >
                        {typedName.trim() || (language === 'th' ? 'ลายเซ็นของคุณ' : 'Your Signature')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                }}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-pink-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/30 transition-colors"
              >
                {uploadedImage ? (
                  <div className="space-y-2">
                    <img
                      src={uploadedImage}
                      alt="Signature"
                      className="max-h-32 mx-auto object-contain"
                    />
                    <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">
                      {language === 'th' ? 'คลิกเพื่อเปลี่ยนรูปภาพ' : 'Click to change image'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-500 dark:text-slate-400">
                    <Upload className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="text-xs font-medium">
                      {t('uploadSignaturePrompt', language)}
                    </p>
                    <p className="text-[11px] text-slate-400">PNG, JPG (สูงสุด 5MB)</p>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={removeBg}
                  onChange={(e) => setRemoveBg(e.target.checked)}
                  className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4 cursor-pointer"
                />
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>{t('removeBackground', language)}</span>
              </label>
            </div>
          )}

          {/* Signature Preview on Document Line */}
          <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('signaturePreview', language)}
            </div>
            <div className="h-16 flex items-end justify-center pb-2 relative">
              <div className="w-4/5 border-b border-slate-400 dark:border-slate-600 relative flex justify-center pb-1">
                {activeTab === 'type' && typedName.trim() && (
                  <span
                    className="text-2xl leading-none"
                    style={{ fontFamily: fontOptions[typedFontIndex].font, color: typedColor }}
                  >
                    {typedName}
                  </span>
                )}
                {activeTab === 'upload' && uploadedImage && (
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="max-h-12 object-contain"
                  />
                )}
                {activeTab === 'draw' && strokes.length > 0 && (
                  <span className="text-xs text-pink-600 dark:text-pink-400 italic">
                    {language === 'th' ? '(พร้อมแทรกลายเซ็นวาด)' : '(Draw signature ready)'}
                  </span>
                )}
                {isInsertDisabled && (
                  <span className="text-xs text-slate-400 italic">
                    {language === 'th' ? 'ลงชื่อที่นี่' : 'Sign here'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50/70 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {t('btnCancel', language)}
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={isInsertDisabled}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-pink-600"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t('btnInsertSignature', language)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

