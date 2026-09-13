import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ToolMode, 
  ThaiFontFamily, 
  PageInfo, 
  TextAnnotation, 
  ImageAnnotation, 
  ShapeAnnotation, 
  DrawingAnnotation,
  ExtractedTextBlock,
  RightSidebarTab,
  PdfMetadata,
  HistoryItem
} from './types';
import { PDFDocument } from 'pdf-lib';
import { PdfRenderService } from './services/pdfRenderService';
import { PdfService } from './services/pdfService';
import { TopHeaderBar } from './components/layout/TopHeaderBar';
import { RibbonHeader } from './components/layout/RibbonHeader';
import { LeftSidebarStrip, LeftSidebarTab } from './components/layout/LeftSidebarStrip';
import { RightSidebarStrip } from './components/layout/RightSidebarStrip';
import { ThumbnailSidebar } from './components/sidebar/ThumbnailSidebar';
import { BookmarksSidebar, BookmarkItem } from './components/sidebar/BookmarksSidebar';
import { LayersSidebar, LayerItem } from './components/sidebar/LayersSidebar';
import { AttachmentsSidebar, AttachmentItem } from './components/sidebar/AttachmentsSidebar';
import { RightSidebarContainer } from './components/sidebar/right/RightSidebarContainer';
import { PdfViewer } from './components/viewer/PdfViewer';
import { SearchBar } from './components/viewer/SearchBar';
import { DropZone } from './components/viewer/DropZone';
import { MergeModal } from './components/modals/MergeModal';
import { SplitModal } from './components/modals/SplitModal';
import { AboutModal } from './components/modals/AboutModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AlertModal, AlertType } from './components/modals/AlertModal';
import { SignatureModal } from './components/modals/SignatureModal';
import { EncryptModal } from './components/modals/EncryptModal';
import { DecryptModal } from './components/modals/DecryptModal';
import { MetadataModal } from './components/modals/MetadataModal';
import { CompressModal } from './components/modals/CompressModal';
import { MobileToolsModal } from './components/modals/MobileToolsModal';
import { MobileBottomBar } from './components/layout/MobileBottomBar';
import { useResponsive } from './hooks/useResponsive';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { decryptPDF, isEncrypted as checkIsPdfEncrypted } from '@pdfsmaller/pdf-decrypt';
import { AppSettings, DEFAULT_APP_SETTINGS, SETTINGS_STORAGE_KEY, PAPER_SIZES } from './types/settings';
import { t } from './i18n/translations';

export const App: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState<boolean>(false);
  // Document State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  // Tool & Styling State
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [fontFamily, setFontFamily] = useState<ThaiFontFamily>('TH Sarabun New');
  const [fontSize, setFontSize] = useState<number>(18);
  const [color, setColor] = useState<string>('#0284c7');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);

  // Annotations State
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([]);
  const [shapeAnnotations, setShapeAnnotations] = useState<ShapeAnnotation[]>([]);
  const [drawingAnnotations, setDrawingAnnotations] = useState<DrawingAnnotation[]>([]);

  // Extracted Text Blocks for Direct PDF Editing (Lyncub PDF style)
  const [extractedTextBlocks, setExtractedTextBlocks] = useState<ExtractedTextBlock[]>([]);
  const [selectedExtractedBlockId, setSelectedExtractedBlockId] = useState<string | null>(null);
  const [selectedTextAnnotationId, setSelectedTextAnnotationId] = useState<string | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  // Right Sidebar State (Inspector, Comments, Search, Security, History)
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab | null>(null);
  const isInspectorOpen = rightSidebarTab === 'inspector';
  const setIsInspectorOpen = (open: boolean) => setRightSidebarTab(open ? 'inspector' : null);
  const [pdfMetadata, setPdfMetadata] = useState<PdfMetadata>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDocumentModified, setIsDocumentModified] = useState<boolean>(false);

  const addHistory = useCallback((action: string, description: string = '') => {
    setHistory((prev) => [
      {
        id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date(),
        action,
        description,
      },
      ...prev.slice(0, 49),
    ]);
    setIsDocumentModified(true);
  }, []);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentSearchMatchIndex, setCurrentSearchMatchIndex] = useState<number>(0);

  // Left Sidebar State (Thumbnails, Bookmarks, Layers, Attachments)
  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return null;
    }
    return 'thumbnails';
  });
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  // Computed document layers (Annotations + OCG)
  const activeLayers = useMemo<LayerItem[]>(() => {
    const list: LayerItem[] = [];
    if (textAnnotations.length > 0) {
      list.push({
        id: 'layer-texts',
        name: 'ข้อความที่เพิ่ม',
        visible: true,
        type: 'text',
        count: textAnnotations.length,
      });
    }
    if (shapeAnnotations.length > 0) {
      list.push({
        id: 'layer-shapes',
        name: 'รูปร่างและตราประทับ',
        visible: true,
        type: 'shape',
        count: shapeAnnotations.length,
      });
    }
    if (drawingAnnotations.length > 0) {
      list.push({
        id: 'layer-drawings',
        name: 'เส้นวาดอิสระ',
        visible: true,
        type: 'drawing',
        count: drawingAnnotations.length,
      });
    }
    if (imageAnnotations.length > 0) {
      list.push({
        id: 'layer-images',
        name: 'รูปภาพที่แทรก',
        visible: true,
        type: 'image',
        count: imageAnnotations.length,
      });
    }
    return list;
  }, [textAnnotations, shapeAnnotations, drawingAnnotations, imageAnnotations]);

  // UI State
  const [isMergeOpen, setIsMergeOpen] = useState<boolean>(false);
  const [isSplitOpen, setIsSplitOpen] = useState<boolean>(false);
  const [splitDefaultRange, setSplitDefaultRange] = useState<string>('1');
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isEncryptOpen, setIsEncryptOpen] = useState<boolean>(false);
  const [isDecryptOpen, setIsDecryptOpen] = useState<boolean>(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState<boolean>(false);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState<boolean>(false);
  const [isCompressModalOpen, setIsCompressModalOpen] = useState<boolean>(false);
  const [isDocumentEncrypted, setIsDocumentEncrypted] = useState<boolean>(false);

  // Settings & Theme State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage:', e);
    }
    return DEFAULT_APP_SETTINGS;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Listen to system theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute effective dark mode
  const isDarkEffective = useMemo(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return systemPrefersDark;
  }, [settings.theme, systemPrefersDark]);

  // Apply dark mode class to <html> element
  useEffect(() => {
    if (isDarkEffective) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkEffective]);

  // Save settings handler
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  };

  // Direct toggle between light and dark from header moon button
  const handleToggleDarkMode = () => {
    const nextTheme = isDarkEffective ? 'light' : 'dark';
    const updated: AppSettings = { ...settings, theme: nextTheme };
    handleSaveSettings(updated);
  };

  // Alert Modal State (Replaces native browser alert)
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (
    title: string,
    message: string,
    type: AlertType = 'info'
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  // Preload Thai fonts on mount
  useEffect(() => {
    PdfService.loadFonts();
  }, []);

  // Search matches computed across extracted text blocks and user text annotations
  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const matches: Array<{ id: string; pageIndex: number; text: string }> = [];

    for (const b of extractedTextBlocks) {
      if (!b.isDeleted && b.text.toLowerCase().includes(q)) {
        matches.push({ id: b.id, pageIndex: b.pageIndex, text: b.text });
      }
    }
    for (const t of textAnnotations) {
      if (t.text.toLowerCase().includes(q)) {
        matches.push({ id: t.id, pageIndex: t.pageIndex, text: t.text });
      }
    }
    matches.sort((a, b) => a.pageIndex - b.pageIndex);
    return matches;
  }, [searchQuery, extractedTextBlocks, textAnnotations]);

  const handleNextSearchMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentSearchMatchIndex + 1) % searchMatches.length;
    setCurrentSearchMatchIndex(nextIdx);
    const match = searchMatches[nextIdx];
    if (match.pageIndex !== currentPageIndex) {
      setCurrentPageIndex(match.pageIndex);
    }
  };

  const handlePrevSearchMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentSearchMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentSearchMatchIndex(prevIdx);
    const match = searchMatches[prevIdx];
    if (match.pageIndex !== currentPageIndex) {
      setCurrentPageIndex(match.pageIndex);
    }
  };

  useEffect(() => {
    if (searchMatches.length > 0) {
      if (currentSearchMatchIndex >= searchMatches.length) {
        setCurrentSearchMatchIndex(0);
      }
      const match = searchMatches[currentSearchMatchIndex] || searchMatches[0];
      if (match && match.pageIndex !== currentPageIndex) {
        setCurrentPageIndex(match.pageIndex);
      }
    }
  }, [searchMatches]);

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => {
      const next = !prev;
      if (!next) {
        setSearchQuery('');
        setCurrentSearchMatchIndex(0);
      }
      return next;
    });
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setCurrentSearchMatchIndex(0);
  };

  const handleSelectTool = (newTool: ToolMode) => {
    setToolMode(newTool);
    window.getSelection()?.removeAllRanges();

    // Close search and clear query when selecting another tool
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
      setCurrentSearchMatchIndex(0);
    }

    // Only allow extracted text block selection in editText mode
    if (newTool !== 'editText') {
      setSelectedExtractedBlockId(null);
    }

    // In navigation modes (selectText, pan, snapshot), clear all selections and close inspector
    if (newTool === 'selectText' || newTool === 'pan' || newTool === 'snapshot') {
      setSelectedTextAnnotationId(null);
      setSelectedShapeId(null);
      setSelectedExtractedBlockId(null);
      setIsInspectorOpen(false);
    }
  };

  // Global shortcut for Search (Ctrl+F / Cmd+F)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleToggleSearch();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Handle open PDF
  const handleOpenFile = async (newFile: File) => {
    try {
      const bytes = await newFile.arrayBuffer();
      // Keep an isolated clone for application operations so worker transfers cannot detach it
      const safeBytes = bytes.slice(0);
      const doc = await PdfRenderService.loadDocument(bytes.slice(0));

      const numPages = doc.numPages;
      const initialPages: PageInfo[] = [];

      for (let i = 0; i < numPages; i++) {
        initialPages.push({
          pageIndex: i,
          originalPageIndex: i,
          rotation: 0,
          width: 595, // default A4 point size
          height: 842,
        });
      }

      setFile(newFile);
      setFileName(newFile.name);
      setFileBytes(safeBytes);
      setPdfDoc(doc);
      setPages(initialPages);
      setCurrentPageIndex(0);
      setTextAnnotations([]);
      setImageAnnotations([]);
      setShapeAnnotations([]);
      setDrawingAnnotations([]);
      setExtractedTextBlocks([]);
      setSelectedExtractedBlockId(null);
      setSelectedTextAnnotationId(null);
      setSelectedShapeId(null);
      setPdfMetadata({});

      // On mobile/tablet, ensure sidebars are closed so the document takes the full screen
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setLeftSidebarTab(null);
        setRightSidebarTab(null);
      }

      // Check encryption status in background
      checkIsPdfEncrypted(new Uint8Array(safeBytes))
        .then((res) => setIsDocumentEncrypted(res.encrypted))
        .catch(() => setIsDocumentEncrypted(false));

      // Extract metadata in background (dual engines: pdfjs + pdf-lib)
      PdfRenderService.getDocumentMetadata(doc, safeBytes).then((meta) => {
        setPdfMetadata(meta);
      });
      addHistory(settings.language === 'th' ? 'เปิดเอกสาร' : 'Open Document', newFile.name);
      setIsDocumentModified(false);

      // Render thumbnails in background
      for (let i = 0; i < numPages; i++) {
        PdfRenderService.renderThumbnail(doc, i + 1, 140).then((thumbUrl) => {
          setThumbnails((prev) => ({ ...prev, [i]: thumbUrl }));
        });
      }

      // Extract existing text blocks in background for Direct PDF Editing (Lyncub style)
      for (let i = 0; i < numPages; i++) {
        PdfRenderService.extractPageTextBlocks(doc, i + 1, i).then((pageBlocks) => {
          setExtractedTextBlocks((prev) => [...prev, ...pageBlocks]);
        });
      }

      // Extract bookmarks in background
      doc.getOutline().then(async (outline) => {
        if (outline && outline.length > 0) {
          const list: BookmarkItem[] = [];
          const traverse = async (items: any[]) => {
            for (const it of items) {
              let targetPage = 0;
              if (typeof it.dest === 'string') {
                try {
                  const dest = await doc.getDestination(it.dest);
                  if (dest && dest[0]) {
                    targetPage = await doc.getPageIndex(dest[0]);
                  }
                } catch {}
              } else if (Array.isArray(it.dest) && it.dest[0]) {
                try {
                  targetPage = await doc.getPageIndex(it.dest[0]);
                } catch {}
              }
              list.push({
                id: `bm-${list.length}`,
                title: it.title || 'Untitled',
                pageIndex: targetPage,
              });
              if (it.items && it.items.length > 0) {
                await traverse(it.items);
              }
            }
          };
          await traverse(outline);
          setBookmarks(list);
        } else {
          setBookmarks([]);
        }
      }).catch(() => setBookmarks([]));

      // Extract attachments in background
      doc.getAttachments().then((atts) => {
        if (atts && Object.keys(atts).length > 0) {
          const list: AttachmentItem[] = Object.entries(atts).map(([filename, val]: [string, any], idx) => ({
            id: `att-${idx}`,
            filename,
            size: val?.content?.length || 0,
            dataBytes: val?.content,
          }));
          setAttachments(list);
        } else {
          setAttachments([]);
        }
      }).catch(() => setAttachments([]));
    } catch (err) {
      console.error('Error opening PDF file:', err);
      showAlert(
        'ไม่สามารถเปิดไฟล์ได้',
        'ไม่สามารถเปิดไฟล์ PDF นี้ได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF ที่สมบูรณ์และไม่เสียหาย',
        'error'
      );
    }
  };

  // Add image annotation
  const handleAddImage = (imgFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const mimeType = imgFile.type === 'image/png' ? 'image/png' : 'image/jpeg';

      const newImage: ImageAnnotation = {
        id: `img-${Date.now()}`,
        pageIndex: currentPageIndex,
        imageDataUrl: dataUrl,
        mimeType,
        x: 100,
        y: 100,
        width: 150,
        height: 150,
      };

      setImageAnnotations((prev) => [...prev, newImage]);
      setToolMode('select');
    };
    reader.readAsDataURL(imgFile);
  };

  // Rotate Page
  const handleRotateCurrentPage = useCallback((delta: number) => {
    setPages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const page = copy[currentPageIndex];
      copy[currentPageIndex] = {
        ...page,
        rotation: (page.rotation + delta + 360) % 360,
      };
      return copy;
    });
  }, [currentPageIndex]);

  // Duplicate Page
  const handleDuplicatePage = useCallback(() => {
    setPages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const targetPage = copy[currentPageIndex];
      const duplicated: PageInfo = {
        ...targetPage,
        pageIndex: copy.length,
      };
      copy.splice(currentPageIndex + 1, 0, duplicated);
      return copy;
    });
  }, [currentPageIndex]);

  // Delete Page
  const handleDeletePage = useCallback((indexToDelete?: number) => {
    const idx = indexToDelete !== undefined ? indexToDelete : currentPageIndex;
    setPages((prev) => {
      if (prev.length <= 1) return prev;
      const copy = prev.filter((_, i) => i !== idx);
      return copy;
    });

    if (currentPageIndex >= pages.length - 1 && currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  }, [currentPageIndex, pages.length]);

  // Rotate specific page CCW (Left)
  const handleRotatePageLeftAtIndex = useCallback((index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      if (!copy[index]) return prev;
      copy[index] = {
        ...copy[index],
        rotation: (copy[index].rotation - 90 + 360) % 360,
      };
      return copy;
    });
    setIsDocumentModified(true);
  }, []);

  // Rotate specific page CW (Right)
  const handleRotatePageRightAtIndex = useCallback((index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      if (!copy[index]) return prev;
      copy[index] = {
        ...copy[index],
        rotation: (copy[index].rotation + 90) % 360,
      };
      return copy;
    });
    setIsDocumentModified(true);
  }, []);

  // Duplicate page at specific index
  const handleDuplicatePageAtIndex = useCallback((index: number) => {
    setPages((prev) => {
      if (prev.length === 0 || !prev[index]) return prev;
      const copy = [...prev];
      const targetPage = copy[index];
      const duplicated: PageInfo = {
        ...targetPage,
        pageIndex: copy.length,
      };
      copy.splice(index + 1, 0, duplicated);
      return copy;
    });
    setIsDocumentModified(true);
    addHistory(settings.language === 'th' ? 'ทำสำเนาหน้า' : 'Duplicate Page', `หน้า ${index + 1}`);
  }, [settings.language]);


  // Reorder page from one index to another (Drag and drop)
  const handleReorderPages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= pages.length || toIndex >= pages.length) return;

    setPages((prev) => {
      const copy = [...prev];
      const [movedPage] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, movedPage);
      return copy.map((p, idx) => ({ ...p, pageIndex: idx }));
    });

    // Helper to remap page indices of annotations
    const remapIndex = (oldIdx: number): number => {
      if (oldIdx === fromIndex) return toIndex;
      if (fromIndex < toIndex) {
        if (oldIdx > fromIndex && oldIdx <= toIndex) return oldIdx - 1;
      } else {
        if (oldIdx >= toIndex && oldIdx < fromIndex) return oldIdx + 1;
      }
      return oldIdx;
    };

    setTextAnnotations((prev) =>
      prev.map((t) => ({ ...t, pageIndex: remapIndex(t.pageIndex) }))
    );
    setImageAnnotations((prev) =>
      prev.map((i) => ({ ...i, pageIndex: remapIndex(i.pageIndex) }))
    );
    setShapeAnnotations((prev) =>
      prev.map((s) => ({ ...s, pageIndex: remapIndex(s.pageIndex) }))
    );
    setDrawingAnnotations((prev) =>
      prev.map((d) => ({ ...d, pageIndex: remapIndex(d.pageIndex) }))
    );
    setExtractedTextBlocks((prev) =>
      prev.map((b) => ({ ...b, pageIndex: remapIndex(b.pageIndex) }))
    );

    setCurrentPageIndex((prev) => remapIndex(prev));
    setIsDocumentModified(true);
    addHistory(
      settings.language === 'th' ? 'ย้ายตำแหน่งหน้า' : 'Reorder Page',
      settings.language === 'th'
        ? `ย้ายหน้า ${fromIndex + 1} ไปยังหน้า ${toIndex + 1}`
        : `Moved page ${fromIndex + 1} to page ${toIndex + 1}`
    );
  }, [pages.length, settings.language]);

  // Extract single page to a new downloadable PDF file
  const handleExtractPage = useCallback(async (pageIndex: number) => {
    if ((!fileBytes && !file) || !pages[pageIndex]) return;
    try {
      let activeBytes = fileBytes;
      if (!activeBytes || activeBytes.byteLength === 0) {
        if (file) {
          activeBytes = await file.arrayBuffer();
          setFileBytes(activeBytes.slice(0));
        } else {
          throw new Error('ไม่พบข้อมูลไฟล์');
        }
      }

      const targetPage = pages[pageIndex];
      const singlePageBytes = await PdfService.exportPdfWithAnnotations(
        activeBytes.slice(0),
        [targetPage],
        textAnnotations.filter((t) => t.pageIndex === pageIndex).map((t) => ({ ...t, pageIndex: 0 })),
        imageAnnotations.filter((i) => i.pageIndex === pageIndex).map((i) => ({ ...i, pageIndex: 0 })),
        shapeAnnotations.filter((s) => s.pageIndex === pageIndex).map((s) => ({ ...s, pageIndex: 0 })),
        drawingAnnotations.filter((d) => d.pageIndex === pageIndex).map((d) => ({ ...d, pageIndex: 0 })),
        extractedTextBlocks.filter((b) => b.pageIndex === pageIndex).map((b) => ({ ...b, pageIndex: 0 })),
        pdfMetadata
      );

      const outName = `${fileName.replace(/\.pdf$/i, '')}_page_${pageIndex + 1}.pdf`;
      PdfService.downloadFile(singlePageBytes, outName);

      addHistory(
        settings.language === 'th' ? 'ดึงหน้าเอกสาร' : 'Extract Page',
        `หน้า ${pageIndex + 1} (${outName})`
      );

      showAlert(
        settings.language === 'th' ? 'ดึงหน้าสำเร็จ' : 'Page Extracted',
        settings.language === 'th'
          ? `ดึงหน้า ${pageIndex + 1} ออกมาเป็นไฟล์ "${outName}" เรียบร้อยแล้ว`
          : `Extracted page ${pageIndex + 1} as "${outName}" successfully`,
        'success'
      );
    } catch (err: any) {
      console.error('Extract page error:', err);
      showAlert(
        settings.language === 'th' ? 'ข้อผิดพลาด' : 'Error',
        `${settings.language === 'th' ? 'ไม่สามารถดึงหน้าได้' : 'Failed to extract page'}: ${err.message}`,
        'error'
      );
    }
  }, [fileBytes, file, pages, textAnnotations, imageAnnotations, shapeAnnotations, drawingAnnotations, extractedTextBlocks, pdfMetadata, fileName, settings.language]);

  // Insert another PDF file into the document after specific index
  const handleInsertPdfAtIndex = useCallback(async (insertFile: File, afterIndex: number) => {
    if (!fileBytes && !file) return;
    try {
      let activeBytes = fileBytes;
      if (!activeBytes || activeBytes.byteLength === 0) {
        if (file) {
          activeBytes = await file.arrayBuffer();
          setFileBytes(activeBytes.slice(0));
        } else {
          throw new Error('ไม่พบข้อมูลไฟล์');
        }
      }

      // 1. Bake current annotations into current document
      const currentDocBytes = await PdfService.exportPdfWithAnnotations(
        activeBytes.slice(0),
        pages,
        textAnnotations,
        imageAnnotations,
        shapeAnnotations,
        drawingAnnotations,
        extractedTextBlocks,
        pdfMetadata
      );

      const insertBytes = await insertFile.arrayBuffer();

      // 2. Load in pdf-lib and merge
      const currentPdf = await PDFDocument.load(currentDocBytes, { ignoreEncryption: true });
      const incomingPdf = await PDFDocument.load(insertBytes, { ignoreEncryption: true });
      const mergedPdf = await PDFDocument.create();

      const currentTotal = currentPdf.getPageCount();
      const insertAt = Math.max(0, Math.min(afterIndex, currentTotal - 1));

      // Pages before and including afterIndex
      const beforeIndices = Array.from({ length: insertAt + 1 }, (_, i) => i);
      if (beforeIndices.length > 0) {
        const copiedBefore = await mergedPdf.copyPages(currentPdf, beforeIndices);
        copiedBefore.forEach((p) => mergedPdf.addPage(p));
      }

      // Incoming pages
      const incomingIndices = incomingPdf.getPageIndices();
      const copiedIncoming = await mergedPdf.copyPages(incomingPdf, incomingIndices);
      copiedIncoming.forEach((p) => mergedPdf.addPage(p));

      // Pages after afterIndex
      const afterCount = currentTotal - (insertAt + 1);
      if (afterCount > 0) {
        const afterIndices = Array.from({ length: afterCount }, (_, i) => i + insertAt + 1);
        const copiedAfter = await mergedPdf.copyPages(currentPdf, afterIndices);
        copiedAfter.forEach((p) => mergedPdf.addPage(p));
      }

      // Preserve metadata
      if (pdfMetadata) {
        if (pdfMetadata.title) mergedPdf.setTitle(pdfMetadata.title);
        if (pdfMetadata.author) mergedPdf.setAuthor(pdfMetadata.author);
        if (pdfMetadata.subject) mergedPdf.setSubject(pdfMetadata.subject);
      }

      const mergedBytes = await mergedPdf.save();
      const safeMergedBytes = mergedBytes.buffer.slice(
        mergedBytes.byteOffset,
        mergedBytes.byteOffset + mergedBytes.byteLength
      ) as ArrayBuffer;

      // 3. Reload into application
      const newDoc = await PdfRenderService.loadDocument(safeMergedBytes.slice(0));
      setPdfDoc(newDoc);
      setFileBytes(safeMergedBytes);

      const newNumPages = newDoc.numPages;
      const newPages: PageInfo[] = [];
      for (let i = 0; i < newNumPages; i++) {
        const p = await newDoc.getPage(i + 1);
        const vp = p.getViewport({ scale: 1 });
        newPages.push({
          pageIndex: i,
          originalPageIndex: i,
          rotation: 0,
          width: Math.round(vp.width),
          height: Math.round(vp.height),
        });
      }

      setPages(newPages);
      setTextAnnotations([]);
      setImageAnnotations([]);
      setShapeAnnotations([]);
      setDrawingAnnotations([]);
      setExtractedTextBlocks([]);
      setIsDocumentModified(true);

      addHistory(
        settings.language === 'th' ? 'รวมไฟล์ PDF แทรกในเอกสาร' : 'Merged PDF into document',
        `${insertFile.name} (${incomingIndices.length} หน้า)`
      );

      // Refresh thumbnails
      setThumbnails({});
      for (let i = 0; i < newNumPages; i++) {
        PdfRenderService.renderThumbnail(newDoc, i + 1, 140).then((thumbUrl) => {
          setThumbnails((prev) => ({ ...prev, [i]: thumbUrl }));
        });
      }

      showAlert(
        settings.language === 'th' ? 'รวมไฟล์สำเร็จ' : 'Merged Successfully',
        settings.language === 'th'
          ? `แทรกไฟล์ "${insertFile.name}" (${incomingIndices.length} หน้า) ต่อจากหน้า ${insertAt + 1} เรียบร้อยแล้ว`
          : `Inserted "${insertFile.name}" (${incomingIndices.length} pages) after page ${insertAt + 1}`,
        'success'
      );
    } catch (err: any) {
      console.error('Insert PDF error:', err);
      showAlert(
        settings.language === 'th' ? 'ข้อผิดพลาด' : 'Error',
        `${settings.language === 'th' ? 'ไม่สามารถรวมไฟล์ PDF ได้' : 'Failed to merge PDF'}: ${err.message}`,
        'error'
      );
    }
  }, [fileBytes, file, pages, textAnnotations, imageAnnotations, shapeAnnotations, drawingAnnotations, extractedTextBlocks, pdfMetadata, settings.language]);

  // Open split modal pre-targeted to a specific page
  const handleOpenSplitAtPage = useCallback((pageIndex: number) => {
    setSplitDefaultRange(`${pageIndex + 1}`);
    setIsSplitOpen(true);
  }, []);

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))));
  const handleResetZoom = () => setZoom(1.0);

  // Auto fit-to-page on mobile when a new PDF is opened
  useEffect(() => {
    if (!pdfDoc || !isMobile || pages.length === 0) return;
    const timer = setTimeout(() => {
      const pageWidth = pages[0]?.width || 595;
      const pageHeight = pages[0]?.height || 842;
      const availableWidth = window.innerWidth - 16;
      const availableHeight = window.innerHeight - 44 - 56 - 24; // TopBar + MobileBar + padding
      const fitScale = Math.min(
        availableWidth / pageWidth,
        availableHeight / pageHeight,
        2.5
      );
      setZoom(Math.max(0.3, Number(fitScale.toFixed(2))));
    }, 150); // wait for render
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc]);

  const handleFitWidth = useCallback(() => {
    if (!pages[currentPageIndex]) return;
    const pageWidth = pages[currentPageIndex].width || 595;
    const pageHeight = pages[currentPageIndex].height || 842;
    const isMobileScreen = window.innerWidth < 768;
    const sidebarOffset = leftSidebarTab ? 350 : (isMobileScreen ? 0 : 100);
    const headerOffset = isMobileScreen ? 44 + 56 : 44 + 88; // TopBar + (MobileBar or Ribbon)
    const availableWidth = window.innerWidth - sidebarOffset - (isMobileScreen ? 16 : 64);
    const availableHeight = window.innerHeight - headerOffset - (isMobileScreen ? 24 : 64);
    const fitByWidth = availableWidth / pageWidth;
    const fitByHeight = availableHeight / pageHeight;
    // On mobile: fit the whole page (fit-to-page), on desktop: fit width
    const fitScale = isMobileScreen
      ? Math.min(fitByWidth, fitByHeight)
      : fitByWidth;
    setZoom(Math.min(2.5, Math.max(0.3, Number(fitScale.toFixed(2)))));
  }, [pages, currentPageIndex, leftSidebarTab]);

  // Export PDF with all edits
  const handleExportPdf = async () => {
    if ((!fileBytes && !file) || pages.length === 0) return;
    setIsExporting(true);
    try {
      let activeBytes = fileBytes;
      // If buffer was somehow detached (byteLength === 0) or missing, reload fresh from file
      if (!activeBytes || activeBytes.byteLength === 0) {
        if (file) {
          activeBytes = await file.arrayBuffer();
          setFileBytes(activeBytes.slice(0));
        } else {
          throw new Error('ไม่พบข้อมูลเอกสาร PDF กรุณาเปิดไฟล์ใหม่อีกครั้ง');
        }
      }

      const outputBytes = await PdfService.exportPdfWithAnnotations(
        activeBytes.slice(0),
        pages,
        textAnnotations,
        imageAnnotations,
        shapeAnnotations,
        drawingAnnotations,
        extractedTextBlocks,
        pdfMetadata
      );
      const outputName = fileName.replace(/\.pdf$/i, '') + '_edited.pdf';
      PdfService.downloadFile(outputBytes, outputName);
      showAlert('บันทึกสำเร็จ', `บันทึกและดาวน์โหลดเอกสาร PDF "${outputName}" เรียบร้อยแล้ว`, 'success');
    } catch (err) {
      console.error('Export PDF error:', err);
      showAlert(
        'ข้อผิดพลาดในการบันทึก',
        `ไม่สามารถบันทึกเอกสาร PDF ได้: ${err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการประมวลผล'}`,
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Apply all pending redactions to the document
  const handleApplyRedactions = () => {
    const redactShapes = shapeAnnotations.filter((s) => s.type === 'redact');
    if (redactShapes.length === 0) {
      showAlert(
        t('info', settings.language),
        t('noRedactionMarks', settings.language),
        'info'
      );
      return;
    }

    // Convert all redact shapes into permanent solid rectangles using their chosen fill color
    setShapeAnnotations((prev) =>
      prev.map((s) => {
        if (s.type === 'redact') {
          const finalColor =
            s.fillColor && !s.fillColor.startsWith('rgba') && s.fillColor !== 'transparent'
              ? s.fillColor
              : s.color && s.color !== '#ef4444'
                ? s.color
                : '#000000';
          return {
            ...s,
            type: 'rect' as const,
            color: finalColor,
            fillColor: finalColor,
            strokeWidth: 0,
            opacity: 1,
            text: undefined,
          };
        }
        return s;
      })
    );

    // Strike out and delete underlying extracted text blocks intersecting with redaction marks
    setExtractedTextBlocks((prev) =>
      prev.map((block) => {
        const pageRedacts = redactShapes.filter((r) => r.pageIndex === block.pageIndex);
        const isCovered = pageRedacts.some((r) => {
          return (
            block.x < r.x + r.width &&
            block.x + block.width > r.x &&
            block.y < r.y + r.height &&
            block.y + block.height > r.y
          );
        });
        if (isCovered) {
          return { ...block, isDeleted: true, isEdited: true, text: '' };
        }
        return block;
      })
    );

    setToolMode('select');
    addHistory(t('historyRedactApplied', settings.language), `${redactShapes.length} จุด`);
    showAlert(
      t('success', settings.language),
      `${t('redactionApplied', settings.language)} (${redactShapes.length})`,
      'success'
    );
  };

  // Insert digital signature as ImageAnnotation
  const handleInsertSignature = (dataUrl: string, width: number, height: number) => {
    const curPage = pages[currentPageIndex] || { width: 595, height: 842 };
    const targetX = Math.max(20, Math.round((curPage.width - width) / 2));
    const targetY = Math.max(20, Math.round(curPage.height * 0.7 - height / 2));

    const newSig: ImageAnnotation = {
      id: `sig-${Date.now()}`,
      pageIndex: currentPageIndex,
      imageDataUrl: dataUrl,
      mimeType: 'image/png',
      x: targetX,
      y: targetY,
      width,
      height,
    };

    setImageAnnotations((prev) => [...prev, newSig]);
    addHistory(t('historyAddSignature', settings.language));
    showAlert(
      t('success', settings.language),
      settings.language === 'th'
        ? `แทรกลายเซ็นลงในหน้า ${currentPageIndex + 1} เรียบร้อยแล้ว คุณสามารถคลิกลากหรือย่อขยายตำแหน่งได้`
        : `Signature inserted on page ${currentPageIndex + 1}. You can drag and resize it.`,
      'success'
    );
  };

  // Encrypt PDF with password
  const handleEncryptDocument = async (password: string, algorithm: 'AES-256' | 'RC4') => {
    if ((!fileBytes && !file) || pages.length === 0) return;
    let activeBytes = fileBytes;
    if (!activeBytes || activeBytes.byteLength === 0) {
      if (file) {
        activeBytes = await file.arrayBuffer();
        setFileBytes(activeBytes.slice(0));
      } else {
        throw new Error('ไม่พบข้อมูลเอกสาร PDF');
      }
    }

    const outputBytes = await PdfService.exportPdfWithAnnotations(
      activeBytes.slice(0),
      pages,
      textAnnotations,
      imageAnnotations,
      shapeAnnotations,
      drawingAnnotations,
      extractedTextBlocks,
      pdfMetadata
    );

    const encryptedBytes = await encryptPDF(outputBytes, password, {
      algorithm,
      ownerPassword: password,
    });

    const encFileName = fileName.replace(/\.pdf$/i, '') + '_protected.pdf';
    PdfService.downloadFile(encryptedBytes, encFileName);
    setIsDocumentEncrypted(true);
    addHistory(t('historyEncryptPdf', settings.language), encFileName);
    showAlert(t('success', settings.language), t('encryptSuccess', settings.language), 'success');
  };

  // Decrypt PDF and remove password protection
  const handleDecryptDocument = async (password: string) => {
    if (!fileBytes && !file) return;
    let activeBytes = fileBytes;
    if (!activeBytes || activeBytes.byteLength === 0) {
      if (file) {
        activeBytes = await file.arrayBuffer();
      } else {
        throw new Error('ไม่พบข้อมูลเอกสาร PDF');
      }
    }

    const decryptedBytes = await decryptPDF(new Uint8Array(activeBytes), password);
    const safeDecryptedBuffer = decryptedBytes.buffer.slice(
      decryptedBytes.byteOffset,
      decryptedBytes.byteOffset + decryptedBytes.byteLength
    ) as ArrayBuffer;
    const doc = await PdfRenderService.loadDocument(safeDecryptedBuffer.slice(0));

    setFileBytes(safeDecryptedBuffer);
    setPdfDoc(doc);
    setIsDocumentEncrypted(false);
    addHistory(t('historyDecryptPdf', settings.language));

    // Also trigger download of the decrypted PDF
    const decFileName = fileName.replace(/\.pdf$/i, '') + '_unlocked.pdf';
    PdfService.downloadFile(decryptedBytes, decFileName);
    showAlert(t('success', settings.language), t('decryptSuccess', settings.language), 'success');
  };

  // Fullscreen Presentation Mode
  const handleTogglePresentation = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+O: Open
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = (ev: Event) => {
          const files = (ev.target as HTMLInputElement).files;
          if (files && files[0]) handleOpenFile(files[0]);
        };
        input.click();
      }
      // Ctrl+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleExportPdf();
      }
      // Ctrl+L: Rotate Left
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        handleRotateCurrentPage(-90);
      }
      // Ctrl+R: Rotate Right
      if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        handleRotateCurrentPage(90);
      }
      // Ctrl+D: Duplicate Page
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleDuplicatePage();
      }
      // F5: Presentation
      if (e.key === 'F5') {
        e.preventDefault();
        handleTogglePresentation();
      }
      // Escape: Reset tool
      if (e.key === 'Escape') {
        setToolMode('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExportPdf, handleRotateCurrentPage, handleDuplicatePage]);

  // Create blank single-page PDF document
  const handleNewFile = async () => {
    try {
      const paper = PAPER_SIZES[settings.newPageSize] || PAPER_SIZES.A4;
      const pWidth = paper.widthPt;
      const pHeight = paper.heightPt;
      const newPdf = await PDFDocument.create();
      newPdf.addPage([pWidth, pHeight]);
      const bytes = await newPdf.save();
      const safeBytes = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const doc = await PdfRenderService.loadDocument(safeBytes.slice(0));
      setPdfDoc(doc);
      setFileBytes(safeBytes);
      setFileName(settings.language === 'th' ? 'เอกสารใหม่.pdf' : 'New_Document.pdf');
      setPages([{ pageIndex: 0, originalPageIndex: 0, rotation: 0, width: pWidth, height: pHeight }]);
      setCurrentPageIndex(0);
      setThumbnails({});
      PdfRenderService.renderThumbnail(doc, 1, 140).then((thumbUrl) => {
        setThumbnails({ 0: thumbUrl });
      });
      setTextAnnotations([]);
      setImageAnnotations([]);
      setShapeAnnotations([]);
      setDrawingAnnotations([]);
      setExtractedTextBlocks([]);
      setBookmarks([]);
      setAttachments([]);
      setPdfMetadata({
        title: settings.language === 'th' ? 'เอกสารใหม่.pdf' : 'New_Document.pdf',
        author: 'SmartDSP PDF',
      });
      addHistory(settings.language === 'th' ? 'สร้างเอกสารใหม่' : 'Create New Document');
      setIsDocumentModified(false);
      showAlert(
        t('success', settings.language),
        settings.language === 'th' ? 'สร้างเอกสาร PDF เปล่าหน้าใหม่เรียบร้อยแล้ว' : 'Blank PDF document created successfully',
        'success'
      );
    } catch (e: any) {
      showAlert(
        t('error', settings.language),
        `${settings.language === 'th' ? 'ไม่สามารถสร้างเอกสารใหม่ได้' : 'Failed to create new document'}: ${e.message}`,
        'error'
      );
    }
  };

  // Print PDF document
  const handlePrint = async () => {
    if (!pdfDoc || !fileBytes) {
      showAlert(
        t('warning', settings.language),
        settings.language === 'th' ? 'กรุณาเปิดไฟล์ PDF ก่อนพิมพ์' : 'Please open a PDF file before printing',
        'warning'
      );
      return;
    }
    try {
      const exportedBytes = await PdfService.exportPdfWithAnnotations(
        fileBytes,
        pages,
        textAnnotations,
        imageAnnotations,
        shapeAnnotations,
        drawingAnnotations,
        extractedTextBlocks,
        pdfMetadata
      );
      const blob = new Blob([exportedBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    } catch (e: any) {
      showAlert(
        t('error', settings.language),
        `${settings.language === 'th' ? 'ไม่สามารถพิมพ์เอกสารได้' : 'Failed to print document'}: ${e.message}`,
        'error'
      );
    }
  };

  // Open Toolbox info modal
  const handleOpenToolbox = () => {
    showAlert(
      settings.language === 'th' ? 'ชุดเครื่องมือ AI & OCR' : 'AI & OCR Tools',
      settings.language === 'th'
        ? 'ชุดเครื่องมืออัจฉริยะ (Thai OCR & AI Background Removal) พร้อมให้ใช้งานในระบบ SmartDSP PDF'
        : 'Smart AI tools (Thai OCR & AI Background Removal) ready for use in SmartDSP PDF',
      'info'
    );
  };

  // Insert Blank Page after specific index (used by ThumbnailSidebar [+] and right-click menu)
  const handleInsertBlankPageAtIndex = useCallback(async (afterIndex: number) => {
    try {
      let activeBytes = fileBytes;
      if (!activeBytes || activeBytes.byteLength === 0) {
        if (file) {
          activeBytes = await file.arrayBuffer();
          setFileBytes(activeBytes.slice(0));
        } else {
          await handleNewFile();
          return;
        }
      }

      const target = pages[afterIndex] || pages[0];
      const paper = PAPER_SIZES[settings.newPageSize] || PAPER_SIZES.A4;
      const pWidth = target ? target.width : paper.widthPt;
      const pHeight = target ? target.height : paper.heightPt;

      const pdfDocLib = await PDFDocument.load(activeBytes.slice(0), { ignoreEncryption: true });
      const insertIndex = Math.max(0, Math.min(pages.length, afterIndex + 1));
      pdfDocLib.insertPage(insertIndex, [pWidth, pHeight]);
      const updatedBytes = await pdfDocLib.save();
      const safeBuffer = updatedBytes.buffer.slice(
        updatedBytes.byteOffset,
        updatedBytes.byteOffset + updatedBytes.byteLength
      ) as ArrayBuffer;

      const newPdfDoc = await PdfRenderService.loadDocument(safeBuffer.slice(0));
      setPdfDoc(newPdfDoc);
      setFileBytes(safeBuffer);

      const newPagesCount = newPdfDoc.numPages;
      const updatedPages: PageInfo[] = [];
      for (let i = 0; i < newPagesCount; i++) {
        const oldPage = pages[i < insertIndex ? i : i - 1];
        updatedPages.push({
          pageIndex: i,
          originalPageIndex: i,
          rotation: i === insertIndex ? 0 : (oldPage?.rotation || 0),
          width: i === insertIndex ? pWidth : (oldPage?.width || pWidth),
          height: i === insertIndex ? pHeight : (oldPage?.height || pHeight),
        });
      }
      setPages(updatedPages);
      setCurrentPageIndex(insertIndex);

      // Shift existing annotations for pages at or after insertIndex
      const shiftIdx = (idx: number) => (idx >= insertIndex ? idx + 1 : idx);
      setTextAnnotations((prev) => prev.map((t) => ({ ...t, pageIndex: shiftIdx(t.pageIndex) })));
      setImageAnnotations((prev) => prev.map((i) => ({ ...i, pageIndex: shiftIdx(i.pageIndex) })));
      setShapeAnnotations((prev) => prev.map((s) => ({ ...s, pageIndex: shiftIdx(s.pageIndex) })));
      setDrawingAnnotations((prev) => prev.map((d) => ({ ...d, pageIndex: shiftIdx(d.pageIndex) })));
      setExtractedTextBlocks((prev) => prev.map((b) => ({ ...b, pageIndex: shiftIdx(b.pageIndex) })));

      setIsDocumentModified(true);
      addHistory(
        settings.language === 'th' ? 'แทรกหน้าใหม่' : 'Insert Blank Page',
        `หลังหน้า ${afterIndex + 1}`
      );

      // Refresh thumbnails for all pages
      setThumbnails({});
      for (let i = 0; i < newPagesCount; i++) {
        PdfRenderService.renderThumbnail(newPdfDoc, i + 1, 140).then((thumbUrl) => {
          setThumbnails((prev) => ({ ...prev, [i]: thumbUrl }));
        });
      }

      showAlert(
        t('success', settings.language),
        settings.language === 'th'
          ? `แทรกหน้าใหม่ต่อจากหน้า ${afterIndex + 1} เรียบร้อยแล้ว`
          : `Inserted blank page after page ${afterIndex + 1}`,
        'success'
      );
    } catch (e: any) {
      console.error('Insert blank page error:', e);
      showAlert(
        t('error', settings.language),
        `${settings.language === 'th' ? 'ไม่สามารถแทรกหน้าใหม่ได้' : 'Failed to insert blank page'}: ${e.message}`,
        'error'
      );
    }
  }, [fileBytes, file, pages, settings.newPageSize, settings.language]);

  // Add Blank Page after current page (used by Ribbon toolbar)
  const handleAddBlankPage = async () => {
    await handleInsertBlankPageAtIndex(currentPageIndex);
  };

  // Reverse page order
  const handleReversePages = () => {
    if (pages.length <= 1) {
      showAlert('แจ้งเตือน', 'เอกสารมีเพียง 1 หน้า ไม่สามารถกลับลำดับได้', 'info');
      return;
    }
    setPages((prev) => {
      const reversed = [...prev].reverse().map((p, idx) => ({
        ...p,
        pageIndex: idx,
      }));
      return reversed;
    });
    setCurrentPageIndex(0);
    showAlert('สำเร็จ', 'กลับลำดับหน้าทั้งหมดเรียบร้อยแล้ว', 'success');
  };

  // Clear all annotations on current page
  const handleClearAnnotations = () => {
    if (!pdfDoc) return;
    setTextAnnotations((prev) => prev.filter((t) => t.pageIndex !== currentPageIndex));
    setImageAnnotations((prev) => prev.filter((i) => i.pageIndex !== currentPageIndex));
    setShapeAnnotations((prev) => prev.filter((s) => s.pageIndex !== currentPageIndex));
    setDrawingAnnotations((prev) => prev.filter((d) => d.pageIndex !== currentPageIndex));
    setSelectedShapeId(null);
    showAlert('สำเร็จ', 'ลบคำอธิบายประกอบและรูปวาดทั้งหมดในหน้านี้เรียบร้อยแล้ว', 'info');
  };

  // Instantly create and place a comment item / shape on current page
  const handleAddCommentItem = (type: ShapeAnnotation['type']) => {
    if (!pdfDoc || pages.length === 0) return;
    const curPage = pages[currentPageIndex] || { width: 595.28, height: 841.89 };
    const pW = curPage.width || 595.28;
    const pH = curPage.height || 841.89;

    let defW = 180;
    let defH = 110;
    let strokeCol = '#7c3aed';
    let fillCol = 'transparent';
    let sWidth = 2;
    let textVal: string | undefined = undefined;
    let fSize: number | undefined = undefined;

    switch (type) {
      case 'rect':
        defW = 180;
        defH = 110;
        strokeCol = '#7c3aed';
        fillCol = 'transparent';
        sWidth = 2;
        break;
      case 'circle':
        defW = 140;
        defH = 140;
        strokeCol = '#9333ea';
        fillCol = 'transparent';
        sWidth = 2;
        break;
      case 'ellipse':
        defW = 180;
        defH = 100;
        strokeCol = '#9333ea';
        fillCol = 'transparent';
        sWidth = 2;
        break;
      case 'arrow':
        defW = 150;
        defH = 70;
        strokeCol = '#dc2626';
        fillCol = '#dc2626';
        sWidth = 2;
        break;
      case 'stamp':
        defW = 160;
        defH = 60;
        strokeCol = '#dc2626';
        fillCol = 'rgba(254, 226, 226, 0.75)';
        sWidth = 2;
        textVal = 'STAMP';
        fSize = 20;
        break;
      case 'note':
        defW = 160;
        defH = 100;
        strokeCol = '#ca8a04';
        fillCol = 'rgba(254, 240, 138, 0.9)';
        sWidth = 1.5;
        textVal = 'โน้ตย่อ: บันทึกข้อความ...';
        fSize = 14;
        break;
      case 'highlight':
        defW = 200;
        defH = 26;
        strokeCol = '#eab308';
        fillCol = 'rgba(250, 204, 21, 0.45)';
        sWidth = 0;
        break;
      case 'underline':
        defW = 180;
        defH = 20;
        strokeCol = '#dc2626';
        fillCol = 'transparent';
        sWidth = 2;
        break;
      case 'strikethrough':
        defW = 180;
        defH = 20;
        strokeCol = '#dc2626';
        fillCol = 'transparent';
        sWidth = 2;
        break;
    }

    const newShape: ShapeAnnotation = {
      id: `shape-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: type,
      x: Math.max(20, Math.round((pW - defW) / 2)),
      y: Math.max(40, Math.round((pH - defH) / 3)),
      width: defW,
      height: defH,
      color: strokeCol,
      fillColor: fillCol,
      strokeWidth: sWidth,
      text: textVal,
      fontSize: fSize,
      opacity: 1,
    };

    setShapeAnnotations((prev) => [...prev, newShape]);
    setSelectedShapeId(newShape.id);
    setSelectedTextAnnotationId(null);
    setSelectedExtractedBlockId(null);
    setToolMode('select');
  };

  // Instantly create and place a marked redaction box on current page
  const handleAddRedactionMark = () => {
    if (!pdfDoc || pages.length === 0) return;
    const curPage = pages[currentPageIndex] || { width: 595.28, height: 841.89 };
    const pW = curPage.width || 595.28;
    const pH = curPage.height || 841.89;
    const defW = 200;
    const defH = 45;

    const newShape: ShapeAnnotation = {
      id: `redact-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: 'redact',
      x: Math.max(20, Math.round((pW - defW) / 2)),
      y: Math.max(40, Math.round((pH - defH) / 3)),
      width: defW,
      height: defH,
      color: '#ef4444',
      fillColor: '#ef4444',
      strokeWidth: 2,
      text: settings.language === 'th' ? 'ปกปิด' : 'REDACT',
      opacity: 0.5,
    };

    setShapeAnnotations((prev) => [...prev, newShape]);
    setSelectedShapeId(newShape.id);
    setSelectedTextAnnotationId(null);
    setSelectedExtractedBlockId(null);
    setToolMode('select');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans transition-colors">
      {/* Top SmartDSP PDF Header Bar */}
      <TopHeaderBar
        fileName={fileName}
        hasDocument={!!pdfDoc}
        language={settings.language}
        theme={settings.theme}
        isDarkEffective={isDarkEffective}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMobileTools={() => setIsMobileToolsOpen(true)}
      />

      {/* Top Office / Lyncub PDF Ribbon Header */}
      <RibbonHeader
        fileName={fileName}
        hasDocument={!!pdfDoc}
        toolMode={toolMode}
        language={settings.language}
        onSelectTool={handleSelectTool}
        onOpenFile={handleOpenFile}
        onNewFile={handleNewFile}
        onSavePdf={handleExportPdf}
        onSaveAsPdf={handleExportPdf}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onAddImage={handleAddImage}
        onOpenMergeModal={() => setIsMergeOpen(true)}
        onOpenSplitModal={() => setIsSplitOpen(true)}
        onRotateLeft={() => handleRotateCurrentPage(-90)}
        onRotateRight={() => handleRotateCurrentPage(90)}
        onDuplicatePage={handleDuplicatePage}
        onDeletePage={() => handleDeletePage()}
        onAddBlankPage={handleAddBlankPage}
        onReversePages={handleReversePages}
        onTogglePresentation={handleTogglePresentation}
        onClearAnnotations={handleClearAnnotations}
        onAddCommentItem={handleAddCommentItem}
        isSearchOpen={isSearchOpen}
        onToggleSearch={handleToggleSearch}
        onOpenToolbox={handleOpenToolbox}
        onOpenAboutModal={() => setIsAboutOpen(true)}
        onMarkRedaction={handleAddRedactionMark}
        onApplyRedaction={handleApplyRedactions}
        onOpenEncryptModal={() => setIsEncryptOpen(true)}
        onOpenDecryptModal={() => setIsDecryptOpen(true)}
        onOpenSignatureModal={() => setIsSignatureOpen(true)}
        onOpenMetadataModal={() => setIsMetadataModalOpen(true)}
        onOpenCompressModal={() => setIsCompressModalOpen(true)}
      />

      {/* Main Workspace Area with Left Strip, Thumbnail Panel, Center PDF Viewer, Right Property Panel, Right Strip */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Far Left Vertical Icon Strip */}
        <LeftSidebarStrip
          hasDocument={!!pdfDoc}
          activeTab={leftSidebarTab}
          language={settings.language}
          onToggleTab={(tab) => setLeftSidebarTab((prev) => (prev === tab ? null : tab))}
          onOpenToolbox={handleOpenToolbox}
        />

        {pdfDoc ? (
          <>
            {/* Left Collapsible Panels */}
            {leftSidebarTab === 'thumbnails' && (
              <ThumbnailSidebar
                pages={pages}
                currentPageIndex={currentPageIndex}
                language={settings.language}
                onSelectPage={(index) => setCurrentPageIndex(index)}
                onRotatePageLeft={handleRotatePageLeftAtIndex}
                onRotatePageRight={handleRotatePageRightAtIndex}
                onDuplicatePage={handleDuplicatePageAtIndex}
                onInsertBlankPage={handleInsertBlankPageAtIndex}
                onDeletePage={(index) => handleDeletePage(index)}
                onInsertPdf={handleInsertPdfAtIndex}
                onOpenSplit={handleOpenSplitAtPage}
                onExtractPage={handleExtractPage}
                onReorderPages={handleReorderPages}
                thumbnails={thumbnails}
                isOpen={true}
                onToggleOpen={() => setLeftSidebarTab(null)}
              />
            )}

            {leftSidebarTab === 'bookmarks' && (
              <BookmarksSidebar
                bookmarks={bookmarks}
                currentPageIndex={currentPageIndex}
                onSelectPage={(pageIdx) => setCurrentPageIndex(pageIdx)}
                onAddBookmark={(title, pageIdx) => {
                  setBookmarks((prev) => [
                    ...prev,
                    { id: `bm-${Date.now()}`, title, pageIndex: pageIdx },
                  ]);
                }}
                onDeleteBookmark={(id) => {
                  setBookmarks((prev) => prev.filter((b) => b.id !== id));
                }}
                onClose={() => setLeftSidebarTab(null)}
              />
            )}

            {leftSidebarTab === 'layers' && (
              <LayersSidebar
                layers={activeLayers}
                onClose={() => setLeftSidebarTab(null)}
              />
            )}

            {leftSidebarTab === 'attachments' && (
              <AttachmentsSidebar
                attachments={attachments}
                onAddAttachment={(file) => {
                  setAttachments((prev) => [
                    ...prev,
                    {
                      id: `att-${Date.now()}`,
                      filename: file.name,
                      size: file.size,
                      dataUrl: URL.createObjectURL(file),
                    },
                  ]);
                }}
                onDeleteAttachment={(id) => {
                  setAttachments((prev) => prev.filter((a) => a.id !== id));
                }}
                onClose={() => setLeftSidebarTab(null)}
              />
            )}

            {/* Central PDF Viewer & Overlay */}
            <PdfViewer
              pdfDoc={pdfDoc}
              currentPageIndex={currentPageIndex}
              pages={pages}
              zoom={zoom}
              onZoomChange={setZoom}
              onNextPage={() => setCurrentPageIndex((p) => Math.min(pages.length - 1, p + 1))}
              onPrevPage={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
              totalPages={pages.length}
              toolMode={toolMode}
              fontFamily={fontFamily}
              fontSize={fontSize}
              color={color}
              strokeWidth={strokeWidth}
              textAnnotations={textAnnotations}
              imageAnnotations={imageAnnotations}
              shapeAnnotations={shapeAnnotations}
              drawingAnnotations={drawingAnnotations}
              extractedTextBlocks={extractedTextBlocks}
              selectedExtractedBlockId={selectedExtractedBlockId}
              onSelectExtractedBlock={(id) => {
                if (toolMode !== 'editText') {
                  setSelectedExtractedBlockId(null);
                  return;
                }
                setSelectedExtractedBlockId(id);
                if (id) {
                  setSelectedTextAnnotationId(null);
                  setSelectedShapeId(null);
                  setIsInspectorOpen(true);
                } else if (!selectedTextAnnotationId && !selectedShapeId) {
                  setIsInspectorOpen(false);
                }
              }}
              onUpdateExtractedBlock={(updated) =>
                setExtractedTextBlocks((prev) =>
                  prev.map((b) => (b.id === updated.id ? updated : b))
                )
              }
              onDeleteExtractedBlock={(id) => {
                setExtractedTextBlocks((prev) =>
                  prev.map((b) => (b.id === id ? { ...b, isDeleted: true } : b))
                );
                setSelectedExtractedBlockId(null);
              }}
              selectedTextAnnotationId={selectedTextAnnotationId}
              onSelectTextAnnotation={(id) => {
                setSelectedTextAnnotationId(id);
                if (id) {
                  setSelectedExtractedBlockId(null);
                  setSelectedShapeId(null);
                  setIsInspectorOpen(true);
                } else if (!selectedExtractedBlockId && !selectedShapeId) {
                  setIsInspectorOpen(false);
                }
              }}
              selectedShapeId={selectedShapeId}
              onSelectShape={(id) => {
                setSelectedShapeId(id);
                if (id) {
                  setSelectedTextAnnotationId(null);
                  setSelectedExtractedBlockId(null);
                  setIsInspectorOpen(true);
                } else if (!selectedTextAnnotationId && !selectedExtractedBlockId) {
                  setIsInspectorOpen(false);
                }
              }}
              onAddText={(newText) => {
                setTextAnnotations((prev) => [...prev, newText]);
                setSelectedTextAnnotationId(newText.id);
                setSelectedExtractedBlockId(null);
                setSelectedShapeId(null);
                setIsInspectorOpen(true);
              }}
              onUpdateText={(updated) =>
                setTextAnnotations((prev) =>
                  prev.map((t) => (t.id === updated.id ? updated : t))
                )
              }
              onDeleteText={(id) => {
                setTextAnnotations((prev) => prev.filter((t) => t.id !== id));
                setSelectedTextAnnotationId(null);
              }}
              onUpdateImage={(updated) =>
                setImageAnnotations((prev) =>
                  prev.map((i) => (i.id === updated.id ? updated : i))
                )
              }
              onDeleteImage={(id) =>
                setImageAnnotations((prev) => prev.filter((i) => i.id !== id))
              }
              onAddShape={(newShape) => {
                setShapeAnnotations((prev) => [...prev, newShape]);
                setSelectedShapeId(newShape.id);
                setSelectedTextAnnotationId(null);
                setSelectedExtractedBlockId(null);
                setIsInspectorOpen(true);
              }}
              onUpdateShape={(updated) =>
                setShapeAnnotations((prev) =>
                  prev.map((s) => (s.id === updated.id ? updated : s))
                )
              }
              onDeleteShape={(id) => {
                setShapeAnnotations((prev) => prev.filter((s) => s.id !== id));
                setSelectedShapeId(null);
              }}
              onAddDrawing={(newDrawing) =>
                setDrawingAnnotations((prev) => [...prev, newDrawing])
              }
              onSelectTool={handleSelectTool}
              searchQuery={searchQuery}
              activeSearchBlockId={
                isSearchOpen ? (searchMatches[currentSearchMatchIndex]?.id || null) : null
              }
              matchingBlockIds={
                isSearchOpen
                  ? new Set(
                      searchMatches
                        .filter((m) => m.pageIndex === currentPageIndex)
                        .map((m) => m.id)
                    )
                  : undefined
              }
              snapshotDpi={settings.snapshotDpi}
              disableLatinSpacing={settings.disableLatinSpacing}
              language={settings.language}
            />

            {/* In-document Search Bar Widget (Ctrl+F) */}
            <SearchBar
              isOpen={isSearchOpen}
              onClose={handleCloseSearch}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalMatches={searchMatches.length}
              currentMatchIndex={currentSearchMatchIndex}
              onNextMatch={handleNextSearchMatch}
              onPrevMatch={handlePrevSearchMatch}
            />

            {/* Right Sidebar Multi-panel: Inspector, Comments, Search, Security, History */}
            <RightSidebarContainer
              isOpen={rightSidebarTab !== null}
              activeTab={rightSidebarTab}
              onClose={() => setRightSidebarTab(null)}
              language={settings.language}
              hasDocument={!!pdfDoc}
              fileName={fileName}
              totalPages={pages.length}
              isModified={isDocumentModified}
              metadata={pdfMetadata}
              toolProfileCount={textAnnotations.length + shapeAnnotations.length + drawingAnnotations.length}
              selectedExtractedBlock={
                extractedTextBlocks.find((b) => b.id === selectedExtractedBlockId) || null
              }
              selectedTextAnnotation={
                textAnnotations.find((t) => t.id === selectedTextAnnotationId) || null
              }
              selectedShape={
                shapeAnnotations.find((s) => s.id === selectedShapeId) || null
              }
              onUpdateExtractedBlock={(updated) => {
                setExtractedTextBlocks((prev) =>
                  prev.map((b) => (b.id === updated.id ? updated : b))
                );
                setIsDocumentModified(true);
              }}
              onDeleteExtractedBlock={(id) => {
                setExtractedTextBlocks((prev) =>
                  prev.map((b) => (b.id === id ? { ...b, isDeleted: true } : b))
                );
                setSelectedExtractedBlockId(null);
                addHistory(settings.language === 'th' ? 'ลบข้อความ' : 'Delete Text');
              }}
              onUpdateTextAnnotation={(updated) => {
                setTextAnnotations((prev) =>
                  prev.map((t) => (t.id === updated.id ? updated : t))
                );
                setIsDocumentModified(true);
              }}
              onDeleteTextAnnotation={(id) => {
                setTextAnnotations((prev) => prev.filter((t) => t.id !== id));
                setSelectedTextAnnotationId(null);
                addHistory(settings.language === 'th' ? 'ลบข้อความ' : 'Delete Text');
              }}
              onUpdateShape={(updated) => {
                setShapeAnnotations((prev) =>
                  prev.map((s) => (s.id === updated.id ? updated : s))
                );
                setIsDocumentModified(true);
              }}
              onDeleteShape={(id) => {
                setShapeAnnotations((prev) => prev.filter((s) => s.id !== id));
                setSelectedShapeId(null);
                addHistory(settings.language === 'th' ? 'ลบรูปร่าง' : 'Delete Shape');
              }}
              textAnnotations={textAnnotations}
              shapeAnnotations={shapeAnnotations}
              drawingAnnotations={drawingAnnotations}
              currentPageIndex={currentPageIndex}
              onSelectPage={(pageIdx) => setCurrentPageIndex(pageIdx)}
              onSelectTextAnnotation={(id) => {
                setSelectedTextAnnotationId(id);
                setSelectedExtractedBlockId(null);
                setSelectedShapeId(null);
                setRightSidebarTab('inspector');
              }}
              onSelectShape={(id) => {
                setSelectedShapeId(id);
                setSelectedTextAnnotationId(null);
                setSelectedExtractedBlockId(null);
                setRightSidebarTab('inspector');
              }}
              onDeleteDrawing={(id) => {
                setDrawingAnnotations((prev) => prev.filter((d) => d.id !== id));
                addHistory(settings.language === 'th' ? 'ลบเส้นวาด' : 'Delete Drawing');
              }}
              extractedTextBlocks={extractedTextBlocks}
              onSelectMatch={(blockId, pageIdx) => {
                setCurrentPageIndex(pageIdx);
                setSelectedExtractedBlockId(blockId);
                setRightSidebarTab('inspector');
              }}
              onOpenPolicy={() =>
                showAlert(
                  settings.language === 'th' ? 'นโยบายความปลอดภัย PDF' : 'PDF Security Policy',
                  settings.language === 'th'
                    ? 'เอกสาร PDF นี้เปิดอ่านและแก้ไขได้ตามสิทธิ์มาตรฐาน สามารถพิมพ์ คัดลอกเนื้อหา และบันทึกข้อมูลได้ 100%'
                    : 'This PDF document is open for standard editing, printing, content copying, and saving without restriction.',
                  'info'
                )
              }
              isEncrypted={isDocumentEncrypted}
              signaturesCount={imageAnnotations.filter((img) => img.id.startsWith('sig-')).length}
              onOpenEncrypt={() => setIsEncryptOpen(true)}
              onOpenDecrypt={() => setIsDecryptOpen(true)}
              onOpenSignature={() => setIsSignatureOpen(true)}
              history={history}
              onClearHistory={() => setHistory([])}
            />
          </>
        ) : (
          <DropZone onFileSelected={handleOpenFile} language={settings.language} />
        )}

        {/* Far Right Vertical Icon Strip */}
        <RightSidebarStrip
          hasDocument={!!pdfDoc}
          activeTab={rightSidebarTab}
          language={settings.language}
          onToggleTab={(tab) => setRightSidebarTab((prev) => (prev === tab ? null : tab))}
        />
      </div>

      {/* Modals */}
      <MergeModal
        isOpen={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        showAlert={showAlert}
      />
      <SplitModal
        isOpen={isSplitOpen}
        onClose={() => setIsSplitOpen(false)}
        fileBytes={fileBytes}
        fileName={fileName}
        totalPages={pages.length}
        defaultRange={splitDefaultRange}
        showAlert={showAlert}
      />
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        language={settings.language}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        systemPrefersDark={systemPrefersDark}
      />
      <SignatureModal
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        onInsertSignature={handleInsertSignature}
        language={settings.language}
      />
      <EncryptModal
        isOpen={isEncryptOpen}
        onClose={() => setIsEncryptOpen(false)}
        onEncrypt={handleEncryptDocument}
        fileName={fileName}
        language={settings.language}
      />
      <DecryptModal
        isOpen={isDecryptOpen}
        onClose={() => setIsDecryptOpen(false)}
        onDecrypt={handleDecryptDocument}
        fileName={fileName}
        language={settings.language}
      />
      <MetadataModal
        isOpen={isMetadataModalOpen}
        onClose={() => setIsMetadataModalOpen(false)}
        fileName={fileName}
        totalPages={pages.length}
        fileSize={fileBytes?.byteLength || file?.size}
        isEncrypted={isDocumentEncrypted}
        metadata={pdfMetadata}
        language={settings.language}
        onSaveMetadata={(updated) => {
          setPdfMetadata(updated);
          setIsDocumentModified(true);
          addHistory(settings.language === 'th' ? 'แก้ไขเมทาดาทา' : 'Edit Metadata', updated.title || fileName);
          showAlert(
            settings.language === 'th' ? 'สำเร็จ' : 'Success',
            settings.language === 'th' ? 'บันทึกข้อมูลเมทาดาทาเรียบร้อยแล้ว' : 'Metadata saved successfully',
            'success'
          );
        }}
      />
      <CompressModal
        isOpen={isCompressModalOpen}
        onClose={() => setIsCompressModalOpen(false)}
        fileBytes={fileBytes}
        fileName={fileName}
        language={settings.language}
        showAlert={showAlert}
        onApplyCompressed={async (compressedBytes) => {
          try {
            const arrayBuffer = new ArrayBuffer(compressedBytes.byteLength);
            new Uint8Array(arrayBuffer).set(compressedBytes);
            const newDoc = await PdfRenderService.loadDocument(arrayBuffer.slice(0));
            const numPages = newDoc.numPages;
            const initialPages: PageInfo[] = [];
            for (let i = 0; i < numPages; i++) {
              initialPages.push({
                pageIndex: i,
                originalPageIndex: i,
                rotation: 0,
                width: 595,
                height: 842,
              });
            }
            setFileBytes(arrayBuffer);
            setPdfDoc(newDoc);
            setPages(initialPages);
            setCurrentPageIndex(0);
            setTextAnnotations([]);
            setImageAnnotations([]);
            setShapeAnnotations([]);
            setDrawingAnnotations([]);
            setExtractedTextBlocks([]);
            setSelectedExtractedBlockId(null);
            setSelectedTextAnnotationId(null);
            setSelectedShapeId(null);
            setIsDocumentModified(true);
            addHistory(settings.language === 'th' ? 'ลดขนาดไฟล์ PDF' : 'Compress PDF', fileName);
            showAlert(
              t('success', settings.language),
              settings.language === 'th' ? 'เปิดเอกสารที่ลดขนาดแล้วเรียบร้อย' : 'Opened compressed PDF successfully',
              'success'
            );
          } catch (err: any) {
            showAlert(
              t('error', settings.language),
              err?.message || String(err),
              'error'
            );
          }
        }}
      />

      {/* Global Alert Modal (Replaces browser alert) */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <MobileBottomBar
        hasDocument={!!pdfDoc}
        currentPageIndex={currentPageIndex}
        totalPages={pages.length}
        toolMode={toolMode}
        onSelectTool={handleSelectTool}
        onOpenThumbnails={() => setLeftSidebarTab((prev) => (prev === 'thumbnails' ? null : 'thumbnails'))}
        onFitWidth={handleFitWidth}
        onSavePdf={handleExportPdf}
        onOpenMoreMenu={() => setIsMobileToolsOpen(true)}
        onPrevPage={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
        onNextPage={() => setCurrentPageIndex((p) => Math.min(pages.length - 1, p + 1))}
        language={settings.language}
      />

      {/* Mobile Tools Modal / Bottom Sheet */}
      <MobileToolsModal
        isOpen={isMobileToolsOpen}
        onClose={() => setIsMobileToolsOpen(false)}
        onOpenMerge={() => setIsMergeOpen(true)}
        onOpenSplit={() => setIsSplitOpen(true)}
        onOpenSignature={() => setIsSignatureOpen(true)}
        onOpenCompress={() => setIsCompressModalOpen(true)}
        onOpenEncrypt={() => setIsEncryptOpen(true)}
        onOpenDecrypt={() => setIsDecryptOpen(true)}
        onToggleSearch={handleToggleSearch}
        onOpenHistory={() => setRightSidebarTab('history')}
        onAddImage={handleAddImage}
        onAddBlankPage={handleAddBlankPage}
        onReversePages={handleReversePages}
        onRotateLeft={() => handleRotateCurrentPage(-90)}
        onRotateRight={() => handleRotateCurrentPage(90)}
        onPrint={handlePrint}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onSelectTool={handleSelectTool}
        onDuplicatePage={handleDuplicatePage}
        onDeletePage={() => handleDeletePage()}
        language={settings.language}
      />
    </div>
  );
};

