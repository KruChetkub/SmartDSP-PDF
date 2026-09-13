import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Combine, CheckCircle2 } from 'lucide-react';
import { PdfService } from '../../services/pdfService';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  showAlert?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

interface MergeFileItem {
  id: string;
  name: string;
  size: number;
  bytes: ArrayBuffer;
}

export const MergeModal: React.FC<MergeModalProps> = ({ isOpen, onClose, showAlert }) => {
  const [files, setFiles] = useState<MergeFileItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newItems: MergeFileItem[] = [];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const bytes = await file.arrayBuffer();
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          bytes,
        });
      }
    }

    setFiles((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    try {
      const mergedBytes = await PdfService.mergePdfs(
        files.map((f) => ({ name: f.name, bytes: f.bytes }))
      );
      PdfService.downloadFile(mergedBytes, 'merged_document.pdf');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error merging PDFs:', err);
      if (showAlert) {
        showAlert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการรวมไฟล์ PDF', 'error');
      }
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Combine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">รวมไฟล์ PDF (Merge)</h3>
              <p className="text-xs text-slate-500">เลือกไฟล์ PDF ตั้งแต่ 2 ไฟล์ขึ้นไปเพื่อรวมเป็นไฟล์เดียว</p>
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
        <div className="p-6">
          <div className="mb-4">
            <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-emerald-50/30 transition-all">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleAddFiles}
                className="hidden"
              />
              <Plus className="w-6 h-6 text-emerald-600 mb-1" />
              <span className="text-xs font-semibold text-slate-700">คลิกเพื่อเลือกไฟล์ PDF เพิ่มเติม</span>
              <span className="text-[11px] text-slate-400 mt-0.5">เลือกได้หลายไฟล์พร้อมกัน</span>
            </label>
          </div>

          {/* Files List */}
          <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
            {files.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                ยังไม่มีไฟล์ที่เลือก กรุณาเพิ่มไฟล์ PDF ที่ต้องการรวม
              </div>
            ) : (
              files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-medium text-[10px] shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-700 truncate">{file.name}</span>
                    <span className="text-slate-400 shrink-0">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-600"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === files.length - 1}
                      className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-600"
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(file.id)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded"
                      title="ลบออก"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">เลือกแล้ว {files.length} ไฟล์</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || isMerging}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-sm ${
                files.length < 2 || isMerging
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>รวมไฟล์สำเร็จ!</span>
                </>
              ) : (
                <>
                  <Combine className="w-4 h-4" />
                  <span>{isMerging ? 'กำลังรวมไฟล์...' : 'รวมไฟล์และดาวน์โหลด'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

