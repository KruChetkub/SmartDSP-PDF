// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// MobileToolsModal.tsx - Comprehensive quick action bottom sheet for mobile devices

import React from 'react';
import { 
  X, 
  Combine, 
  Scissors, 
  PenLine, 
  FileDown, 
  Lock, 
  Unlock, 
  Search, 
  History, 
  Image as ImageIcon, 
  FilePlus, 
  ArrowUpDown, 
  Settings, 
  Info,
  RotateCw,
  RotateCcw,
  Printer
} from 'lucide-react';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';

interface MobileToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMerge: () => void;
  onOpenSplit: () => void;
  onOpenSignature: () => void;
  onOpenCompress: () => void;
  onOpenEncrypt: () => void;
  onOpenDecrypt: () => void;
  onToggleSearch: () => void;
  onOpenHistory: () => void;
  onAddImage: (file: File) => void;
  onAddBlankPage: () => void;
  onReversePages: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onPrint: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  language?: AppLanguage;
}

export const MobileToolsModal: React.FC<MobileToolsModalProps> = ({
  isOpen,
  onClose,
  onOpenMerge,
  onOpenSplit,
  onOpenSignature,
  onOpenCompress,
  onOpenEncrypt,
  onOpenDecrypt,
  onToggleSearch,
  onOpenHistory,
  onAddImage,
  onAddBlankPage,
  onReversePages,
  onRotateLeft,
  onRotateRight,
  onPrint,
  onOpenSettings,
  onOpenAbout,
  language = 'th',
}) => {
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAction = (fn: () => void) => {
    onClose();
    fn();
  };

  const handleTriggerImage = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
      imageInputRef.current.click();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddImage(e.target.files[0]);
      onClose();
    }
  };

  const toolItems = [
    { label: t('signatureModalTitle', language) || 'เซ็นลายเซ็น', icon: PenLine, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40', action: onOpenSignature },
    { label: t('insertImage', language) || 'แทรกรูปภาพ', icon: ImageIcon, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', action: handleTriggerImage },
    { label: t('insertBlankPage', language) || 'แทรกหน้าใหม่', icon: FilePlus, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40', action: onAddBlankPage },
    { label: 'หมุนซ้าย 90°', icon: RotateCcw, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40', action: onRotateLeft },
    { label: 'หมุนขวา 90°', icon: RotateCw, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40', action: onRotateRight },
    { label: t('merge', language) || 'รวมไฟล์ PDF', icon: Combine, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', action: onOpenMerge },
    { label: t('split', language) || 'แยกเอกสาร', icon: Scissors, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40', action: onOpenSplit },
    { label: t('compressPdf', language) || 'ลดขนาดไฟล์', icon: FileDown, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40', action: onOpenCompress },
    { label: t('searchText', language) || 'ค้นหาข้อความ', icon: Search, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40', action: onToggleSearch },
    { label: 'ประวัติแก้ไข', icon: History, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40', action: onOpenHistory },
    { label: 'เข้ารหัส PDF', icon: Lock, color: 'text-red-600 bg-red-50 dark:bg-red-950/40', action: onOpenEncrypt },
    { label: 'ถอดรหัส PDF', icon: Unlock, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40', action: onOpenDecrypt },
    { label: t('reverse', language) || 'กลับลำดับหน้า', icon: ArrowUpDown, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40', action: onReversePages },
    { label: t('print', language) || 'พิมพ์เอกสาร', icon: Printer, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800', action: onPrint },
    { label: t('settings', language) || 'การตั้งค่า', icon: Settings, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800', action: onOpenSettings },
    { label: 'เกี่ยวกับระบบ', icon: Info, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800', action: onOpenAbout },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 border-t border-slate-200 dark:border-slate-800">
        {/* Handle bar & Header */}
        <div className="flex flex-col items-center pt-3 pb-2 px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mb-3" />
          <div className="w-full flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              {language === 'th' ? 'เครื่องมือและฟังก์ชันทั้งหมด' : 'All Tools & Features'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 pb-8">
          {toolItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAction(item.action)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 active:scale-95 transition-all text-center group cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 shadow-2xs ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
