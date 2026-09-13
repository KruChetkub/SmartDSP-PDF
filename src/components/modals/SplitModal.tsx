import React, { useState, useEffect } from 'react';
import { X, Split, CheckCircle2 } from 'lucide-react';
import { PdfService } from '../../services/pdfService';

interface SplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileBytes: ArrayBuffer | null;
  fileName: string;
  totalPages: number;
  defaultRange?: string;
  showAlert?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SplitModal: React.FC<SplitModalProps> = ({
  isOpen,
  onClose,
  fileBytes,
  fileName,
  totalPages,
  defaultRange,
  showAlert,
}) => {
  const [mode, setMode] = useState<'range' | 'all'>('range');
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [isSplitting, setIsSplitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultRange) {
        setRangeInput(defaultRange);
      } else {
        setRangeInput('1');
      }
      setSuccess(false);
    }
  }, [isOpen, defaultRange]);

  if (!isOpen) return null;

  const parseRange = (input: string, max: number): number[] => {
    const indices: Set<number> = new Set();
    const parts = input.split(',').map((p) => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          const s = Math.max(1, Math.min(start, end));
          const e = Math.min(max, Math.max(start, end));
          for (let i = s; i <= e; i++) {
            indices.add(i - 1); // 0-based
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= max) {
          indices.add(p - 1); // 0-based
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!fileBytes) return;
    setIsSplitting(true);
    try {
      if (mode === 'range') {
        const selectedIndices = parseRange(rangeInput, totalPages);
        if (selectedIndices.length === 0) {
          if (showAlert) {
            showAlert('ระบุหน้าไม่ถูกต้อง', 'กรุณาระบุเลขหน้าที่ถูกต้อง เช่น 1-3 หรือ 1, 3, 5', 'warning');
          }
          setIsSplitting(false);
          return;
        }

        const resultBytes = await PdfService.splitPdf(fileBytes, selectedIndices);
        const baseName = fileName.replace(/\.pdf$/i, '');
        PdfService.downloadFile(resultBytes, `${baseName}_extracted.pdf`);
      } else {
        // Split every page
        for (let i = 0; i < totalPages; i++) {
          const pageBytes = await PdfService.splitPdf(fileBytes, [i]);
          const baseName = fileName.replace(/\.pdf$/i, '');
          PdfService.downloadFile(pageBytes, `${baseName}_page_${i + 1}.pdf`);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error splitting PDF:', err);
      if (showAlert) {
        showAlert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการแยกหน้าเอกสาร', 'error');
      }
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Split className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">แยกหน้า PDF (Split)</h3>
              <p className="text-xs text-slate-500">เอกสารมีทั้งหมด {totalPages} หน้า</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="splitMode"
                checked={mode === 'range'}
                onChange={() => setMode('range')}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span>ดึงเฉพาะหน้าที่ต้องการ (Custom Range)</span>
            </label>

            {mode === 'range' && (
              <div className="pl-6">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="เช่น 1-3 หรือ 1, 2, 4"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-amber-500 bg-slate-50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  พิมพ์ระบุเลขหน้า เช่น 1-3 (หน้า 1 ถึง 3) หรือ 1, 4 (หน้า 1 และ 4)
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="splitMode"
                checked={mode === 'all'}
                onChange={() => setMode('all')}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span>แยกทุกหน้าเป็นไฟล์เดี่ยว (Split All Pages)</span>
            </label>
            {mode === 'all' && (
              <p className="text-[11px] text-slate-400 pl-6">
                โปรแกรมจะแยกแต่ละหน้าออกมาเป็นไฟล์ PDF แยกกัน {totalPages} ไฟล์
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSplit}
            disabled={isSplitting}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-sm ${
              isSplitting
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>แยกหน้าสำเร็จ!</span>
              </>
            ) : (
              <>
                <Split className="w-4 h-4" />
                <span>{isSplitting ? 'กำลังแยกหน้า...' : 'แยกหน้าและดาวน์โหลด'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

