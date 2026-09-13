// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Sittichat Pothising
// OpenJPDF - PDF Editor (Web)
// compressService.ts - PDF Compression Service

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Ensure worker path is configured
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export type CompressPreset = '1m' | '3m' | '5m';

export interface CompressResult {
  compressedBytes: Uint8Array;
  originalSize: number;
  newSize: number;
  ratio: number;
}

export class CompressService {
  /**
   * Compress PDF document according to target size preset (1MB, 3MB, 5MB).
   * Automatically adapts image resolutions, object streams, and quality.
   */
  static async compressPdf(
    fileBytes: ArrayBuffer,
    preset: CompressPreset,
    onProgress?: (progress: number) => void
  ): Promise<CompressResult> {
    const originalSize = fileBytes.byteLength;
    const targetMap: Record<CompressPreset, number> = {
      '1m': 1 * 1024 * 1024,
      '3m': 3 * 1024 * 1024,
      '5m': 5 * 1024 * 1024,
    };
    const targetBytes = targetMap[preset];

    if (onProgress) onProgress(5);

    // Load original with pdf-lib to check lossless object stream compression
    let losslessBytes: Uint8Array | null = null;
    let srcPdfLib: PDFDocument | null = null;
    try {
      srcPdfLib = await PDFDocument.load(fileBytes.slice(0), { ignoreEncryption: true });
      losslessBytes = await srcPdfLib.save({ useObjectStreams: true });
    } catch (e) {
      console.warn('Could not perform initial pdf-lib load:', e);
    }

    if (onProgress) onProgress(15);

    // If lossless already achieves reduction under the target and is smaller than original
    if (
      losslessBytes &&
      losslessBytes.byteLength <= targetBytes &&
      losslessBytes.byteLength <= originalSize * 0.75
    ) {
      if (onProgress) onProgress(100);
      const newSize = losslessBytes.byteLength;
      const ratio = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));
      return {
        compressedBytes: losslessBytes,
        originalSize,
        newSize,
        ratio,
      };
    }

    // Load with PDF.js to re-encode high resolution raster pages
    const dataClone = fileBytes.slice(0);
    const pdfDoc = await pdfjsLib.getDocument({
      data: new Uint8Array(dataClone),
      cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    }).promise;

    const numPages = pdfDoc.numPages;

    // Calculate adaptive resolution limit and JPEG quality based on page count & preset
    let maxDim = 1500;
    let quality = 0.70;

    if (preset === '1m') {
      if (numPages <= 3) {
        maxDim = 1400;
        quality = 0.65;
      } else if (numPages <= 10) {
        maxDim = 1200;
        quality = 0.55;
      } else if (numPages <= 25) {
        maxDim = 1000;
        quality = 0.45;
      } else {
        maxDim = 850;
        quality = 0.38;
      }
    } else if (preset === '3m') {
      if (numPages <= 5) {
        maxDim = 1800;
        quality = 0.78;
      } else if (numPages <= 15) {
        maxDim = 1500;
        quality = 0.70;
      } else if (numPages <= 30) {
        maxDim = 1200;
        quality = 0.60;
      } else {
        maxDim = 1000;
        quality = 0.50;
      }
    } else {
      // 5m
      if (numPages <= 8) {
        maxDim = 2200;
        quality = 0.85;
      } else if (numPages <= 20) {
        maxDim = 1800;
        quality = 0.75;
      } else if (numPages <= 40) {
        maxDim = 1400;
        quality = 0.65;
      } else {
        maxDim = 1100;
        quality = 0.55;
      }
    }

    const outputDoc = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      if (onProgress) {
        const stepProgress = 15 + Math.round(((i - 1) / numPages) * 75);
        onProgress(stepProgress);
      }

      const page = await pdfDoc.getPage(i);
      const origViewport = page.getViewport({ scale: 1.0 });
      const maxSide = Math.max(origViewport.width, origViewport.height);
      const scale = Math.min(Math.max(maxDim / maxSide, 1.0), 2.0);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
      });

      if (blob) {
        const imgBytes = await blob.arrayBuffer();
        const embedded = await outputDoc.embedJpg(imgBytes);
        const newPage = outputDoc.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(embedded, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height,
        });
      }
    }

    // Preserve metadata
    if (srcPdfLib) {
      try {
        const title = srcPdfLib.getTitle();
        if (title) outputDoc.setTitle(title);
        const author = srcPdfLib.getAuthor();
        if (author) outputDoc.setAuthor(author);
        const subject = srcPdfLib.getSubject();
        if (subject) outputDoc.setSubject(subject);
      } catch {
        // Ignore metadata error
      }
    }

    if (onProgress) onProgress(93);

    const rasterBytes = await outputDoc.save({ useObjectStreams: true });

    // Choose the best output candidate:
    // 1. If lossless is already under target and smaller than raster, use lossless
    // 2. If raster is smaller than original, use raster
    // 3. If file was already very small and raster inflated it, keep lossless or original
    let finalBytes: Uint8Array = rasterBytes;

    if (losslessBytes && losslessBytes.byteLength <= targetBytes && losslessBytes.byteLength <= rasterBytes.byteLength) {
      finalBytes = losslessBytes;
    } else if (rasterBytes.byteLength > originalSize && originalSize <= targetBytes && losslessBytes) {
      finalBytes = losslessBytes.byteLength < originalSize ? losslessBytes : new Uint8Array(fileBytes);
    }

    if (onProgress) onProgress(100);

    const newSize = finalBytes.byteLength;
    const ratio = originalSize > 0 && newSize < originalSize
      ? Math.round(((originalSize - newSize) / originalSize) * 100)
      : 0;

    return {
      compressedBytes: finalBytes,
      originalSize,
      newSize,
      ratio,
    };
  }
}

