// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  ArrowUpDown, ArrowUpRight, Baseline, Camera, Check, Circle, Copy, Download,
  Eraser, EyeOff, FilePlus, FolderOpen, Hand, Highlighter, Image as ImageIcon,
  Info, Lock, Maximize, Minimize2, MousePointer2, PenLine, Printer, RotateCcw,
  RotateCw, Save, Search, Share2, Square, Stamp, StickyNote, Strikethrough,
  TextCursor, Trash2, Type, Underline, Unlock, ZoomIn, ZoomOut,
  type LucideIcon,
} from 'lucide-react';
import type { AppLanguage } from '../../../types/settings';
import type { TourChapter, TourTab, TourTool } from '../types/tour';

interface LocalizedText { th: string; en: string }

interface LocalizedTool {
  id: string;
  icon: LucideIcon;
  name: LocalizedText;
  description: LocalizedText;
}

interface LocalizedChapter {
  id: TourTab;
  title: LocalizedText;
  summary: LocalizedText;
  tools: LocalizedTool[];
}

const text = (th: string, en: string): LocalizedText => ({ th, en });

const tool = (
  id: string,
  icon: LucideIcon,
  thName: string,
  enName: string,
  thDescription: string,
  enDescription: string,
): LocalizedTool => ({
  id,
  icon,
  name: text(thName, enName),
  description: text(thDescription, enDescription),
});

const chapters: LocalizedChapter[] = [
  {
    id: 'home',
    title: text('เมนูหน้าหลัก', 'Home menu'),
    summary: text(
      'เริ่มต้นจัดการไฟล์ เลือกเนื้อหา นำทาง ค้นหา และปรับขนาดการแสดงผลของ PDF',
      'Manage files, select content, navigate, search, and adjust the PDF view.',
    ),
    tools: [
      tool('new', FilePlus, 'สร้างใหม่', 'New', 'สร้างเอกสาร PDF เปล่าตามขนาดกระดาษที่ตั้งไว้ เพื่อเริ่มงานใหม่ทันที', 'Create a blank PDF using the configured paper size.'),
      tool('open', FolderOpen, 'เปิด', 'Open', 'เลือกไฟล์ PDF จากเครื่องเพื่อเปิดอ่าน ตรวจสอบ หรือแก้ไขในโปรแกรม', 'Choose a PDF from your device to view or edit.'),
      tool('save', Save, 'บันทึก', 'Save', 'บันทึกการแก้ไขล่าสุดกลับเป็นไฟล์ PDF โดยใช้ชื่อเอกสารปัจจุบัน', 'Save the latest changes using the current document name.'),
      tool('save-as', Download, 'บันทึกเป็น', 'Save as', 'สร้างไฟล์ PDF สำเนาใหม่ เหมาะเมื่อต้องการเก็บต้นฉบับไว้โดยไม่เขียนทับ', 'Create a new PDF copy while keeping the original file unchanged.'),
      tool('print', Printer, 'พิมพ์', 'Print', 'เปิดหน้าต่างพิมพ์ของเบราว์เซอร์ เพื่อเลือกเครื่องพิมพ์ จำนวนสำเนา และช่วงหน้า', 'Open the browser print dialog to choose printer, copies, and page range.'),
      tool('export', Share2, 'ส่งออก', 'Export', 'ประมวลผลการแก้ไขทั้งหมดและดาวน์โหลดเอกสารเป็นไฟล์ PDF พร้อมใช้งาน', 'Process all changes and download the finished PDF.'),
      tool('select', MousePointer2, 'เลือก', 'Select', 'เลือกข้อความ รูปภาพ หรือวัตถุที่เพิ่มไว้ เพื่อย้าย ปรับขนาด หรือแก้ไขคุณสมบัติ', 'Select added text, images, or objects to move, resize, or edit them.'),
      tool('pan', Hand, 'เลื่อนหน้า', 'Pan', 'กดค้างแล้วลากพื้นที่เอกสารเพื่อเลื่อนดูส่วนต่าง ๆ โดยไม่แก้ไขวัตถุ', 'Drag the document canvas to move around without editing objects.'),
      tool('select-text', TextCursor, 'เลือกข้อความ', 'Select text', 'เลือกข้อความเดิมใน PDF สำหรับคัดลอกหรืออ่านรายละเอียดข้อความ', 'Select existing PDF text for copying or closer inspection.'),
      tool('snapshot', Camera, 'สแนปช็อต', 'Snapshot', 'ลากครอบบริเวณที่ต้องการบนหน้า PDF เพื่อจับเป็นรูปภาพตามความละเอียดที่ตั้งไว้', 'Drag over an area of the PDF to capture it as an image.'),
      tool('search', Search, 'ค้นหา', 'Search', 'เปิดช่องค้นหาเพื่อพิมพ์คำ แล้วเลื่อนไปยังตำแหน่งที่พบภายในเอกสาร', 'Search for words and move through matches in the document.'),
      tool('zoom-in', ZoomIn, 'ขยาย', 'Zoom in', 'เพิ่มขนาดการแสดงผลเพื่ออ่านข้อความหรือรายละเอียดขนาดเล็กให้ชัดขึ้น', 'Enlarge the document view to inspect small details.'),
      tool('zoom-out', ZoomOut, 'ย่อ', 'Zoom out', 'ลดขนาดการแสดงผลเพื่อมองเห็นพื้นที่ของหน้าเอกสารได้กว้างขึ้น', 'Reduce the document view to see more of the page.'),
    ],
  },
  {
    id: 'edit',
    title: text('เมนูแก้ไข', 'Edit menu'),
    summary: text('แก้ไขเนื้อหา เพิ่มรูปภาพ และจัดการหน้าของเอกสาร', 'Edit content, insert images, and manage document pages.'),
    tools: [
      tool('edit-text', Baseline, 'แก้ไขข้อความ', 'Edit text', 'เลือกข้อความเดิมบน PDF แล้วแก้เนื้อหา แบบอักษร ขนาด สี และรูปแบบได้โดยตรง', 'Select existing PDF text and edit its content and formatting.'),
      tool('add-text', Type, 'เพิ่มข้อความ', 'Add text', 'คลิกตำแหน่งบนหน้าเพื่อวางกล่องข้อความใหม่ แล้วกำหนดรูปแบบจากแผงคุณสมบัติ', 'Place a new text box on the page and format it in the inspector.'),
      tool('insert-image', ImageIcon, 'แทรกรูปภาพ', 'Insert image', 'เลือกไฟล์ภาพจากเครื่องแล้ววางบนหน้า PDF จากนั้นย้ายและปรับขนาดได้', 'Insert an image file, then move and resize it on the PDF.'),
      tool('rotate-left', RotateCcw, 'หมุนซ้าย', 'Rotate left', 'หมุนหน้าปัจจุบันทวนเข็มนาฬิกา 90 องศา', 'Rotate the current page 90 degrees counterclockwise.'),
      tool('rotate-right', RotateCw, 'หมุนขวา', 'Rotate right', 'หมุนหน้าปัจจุบันตามเข็มนาฬิกา 90 องศา', 'Rotate the current page 90 degrees clockwise.'),
      tool('duplicate-page', Copy, 'คัดลอกหน้า', 'Duplicate page', 'สร้างสำเนาของหน้าปัจจุบันและเพิ่มต่อจากหน้าต้นฉบับ', 'Create a copy of the current page after the original.'),
      tool('delete-page', Trash2, 'ลบหน้า', 'Delete page', 'ลบหน้าปัจจุบันออกจากเอกสาร ควรตรวจสอบหน้าที่เลือกก่อนยืนยัน', 'Remove the current page after confirming the selected page.'),
      tool('blank-page', FilePlus, 'หน้าเปล่า', 'Blank page', 'เพิ่มหน้าเปล่าใหม่ตามขนาดกระดาษที่ตั้งค่าไว้', 'Insert a blank page using the configured paper size.'),
      tool('reverse-pages', ArrowUpDown, 'กลับด้าน', 'Reverse pages', 'กลับลำดับหน้าทั้งเอกสารจากท้ายไปต้น เหมาะกับไฟล์ที่สแกนเรียงย้อนกลับ', 'Reverse all document pages when a scan is ordered backward.'),
    ],
  },
  {
    id: 'comment',
    title: text('เมนูความคิดเห็น', 'Comment menu'),
    summary: text('เพิ่มคำอธิบาย มาร์กอัป รูปร่าง และตราประทับสำหรับการตรวจทาน', 'Add notes, markup, shapes, and stamps for review.'),
    tools: [
      tool('note', StickyNote, 'โน้ต', 'Note', 'เพิ่มโน้ตบนหน้าปัจจุบันเพื่อบันทึกข้อสังเกตหรือข้อความสำหรับผู้ตรวจทาน', 'Add a note for observations or reviewer messages.'),
      tool('highlight', Highlighter, 'ไฮไลต์', 'Highlight', 'ทำเครื่องหมายข้อความหรือพื้นที่สำคัญด้วยสีเน้น เพื่อให้มองเห็นได้รวดเร็ว', 'Mark important text or areas with a visible highlight.'),
      tool('underline', Underline, 'ขีดเส้นใต้', 'Underline', 'ขีดเส้นใต้ส่วนที่ต้องการเน้น โดยยังคงอ่านข้อความเดิมได้ชัดเจน', 'Underline content that needs emphasis while keeping it readable.'),
      tool('strikethrough', Strikethrough, 'ขีดฆ่า', 'Strikethrough', 'ทำเครื่องหมายข้อความที่ควรลบหรือไม่ใช้งาน โดยไม่ลบเนื้อหาต้นฉบับทันที', 'Mark text proposed for removal without deleting the original.'),
      tool('rectangle', Square, 'สี่เหลี่ยม', 'Rectangle', 'วางกรอบสี่เหลี่ยมเพื่อระบุพื้นที่หรือข้อมูลที่ต้องการให้ตรวจสอบ', 'Place a rectangle around an area that needs attention.'),
      tool('circle', Circle, 'วงกลม', 'Circle', 'วางวงกลมเพื่อเน้นจุดสำคัญหรือรายการเฉพาะบนหน้า', 'Circle a specific point or item on the page.'),
      tool('ellipse', Circle, 'วงรี', 'Ellipse', 'วางวงรีเพื่อครอบพื้นที่แนวตั้งหรือแนวนอนตามรูปแบบของเนื้อหา', 'Place an ellipse around vertical or horizontal content.'),
      tool('arrow', ArrowUpRight, 'ลูกศร', 'Arrow', 'เพิ่มลูกศรเพื่อชี้จากคำอธิบายไปยังตำแหน่งที่ต้องการสื่อสาร', 'Point from an explanation to a specific location.'),
      tool('stamp', Stamp, 'ตราประทับ', 'Stamp', 'เพิ่มตราประทับ เช่น ตรวจสอบแล้วหรืออนุมัติ เพื่อแสดงสถานะของเอกสาร', 'Add a status stamp such as reviewed or approved.'),
      tool('clear-all', Eraser, 'ลบทั้งหมด', 'Clear all', 'ลบคำอธิบายประกอบที่เพิ่มไว้ทั้งหมด ควรใช้เมื่อแน่ใจว่าไม่ต้องการเก็บมาร์กอัป', 'Remove all added annotations when they are no longer needed.'),
    ],
  },
  {
    id: 'view',
    title: text('เมนูมุมมอง', 'View menu'),
    summary: text('ปรับขนาดจริงและเปิดโหมดนำเสนอสำหรับการอ่านเอกสาร', 'Use actual size or presentation mode for reading.'),
    tools: [
      tool('actual-size', ZoomIn, '100% ขนาดจริง', 'Actual size 100%', 'คืนระดับการซูมเป็น 100% เพื่อดูหน้าเอกสารตามขนาดมาตรฐาน', 'Reset zoom to 100% to view the page at its standard size.'),
      tool('presentation', Maximize, 'เต็มจอ/นำเสนอ', 'Fullscreen / presentation', 'เปิดเอกสารเต็มหน้าจอเพื่อลดสิ่งรบกวน เหมาะสำหรับอ่านหรือนำเสนอ', 'Open the document fullscreen for focused reading or presenting.'),
    ],
  },
  {
    id: 'forms',
    title: text('เมนูฟอร์ม', 'Forms menu'),
    summary: text('เพิ่มลายเซ็นลงในตำแหน่งที่ต้องการบนเอกสาร', 'Add a signature at the required document location.'),
    tools: [
      tool('signature', PenLine, 'ลายเซ็น', 'Signature', 'วาด พิมพ์ หรืออัปโหลดลายเซ็น แล้วนำไปวางและปรับขนาดบนหน้า PDF', 'Draw, type, or upload a signature, then place and resize it on the PDF.'),
    ],
  },
  {
    id: 'security',
    title: text('เมนูความปลอดภัย', 'Security menu'),
    summary: text('ปกปิดข้อมูลสำคัญและควบคุมการเข้าถึงเอกสาร', 'Redact sensitive data and control document access.'),
    tools: [
      tool('mark-redaction', EyeOff, 'ทำเครื่องหมาย', 'Mark redaction', 'ทำกรอบบนข้อมูลที่ต้องการปกปิด ตรวจตำแหน่งให้ถูกต้องก่อนใช้การปกปิดถาวร', 'Mark sensitive areas and verify them before permanent redaction.'),
      tool('apply-redaction', Check, 'ใช้', 'Apply redaction', 'ใช้การปกปิดกับทุกกรอบที่ทำเครื่องหมายไว้ ทำให้ข้อมูลภายในถูกนำออกจากไฟล์ส่งออก', 'Apply all redaction marks so their underlying content is removed.'),
      tool('encrypt', Lock, 'เข้ารหัส', 'Encrypt', 'ตั้งรหัสผ่านและสิทธิ์การใช้งาน เพื่อจำกัดผู้ที่สามารถเปิดหรือแก้ไขเอกสาร', 'Set a password and permissions to restrict document access.'),
      tool('decrypt', Unlock, 'ถอดรหัส', 'Decrypt', 'ป้อนรหัสผ่านที่ถูกต้องเพื่อนำการป้องกันออกและบันทึกเป็น PDF ที่ไม่ล็อก', 'Enter the correct password and save an unlocked PDF.'),
    ],
  },
  {
    id: 'review',
    title: text('เมนูตรวจสอบ', 'Review menu'),
    summary: text('ตรวจสอบข้อมูลประจำเอกสารก่อนบันทึกหรือส่งต่อ', 'Inspect document information before saving or sharing.'),
    tools: [
      tool('metadata', Info, 'ดูข้อมูลเมทาดาทาตรวจสอบ', 'Inspect metadata', 'ดูและแก้ไขชื่อเรื่อง ผู้เขียน หัวเรื่อง คำสำคัญ วันที่ และสถานะความปลอดภัยของ PDF', 'View and edit title, author, subject, keywords, dates, and security status.'),
    ],
  },
  {
    id: 'tools',
    title: text('เมนูเครื่องมือ', 'Tools menu'),
    summary: text('ใช้เครื่องมือเพิ่มเติมเพื่อปรับปรุงและจัดการไฟล์ PDF', 'Use additional tools to optimize and manage PDFs.'),
    tools: [
      tool('compress', Minimize2, 'ลดขนาดไฟล์ PDF', 'Compress PDF', 'ลดขนาดไฟล์เพื่อส่งต่อหรือจัดเก็บได้สะดวกขึ้น โดยเลือกระดับคุณภาพที่เหมาะสม', 'Reduce file size for easier sharing or storage at the preferred quality.'),
    ],
  },
];

const localize = (value: LocalizedText, language: AppLanguage) => value[language];

export const getTourChapters = (language: AppLanguage): TourChapter[] => (
  chapters.map((chapter) => ({
    id: chapter.id,
    tab: chapter.id,
    title: localize(chapter.title, language),
    summary: localize(chapter.summary, language),
    tools: chapter.tools.map<TourTool>((item) => ({
      id: item.id,
      targetId: `tour-tool-${chapter.id}-${item.id}`,
      name: localize(item.name, language),
      description: localize(item.description, language),
      icon: item.icon,
    })),
  }))
);
