import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { ExtractedTextBlock, PdfMetadata } from '../types';

// Set worker path to local bundled worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export class PdfRenderService {
  /**
   * Load PDF document from ArrayBuffer
   */
  static async loadDocument(data: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
    // Clone buffer so PDF.js Web Worker transfer never detaches caller's ArrayBuffer
    const dataClone = data.slice(0);
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(dataClone),
      cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });
    return await loadingTask.promise;
  }

  /**
   * Get metadata from loaded PDF document using dual engines (pdfjs-dist + pdf-lib fallback)
   */
  static async getDocumentMetadata(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    rawBytes?: ArrayBuffer
  ): Promise<PdfMetadata> {
    let meta: PdfMetadata = {};

    // Engine 1: Extract from pdfjs-dist info & XMP
    try {
      const data = await pdfDoc.getMetadata();
      const info = (data?.info || {}) as any;
      const xmp = data?.metadata as any;

      meta = {
        title: info.Title || info.title || (xmp && typeof xmp.get === 'function' ? xmp.get('dc:title') : '') || '',
        author: info.Author || info.author || (xmp && typeof xmp.get === 'function' ? xmp.get('dc:creator') : '') || '',
        subject: info.Subject || info.subject || (xmp && typeof xmp.get === 'function' ? xmp.get('dc:description') : '') || '',
        keywords: info.Keywords || info.keywords || (xmp && typeof xmp.get === 'function' ? xmp.get('pdf:keywords') : '') || '',
        creator: info.Creator || info.creator || (xmp && typeof xmp.get === 'function' ? xmp.get('xmp:creatortool') : '') || '',
        producer: info.Producer || info.producer || '',
        creationDate: info.CreationDate || info.creationDate || (xmp && typeof xmp.get === 'function' ? xmp.get('xmp:createdate') : '') || '',
        modificationDate: info.ModDate || info.modDate || (xmp && typeof xmp.get === 'function' ? xmp.get('xmp:modifydate') : '') || '',
      };
    } catch (err) {
      console.warn('PDF.js getMetadata error:', err);
    }

    // Engine 2: Fallback / Enhance with pdf-lib if rawBytes is provided
    if (rawBytes) {
      try {
        const pdfLibDoc = await PDFDocument.load(rawBytes.slice(0), { ignoreEncryption: true });
        if (!meta.title) meta.title = pdfLibDoc.getTitle() || '';
        if (!meta.author) meta.author = pdfLibDoc.getAuthor() || '';
        if (!meta.subject) meta.subject = pdfLibDoc.getSubject() || '';
        if (!meta.keywords) {
          const kw = pdfLibDoc.getKeywords();
          if (Array.isArray(kw)) meta.keywords = kw.join(', ');
          else if (typeof kw === 'string') meta.keywords = kw;
        }
        if (!meta.creator) meta.creator = pdfLibDoc.getCreator() || '';
        if (!meta.producer) meta.producer = pdfLibDoc.getProducer() || '';
        if (!meta.creationDate) {
          const cd = pdfLibDoc.getCreationDate();
          if (cd) meta.creationDate = cd.toISOString();
        }
        if (!meta.modificationDate) {
          const md = pdfLibDoc.getModificationDate();
          if (md) meta.modificationDate = md.toISOString();
        }
      } catch (pdfLibErr) {
        console.warn('pdf-lib getMetadata fallback error:', pdfLibErr);
      }
    }

    return meta;
  }

  /**
   * Render a specific page to an HTML5 Canvas using an off-screen buffer to avoid concurrent render collisions
   */
  static renderPage(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number, // 1-based
    targetCanvas: HTMLCanvasElement,
    scale: number = 1.0,
    additionalRotation: number = 0
  ): { promise: Promise<{ width: number; height: number }>; cancel: () => void } {
    let isCancelled = false;
    let renderTask: pdfjsLib.RenderTask | null = null;

    const promise = (async () => {
      const page = await pdfDoc.getPage(pageNumber);
      if (isCancelled) return { width: 0, height: 0 };

      const rotation = (page.rotate + additionalRotation) % 360;
      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * pixelRatio, rotation });

      // Create an isolated off-screen buffer canvas for this render task
      const bufferCanvas = document.createElement('canvas');
      bufferCanvas.width = viewport.width;
      bufferCanvas.height = viewport.height;

      const bufferContext = bufferCanvas.getContext('2d');
      if (!bufferContext) {
        throw new Error('Buffer canvas context not available');
      }

      // Fill white background for blank pages or pages without explicit background
      bufferContext.fillStyle = '#ffffff';
      bufferContext.fillRect(0, 0, bufferCanvas.width, bufferCanvas.height);

      renderTask = page.render({
        canvasContext: bufferContext,
        viewport: viewport,
      });

      try {
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException') {
          return { width: 0, height: 0 };
        }
        throw err;
      }

      if (isCancelled) return { width: 0, height: 0 };

      // Transfer rendered buffer to target canvas
      targetCanvas.width = viewport.width;
      targetCanvas.height = viewport.height;
      targetCanvas.style.width = `${viewport.width / pixelRatio}px`;
      targetCanvas.style.height = `${viewport.height / pixelRatio}px`;

      const targetContext = targetCanvas.getContext('2d');
      if (targetContext) {
        targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        targetContext.drawImage(bufferCanvas, 0, 0);
      }

      const unscaledViewport = page.getViewport({ scale: 1.0, rotation });
      return {
        width: unscaledViewport.width,
        height: unscaledViewport.height,
      };
    })();

    return {
      promise,
      cancel: () => {
        isCancelled = true;
        if (renderTask) {
          try {
            renderTask.cancel();
          } catch {
            // ignore
          }
        }
      },
    };
  }

  /**
   * Render thumbnail for sidebar
   */
  static async renderThumbnail(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    thumbWidth: number = 140,
    additionalRotation: number = 0
  ): Promise<string> {
    const page = await pdfDoc.getPage(pageNumber);
    const rotation = (page.rotate + additionalRotation) % 360;
    const originalViewport = page.getViewport({ scale: 1.0, rotation });
    
    const scale = thumbWidth / originalViewport.width;
    const viewport = page.getViewport({ scale, rotation });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d');
    if (!context) return '';

    // Fill white background so empty/blank pages render as clean white paper instead of transparent/black in JPEG
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.85);
  }

  /**
   * Extract existing text blocks with positions from a specific page
   */
  static async extractPageTextBlocks(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number, // 1-based
    pageIndex: number   // 0-based
  ): Promise<ExtractedTextBlock[]> {
    try {
      const page = await pdfDoc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0, rotation: 0 });

      interface RawItem {
        str: string;
        x: number;
        y: number; // top-relative
        pdfY: number; // bottom-relative
        width: number;
        height: number;
        fontSize: number;
      }

      const rawItems: RawItem[] = [];

      for (const item of textContent.items) {
        if (!('str' in item) || !item.str) continue;
        const tx = item.transform[4];
        const ty = item.transform[5];
        const fontSize = Math.max(9, Math.round(Math.hypot(item.transform[0], item.transform[1])));
        const width = item.width || fontSize * item.str.length * 0.55;
        const height = fontSize * 1.25;
        const y = viewport.height - ty - fontSize;

        rawItems.push({
          str: item.str,
          x: tx,
          y,
          pdfY: ty,
          width,
          height,
          fontSize,
        });
      }

      // Sort items top-to-bottom, then left-to-right
      rawItems.sort((a, b) => {
        if (Math.abs(a.pdfY - b.pdfY) > 3) {
          return b.pdfY - a.pdfY; // top first
        }
        return a.x - b.x;
      });

      // Merge adjacent items on same baseline into single line blocks
      const blocks: ExtractedTextBlock[] = [];
      let currentBlock: (RawItem & { text: string }) | null = null;

      for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i];
        if (!item.str.trim()) continue;

        if (!currentBlock) {
          currentBlock = { ...item, text: item.str };
        } else {
          const isSameLine = Math.abs(currentBlock.pdfY - item.pdfY) <= 4;
          const isNearby = (item.x - (currentBlock.x + currentBlock.width)) < Math.max(25, item.fontSize * 1.5);

          if (isSameLine && isNearby) {
            const spaceNeeded = (item.x - (currentBlock.x + currentBlock.width)) > 2 ? ' ' : '';
            currentBlock.text += spaceNeeded + item.str;
            currentBlock.width = (item.x + item.width) - currentBlock.x;
            currentBlock.height = Math.max(currentBlock.height, item.height);
          } else {
            blocks.push({
              id: `block-${pageIndex}-${blocks.length}-${Date.now()}`,
              pageIndex,
              originalText: currentBlock.text,
              text: currentBlock.text,
              x: Math.round(currentBlock.x),
              y: Math.round(currentBlock.y),
              pdfY: Math.round(currentBlock.pdfY),
              width: Math.round(currentBlock.width),
              height: Math.round(currentBlock.height),
              fontSize: currentBlock.fontSize,
              fontFamily: 'TH Sarabun New',
              color: '#000000',
              isEdited: false,
              isDeleted: false,
            });

            currentBlock = { ...item, text: item.str };
          }
        }
      }

      if (currentBlock && currentBlock.text.trim()) {
        blocks.push({
          id: `block-${pageIndex}-${blocks.length}-${Date.now()}`,
          pageIndex,
          originalText: currentBlock.text,
          text: currentBlock.text,
          x: Math.round(currentBlock.x),
          y: Math.round(currentBlock.y),
          pdfY: Math.round(currentBlock.pdfY),
          width: Math.round(currentBlock.width),
          height: Math.round(currentBlock.height),
          fontSize: currentBlock.fontSize,
          fontFamily: 'TH Sarabun New',
          color: '#000000',
          isEdited: false,
          isDeleted: false,
        });
      }

      return blocks;
    } catch (err) {
      console.warn(`Could not extract text from page ${pageNumber}:`, err);
      return [];
    }
  }
}

