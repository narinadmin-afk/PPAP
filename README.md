# PPAP Management System (ระบบบริหารจัดการ PPAP มาตรฐานยานยนต์ IATF 16949)

**PPAP Management System** เป็นเว็บแอปพลิเคชันระดับองค์กร (Enterprise Automotive Quality Application) พัฒนาตามข้อกำหนดมาตรฐาน **IATF 16949:2016** และ **AIAG PPAP Manual 4th Edition / AIAG-VDA FMEA 1st Edition** เพื่อช่วยวิศวกรฝ่ายประกันและควบคุมคุณภาพ (QA/QC), วิศวกรฝ่ายผลิต (Production Engineer), วิศวกร R&D และ Supplier Quality Engineer ในการจัดทำ ติดตาม และอนุมัติเอกสาร PPAP ทั้ง 18 Elements ได้อย่างมีประสิทธิภาพ

---

## 🚀 ฟังก์ชันหลักของระบบ (Core Capabilities)

1. **Dashboard & Real-time Analytics**
   - KPI สรุปผลรวม: Total PPAP Projects, Pending Review, Approved, Rejected, Incomplete Documents, Compliance Rate (%)
   - กราฟสัดส่วนการส่งมอบตาม PPAP Levels (Level 1 ถึง Level 5)
   - การติดตามกำหนดส่งมอบ (Upcoming Submission Deadlines) พร้อมระบบนับถอยหลังเตือนล่วงหน้า
   - ประวัติกิจกรรมล่าสุดและการบันทึก Audit Trail ตามข้อกำหนด IATF 16949 Section 7.5.3

2. **PPAP Project Management (ระบบจัดการโครงการ PPAP)**
   - สร้าง แก้ไข ค้นหา กรอง และลบโครงการ PPAP
   - ข้อมูลโครงการครบถ้วน: Project Number, Customer Name, Supplier Name, Part Name, Part Number, Drawing Number, Engineering Change Level (ECL), Manufacturing Location, PPAP Submission Level (1-5), Submission Reason, Target Date, Responsible Engineer
   - แถบแสดงความพร้อมของเอกสาร (Readiness Score %)

3. **PPAP 18 Elements Management Hub (ศูนย์จัดการเอกสารทั้ง 18 รายการ)**
   - จัดการเอกสารทั้ง 18 Elements ตามมาตรฐาน AIAG:
     1. Design Records
     2. Engineering Change Documents
     3. Customer Engineering Approval
     4. Design FMEA (DFMEA)
     5. Process Flow Diagram
     6. Process FMEA (PFMEA)
     7. Control Plan
     8. Measurement System Analysis (MSA)
     9. Dimensional Results
     10. Material / Performance Test Results
     11. Initial Process Studies (Cpk / Ppk >= 1.67)
     12. Qualified Laboratory Documentation (ISO/IEC 17025)
     13. Appearance Approval Report (AAR)
     14. Sample Production Parts
     15. Master Sample
     16. Checking Aids / Fixtures
     17. Customer-Specific Requirements (CSR / IMDS)
     18. Part Submission Warrant (PSW)
   - แสดงสถานะข้อกำหนดตาม Level (S = Submit to OEM, R = Retain at Supplier, * = Customer Specific, NA = Not Applicable)
   - Revision Control (Rev 0, Rev A, Rev B...), Upload/Download ไฟล์แนบ, และประวัติการแก้ไข

4. **AI Document Generator (ผู้ช่วย AI อัจฉริยะ)**
   - ขับเคลื่อนด้วย Gemini API (`gemini-3.8-flash`) พร้อม Fallback สำหรับงานวิศวกรรมยานยนต์
   - รองรับการสร้างร่างเอกสาร: PFMEA, Process Flow, Control Plan, Work Instruction, Inspection Standard, Dimensional Report, MSA Report, PSW
   - สร้างเนื้อหาในตารางที่สามารถตรวจทานและแก้ไขได้ก่อนกด Apply เข้าสู่โครงการ
   - **กฎความถูกต้อง:** AI จะไม่สร้างผลการวัดจริงขึ้นมาเอง หากไม่มีข้อมูลจริงจะระบุสถานะ "Pending Verification / รอการตรวจสอบชิ้นงานจริง" ตามมาตรฐานการ Audit

5. **PFMEA Generator & Matrix (AIAG & VDA FMEA)**
   - โครงสร้างคอลัมน์มาตรฐาน: Process Step, Function, Failure Mode, Effect, Cause, Prevention Control, Detection Control, Severity (S), Occurrence (O), Detection (D)
   - คำนวณ Action Priority (AP: High / Medium / Low) อัตโนมัติแบบ Real-time
   - กรองเฉพาะ High AP สำหรับการวางมาตรการแก้ไขเร่งด่วน

6. **Process Flow Diagram Generator**
   - แผนภูมิกระบวนการผลิตด้วยสัญลักษณ์มาตรฐานยานยนต์ (Operation ○, Inspection □, Transport →, Storage ▽, Delay D)
   - ลำดับขั้นตอน (OP 10, OP 20...) พร้อมเครื่องจักรและพารามิเตอร์วิกฤต
   - ส่งออกเป็น PDF และซิงค์ขั้นตอนไปยัง Control Plan / PFMEA อัตโนมัติ

7. **Control Plan Generator (แผนควบคุมกระบวนการผลิต)**
   - จัดทำ Control Plan ระบุ Process No, Machine, Product Characteristic, Process Characteristic, Special Characteristic (Critical ▽, Major ◇, Minor), Spec/Tolerance, Measurement Technique, Sample Size, Frequency, Control Method, Reaction Plan
   - ฟังก์ชัน Auto-Sync ดึงข้อมูลจาก Process Flow และ PFMEA โดยตรง

8. **Dimensional Inspection Report (บันทึกผลการตรวจสอบมิติ)**
   - กำหนดหมายเลข Balloon, Drawing Requirement, Specification, Upper/Lower Tolerance Limits
   - บันทึกผลการวัดชิ้นงานทดลองผลิต 5 ตัวอย่าง (Sample 1-5)
   - คำนวณค่า Mean, Min, Max และตัดสินผล PASS / FAIL อัตโนมัติ
   - รองรับการ Import ข้อมูลจาก Excel (.xlsx) และ Export เป็น Excel / PDF

9. **Part Submission Warrant (PSW)**
   - แบบฟอร์มใบรับรองการส่งมอบชิ้นงานตามมาตรฐาน AIAG 4th Edition
   - ตรวจสอบรายการผลการทดสอบ (Dimensional, Material, Performance, Appearance, IMDS)
   - ระบบลงนามอิเล็กทรอนิกส์ (Digital Sign-off) สำหรับ QA Manager และบันทึกผลการพิจารณาจากลูกค้า (OEM Disposition)

10. **PPAP Completeness Checker (ตรวจสอบความครบถ้วน)**
    - วิเคราะห์ความครบถ้วนตาม Submission Level 1-5
    - ตรวจสอบเอกสารที่ยังขาด เอกสารรอการอนุมัติ และเอกสารที่ถูก Reject
    - ส่งออก PPAP Checklist (Excel)

11. **Export Document Package (ส่งออกเอกสารครบวงจร)**
    - **Complete PPAP Package (ZIP):** รวมเอกสาร PSW (PDF), Process Flow (PDF), PFMEA (Excel), Control Plan (Excel), Dimensional Report (PDF/Excel) และ Master Checklist ไว้ในไฟล์ ZIP เดียวกัน
    - ส่งออกเอกสารแยกรายการทั้งรูปแบบ Excel (.xlsx) และ PDF (.pdf)

12. **Role-Based Access Control & Multi-Language**
    - กำหนดสิทธิ์: Administrator, Quality Manager, Quality Engineer, Production Engineer, R&D Engineer, Inspector, Viewer
    - รองรับ 3 ภาษา: ภาษาไทย (TH), ภาษาอังกฤษ (EN), ภาษาจีน (ZH)

---

## 🛠️ สถาปัตยกรรมระบบ (System Architecture)

```
[ Frontend: React + TypeScript + Tailwind CSS ]
         | (REST API / JSON)
[ Backend: Node.js + Express (server.ts) ]
    ├── API Router (/server/routes.ts)
    ├── AI Engine (/server/ai.ts with @google/genai & domain fallback)
    └── Persistent Database Engine (/server/db.ts -> data/ppap_store.json)
```

---

## 📦 การติดตั้งและการรันระบบ (Installation & Setup)

### 1. Requirements
- Node.js >= 20.x
- npm >= 10.x

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. กำหนดค่า Environment Variables (.env)
สร้างไฟล์ `.env` โดยอ้างอิงจาก `.env.example`:
```bash
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```
*(หากไม่มี API Key ระบบจะมี Intelligent Automotive Fallback Engine รองรับการสร้างเอกสารอัตโนมัติ)*

### 4. รันในโหมด Development
```bash
npm run dev
```
เข้าใช้งานผ่านเบราว์เซอร์ที่: `http://localhost:3000`

### 5. Build สำหรับ Production
```bash
npm run build
npm start
```

### 6. การ Deploy บน Render (Render.com Web Service)
เมื่อ Deploy บน Render ให้ตั้งค่าใน Dashboard ดังนี้:
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `GEMINI_API_KEY`: *(ระบุ API Key ของคุณ)*

> หมายเหตุ: ใน `package.json` ได้เพิ่ม `"prestart": "npm run build"` ไว้แล้ว เพื่อรับประกันว่าหาก Render รัน `npm start` ระบบจะ Build `dist/index.html` ให้อัตโนมัติเสมอ ป้องกันข้อผิดพลาด `ENOENT: no such file or directory, stat '.../dist/index.html'`

---

## 📑 API Endpoints Reference

| Method | Endpoint | รายละเอียด |
|---|---|---|
| `GET` | `/api/dashboard/stats` | ดึงข้อมูลสถิติภาพรวม แดชบอร์ด และกำหนดการส่งมอบ |
| `GET` | `/api/projects` | ดึงรายการโครงการ PPAP ทั้งหมด (รองรับ filter status, level, search) |
| `POST` | `/api/projects` | สร้างโครงการ PPAP ใหม่ |
| `GET` | `/api/projects/:id` | ดึงรายละเอียดโครงการและ 18 Elements |
| `PUT` | `/api/projects/:id` | แก้ไขข้อมูลโครงการ |
| `DELETE`| `/api/projects/:id` | ลบโครงการ |
| `PUT` | `/api/projects/:id/elements/:elementId` | อัปเดตสถานะเอกสาร อนุมัติ หรือ Reject พร้อมคอมเมนต์ |
| `POST` | `/api/projects/:id/elements/:elementId/upload` | แนบไฟล์เอกสารใน Element |
| `GET` | `/api/projects/:id/pfmea` | ดึงตาราง PFMEA |
| `POST` | `/api/projects/:id/pfmea` | บันทึกตาราง PFMEA |
| `GET` | `/api/projects/:id/process-flow` | ดึงขั้นตอน Process Flow |
| `POST` | `/api/projects/:id/process-flow` | บันทึกขั้นตอน Process Flow |
| `GET` | `/api/projects/:id/control-plan` | ดึงข้อมูล Control Plan |
| `POST` | `/api/projects/:id/control-plan` | บันทึกข้อมูล Control Plan |
| `GET` | `/api/projects/:id/dimensional` | ดึงผลการตรวจสอบมิติ |
| `POST` | `/api/projects/:id/dimensional` | บันทึกผลการตรวจสอบมิติ |
| `GET` | `/api/projects/:id/psw` | ดึงข้อมูล Part Submission Warrant |
| `POST` | `/api/projects/:id/psw` | บันทึกและลงนาม PSW |
| `POST` | `/api/ai/generate` | ส่งคำสั่งให้ AI สร้างร่างเอกสารทางวิศวกรรม |
| `GET` | `/api/notifications` | ดึงรายการแจ้งเตือน |
| `GET` | `/api/audit-logs` | ดึงประวัติ Audit Trail |

---

## 🔒 มาตรฐานความปลอดภัย (Security & Compliance)
- Role-Based Access Control ป้องกันผู้ใช้งานแก้ไขหรืออนุมัติเอกสารนอกเหนือสิทธิ์
- Client API Key Protection: ไม่เปิดเผยคีย์ Gemini หรือ Credentials สู่เบราว์เซอร์ จัดการผ่าน Server Proxy ทั้งหมด
- Audit Log บันทึกทุก Action พร้อม User, Role, Element และ Timestamp แบบแก้ไขย้อนหลังไม่ได้
