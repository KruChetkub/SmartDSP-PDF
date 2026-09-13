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

  useEffect(() => {
    if (!isPanning) return;

    const handlePanMove = (e: MouseEvent) => {
      if (!panStartRef.current || !scrollContainerRef.current) return;
      const dx = e.clientX - panStartRef.current.mouseX;
      const dy = e.clientY - panStartRef.current.mouseY;
      scrollContainerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
      scrollContainerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
    };

    const handlePanUp = () => {
      setIsPanning(false);
      panStartRef.current = null;
    };

    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanUp);

    return () => {
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', handlePanUp);
    };
  }, [isPanning]);

  return {
    scrollContainerRef,
    isPanning,
    handlePanMouseDown,
  };
};

