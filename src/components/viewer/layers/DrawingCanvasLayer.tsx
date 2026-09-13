// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// DrawingCanvasLayer.tsx - HTML5 Canvas layer for freehand pen drawings and live stroke preview

import React, { useEffect } from 'react';
import { DrawingAnnotation, DrawingPoint } from '../../../types';

interface DrawingCanvasLayerProps {
  drawCanvasRef: React.RefObject<HTMLCanvasElement>;
  pageDrawings: DrawingAnnotation[];
  currentStroke: DrawingPoint[];
  color: string;
  strokeWidth: number;
  zoom: number;
  width: number;
  height: number;
}

export const DrawingCanvasLayer: React.FC<DrawingCanvasLayerProps> = ({
  drawCanvasRef,
  pageDrawings,
  currentStroke,
  color,
  strokeWidth,
  zoom,
  width,
  height,
}) => {
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved drawings on this page
    pageDrawings.forEach((drawing) => {
      if (drawing.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.strokeWidth * zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(drawing.points[0].x * zoom, drawing.points[0].y * zoom);
      for (let i = 1; i < drawing.points.length; i++) {
        ctx.lineTo(drawing.points[i].x * zoom, drawing.points[i].y * zoom);
      }
      ctx.stroke();
    });

    // Draw active in-progress stroke
    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth * zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(currentStroke[0].x * zoom, currentStroke[0].y * zoom);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x * zoom, currentStroke[i].y * zoom);
      }
      ctx.stroke();
    }
  }, [drawCanvasRef, pageDrawings, currentStroke, zoom, color, strokeWidth]);

  return (
    <canvas
      ref={drawCanvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};

