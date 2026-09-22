// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// AttachmentsSidebar.tsx - Attachments panel for PDF embedded file management

import React, { useRef } from 'react';
import { PanelLeftClose, Download, Trash2, Plus, File } from 'lucide-react';

export interface AttachmentItem {
  id: string;
  filename: string;
  size?: number;
  dataBlob?: Blob;
  dataBytes?: Uint8Array;
}

interface AttachmentsSidebarProps {
  attachments: AttachmentItem[];
  onAddAttachment?: (file: File) => void;
  onDeleteAttachment?: (id: string) => void;
  onClose: () => void;
}

export const AttachmentsSidebar: React.FC<AttachmentsSidebarProps> = ({
  attachments,
  onAddAttachment,
  onDeleteAttachment,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (att: AttachmentItem) => {
    const blob = att.dataBlob
      ?? (att.dataBytes
        ? new Blob([att.dataBytes as unknown as BlobPart])
        : undefined);
    if (!blob) return;

    // Keep attachment-controlled data away from DOM URL sinks in application
    // code. PDF.js owns the browser-specific download implementation.
    const { DownloadManager } = await import('pdfjs-dist/web/pdf_viewer');
    new DownloadManager().download(blob, '', att.filename, undefined);
  };

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col z-20 select-none">
      {/* Header */}
      <div className="h-10 px-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <span className="font-semibold text-slate-800 text-sm">ไฟล์แนบ</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
          title="ปิดแถบข้าง"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {attachments.length === 0 ? (
          <p className="text-xs text-slate-500 italic">ไม่มีไฟล์แนบ</p>
        ) : (
          <div className="space-y-1.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group flex items-center justify-between p-2 rounded-lg text-xs bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <p className="truncate text-slate-700 font-medium">{att.filename}</p>
                    {att.size && (
                      <p className="text-[10px] text-slate-400">{formatSize(att.size)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={() => handleDownload(att)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                    title="ดาวน์โหลดไฟล์แนบ"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteAttachment && (
                    <button
                      type="button"
                      onClick={() => onDeleteAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                      title="ลบไฟล์แนบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optional Add Attachment */}
        {onAddAttachment && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onAddAttachment(f);
                e.target.value = '';
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-pink-600 hover:bg-pink-50/60 rounded-lg border border-dashed border-slate-200 hover:border-pink-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มไฟล์แนบ</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
