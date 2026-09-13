import React from 'react';
import { X, Heart, ShieldCheck, Github, ExternalLink } from 'lucide-react';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: AppLanguage;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, language = 'th' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/60 p-1 flex items-center justify-center border border-pink-100 dark:border-pink-900/40">
              <img src="/DSPLogo.svg" alt="SmartDSP PDF" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
                {language === 'th' ? 'เกี่ยวกับ SmartDSP PDF' : 'About SmartDSP PDF'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'th' ? 'เวอร์ชัน 1.0.0 (Web Edition)' : 'Version 1.0.0 (Web Edition)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 text-pink-950 dark:text-pink-200">
            <p className="font-semibold text-sm mb-1">
              {language === 'th' ? 'โปรแกรมแก้ไข PDF ภาษาไทย มาตรฐานองค์กร' : 'SmartDSP PDF - Enterprise Thai PDF Editor'}
            </p>
            <p className="text-xs opacity-90">
              {language === 'th' 
                ? 'ระบบแก้ไขเอกสาร PDF ครบวงจร ทำงานแบบ Client-Side 100% ปลอดภัยและรวดเร็ว'
                : 'All-in-one PDF Editor running 100% client-side for maximum speed and security.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {language === 'th' ? 'ความเป็นส่วนตัว 100% (Client-Side):' : '100% Privacy (Client-Side):'}
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'th'
                    ? 'ไฟล์ PDF ของคุณถูกเปิดและประมวลผลบนหน่วยความจำของเบราว์เซอร์ในเครื่องของคุณเท่านั้น ไม่มีการส่งไฟล์ไปยังเซิร์ฟเวอร์ภายนอกใดๆ'
                    : 'Your PDF files are opened and manipulated directly inside browser memory. Files are never transmitted to external servers.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {language === 'th' ? 'ผู้พัฒนา:' : 'Developer:'}
                </span>
                <p className="text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  นายพิเชษฐ์ ศรีพิชัย (Pichet Sripichai)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>License: AGPL-3.0-or-later</span>
            <span>Bundled: TH Sarabun New</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <a
            href="https://github.com/KruChetkub/SmartDSP-PDF"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
          >
            <Github className="w-4 h-4" />
            <span>SmartDSP PDF</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {t('btnClose', language)}
          </button>
        </div>
      </div>
    </div>
  );
};

