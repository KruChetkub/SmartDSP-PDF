// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// SecurityPanel.tsx - Document security & permissions panel matching Screenshot 5

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PanelRightClose, 
  Lock, 
  KeyRound, 
  FileCheck2, 
  FileSignature, 
  Info 
} from 'lucide-react';
import { AppLanguage } from '../../../types/settings';
import { t } from '../../../i18n/translations';

interface SecurityPanelProps {
  hasDocument: boolean;
  language?: AppLanguage;
  onClose: () => void;
  onOpenPolicy?: () => void;
  isEncrypted?: boolean;
  signaturesCount?: number;
  onOpenEncrypt?: () => void;
  onOpenDecrypt?: () => void;
  onOpenSignature?: () => void;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({
  hasDocument,
  language = 'th',
  onClose,
  onOpenPolicy,
  isEncrypted = false,
  signaturesCount = 0,
  onOpenEncrypt,
  onOpenDecrypt,
  onOpenSignature,
}) => {
  const [showPolicyInfo, setShowPolicyInfo] = useState(false);

  const handlePolicyClick = () => {
    if (onOpenPolicy) {
      onOpenPolicy();
    } else {
      setShowPolicyInfo((prev) => !prev);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 select-none text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <div className="h-12 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
          {t('securityTab', language)}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Section: Document Security */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
              {t('docSecurity', language)}
            </span>
            <button
              type="button"
              onClick={handlePolicyClick}
              className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-bold text-xs hover:underline cursor-pointer transition-colors"
            >
              {t('securityPolicy', language)}
            </button>
          </div>

          {/* Policy Info Card (if toggled) */}
          {showPolicyInfo && (
            <div className="mt-3 p-3 rounded-xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40 text-xs text-pink-950 dark:text-pink-200 leading-relaxed space-y-1 animate-in fade-in duration-150">
              <div className="font-bold flex items-center gap-1.5 text-pink-700 dark:text-pink-400">
                <Info className="w-3.5 h-3.5" />
                <span>{language === 'th' ? 'นโยบายความปลอดภัย PDF' : 'PDF Security Policy'}</span>
              </div>
              <p className="text-[11px]">
                {language === 'th'
                  ? 'เอกสาร PDF นี้เปิดอ่านและแก้ไขได้ตามสิทธิ์มาตรฐาน สามารถพิมพ์ คัดลอกเนื้อหา และบันทึกข้อมูลได้ 100%'
                  : 'This PDF document is open for standard editing, printing, content copying, and saving without restriction.'}
              </p>
            </div>
          )}

          {/* Details list matching screenshot 5 */}
          <div className="space-y-3 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t('securityEncryption', language)}
              </span>
              <span className={`font-bold ${isEncrypted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                {isEncrypted 
                  ? (language === 'th' ? 'AES-256 (ปลอดภัย)' : 'AES-256 (Secure)') 
                  : t('securityEncryptionVal', language)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t('securityCopyContent', language)}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {t('securityAllowed', language)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t('securityEditDocument', language)}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {t('securityAllowed', language)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t('securityDigitalSignature', language)}
              </span>
              <span className={`font-bold ${signaturesCount > 0 ? 'text-pink-600 dark:text-pink-400' : 'text-slate-800 dark:text-slate-100'}`}>
                {signaturesCount > 0
                  ? (language === 'th' ? `พบลายเซ็น ${signaturesCount} รายการ` : `Found ${signaturesCount} signature(s)`)
                  : t('securityNoSignatures', language)}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800/60 mt-3">
            {isEncrypted ? (
              <button
                type="button"
                onClick={onOpenDecrypt}
                disabled={!hasDocument}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{t('decrypt', language)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenEncrypt}
                disabled={!hasDocument}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t('encrypt', language)}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSignature}
              disabled={!hasDocument}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-300 text-xs font-semibold transition-colors cursor-pointer border border-pink-200/80 dark:border-pink-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>{t('sign', language)}</span>
            </button>
          </div>
        </div>

        {/* Security Certificate / Badge Card */}
        <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2 mt-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-bold text-xs">
              {language === 'th' ? 'การประมวลผลปลอดภัยบนเครื่อง' : 'Safe Client-side Processing'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {language === 'th'
              ? 'เอกสาร PDF และการประมวลผลข้อความทั้งหมดทำงานภายในเบราว์เซอร์ของคุณ 100% ไม่ส่งข้อมูลออกนอกเครื่อง'
              : 'All PDF processing and text editing run 100% in your local browser sandbox without cloud transmission.'}
          </p>
        </div>
      </div>
    </div>
  );
};

