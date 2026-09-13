// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// settings.ts - Application settings types, defaults, and paper size constants

export type AppLanguage = 'th' | 'en';
export type AppTheme = 'system' | 'light' | 'dark';
export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'custom';
export type SnapshotDpi = 72 | 96 | 150 | 300;

export interface PaperSizeDefinition {
  id: PaperSize;
  name: string;
  widthPt: number;
  heightPt: number;
  labelTh: string;
  labelEn: string;
  dimensionTh: string;
  dimensionEn: string;
}

export const PAPER_SIZES: Record<PaperSize, PaperSizeDefinition> = {
  A4: {
    id: 'A4',
    name: 'A4',
    widthPt: 595.28,
    heightPt: 841.89,
    labelTh: 'เอกสารมาตรฐานสากล',
    labelEn: 'Standard International',
    dimensionTh: '21 × 29.7 cm',
    dimensionEn: '21 × 29.7 cm',
  },
  Letter: {
    id: 'Letter',
    name: 'Letter',
    widthPt: 612.0,
    heightPt: 792.0,
    labelTh: 'เอกสารมาตรฐานสหรัฐฯ',
    labelEn: 'US Standard',
    dimensionTh: '21.6 × 27.9 cm',
    dimensionEn: '21.6 × 27.9 cm',
  },
  Legal: {
    id: 'Legal',
    name: 'Legal',
    widthPt: 612.0,
    heightPt: 1008.0,
    labelTh: 'สัญญา / เอกสารทางกฎหมาย',
    labelEn: 'Legal / Contract',
    dimensionTh: '21.6 × 35.6 cm',
    dimensionEn: '21.6 × 35.6 cm',
  },
  A3: {
    id: 'A3',
    name: 'A3',
    widthPt: 841.89,
    heightPt: 1190.55,
    labelTh: 'ไดอะแกรม / โปสเตอร์ขนาดใหญ่',
    labelEn: 'Diagram / Large Poster',
    dimensionTh: '29.7 × 42 cm',
    dimensionEn: '29.7 × 42 cm',
  },
  A5: {
    id: 'A5',
    name: 'A5',
    widthPt: 419.53,
    heightPt: 595.28,
    labelTh: 'หนังสือเล่มเล็ก / เอกสารขนาดเล็ก',
    labelEn: 'Booklet / Small Document',
    dimensionTh: '14.8 × 21 cm',
    dimensionEn: '14.8 × 21 cm',
  },
  custom: {
    id: 'custom',
    name: 'กำหนดเอง',
    widthPt: 595.28,
    heightPt: 841.89,
    labelTh: 'ขนาดกำหนดเอง',
    labelEn: 'Custom Dimensions',
    dimensionTh: 'กำหนดขนาดเอง',
    dimensionEn: 'Custom size',
  },
};

export interface AppSettings {
  language: AppLanguage;
  theme: AppTheme;
  newPageSize: PaperSize;
  customWidth?: number;
  customHeight?: number;
  snapshotDpi: SnapshotDpi;
  disableLatinSpacing: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  language: 'th',
  theme: 'system',
  newPageSize: 'A4',
  snapshotDpi: 150,
  disableLatinSpacing: false,
};

export const SETTINGS_STORAGE_KEY = 'smartdsp_pdf_settings';

