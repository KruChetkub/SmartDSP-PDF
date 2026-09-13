// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// ImageAnnotationLayer.tsx - Layer rendering user inserted images with drag and resize handles

import React from 'react';
import { ImageAnnotation, ToolMode } from '../../../types';
import { ResizeHandleType } from '../viewerTypes';
import { FloatingActionToolbar } from '../overlay/FloatingActionToolbar';
import { ResizeHandlesOverlay } from '../overlay/ResizeHandlesOverlay';

interface ImageAnnotationLayerProps {
  pageImages: ImageAnnotation[];
  selectedImageId: string | null;
  toolMode: ToolMode;
  zoom: number;
  onSelectImage: (id: string | null) => void;
  onUpdateImage: (img: ImageAnnotation) => void;
  onDeleteImage: (id: string) => void;
  onStartDrag: (e: React.MouseEvent | React.TouchEvent, item: ImageAnnotation) => void;
  onStartResize: (e: React.MouseEvent | React.TouchEvent, item: ImageAnnotation, handle: ResizeHandleType) => void;
  onStartRotate?: (e: React.MouseEvent | React.TouchEvent, item: ImageAnnotation) => void;
  onOpenInspector?: () => void;
}

export const ImageAnnotationLayer: React.FC<ImageAnnotationLayerProps> = ({
  pageImages,
  selectedImageId,
  toolMode,
  zoom,
  onSelectImage,
  onUpdateImage,
  onDeleteImage,
  onStartDrag,
  onStartResize,
  onStartRotate,
  onOpenInspector,
}) => {
  const lastTapRef = React.useRef<{ id: string; time: number } | null>(null);

  return (
    <>
      {pageImages.map((img) => {
        const isSelected = selectedImageId === img.id;

        return (
          <div
            key={img.id}
            onMouseDown={(e) => {
              if (toolMode === 'pan' || toolMode === 'selectText') return;
              e.stopPropagation();
              onSelectImage(img.id);
              onStartDrag(e, img);
            }}
            onTouchStart={(e) => {
              if (toolMode === 'pan' || toolMode === 'selectText') return;
              e.stopPropagation();
              onSelectImage(img.id);

              const now = Date.now();
              // Double-tap detector: 2 taps on same image within 350ms opens inspector
              if (lastTapRef.current && lastTapRef.current.id === img.id && now - lastTapRef.current.time < 350) {
                lastTapRef.current = null;
                onOpenInspector?.();
              } else {
                lastTapRef.current = { id: img.id, time: now };
                onStartDrag(e, img);
              }
            }}
            onDoubleClick={(e) => {
              if (toolMode === 'pan' || toolMode === 'selectText') return;
              e.stopPropagation();
              onSelectImage(img.id);
              onOpenInspector?.();
            }}
            className={`absolute select-none ${
              toolMode === 'pan' || toolMode === 'selectText'
                ? 'pointer-events-none'
                : 'cursor-move'
            } ${
              isSelected
                ? 'outline outline-2 outline-pink-500 ring-2 ring-pink-300 z-30 shadow-md'
                : 'hover:outline hover:outline-1 hover:outline-dashed hover:outline-pink-400 z-20'
            }`}
            style={{
              left: `${img.x * zoom}px`,
              top: `${img.y * zoom}px`,
              width: `${img.width * zoom}px`,
              height: `${img.height * zoom}px`,
              transform: `rotate(${img.rotation || 0}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={img.imageDataUrl}
              alt="PDF Annotation"
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />

            {/* Floating Action Toolbar: Move, Rotate, Edit, and Delete */}
            {isSelected && toolMode !== 'pan' && (
              <FloatingActionToolbar
                onStartDrag={(e) => onStartDrag(e, img)}
                onRotate={(e) => {
                  e.stopPropagation();
                  onUpdateImage({
                    ...img,
                    rotation: ((img.rotation || 0) + 90) % 360,
                  });
                }}
                onEdit={() => onOpenInspector?.()}
                onDelete={() => {
                  onDeleteImage(img.id);
                  onSelectImage(null);
                }}
                accentColor="#d946ef"
                isBottom={img.y * zoom < 40}
              />
            )}

            {/* 8 Circular Magenta Resize Handles + Top Rotation Handle */}
            {isSelected && toolMode !== 'pan' && (
              <ResizeHandlesOverlay
                onStartResize={(e, handle) => onStartResize(e, img, handle)}
                onStartRotate={(e) => onStartRotate?.(e, img)}
                color="#d946ef"
              />
            )}
          </div>
        );
      })}
    </>
  );
};
