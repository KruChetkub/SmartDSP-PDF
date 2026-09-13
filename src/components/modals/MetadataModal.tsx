// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// MetadataModal.tsx - Modal dialog for inspecting and editing PDF document metadata

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Info, 
  Copy, 
  Check, 
  Save, 
  FileText, 
  User, 
  Tag, 
  ShieldCheck, 
  ShieldAlert,
  Layers,
  HardDrive
} from 'lucide-react';
import { PdfMetadata } from '../../types';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  totalPages: number;
  fileSize?: number;
  isEncrypted?: boolean;
  metadata?: PdfMetadata;
  language?: AppLanguage;
  onSaveMetadata?: (updated: PdfMetadata) => void;
}

export const MetadataModal: React.FC<MetadataModalProps> = ({
  isOpen,
  onClose,
  fileName = 'document.pdf',
  totalPages = 1,
  fileSize,
  isEncrypted = false,
  metadata,
  language = 'th',
  onSaveMetadata,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [keywords, setKeywords] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(metadata?.title || '');
      setAuthor(metadata?.author || '');
      setSubject(metadata?.subject || '');
      setKeywords(metadata?.keywords || '');
      setSavedSuccess(false);
      setCopied(false);
    }
  }, [isOpen, metadata]);

  if (!isOpen) return null;

  // Format file size nicely
  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date nicely
  const formatDate = (dateVal?: Date | string) => {
    if (!dateVal) return '-';
    try {
      if (typeof dateVal === 'string' && dateVal.startsWith('D:')) {
        // PDF date format: D:YYYYMMDDHHmmSSOHH'mm'
        const y = dateVal.slice(2, 6);
        const m = dateVal.slice(6, 8);
        const d = dateVal.slice(8, 10);
        return `${d}/${m}/${y}`;
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateVal);
    }
  };

  // Handle Save
  const handleSave = () => {
    const updated: PdfMetadata = {
      ...metadata,
      title: title.trim(),
      author: author.trim(),
      subject: subject.trim(),
      keywords: keywords.trim(),
      modificationDate: new Date(),
    };
    onSaveMetadata?.(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  // Handle Copy all metadata to clipboard
  const handleCopyAll = () => {
    const lines = [
      `=== ${language === 'th' ? 'ข้อมูลเมทาดาทาเอกสาร' : 'Document Metadata'} ===`,
      `${language === 'th' ? 'ชื่อไฟล์' : 'File Name'}: ${fileName}`,
      `${language === 'th' ? 'จำนวนหน้า' : 'Total Pages'}: ${totalPages}`,
      `${language === 'th' ? 'ขนาดไฟล์' : 'File Size'}: ${formatFileSize(fileSize)}`,
      `${language === 'th' ? 'ชื่อเรื่อง' : 'Title'}: ${title || '-'}`,
      `${language === 'th' ? 'ผู้สร้าง/ผู้แต่ง' : 'Author'}: ${author || '-'}`,
      `${language === 'th' ? 'หัวข้อ' : 'Subject'}: ${subject || '-'}`,
      `${language === 'th' ? 'คำสำคัญ' : 'Keywords'}: ${keywords || '-'}`,
      `${language === 'th' ? 'สถานะความปลอดภัย' : 'Security'}: ${isEncrypted ? 'Encrypted (AES-256)' : 'None'}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/60 p-2 flex items-center justify-center border border-pink-200 dark:border-pink-900/40 text-pink-600 dark:text-pink-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
                {language === 'th' ? 'ข้อมูลเมทาดาทาของเอกสาร' : 'Document Metadata'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Quick Overview Badges Card */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Pages */}
            <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {language === 'th' ? 'จำนวนหน้า' : 'Pages'}
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {totalPages} {language === 'th' ? 'หน้า' : 'pages'}
                </div>
              </div>
            </div>

            {/* File Size */}
            <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {language === 'th' ? 'ขนาดไฟล์' : 'File Size'}
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {formatFileSize(fileSize)}
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isEncrypted
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
              }`}>
                {isEncrypted ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div className="truncate">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {language === 'th' ? 'ความปลอดภัย' : 'Security'}
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {isEncrypted ? 'AES-256' : (language === 'th' ? 'ไม่มีรหัสผ่าน' : 'Open')}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Editable Metadata */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span>{language === 'th' ? 'ข้อมูลคุณลักษณะเอกสาร (แก้ไขได้)' : 'Document Properties (Editable)'}</span>
              </h4>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {language === 'th' ? 'แก้ไขแล้วกดบันทึกเพื่อฝังลงใน PDF' : 'Save to embed in PDF'}
              </span>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {language === 'th' ? 'ชื่อเรื่อง (Title)' : 'Title'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={fileName.replace(/\.pdf$/i, '')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{language === 'th' ? 'ผู้สร้าง / ผู้แต่ง (Author)' : 'Author'}</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={language === 'th' ? 'ชื่อผู้แต่ง หรือองค์กรผู้จัดทำ' : 'Author name or organization'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {language === 'th' ? 'หัวข้อเรื่อง (Subject)' : 'Subject'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={language === 'th' ? 'รายละเอียดหัวข้อ หรือคำอธิบายเอกสารสั้นๆ' : 'Subject or brief description'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>{language === 'th' ? 'คำสำคัญ / แท็ก (Keywords)' : 'Keywords'}</span>
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={language === 'th' ? 'คั่นด้วยเครื่องหมายจุลภาค เช่น PDF, รายงาน, หนังสือราชการ' : 'Comma-separated keywords'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850/50">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {language === 'th' ? 'คัดลอกแล้ว!' : 'Copied!'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{language === 'th' ? 'คัดลอกข้อมูลทั้งหมด' : 'Copy All'}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'th' ? 'ปิด' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-pink-600 hover:bg-pink-700 active:scale-98 text-white rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'th' ? 'บันทึกแล้ว' : 'Saved'}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

