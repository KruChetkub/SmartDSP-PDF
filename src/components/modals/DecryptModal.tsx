// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// DecryptModal.tsx - Remove password protection and decrypt PDF modal

import React, { useState } from 'react';
import { 
  Unlock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2, 
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';

interface DecryptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecrypt: (password: string) => Promise<void>;
  fileName: string;
  language?: AppLanguage;
}

export const DecryptModal: React.FC<DecryptModalProps> = ({
  isOpen,
  onClose,
  onDecrypt,
  fileName,
  language = 'th',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError(t('passwordEmpty', language));
      return;
    }

    try {
      setIsProcessing(true);
      await onDecrypt(password);
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err?.message || t('decryptFailed', language));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-xs">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {t('decryptModalTitle', language)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('decryptModalSubtitle', language)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target File Name */}
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <KeyRound className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span className="truncate">{fileName || 'document.pdf'}</span>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('passwordLabel', language)}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder', language)}
                disabled={isProcessing}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[11px] leading-relaxed">
              {language === 'th'
                ? 'การถอดรหัสจะปลดล็อคข้อจำกัดทั้งหมด ทำให้สามารถเปิดอ่าน แก้ไข พิมพ์ และบันทึกเป็นไฟล์ PDF ทั่วไปได้'
                : 'Decryption unlocks all restrictions, allowing open reading, editing, printing, and saving as standard unencrypted PDF.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 animate-in fade-in">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t('btnCancel', language)}
            </button>
            <button
              type="submit"
              disabled={isProcessing || !password}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-pink-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'th' ? 'กำลังถอดรหัส...' : 'Decrypting...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('btnDecrypt', language)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

