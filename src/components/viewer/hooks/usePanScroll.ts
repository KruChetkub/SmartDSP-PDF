// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// usePanScroll.ts - Custom hook managing Hand / Pan drag scrolling

import { useRef, useState, useEffect } from 'react';
import { ToolMode } from '../../../types';

export const usePanScroll = (toolMode: ToolMode) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  const handlePanMouseDown = (e: React.MouseEvent<HTMLDivElement>): boolean => {
    if (toolMode !== 'pan') return false;
    if (e.button !== 0) return false;
    setIsPanning(true);
    panStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      scrollLeft: scrollContainerRef.current?.scrollLeft || 0,
      scrollTop: scrollContainerRef.current?.scrollTop || 0,
    };
    return true;
  };

  const handlePanTouchStart = (e: React.TouchEvent<HTMLDivElement>): boolean => {
    if (toolMode !== 'pan' || e.touches.length !== 1) return false;
    setIsPanning(true);
    panStartRef.current = {
      mouseX: e.touches[0].clientX,
      mouseY: e.touches[0].clientY,
      scrollLeft: scrollContainerRef.current?.scrollLeft || 0,
      scrollTop: scrollContainerRef.current?.scrollTop || 0,
    };
    return true;
  };

  useEffect(() => {
    if (!isPanning) return;

    const handlePanMove = (e: MouseEvent) => {
      if (!panStartRef.current || !scrollContainerRef.current) return;
      const dx = e.clientX - panStartRef.current.mouseX;
      const dy = e.clientY - panStartRef.current.mouseY;
      scrollContainerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
      scrollContainerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!panStartRef.current || !scrollContainerRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - panStartRef.current.mouseX;
      const dy = e.touches[0].clientY - panStartRef.current.mouseY;
      scrollContainerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
      scrollContainerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
    };

    const handlePanUp = () => {
      setIsPanning(false);
      panStartRef.current = null;
    };

    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handlePanUp);
    window.addEventListener('touchcancel', handlePanUp);

    return () => {
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', handlePanUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePanUp);
      window.removeEventListener('touchcancel', handlePanUp);
    };
  }, [isPanning]);

  return {
    scrollContainerRef,
    isPanning,
    handlePanMouseDown,
    handlePanTouchStart,
  };
};

