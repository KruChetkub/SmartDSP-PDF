// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ToolMode } from '../../../types';
import type { AppLanguage } from '../../../types/settings';

export type RibbonTabType =
  | 'home'
  | 'edit'
  | 'comment'
  | 'view'
  | 'forms'
  | 'security'
  | 'review'
  | 'tools';

export interface RibbonHeaderProps {
  fileName: string;
  hasDocument: boolean;
  toolMode: ToolMode;
  language?: AppLanguage;
  activeTab?: RibbonTabType;
  onActiveTabChange?: (tab: RibbonTabType) => void;
  onSelectTool: (mode: ToolMode) => void;

  onOpenFile: (file: File) => void;
  onNewFile: () => void;
  onSavePdf: () => void;
  onSaveAsPdf: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  isExporting: boolean;

  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;

  onAddImage: (file: File) => void;
  onOpenMergeModal: () => void;
  onOpenSplitModal: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;
  onAddBlankPage: () => void;
  onReversePages: () => void;
  onTogglePresentation: () => void;
  onClearAnnotations: () => void;
  onAddCommentItem?: (type: 'rect' | 'circle' | 'ellipse' | 'line' | 'arrow' | 'stamp' | 'note' | 'highlight' | 'underline' | 'strikethrough') => void;
  isSearchOpen?: boolean;
  onToggleSearch?: () => void;

  onOpenToolbox: () => void;
  onOpenAboutModal: () => void;

  onMarkRedaction?: () => void;
  onApplyRedaction?: () => void;
  onOpenEncryptModal?: () => void;
  onOpenDecryptModal?: () => void;
  onOpenSignatureModal?: () => void;

  onOpenMetadataModal?: () => void;
  onOpenCompressModal?: () => void;
}
