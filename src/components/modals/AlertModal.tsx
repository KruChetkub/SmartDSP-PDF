import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'ตกลง'
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      icon: Info,
      bgColor: 'bg-sky-100',
      textColor: 'text-sky-700',
      buttonColor: 'bg-sky-600 hover:bg-sky-700 text-white',
      badge: 'แจ้งเตือน'
    },
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'สำเร็จ'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      badge: 'คำเตือน'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-rose-100',
      textColor: 'text-rose-700',
      buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
      badge: 'ข้อผิดพลาด'
    },
  }[type];

  const IconComponent = typeConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] select-none animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 transform scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} ${typeConfig.textColor} flex items-center justify-center shrink-0 shadow-xs`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                {typeConfig.badge}
              </span>
              <h3 className="font-bold text-slate-800 text-base mt-1 leading-snug">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Message */}
        <div className="px-5 py-2">
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 pt-3 flex justify-end gap-2 bg-slate-50 border-t border-slate-100 mt-3">
          <button
            onClick={onClose}
            autoFocus
            className={`px-5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${typeConfig.buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

