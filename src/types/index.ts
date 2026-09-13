export type ToolMode = 
  | 'select' 
  | 'editText'
  | 'text' 
  | 'image' 
  | 'rect' 
  | 'circle' 
  | 'ellipse'
  | 'line' 
  | 'arrow'
  | 'draw'
  | 'pan'
  | 'selectText'
  | 'snapshot'
  | 'note'
  | 'highlight'
  | 'underline'
  | 'strikethrough'
  | 'stamp'
  | 'redact';

export type ThaiFontFamily = 
  | 'TH Sarabun New' 
  | 'TH Sarabun PSK'
  | 'Noto Sans Thai' 
  | 'Angsana New'
  | 'Cordia New'
  | 'Helvetica';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface ExtractedTextBlock {
  id: string;
  pageIndex: number;
  originalText: string;
  text: string;
  x: number; // in PDF points (from left)
  y: number; // in PDF points (from top of page for screen rendering)
  pdfY: number; // in PDF points (from bottom of page for pdf-lib)
  width: number;
  height: number;
  fontSize: number;
  fontFamily: ThaiFontFamily;
  color: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  lineHeight?: number;
  opacity?: number;
  textAlign?: TextAlign;
  verticalAlign?: 'baseline' | 'super' | 'sub';
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface TextAnnotation {
  id: string;
  pageIndex: number;
  text: string;
  x: number; // in PDF points (72 DPI)
  y: number; // in PDF points
  fontSize: number;
  color: string;
  fontFamily: ThaiFontFamily;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  lineHeight?: number;
  opacity?: number;
  textAlign?: TextAlign;
  verticalAlign?: 'baseline' | 'super' | 'sub';
  rotation?: number; // In degrees (0-360)
}

export interface ImageAnnotation {
  id: string;
  pageIndex: number;
  imageDataUrl: string;
  imageBytes?: Uint8Array;
  mimeType: 'image/png' | 'image/jpeg';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // In degrees (0-360)
}

export interface ShapeAnnotation {
  id: string;
  pageIndex: number;
  type: 
    | 'rect' 
    | 'circle' 
    | 'ellipse' 
    | 'line' 
    | 'arrow' 
    | 'stamp' 
    | 'note' 
    | 'highlight' 
    | 'underline' 
    | 'strikethrough' 
    | 'redact';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  opacity?: number;
  text?: string;
  fontSize?: number;
  rotation?: number; // In degrees (0-360)
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingAnnotation {
  id: string;
  pageIndex: number;
  points: DrawingPoint[];
  color: string;
  strokeWidth: number;
}

export interface PageInfo {
  pageIndex: number; // 0-based
  originalPageIndex: number;
  rotation: number; // 0, 90, 180, 270
  width: number;
  height: number;
}

export interface PdfDocumentState {
  file: File | null;
  fileName: string;
  fileBytes: ArrayBuffer | null;
  pageCount: number;
  currentPageIndex: number;
  pages: PageInfo[];
  zoom: number; // 1.0 = 100%
  textAnnotations: TextAnnotation[];
  imageAnnotations: ImageAnnotation[];
  shapeAnnotations: ShapeAnnotation[];
  drawingAnnotations: DrawingAnnotation[];
}

export type RightSidebarTab = 'inspector' | 'comments' | 'search' | 'security' | 'history';

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date | string;
  modificationDate?: Date | string;
}

export interface HistoryItem {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
}

export * from './settings';


