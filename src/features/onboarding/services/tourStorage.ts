// SPDX-License-Identifier: AGPL-3.0-or-later

const TOUR_VERSION = '2';
const TOUR_STORAGE_KEY = `smartdsp-pdf:guided-tour:v${TOUR_VERSION}:completed`;

export const hasCompletedTour = (): boolean => {
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const markTourCompleted = (): void => {
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  } catch {
    // The guide still works when storage is unavailable.
  }
};
