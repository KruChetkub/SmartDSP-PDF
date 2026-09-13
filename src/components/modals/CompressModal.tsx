// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// CompressModal.tsx - Modal dialog for reducing PDF file size without technical jargon

import React, { useState } from 'react';
import { 
  X, 
  Minimize2, 
  Download, 
  CheckCircle2, 
  Loader2, 
  FileText,
  Mail,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { AppLanguage } from '../../types/settings';
import { t } from '../../i18n/translations';
import { CompressPreset, CompressResult, CompressService } from '../../services/compressService';
import { PdfService } from '../../services/pdfService';

interface CompressModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileBytes: ArrayBuffer | null;
  fileName?: string;
  language?: AppLanguage;
  showAlert: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onApplyCompressed?: (compressedBytes: Uint8Array) => void;
}

export const CompressModal: React.FC<CompressModalProps> = ({
  isOpen,
  onClose,
  fileBytes,
  fileName = 'document.pdf',
  language = 'th',
  showAlert,
  onApplyCompressed,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<CompressPreset>('3m');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<CompressResult | null>(null);

  if (!isOpen) return null;

  const currentFileSize = fileBytes?.byteLength || 0;

  const formatFileSize = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleStartCompress = async () => {
    if (!fileBytes || fileBytes.byteLength === 0) {
      showAlert(
        t('warning', language),
        language === 'th' ? 'ไม่มีข้อมูลไฟล์ PDF สำหรับลดขนาด' : 'No PDF document loaded to compress',
        'warning'
      );
      return;
    }

    setIsCompressing(true);
    setProgress(5);
    setResult(null);

    try {
      const res = await CompressService.compressPdf(
        fileBytes,
        selectedPreset,
        (p) => setProgress(p)
      );
      setResult(res);
      showAlert(
        t('success', language),
        t('compressSuccess', language),
        'success'
      );
    } catch (err: any) {
      showAlert(
        t('error', language),
        `${t('compressFailed', language)}: ${err?.message || err}`,
        'error'
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_compressed.pdf`;
    PdfService.downloadFile(result.compressedBytes, outName);
  };

  const handleApplyToEditor = () => {
    if (!result || !onApplyCompressed) return;
    onApplyCompressed(result.compressedBytes);
    onClose();
  };

  const presets: {
    id: CompressPreset;
    title: string;
    description: string;
    icon: React.ReactNode;
    tag?: string;
  }[] = [
    {
      id: '1m',
      title: t('compressPreset1M', language),
      description: t('compressPreset1MDesc', language),
      icon: <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      tag: language === 'th' ? 'ขนาดเล็กสุด' : 'Smallest',
    },
    {
      id: '3m',
      title: t('compressPreset3M', language),
      description: t('compressPreset3MDesc', language),
      icon: <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      tag: language === 'th' ? 'แนะนำ' : 'Recommended',
    },
    {
      id: '5m',
      title: t('compressPreset5M', language),
      description: t('compressPreset5MDesc', language),
      icon: <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      tag: language === 'th' ? 'ความคมชัดสูง' : 'High Quality',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 p-2 flex items-center justify-center border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400">
              <Minimize2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
                {t('compressModalTitle', language)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCompressing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Current File Size Info Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {t('currentFileSize', language)}:
              </span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white px-2.5 py-0.5 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-2xs">
              {formatFileSize(currentFileSize)}
            </span>
          </div>

          {/* Preset Choices */}
          <div className="space-y-2.5">
            <label className="block font-medium text-slate-700 dark:text-slate-300 text-xs">
              {t('targetFileSize', language)}:
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {presets.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      if (!isCompressing) {
                        setSelectedPreset(preset.id);
                        setResult(null);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                    } ${isCompressing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {preset.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white text-sm">
                            {preset.title}
                          </span>
                          {preset.tag && (
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                preset.id === '3m'
                                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                                  : preset.id === '1m'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                              }`}
                            >
                              {preset.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-xs">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 mt-1">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar during Compression */}
          {isCompressing && (
            <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/40 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-medium text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{t('compressing', language)}</span>
                </div>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-200/60 dark:bg-blue-900/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300/80">
                {t('compressWait', language)}
              </p>
            </div>
          )}

          {/* Result Card (When compression completed) */}
          {result && !isCompressing && (
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/40 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('compressSuccess', language)}</span>
              </div>

              {/* Before and After Comparison */}
              <div className="flex items-center justify-around bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-center">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('compressOriginalSize', language)}
                  </div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs mt-0.5 line-through decoration-slate-400">
                    {formatFileSize(result.originalSize)}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />

                <div className="text-center">
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {t('compressReducedSize', language)}
                  </div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 text-sm mt-0.5">
                    {formatFileSize(result.newSize)}
                  </div>
                </div>

                {result.ratio > 0 && (
                  <div className="text-center bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-lg">
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                      {t('compressRatio', language)}
                    </div>
                    <div className="font-extrabold text-emerald-700 dark:text-emerald-300 text-xs">
                      -{result.ratio}%
                    </div>
                  </div>
                )}
              </div>

              {/* Download & Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('downloadCompressed', language)}</span>
                </button>
                {onApplyCompressed && (
                  <button
                    type="button"
                    onClick={handleApplyToEditor}
                    className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                    title={t('applyCompressedToEditor', language)}
                  >
                    {t('applyCompressedToEditor', language)}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isCompressing}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
          >
            {t('btnClose', language)}
          </button>
          <button
            type="button"
            onClick={handleStartCompress}
            disabled={isCompressing || !fileBytes}
            className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompressing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('compressing', language)}</span>
              </>
            ) : result ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'th' ? 'บีบอัดใหม่' : 'Compress Again'}</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>{t('startCompress', language)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

