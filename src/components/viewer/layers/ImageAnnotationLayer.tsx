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
  onDeleteImage: (id: string) => void;
  onStartDrag: (e: React.MouseEvent | React.TouchEvent, item: ImageAnnotation) => void;
  onStartResize: (e: React.MouseEvent | React.TouchEvent, item: ImageAnnotation, handle: ResizeHandleType) => void;
}

export const ImageAnnotationLayer: React.FC<ImageAnnotationLayerProps> = ({
  pageImages,
  selectedImageId,
  toolMode,
  zoom,
  onSelectImage,
  onDeleteImage,
  onStartDrag,
  onStartResize,
}) => {
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
              onStartDrag(e, img);
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
            }}
          >
            <img
              src={img.imageDataUrl}
              alt="PDF Annotation"
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />

            {/* Floating Action Toolbar: Move and Delete */}
            {isSelected && toolMode !== 'pan' && (
              <FloatingActionToolbar
                onStartDrag={(e) => onStartDrag(e, img)}
                onDelete={() => {
                  onDeleteImage(img.id);
                  onSelectImage(null);
                }}
                accentColor="#d946ef"
                isBottom={img.y * zoom < 40}
              />
            )}

            {/* 8 Circular Magenta Resize Handles */}
            {isSelected && toolMode !== 'pan' && (
              <ResizeHandlesOverlay
                onStartResize={(e, handle) => onStartResize(e, img, handle)}
                color="#d946ef"
              />
            )}
          </div>
        );
      })}
    </>
  );
};
