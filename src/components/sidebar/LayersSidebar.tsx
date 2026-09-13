// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// LayersSidebar.tsx - Layers panel for PDF optional content groups and annotation layers

import React from 'react';
import { PanelLeftClose, Layers as LayersIcon, Eye, EyeOff, Type, Shapes, PenTool, Image as ImageIcon } from 'lucide-react';

export interface LayerItem {
  id: string;
  name: string;
  visible: boolean;
  type?: 'text' | 'shape' | 'drawing' | 'image' | 'ocg';
  count?: number;
}

interface LayersSidebarProps {
  layers: LayerItem[];
  onToggleLayer?: (id: string) => void;
  onClose: () => void;
}

export const LayersSidebar: React.FC<LayersSidebarProps> = ({
  layers,
  onToggleLayer,
  onClose,
}) => {
  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col z-20 select-none">
      {/* Header */}
      <div className="h-10 px-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <span className="font-semibold text-slate-800 text-sm">เลเยอร์</span>
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
        {layers.length === 0 ? (
          <p className="text-xs text-slate-500 italic">ไม่มีเลเยอร์เนื้อหาเสริม</p>
        ) : (
          <div className="space-y-1">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-2 truncate">
                  {layer.type === 'text' && <Type className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  {layer.type === 'shape' && <Shapes className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
                  {layer.type === 'drawing' && <PenTool className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                  {layer.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  {(!layer.type || layer.type === 'ocg') && (
                    <LayersIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{layer.name}</span>
                  {typeof layer.count === 'number' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
                      {layer.count}
                    </span>
                  )}
                </div>
                {onToggleLayer && (
                  <button
                    type="button"
                    onClick={() => onToggleLayer(layer.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                    title={layer.visible ? 'ซ่อนเลเยอร์' : 'แสดงเลเยอร์'}
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

