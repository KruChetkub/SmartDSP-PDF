// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// SearchBar.tsx - In-document search bar widget (Ctrl+F)

import React, { useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalMatches: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  totalMatches,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevMatch();
      } else {
        onNextMatch();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="absolute top-4 right-8 z-40 flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl px-3 py-1.5 gap-2 text-slate-700 select-none animate-in fade-in slide-in-from-top-2 duration-150">
      <Search className="w-4 h-4 text-slate-400 shrink-0" />
      
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ค้นหาข้อความในเอกสาร..."
        className="w-48 sm:w-60 text-xs bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 py-1"
      />

      {searchQuery.trim().length > 0 && (
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">
          {totalMatches > 0 ? `${currentMatchIndex + 1} / ${totalMatches}` : 'ไม่พบ'}
        </span>
      )}

      <div className="h-4 w-px bg-slate-200" />

      {/* Prev Match */}
      <button
        type="button"
        onClick={onPrevMatch}
        disabled={totalMatches === 0}
        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        title="ผลลัพธ์ก่อนหน้า (Shift+Enter)"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Next Match */}
      <button
        type="button"
        onClick={onNextMatch}
        disabled={totalMatches === 0}
        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        title="ผลลัพธ์ถัดไป (Enter)"
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Close Search */}
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-0.5"
        title="ปิดการค้นหา (Esc)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

