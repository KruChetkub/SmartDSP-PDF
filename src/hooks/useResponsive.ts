// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// useResponsive.ts - Window resize observer for responsive mobile, tablet, and desktop breakpoints

import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;    // < 768px
  isTablet: boolean;    // 768px - 1023px
  isDesktop: boolean;   // >= 1024px
  width: number;
  height: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isDesktop: true, width: 1280, height: 800 };
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
      width: w,
      height: h,
    };
  });

  useEffect(() => {
    let timeoutId: number | undefined;

    const handleResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setState({
          isMobile: w < 768,
          isTablet: w >= 768 && w < 1024,
          isDesktop: w >= 1024,
          width: w,
          height: h,
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return state;
};

