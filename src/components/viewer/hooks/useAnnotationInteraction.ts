// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// useAnnotationInteraction.ts - Custom hook managing drag moving, 8-point resizing, and rotation of annotations

import { useState, useEffect } from 'react';
import { TextAnnotation, ImageAnnotation, ShapeAnnotation } from '../../../types';
import { DragItemState, ResizeItemState, RotateItemState } from '../viewerTypes';

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
  const [rotateItem, setRotateItem] = useState<RotateItemState | null>(null);

  useEffect(() => {
    if (!dragItem && !resizeItem && !rotateItem) return;

    const updateDrag = (clientX: number, clientY: number) => {
      if (!dragItem) return;
      const rawDist = Math.hypot(clientX - dragItem.mouseStartX, clientY - dragItem.mouseStartY);
      // Threshold of 3px prevents accidental micro-drifts when user just taps/clicks
      if (!dragItem.hasMoved) {
        if (rawDist < 3) return;
        dragItem.hasMoved = true;
      }

      const deltaX = (clientX - dragItem.mouseStartX) / zoom;
      const deltaY = (clientY - dragItem.mouseStartY) / zoom;

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
    };

    const updateResize = (clientX: number, clientY: number) => {
      if (!resizeItem) return;
      const deltaX = (clientX - resizeItem.mouseStartX) / zoom;
      const deltaY = (clientY - resizeItem.mouseStartY) / zoom;
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
    };

    const updateRotate = (clientX: number, clientY: number) => {
      if (!rotateItem) return;
      const dx = clientX - rotateItem.centerX;
      const dy = clientY - rotateItem.centerY;
      // Angle in degrees from center
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const angleDiff = currentAngle - rotateItem.initialAngle;
      let newRot = Math.round((rotateItem.origRotation + angleDiff + 360) % 360);

      // Snap to 0, 45, 90, 135, 180, 225, 270, 315 within 4 degrees
      const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      for (const snap of snapAngles) {
        if (Math.abs(newRot - snap) <= 4) {
          newRot = snap % 360;
          break;
        }
      }

      if (rotateItem.type === 'text') {
        const item = textAnnotations.find((t) => t.id === rotateItem.id);
        if (item) onUpdateText({ ...item, rotation: newRot });
      } else if (rotateItem.type === 'image') {
        const item = imageAnnotations.find((i) => i.id === rotateItem.id);
        if (item) onUpdateImage({ ...item, rotation: newRot });
      } else if (rotateItem.type === 'shape') {
        const item = shapeAnnotations.find((s) => s.id === rotateItem.id);
        if (item) onUpdateShape({ ...item, rotation: newRot });
      }
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (dragItem) updateDrag(e.clientX, e.clientY);
      else if (resizeItem) updateResize(e.clientX, e.clientY);
      else if (rotateItem) updateRotate(e.clientX, e.clientY);
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && (dragItem || resizeItem || rotateItem)) {
        if (e.cancelable) e.preventDefault(); // Prevent scrolling page while moving/resizing/rotating annotation
        if (dragItem) updateDrag(e.touches[0].clientX, e.touches[0].clientY);
        else if (resizeItem) updateResize(e.touches[0].clientX, e.touches[0].clientY);
        else if (rotateItem) updateRotate(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleWindowEnd = () => {
      setDragItem(null);
      setResizeItem(null);
      setRotateItem(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowEnd);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
    window.addEventListener('touchend', handleWindowEnd);
    window.addEventListener('touchcancel', handleWindowEnd);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowEnd);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowEnd);
      window.removeEventListener('touchcancel', handleWindowEnd);
    };
  }, [
    dragItem,
    resizeItem,
    rotateItem,
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
    rotateItem,
    setRotateItem,
  };
};
