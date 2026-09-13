// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// useAnnotationInteraction.ts - Custom hook managing drag moving and 8-point resizing of annotations

import { useState, useEffect } from 'react';
import { TextAnnotation, ImageAnnotation, ShapeAnnotation } from '../../../types';
import { DragItemState, ResizeItemState } from '../viewerTypes';

interface UseAnnotationInteractionProps {
  zoom: number;
  textAnnotations: TextAnnotation[];
  imageAnnotations: ImageAnnotation[];
  shapeAnnotations: ShapeAnnotation[];
  onUpdateText: (text: TextAnnotation) => void;
  onUpdateImage: (img: ImageAnnotation) => void;
  onUpdateShape: (shape: ShapeAnnotation) => void;
}

export const useAnnotationInteraction = ({
  zoom,
  textAnnotations,
  imageAnnotations,
  shapeAnnotations,
  onUpdateText,
  onUpdateImage,
  onUpdateShape,
}: UseAnnotationInteractionProps) => {
  const [dragItem, setDragItem] = useState<DragItemState | null>(null);
  const [resizeItem, setResizeItem] = useState<ResizeItemState | null>(null);

  useEffect(() => {
    if (!dragItem && !resizeItem) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (dragItem) {
        const rawDist = Math.hypot(e.clientX - dragItem.mouseStartX, e.clientY - dragItem.mouseStartY);
        // Threshold of 3px prevents accidental micro-drifts when user just clicks
        if (!dragItem.hasMoved) {
          if (rawDist < 3) return;
          dragItem.hasMoved = true;
        }

        const deltaX = (e.clientX - dragItem.mouseStartX) / zoom;
        const deltaY = (e.clientY - dragItem.mouseStartY) / zoom;

        if (dragItem.type === 'text') {
          const item = textAnnotations.find((t) => t.id === dragItem.id);
          if (item) {
            onUpdateText({
              ...item,
              x: Math.max(0, Math.round(dragItem.origX + deltaX)),
              y: Math.max(0, Math.round(dragItem.origY + deltaY)),
            });
          }
        } else if (dragItem.type === 'image') {
          const item = imageAnnotations.find((i) => i.id === dragItem.id);
          if (item) {
            onUpdateImage({
              ...item,
              x: Math.max(0, Math.round(dragItem.origX + deltaX)),
              y: Math.max(0, Math.round(dragItem.origY + deltaY)),
            });
          }
        } else if (dragItem.type === 'shape') {
          const item = shapeAnnotations.find((s) => s.id === dragItem.id);
          if (item) {
            onUpdateShape({
              ...item,
              x: Math.max(0, Math.round(dragItem.origX + deltaX)),
              y: Math.max(0, Math.round(dragItem.origY + deltaY)),
            });
          }
        }
      } else if (resizeItem) {
        const deltaX = (e.clientX - resizeItem.mouseStartX) / zoom;
        const deltaY = (e.clientY - resizeItem.mouseStartY) / zoom;
        const minDim = 15;

        let newX = resizeItem.origX;
        let newY = resizeItem.origY;
        let newWidth = resizeItem.origWidth;
        let newHeight = resizeItem.origHeight;

        const h = resizeItem.handle;

        // Horizontal resizing
        if (h.includes('e')) {
          newWidth = Math.max(minDim, Math.round(resizeItem.origWidth + deltaX));
        } else if (h.includes('w')) {
          const possibleW = resizeItem.origWidth - deltaX;
          if (possibleW >= minDim) {
            newX = Math.round(resizeItem.origX + deltaX);
            newWidth = Math.round(possibleW);
          } else {
            newWidth = minDim;
            newX = Math.round(resizeItem.origX + resizeItem.origWidth - minDim);
          }
        }

        // Vertical resizing
        if (h.includes('s')) {
          newHeight = Math.max(minDim, Math.round(resizeItem.origHeight + deltaY));
        } else if (h.includes('n')) {
          const possibleH = resizeItem.origHeight - deltaY;
          if (possibleH >= minDim) {
            newY = Math.round(resizeItem.origY + deltaY);
            newHeight = Math.round(possibleH);
          } else {
            newHeight = minDim;
            newY = Math.round(resizeItem.origY + resizeItem.origHeight - minDim);
          }
        }

        if (resizeItem.type === 'shape') {
          const shape = shapeAnnotations.find((s) => s.id === resizeItem.id);
          if (shape) {
            onUpdateShape({
              ...shape,
              x: Math.max(0, newX),
              y: Math.max(0, newY),
              width: newWidth,
              height: newHeight,
            });
          }
        } else if (resizeItem.type === 'image') {
          const img = imageAnnotations.find((i) => i.id === resizeItem.id);
          if (img) {
            onUpdateImage({
              ...img,
              x: Math.max(0, newX),
              y: Math.max(0, newY),
              width: newWidth,
              height: newHeight,
            });
          }
        }
      }
    };

    const handleWindowMouseUp = () => {
      setDragItem(null);
      setResizeItem(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [
    dragItem,
    resizeItem,
    zoom,
    textAnnotations,
    imageAnnotations,
    shapeAnnotations,
    onUpdateText,
    onUpdateImage,
    onUpdateShape,
  ]);

  return {
    dragItem,
    setDragItem,
    resizeItem,
    setResizeItem,
  };
};

