import React, { useRef } from 'react';
import { 
  FolderOpen, 
  Download, 
  Combine, 
  Split, 
  Maximize, 
  Info,
  Layers
} from 'lucide-react';

interface NavbarProps {
  fileName: string;
  hasDocument: boolean;
  onOpenFile: (file: File) => void;
  onExportPdf: () => void;
  onOpenMergeModal: () => void;
  onOpenSplitModal: () => void;
  onOpenAboutModal: () => void;
  onTogglePresentation: () => void;
  isExporting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  fileName,
  hasDocument,
  onOpenFile,
  onExportPdf,
  onOpenMergeModal,
  onOpenSplitModal,
  onOpenAboutModal,
  onTogglePresentation,
  isExporting
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onOpenFile(files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm z-30 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-base tracking-tight">OpenJPDF</span>
            <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">Web</span>
          </div>
          {fileName && (
            <p className="text-xs text-slate-500 max-w-[200px] truncate" title={fileName}>
              {fileName}
            </p>
          )}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInputChange} 
          accept=".pdf" 
          className="hidden" 
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="เปิดไฟล์ PDF (Ctrl+O)"
        >
          <FolderOpen className="w-4 h-4 text-sky-600" />
          <span>เปิดไฟล์</span>
        </button>

        <button
          onClick={onExportPdf}
          disabled={!hasDocument || isExporting}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm ${
            !hasDocument || isExporting
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-sky-600 hover:bg-sky-700 text-white'
          }`}
          title="บันทึก / ดาวน์โหลด PDF (Ctrl+S)"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'กำลังบันทึก...' : 'บันทึก PDF'}</span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Multi-PDF Tools */}
        <button
          onClick={onOpenMergeModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          title="รวมไฟล์ PDF หลายไฟล์เข้าด้วยกัน"
        >
          <Combine className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">รวม PDF</span>
        </button>

        <button
          onClick={onOpenSplitModal}
          disabled={!hasDocument}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            !hasDocument 
              ? 'text-slate-300 cursor-not-allowed' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="แยกหน้า PDF"
        >
          <Split className="w-4 h-4 text-amber-600" />
          <span className="hidden sm:inline">แยกหน้า</span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Presentation & Help */}
        <button
          onClick={onTogglePresentation}
          disabled={!hasDocument}
          className={`p-2 rounded-md transition-colors ${
            !hasDocument ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="โหมดนำเสนอเต็มหน้าจอ (F5)"
        >
          <Maximize className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAboutModal}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
          title="เกี่ยวกับโปรแกรม OpenJPDF Web"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

