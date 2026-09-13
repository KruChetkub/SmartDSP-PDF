# OpenJPDF Web - โปรแกรมแก้ไข PDF ภาษาไทย (Web Edition)

[![Platform](https://img.shields.io/badge/Platform-Web%20Browser-blue.svg)](https://vitejs.dev)
[![Framework](https://img.shields.io/badge/Framework-React%20%2B%20Vite%20%2B%20TypeScript-61DAFB.svg)](https://react.dev)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel%20Ready-black.svg)](https://vercel.com)
[![License](https://img.shields.io/badge/License-AGPLv3-green.svg)](LICENSE)

**OpenJPDF Web** คือโปรแกรมแก้ไขและจัดการไฟล์ PDF ภาษาไทยเวอร์ชันเว็บ ดัดแปลงจากโปรเจกต์ OpenJPDF (WPF/.NET 8) ให้สามารถทำงานบน **Web Browser** ได้อย่างสมบูรณ์แบบ รองรับทุกระบบปฏิบัติการ (Linux, Windows, macOS, ChromeOS)

---

## ✨ คุณสมบัติเด่น (Key Features)

- 🔒 **ความเป็นส่วนตัว 100% (Client-Side Only):** ประมวลผลเอกสาร PDF บน RAM ของเครื่องผู้ใช้โดยตรง ไม่มีการส่งไฟล์ไปที่เซิร์ฟเวอร์ภายนอก ปลอดภัยสำหรับเอกสารสำคัญ
- 🇹🇭 **รองรับฟอนต์ภาษาไทยสมบูรณ์:** มาพร้อมฟอนต์ TH Sarabun New และ Noto Sans Thai พิมพ์ภาษาไทยสระไม่ลอย/ไม่จม
- ✏️ **แก้ไขและเพิ่มเนื้อหา (Annotations):**
  - เพิ่มข้อความภาษาไทย ปรับขนาดตัวอักษร สี และฟอนต์
  - แทรกรูปภาพ (PNG, JPG) ปรับขนาดและตำแหน่งได้
  - วาดเขียนด้วยปากกา (Freehand Drawing)
  - รูปร่าง: สี่เหลี่ยม, วงกลม, เส้นตรง
- 📑 **เครื่องมือจัดการหน้าเอกสาร (Page Tools):**
  - หมุนหน้าเอกสาร 90° ซ้าย/ขวา
  - ทำสำเนาหน้า (Duplicate Page)
  - ลบหน้าเอกสารที่ไม่ต้องการ
  - แสดงตัวอย่างหน้า (Page Thumbnails Sidebar)
- 🔀 **เครื่องมือรวมและแยกไฟล์ (PDF Tools):**
  - **รวม PDF (Merge):** รวมหลายไฟล์ PDF เข้าเป็นไฟล์เดียว พร้อมจัดลำดับก่อน-หลัง
  - **แยก PDF (Split):** แยกทุกหน้า หรือเลือกดึงเฉพาะช่วงหน้าที่ต้องการ (เช่น 1-3 หรือ 1, 4)
- 🖥️ **โหมดนำเสนอ (Presentation Mode):** กด F5 เพื่อแสดงเอกสารเต็มจอ
- ⌨️ **รองรับคีย์ลัดมาตรฐาน:** `Ctrl+O` (เปิดไฟล์), `Ctrl+S` (บันทึก), `Ctrl+L` / `Ctrl+R` (หมุนหน้า), `Ctrl+D` (สำเนาหน้า), `Delete` (ลบ)

---

## 🚀 วิธีเปิดใช้งานในเครื่อง (Local Development)

### ความต้องการของระบบ
- **Node.js**: เวอร์ชัน 18 ขึ้นไป
- **npm**: เวอร์ชัน 9 ขึ้นไป

### ขั้นตอนการรัน
```bash
# 1. เข้าสู่โฟลเดอร์ openjpdf-web
cd openjpdf-web

# 2. ติดตั้ง dependencies (ทำครั้งแรก)
npm install

# 3. รันเซิร์ฟเวอร์ทดสอบ
npm run dev
```

เปิดเบราว์เซอร์แล้วไปที่: `http://localhost:3000` (หรือ URL ที่แสดงในหน้าจอ Terminal)

### ทดสอบการ Build สำหรับ Production
```bash
npm run build
```

---

## 🌐 วิธีนำขึ้น GitHub และ Deploy บน Vercel

โฟลเดอร์ `openjpdf-web` ถูกออกแบบให้เป็นโปรเจกต์เอกเทศ สามารถสร้างเป็น Git Repository แยกของตัวเองได้ทันที:

### ขั้นตอนที่ 1: นำขึ้น GitHub
```bash
# เข้าสู่โฟลเดอร์ openjpdf-web
cd openjpdf-web

# สร้าง Git Repository
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# บันทึก Commit แรก
git commit -m "Initial commit for OpenJPDF Web"

# ตั้งชื่อ branch เป็น main
git branch -M main

# เชื่อมต่อไปยัง GitHub Repository ของคุณ (สร้าง repo เปล่าบน github.com ก่อน)
git remote add origin https://github.com/YOUR_USERNAME/openjpdf-web.git

# Push โค้ดขึ้น GitHub
git push -u origin main
```

---

### ขั้นตอนที่ 2: เชื่อมต่อและ Deploy บน Vercel
1. ไปที่เว็บไซต์ [vercel.com](https://vercel.com) แล้วเข้าสู่ระบบ
2. กดปุ่ม **"Add New..."** → เลือก **"Project"**
3. เลือก Repository `openjpdf-web` จากบัญชี GitHub ของคุณ
4. Vercel จะตรวจจับการตั้งค่าให้อัตโนมัติ:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. กดปุ่ม **"Deploy"**
6. ภายใน 15-30 วินาที โปรเจกต์จะถูกบิลด์และออนไลน์ พร้อมมอบ URL (เช่น `https://openjpdf-web.vercel.app`) ให้คุณแชร์และใช้งานได้ทั่วโลกทันที!

---

## 🛠️ เทคโนโลยีที่ใช้

- **Vite 5** - เครื่องมือ Build เครื่องมือ Dev ที่เร็วที่สุด
- **React 18 & TypeScript** - ส่วนติดต่อผู้ใช้ที่เสถียรและปลอดภัย
- **pdf-lib & @pdf-lib/fontkit** - สร้าง แปลง รวม แยก และบันทึกไฟล์ PDF ในเบราว์เซอร์
- **pdfjs-dist (PDF.js)** - ตัวเรนเดอร์ PDF คุณภาพสูงจาก Mozilla
- **Tailwind CSS** - ตกแต่ง UI ทันสมัย สะอาดตา
- **Lucide React** - ไอคอน SVG ทันสมัย

---

## ⚖️ ใบอนุญาต (License)

OpenJPDF Web เผยแพร่ภายใต้ใบอนุญาต **GNU Affero General Public License v3 (AGPLv3)**  
พัฒนาต่อยอดจาก OpenJPDF โดย **สิทธิชาติ โปธิสิงห์ (Sittichat Pothising)**  
*พัฒนาขึ้นเพื่อสร้างประโยชน์ให้แก่สังคมโดยไม่มีค่าใช้จ่าย*

