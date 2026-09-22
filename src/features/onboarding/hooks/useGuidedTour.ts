// SPDX-License-Identifier: AGPL-3.0-or-later

import { useCallback, useEffect, useState } from 'react';
import { hasCompletedTour, markTourCompleted } from '../services/tourStorage';

const AUTO_START_DELAY_MS = 700;

export const useGuidedTour = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (hasCompletedTour()) return;
    const timer = window.setTimeout(() => setIsTourOpen(true), AUTO_START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const startTour = useCallback(() => setIsTourOpen(true), []);

  const closeTour = useCallback(() => {
    markTourCompleted();
    setIsTourOpen(false);
  }, []);

  return { isTourOpen, startTour, closeTour };
};
