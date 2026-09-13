// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// BookmarksSidebar.tsx - Bookmarks panel for PDF navigation and management

import React, { useState } from 'react';
import { PanelLeftClose, Bookmark as BookmarkIcon, Plus, Trash2 } from 'lucide-react';

export interface BookmarkItem {
  id: string;
  title: string;
  pageIndex: number;
}

interface BookmarksSidebarProps {
  bookmarks: BookmarkItem[];
  currentPageIndex: number;
  onSelectPage: (pageIndex: number) => void;
  onAddBookmark?: (title: string, pageIndex: number) => void;
  onDeleteBookmark?: (id: string) => void;
  onClose: () => void;
}

export const BookmarksSidebar: React.FC<BookmarksSidebarProps> = ({
  bookmarks,
  currentPageIndex,
  onSelectPage,
  onAddBookmark,
  onDeleteBookmark,
  onClose,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddBookmark?.(newTitle.trim(), currentPageIndex);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col z-20 select-none">
      {/* Header */}
      <div className="h-10 px-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <span className="font-semibold text-slate-800 text-sm">บุ๊กมาร์ก</span>
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
        {bookmarks.length === 0 ? (
          <p className="text-xs text-slate-500 italic">ไม่มีบุ๊กมาร์กในเอกสาร</p>
        ) : (
          <div className="space-y-1">
            {bookmarks.map((bm) => {
              const isActive = bm.pageIndex === currentPageIndex;
              return (
                <div
                  key={bm.id}
                  onClick={() => onSelectPage(bm.pageIndex)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-pink-50 text-pink-700 font-medium border border-pink-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <BookmarkIcon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-pink-600 fill-pink-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{bm.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400">น. {bm.pageIndex + 1}</span>
                    {onDeleteBookmark && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBookmark(bm.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 rounded transition-opacity"
                        title="ลบบุ๊กมาร์ก"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Optional Add Bookmark for current page */}
        {onAddBookmark && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            {isAdding ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={`บุ๊กมาร์กหน้า ${currentPageIndex + 1}...`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                  className="w-full text-xs px-2 py-1 border border-slate-200 rounded outline-pink-500 text-slate-800"
                />
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-[11px] px-2 py-0.5 rounded text-slate-500 hover:bg-slate-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="text-[11px] px-2 py-0.5 rounded bg-pink-600 hover:bg-pink-700 text-white font-medium shadow-2xs"
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-pink-600 hover:bg-pink-50/60 rounded-lg border border-dashed border-slate-200 hover:border-pink-300 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มบุ๊กมาร์กหน้านี้</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

