import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { TextAnnotation, ImageAnnotation, ShapeAnnotation, DrawingAnnotation, PageInfo, ExtractedTextBlock, PdfMetadata } from '../types';

export class PdfService {
  private static sarabunFontBytes: ArrayBuffer | null = null;
  private static sarabunBoldFontBytes: ArrayBuffer | null = null;
  private static notoSansFontBytes: ArrayBuffer | null = null;

  /**
   * Pre-load Thai font bytes from public/fonts
   */
  static async loadFonts(): Promise<void> {
    try {
      if (!this.sarabunFontBytes) {
        const res = await fetch('/fonts/THSarabunNew.ttf');
        if (res.ok) {
          this.sarabunFontBytes = await res.arrayBuffer();
        }
      }
      if (!this.sarabunBoldFontBytes) {
        const res = await fetch('/fonts/THSarabunNew-Bold.ttf');
        if (res.ok) {
          this.sarabunBoldFontBytes = await res.arrayBuffer();
        }
      }
      if (!this.notoSansFontBytes) {
        const res = await fetch('/fonts/NotoSansThai-Regular.ttf');
        if (res.ok) {
          this.notoSansFontBytes = await res.arrayBuffer();
        }
      }
    } catch (err) {
      console.warn('Could not load bundled Thai fonts, falling back to standard fonts', err);
    }
  }

  /**
   * Merge multiple PDF files into one
   */
  static async mergePdfs(files: { name: string; bytes: ArrayBuffer }[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const doc = await PDFDocument.load(file.bytes.slice(0), { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    return await mergedPdf.save();
  }

  /**
   * Split PDF into separate pages or extract range
   */
  static async splitPdf(
    fileBytes: ArrayBuffer,
    pageIndices: number[]
  ): Promise<Uint8Array> {
    const safeBytes = fileBytes.slice(0);
    const srcDoc = await PDFDocument.load(safeBytes, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    return await newDoc.save();
  }

  /**
   * Bake annotations and page changes into final PDF
   */
  static async exportPdfWithAnnotations(
    originalBytes: ArrayBuffer,
    pagesConfig: PageInfo[],
    textAnnotations: TextAnnotation[],
    imageAnnotations: ImageAnnotation[],
    shapeAnnotations: ShapeAnnotation[],
    drawingAnnotations: DrawingAnnotation[],
    extractedTextBlocks: ExtractedTextBlock[] = [],
    metadata?: PdfMetadata
  ): Promise<Uint8Array> {
    await this.loadFonts();

    // Use a clean slice to guarantee the ArrayBuffer is never detached
    const safeBytes = originalBytes.slice(0);
    const srcDoc = await PDFDocument.load(safeBytes, { ignoreEncryption: true });
    const outputDoc = await PDFDocument.create();

    // In Vite bundlers, fontkit is exported under .default
    const fontkitInstance = (fontkit && (fontkit as any).default) ? (fontkit as any).default : fontkit;
    outputDoc.registerFontkit(fontkitInstance);

    // Embed Thai fonts if available
    let embeddedSarabun = null;
    let embeddedSarabunBold = null;
    let embeddedNoto = null;

    if (this.sarabunFontBytes) {
      try {
        embeddedSarabun = await outputDoc.embedFont(new Uint8Array(this.sarabunFontBytes.slice(0)), { subset: true });
      } catch (e) {
        console.warn('Error embedding Sarabun font:', e);
      }
    }
    if (this.sarabunBoldFontBytes) {
      try {
        embeddedSarabunBold = await outputDoc.embedFont(new Uint8Array(this.sarabunBoldFontBytes.slice(0)), { subset: true });
      } catch (e) {
        console.warn('Error embedding Sarabun Bold font:', e);
      }
    }
    if (this.notoSansFontBytes) {
      try {
        embeddedNoto = await outputDoc.embedFont(new Uint8Array(this.notoSansFontBytes.slice(0)), { subset: true });
      } catch (e) {
        console.warn('Error embedding Noto Sans font:', e);
      }
    }

    // Build pages based on pagesConfig
    for (let i = 0; i < pagesConfig.length; i++) {
      const pageInfo = pagesConfig[i];
      const [copiedPage] = await outputDoc.copyPages(srcDoc, [pageInfo.originalPageIndex]);
      
      // Apply rotation
      const currentRot = copiedPage.getRotation().angle;
      const targetRot = (currentRot + pageInfo.rotation) % 360;
      copiedPage.setRotation(degrees(targetRot));

      const { width: pWidth, height: pHeight } = copiedPage.getSize();

      // 1. Apply Text Annotations for this page
      const pageTexts = textAnnotations.filter(t => t.pageIndex === i);
      for (const textItem of pageTexts) {
        let fontToUse = embeddedSarabun;
        if (textItem.fontFamily === 'Noto Sans Thai' && embeddedNoto) {
          fontToUse = embeddedNoto;
        } else if (textItem.isBold && embeddedSarabunBold) {
          fontToUse = embeddedSarabunBold;
        } else if (embeddedSarabun) {
          fontToUse = embeddedSarabun;
        }

        const color = this.hexToRgb(textItem.color || '#000000');
        const fontSize = Math.max(6, Number(textItem.fontSize) || 14);
        const opacity = Math.max(0, Math.min(1, textItem.opacity ?? 1));
        const lineHeightMultiplier = textItem.lineHeight ?? 1.2;
        const lineSpacing = fontSize * lineHeightMultiplier;
        const lines = (textItem.text || '').split('\n');

        if (fontToUse) {
          lines.forEach((line, lineIdx) => {
            if (!line) return;
            const lineX = textItem.x;
            const lineY = pHeight - (textItem.y + fontSize * 0.8) - (lineIdx * lineSpacing);

            try {
              copiedPage.drawText(line, {
                x: lineX,
                y: lineY,
                size: fontSize,
                font: fontToUse,
                color: rgb(color.r, color.g, color.b),
                opacity: opacity,
              });

              let lineWidth = fontSize * line.length * 0.5;
              try {
                lineWidth = fontToUse.widthOfTextAtSize(line, fontSize);
              } catch (_) {}

              // Underline
              if (textItem.isUnderline) {
                copiedPage.drawLine({
                  start: { x: lineX, y: lineY - 2 },
                  end: { x: lineX + lineWidth, y: lineY - 2 },
                  color: rgb(color.r, color.g, color.b),
                  thickness: Math.max(0.75, fontSize * 0.06),
                  opacity: opacity,
                });
              }

              // Strikethrough
              if (textItem.isStrikethrough) {
                copiedPage.drawLine({
                  start: { x: lineX, y: lineY + (fontSize * 0.35) },
                  end: { x: lineX + lineWidth, y: lineY + (fontSize * 0.35) },
                  color: rgb(color.r, color.g, color.b),
                  thickness: Math.max(0.75, fontSize * 0.06),
                  opacity: opacity,
                });
              }
            } catch (lineErr) {
              console.warn('Error drawing text line:', lineErr);
            }
          });
        }
      }

      // 2. Apply Image Annotations for this page
      const pageImages = imageAnnotations.filter(img => img.pageIndex === i);
      for (const imgItem of pageImages) {
        try {
          let embeddedImage;
          if (imgItem.mimeType === 'image/png') {
            embeddedImage = await outputDoc.embedPng(imgItem.imageDataUrl);
          } else {
            embeddedImage = await outputDoc.embedJpg(imgItem.imageDataUrl);
          }

          const yPdf = pHeight - imgItem.y - imgItem.height;
          copiedPage.drawImage(embeddedImage, {
            x: imgItem.x,
            y: yPdf,
            width: imgItem.width,
            height: imgItem.height,
          });
        } catch (e) {
          console.error('Failed to embed image annotation:', e);
        }
      }

      // 3. Apply Shape Annotations for this page
      const pageShapes = shapeAnnotations.filter(s => s.pageIndex === i);
      for (const shape of pageShapes) {
        const strokeColor = this.parseColor(shape.color) || { r: 0, g: 0, b: 0, a: 1 };
        const fillColor = this.parseColor(shape.fillColor);
        const yPdf = pHeight - shape.y - shape.height;
        const baseOpacity = Math.max(0, Math.min(1, shape.opacity ?? 1));

        if (shape.type === 'rect') {
          copiedPage.drawRectangle({
            x: shape.x,
            y: yPdf,
            width: shape.width,
            height: shape.height,
            borderColor: shape.strokeWidth > 0 ? rgb(strokeColor.r, strokeColor.g, strokeColor.b) : undefined,
            borderWidth: shape.strokeWidth,
            borderOpacity: baseOpacity * strokeColor.a,
            color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
            opacity: fillColor ? baseOpacity * fillColor.a : undefined,
          });
        } else if (shape.type === 'circle' || shape.type === 'ellipse') {
          const xCenter = shape.x + shape.width / 2;
          const yCenter = yPdf + shape.height / 2;
          const xRadius = shape.width / 2;
          const yRadius = shape.height / 2;

          copiedPage.drawEllipse({
            x: xCenter,
            y: yCenter,
            xScale: xRadius,
            yScale: yRadius,
            borderColor: shape.strokeWidth > 0 ? rgb(strokeColor.r, strokeColor.g, strokeColor.b) : undefined,
            borderWidth: shape.strokeWidth,
            borderOpacity: baseOpacity * strokeColor.a,
            color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
            opacity: fillColor ? baseOpacity * fillColor.a : undefined,
          });
        } else if (shape.type === 'stamp') {
          // Draw stamp border & background
          copiedPage.drawRectangle({
            x: shape.x,
            y: yPdf,
            width: shape.width,
            height: shape.height,
            borderColor: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
            borderWidth: Math.max(1.5, shape.strokeWidth),
            borderOpacity: baseOpacity,
            color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : rgb(1, 0.9, 0.9),
            opacity: fillColor ? baseOpacity * fillColor.a : baseOpacity * 0.7,
          });

          // Draw stamp text centered
          const stampText = shape.text || 'STAMP';
          const fontSize = shape.fontSize || 18;
          const fontToUse = embeddedSarabunBold || embeddedSarabun;
          if (fontToUse) {
            try {
              const textWidth = fontToUse.widthOfTextAtSize(stampText, fontSize);
              const textX = shape.x + (shape.width - textWidth) / 2;
              const textY = yPdf + (shape.height - fontSize * 0.8) / 2;
              copiedPage.drawText(stampText, {
                x: Math.max(shape.x + 2, textX),
                y: textY,
                size: fontSize,
                font: fontToUse,
                color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
                opacity: baseOpacity,
              });
            } catch (_) {}
          }
        } else if (shape.type === 'note') {
          // Sticky note background
          copiedPage.drawRectangle({
            x: shape.x,
            y: yPdf,
            width: shape.width,
            height: shape.height,
            borderColor: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
            borderWidth: 1,
            borderOpacity: baseOpacity,
            color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : rgb(0.99, 0.94, 0.54),
            opacity: fillColor ? baseOpacity * fillColor.a : baseOpacity * 0.95,
          });

          // Note top bar
          copiedPage.drawRectangle({
            x: shape.x,
            y: yPdf + shape.height - 14,
            width: shape.width,
            height: 14,
            color: rgb(0.98, 0.8, 0.08),
            opacity: baseOpacity * 0.5,
          });

          // Note text
          const noteText = shape.text || 'โน้ตย่อ';
          const fontSize = shape.fontSize || 12;
          const fontToUse = embeddedSarabun;
          if (fontToUse) {
            try {
              copiedPage.drawText(noteText, {
                x: shape.x + 6,
                y: yPdf + shape.height - 26,
                size: fontSize,
                font: fontToUse,
                color: rgb(0.2, 0.1, 0),
                opacity: baseOpacity,
              });
            } catch (_) {}
          }
        } else if (shape.type === 'highlight') {
          const hlColor = fillColor || { r: 0.98, g: 0.8, b: 0.08, a: 0.45 };
          copiedPage.drawRectangle({
            x: shape.x,
            y: yPdf,
            width: shape.width,
            height: shape.height,
            color: rgb(hlColor.r, hlColor.g, hlColor.b),
            opacity: baseOpacity * (hlColor.a || 0.45),
          });
        } else if (shape.type === 'underline') {
          copiedPage.drawLine({
            start: { x: shape.x, y: yPdf + 2 },
            end: { x: shape.x + shape.width, y: yPdf + 2 },
            color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
            thickness: Math.max(1, shape.strokeWidth),
            opacity: baseOpacity,
          });
        } else if (shape.type === 'strikethrough') {
          copiedPage.drawLine({
            start: { x: shape.x, y: yPdf + shape.height / 2 },
            end: { x: shape.x + shape.width, y: yPdf + shape.height / 2 },
            color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
            thickness: Math.max(1, shape.strokeWidth),
            opacity: baseOpacity,
          });
        } else if (shape.type === 'line' || shape.type === 'arrow') {
          copiedPage.drawLine({
            start: { x: shape.x, y: yPdf + shape.height / 2 },
            end: { x: shape.x + shape.width, y: yPdf + shape.height / 2 },
            color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
            thickness: Math.max(1, shape.strokeWidth),
            opacity: baseOpacity,
          });
          if (shape.type === 'arrow') {
            // Draw arrowhead
            const arrowTipX = shape.x + shape.width;
            const arrowTipY = yPdf + shape.height / 2;
            const arrowSize = 8;
            copiedPage.drawLine({
              start: { x: arrowTipX - arrowSize, y: arrowTipY + arrowSize / 1.5 },
              end: { x: arrowTipX, y: arrowTipY },
              color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
              thickness: Math.max(1, shape.strokeWidth),
              opacity: baseOpacity,
            });
            copiedPage.drawLine({
              start: { x: arrowTipX - arrowSize, y: arrowTipY - arrowSize / 1.5 },
              end: { x: arrowTipX, y: arrowTipY },
              color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
              thickness: Math.max(1, shape.strokeWidth),
              opacity: baseOpacity,
            });
          }
        }
      }

      // 4. Apply Drawing / Pen Annotations
      const pageDrawings = drawingAnnotations.filter(d => d.pageIndex === i);
      for (const drawing of pageDrawings) {
        if (drawing.points.length < 2) continue;
        const color = this.hexToRgb(drawing.color);

        for (let pt = 0; pt < drawing.points.length - 1; pt++) {
          const p1 = drawing.points[pt];
          const p2 = drawing.points[pt + 1];

          copiedPage.drawLine({
            start: { x: p1.x, y: pHeight - p1.y },
            end: { x: p2.x, y: pHeight - p2.y },
            color: rgb(color.r, color.g, color.b),
            thickness: drawing.strokeWidth,
          });
        }
      }

      // 5. Apply Edited / Redacted Extracted Text Blocks
      const pageExtracted = extractedTextBlocks.filter(b => b.pageIndex === i);
      for (const block of pageExtracted) {
        if (block.isEdited || block.isDeleted) {
          try {
            // Cover original text with white rectangle (redaction)
            copiedPage.drawRectangle({
              x: Math.max(0, Number(block.x) - 2),
              y: Math.max(0, Number(block.pdfY) - 2),
              width: Math.max(10, Number(block.width) + 4),
              height: Math.max(10, Number(block.height) + 4),
              color: rgb(1, 1, 1),
            });

            // If edited and not deleted, draw the new updated text
            if (!block.isDeleted && block.text && block.text.trim().length > 0) {
              let fontToUse = embeddedSarabun;
              if (block.fontFamily === 'Noto Sans Thai' && embeddedNoto) {
                fontToUse = embeddedNoto;
              } else if (block.isBold && embeddedSarabunBold) {
                fontToUse = embeddedSarabunBold;
              } else if (embeddedSarabun) {
                fontToUse = embeddedSarabun;
              }

              const color = this.hexToRgb(block.color || '#000000');
              const fontSize = Math.max(8, Number(block.fontSize) || 14);
              const opacity = Math.max(0, Math.min(1, block.opacity ?? 1));
              const lineHeightMultiplier = block.lineHeight ?? 1.2;
              const lineSpacing = fontSize * lineHeightMultiplier;
              const lines = block.text.split('\n');

              if (fontToUse) {
                lines.forEach((line, lineIdx) => {
                  if (!line) return;
                  const lineY = Math.max(0, Number(block.pdfY) - (lineIdx * lineSpacing));
                  const lineX = Math.max(0, Number(block.x));

                  try {
                    copiedPage.drawText(line, {
                      x: lineX,
                      y: lineY,
                      size: fontSize,
                      font: fontToUse,
                      color: rgb(color.r, color.g, color.b),
                      opacity: opacity,
                    });

                    let lineWidth = fontSize * line.length * 0.5;
                    try {
                      lineWidth = fontToUse.widthOfTextAtSize(line, fontSize);
                    } catch (_) {}

                    // Underline
                    if (block.isUnderline) {
                      copiedPage.drawLine({
                        start: { x: lineX, y: lineY - 2 },
                        end: { x: lineX + lineWidth, y: lineY - 2 },
                        color: rgb(color.r, color.g, color.b),
                        thickness: Math.max(0.75, fontSize * 0.06),
                        opacity: opacity,
                      });
                    }

                    // Strikethrough
                    if (block.isStrikethrough) {
                      copiedPage.drawLine({
                        start: { x: lineX, y: lineY + (fontSize * 0.35) },
                        end: { x: lineX + lineWidth, y: lineY + (fontSize * 0.35) },
                        color: rgb(color.r, color.g, color.b),
                        thickness: Math.max(0.75, fontSize * 0.06),
                        opacity: opacity,
                      });
                    }
                  } catch (lineErr) {
                    console.warn('Error drawing extracted text line:', lineErr);
                  }
                });
              }
            }
          } catch (blockErr) {
            console.warn('Warning: could not draw text block:', blockErr);
          }
        }
      }

      outputDoc.addPage(copiedPage);
    }

    // 1. Copy original metadata from srcDoc so saving/exporting never wipes it out
    try {
      const srcTitle = srcDoc.getTitle();
      if (srcTitle && srcTitle.trim()) outputDoc.setTitle(srcTitle.trim());

      const srcAuthor = srcDoc.getAuthor();
      if (srcAuthor && srcAuthor.trim()) outputDoc.setAuthor(srcAuthor.trim());

      const srcSubject = srcDoc.getSubject();
      if (srcSubject && srcSubject.trim()) outputDoc.setSubject(srcSubject.trim());

      const srcKeywords = srcDoc.getKeywords();
      if (srcKeywords) {
        if (typeof srcKeywords === 'string' && srcKeywords.trim()) {
          outputDoc.setKeywords(srcKeywords.split(/[,;]+/).map(k => k.trim()).filter(Boolean));
        } else if (Array.isArray(srcKeywords) && srcKeywords.length > 0) {
          outputDoc.setKeywords(srcKeywords);
        }
      }

      const srcCreator = srcDoc.getCreator();
      if (srcCreator && srcCreator.trim()) outputDoc.setCreator(srcCreator.trim());

      const srcProducer = srcDoc.getProducer();
      if (srcProducer && srcProducer.trim()) outputDoc.setProducer(srcProducer.trim());

      const srcCreationDate = srcDoc.getCreationDate();
      if (srcCreationDate) outputDoc.setCreationDate(srcCreationDate);
    } catch (srcMetaErr) {
      console.warn('Could not copy original metadata from srcDoc:', srcMetaErr);
    }

    // 2. Overlay with user-edited metadata if provided (only non-empty values)
    if (metadata) {
      try {
        if (metadata.title && metadata.title.trim()) outputDoc.setTitle(metadata.title.trim());
        if (metadata.author && metadata.author.trim()) outputDoc.setAuthor(metadata.author.trim());
        if (metadata.subject && metadata.subject.trim()) outputDoc.setSubject(metadata.subject.trim());
        if (metadata.keywords && metadata.keywords.trim()) {
          const kwArray = metadata.keywords.split(/[,;]+/).map(k => k.trim()).filter(Boolean);
          outputDoc.setKeywords(kwArray);
        }
        if (metadata.creator && metadata.creator.trim()) outputDoc.setCreator(metadata.creator.trim());
        if (metadata.producer && metadata.producer.trim()) outputDoc.setProducer(metadata.producer.trim());
        outputDoc.setModificationDate(new Date());
      } catch (metaErr) {
        console.warn('Could not apply metadata to output document:', metaErr);
      }
    }

    return await outputDoc.save();
  }

  /**
   * Helper: Parse Hex / RGB / RGBA to { r, g, b, a } 0..1
   */
  private static parseColor(colorStr?: string): { r: number; g: number; b: number; a: number } | null {
    if (!colorStr || colorStr === 'transparent') return null;
    const s = colorStr.trim();
    if (s.startsWith('#')) {
      const cleanHex = s.replace('#', '');
      if (cleanHex.length === 3) {
        const r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
        const g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
        const b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
        return { r, g, b, a: 1 };
      }
      const bigint = parseInt(cleanHex.slice(0, 6), 16);
      if (isNaN(bigint)) return { r: 0, g: 0, b: 0, a: 1 };
      const r = ((bigint >> 16) & 255) / 255;
      const g = ((bigint >> 8) & 255) / 255;
      const b = (bigint & 255) / 255;
      let a = 1;
      if (cleanHex.length === 8) {
        a = parseInt(cleanHex.slice(6, 8), 16) / 255;
      }
      return { r, g, b, a };
    }
    if (s.startsWith('rgba') || s.startsWith('rgb')) {
      const match = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        const r = Math.min(255, Math.max(0, parseInt(match[1], 10))) / 255;
        const g = Math.min(255, Math.max(0, parseInt(match[2], 10))) / 255;
        const b = Math.min(255, Math.max(0, parseInt(match[3], 10))) / 255;
        const a = match[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(match[4]))) : 1;
        return { r, g, b, a };
      }
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  /**
   * Helper: Hex to RGB 0..1
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const parsed = this.parseColor(hex);
    if (!parsed) return { r: 0, g: 0, b: 0 };
    return { r: parsed.r, g: parsed.g, b: parsed.b };
  }

  /**
   * Trigger browser file download
   */
  static downloadFile(data: Uint8Array, fileName: string): void {
    const blob = new Blob([data as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
