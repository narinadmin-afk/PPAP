/** 
 * Standard AIAG PPAP 4th Edition & IATF 16949 Element Table Definitions 
 * Provides column specifications and authentic automotive seed rows for all 18 elements.
 * Updated to match professional PPAP layout from PPAP_Forms_Suite_Automotive_Glass_Final.xlsx
 */ 

export interface ElementTableColumn {
  key: string;
  label: string;
  labelTh: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea';
  options?: string[];
  width?: string;
  placeholder?: string;
  isBadge?: boolean;
}

export interface ElementTableDefinition {
  elementId: number;
  nameEn: string;
  nameTh: string;
  standardRef: string;
  descriptionTh: string;
  auditTipsTh: string;
  columns: ElementTableColumn[];
}

export const ELEMENT_TABLE_DEFINITIONS: Record<number, ElementTableDefinition> = {
  1: {
    elementId: 1,
    nameEn: 'Design Records',
    nameTh: '1. บันทึกการออกแบบและแบบวิศวกรรม (Design Records)',
    standardRef: 'AIAG PPAP 4.2.2.1 / ASME Y14.5M / ISO 128',
    descriptionTh: 'ตารางบันทึกแบบวิศวกรรม (2D Engineering Drawing, 3D CAD Models, Math Data และ Specifications)',
    auditTipsTh: 'ต้องมีลายเซ็นวิศวกรผู้ออกแบบ ระดับ ECL ล่าสุด และตรวจสอบ Datum A/B/C ให้ตรงกับ Control Plan',
    columns: [
      { key: 'itemNo', label: 'Item #', labelTh: 'ลำดับ', type: 'number', width: 'w-16' },
      { key: 'docNumber', label: 'Drawing / Spec No.', labelTh: 'เลขที่แบบ / เอกสาร', type: 'text', width: 'w-44' },
      { key: 'description', label: 'Drawing Title / Feature', labelTh: 'ชื่อแบบ / รายละเอียด', type: 'text', width: 'w-64' },
      { key: 'revLevel', label: 'Rev / ECL', labelTh: 'ระดับแก้ไข (Rev)', type: 'text', width: 'w-24' },
      { key: 'releaseDate', label: 'Release Date', labelTh: 'วันที่อนุมัติ', type: 'date', width: 'w-32' },
      { key: 'format', label: 'CAD Format', labelTh: 'รูปแบบไฟล์', type: 'select', options: ['2D Drawing (PDF)', '3D CAD (STEP)', '3D CAD (CATIA v5)', 'NX / Parasolid', 'Material Spec (PDF)'], width: 'w-40' },
      { key: 'drawnBy', label: 'Engineer', labelTh: 'ผู้ออกแบบ', type: 'text', width: 'w-36' },
      { key: 'changeNotice', label: 'ECN Ref.', labelTh: 'เลขที่ ECN', type: 'text', width: 'w-32' },
      { key: 'status', label: 'Status', labelTh: 'สถานะ', type: 'select', options: ['Approved', 'Customer Released', 'In Review', 'Superseded'], width: 'w-32', isBadge: true }
    ]
  },
  2: {
    elementId: 2,
    nameEn: 'Engineering Change Documents',
    nameTh: '2. เอกสารการเปลี่ยนแปลงทางวิศวกรรม (Engineering Change Documents)',
    standardRef: 'AIAG PPAP 4.2.2.2 / IATF 16949 Clause 8.5.6',
    descriptionTh: 'ตารางบันทึกประวัติการขอและอนุมัติการเปลี่ยนแปลงทางวิศวกรรม (ECN / ECO / ECR)',
    auditTipsTh: 'ต้องแนบหลักฐานการอนุมัติจากลูกค้าก่อนเริ่มผลิตงานจริงตามแบบใหม่',
    columns: [
      { key: 'changeNo', label: 'ECN / ECO #', labelTh: 'เลขที่ ECN/ECO', type: 'text', width: 'w-36' },
      { key: 'changeDate', label: 'Issue Date', labelTh: 'วันที่แจ้งเปลี่ยน', type: 'date', width: 'w-32' },
      { key: 'description', label: 'Change Description', labelTh: 'รายละเอียดการเปลี่ยนแปลง', type: 'text', width: 'w-72' },
      { key: 'reason', label: 'Reason for Change', labelTh: 'เหตุผลการเปลี่ยนแปลง', type: 'text', width: 'w-60' },
      { key: 'revFrom', label: 'Rev From', labelTh: 'Rev เดิม', type: 'text', width: 'w-24' },
      { key: 'revTo', label: 'Rev To', labelTh: 'Rev ใหม่', type: 'text', width: 'w-24' },
      { key: 'authorizedBy', label: 'Customer DRE', labelTh: 'ผู้อนุมัติจากลูกค้า', type: 'text', width: 'w-36' },
      { key: 'implementationDate', label: 'Cut-in Date', labelTh: 'วันเริ่มใช้จริง', type: 'date', width: 'w-32' },
      { key: 'status', label: 'Status', labelTh: 'สถานะ', type: 'select', options: ['Approved & Cut-in', 'Customer Approved', 'Pending Review', 'Closed'], width: 'w-36', isBadge: true }
    ]
  },
  3: {
    elementId: 3,
    nameEn: 'Customer Engineering Approval',
    nameTh: '3. การอนุมัติทางวิศวกรรมจากลูกค้า (Customer Engineering Approval)',
    standardRef: 'AIAG PPAP 4.2.2.3 / IATF 16949 Clause 8.3.4.4',
    descriptionTh: 'ตารางบันทึกการอนุมัติการออกแบบ การทดสอบต้นแบบ และผลจำลองจากวิศวกรลูกค้า (Customer DRE Sign-offs)',
    auditTipsTh: 'จำเป็นอย่างยิ่งสำหรับ PPAP ส่งมอบใหม่ หรือการเปลี่ยนวัสดุหลักของชิ้นส่วน',
    columns: [
      { key: 'approvalId', label: 'Approval Ref #', labelTh: 'เลขที่เอกสาร', type: 'text', width: 'w-36' },
      { key: 'approvalItem', label: 'Approval Scope / Item', labelTh: 'หัวข้อการอนุมัติ', type: 'text', width: 'w-64' },
      { key: 'customerDept', label: 'Customer Department', labelTh: 'แผนกของลูกค้า', type: 'text', width: 'w-44' },
      { key: 'customerContact', label: 'Customer DRE / Contact', labelTh: 'วิศวกรผู้รับผิดชอบ', type: 'text', width: 'w-44' },
      { key: 'approvalDate', label: 'Approval Date', labelTh: 'วันที่อนุมัติ', type: 'date', width: 'w-32' },
      { key: 'documentRef', label: 'Reference Report', labelTh: 'เอกสารอ้างอิง', type: 'text', width: 'w-40' },
      { key: 'conditions', label: 'Approval Conditions', labelTh: 'เงื่อนไขการอนุมัติ', type: 'text', width: 'w-60' },
      { key: 'status', label: 'Decision', labelTh: 'ผลการพิจารณา', type: 'select', options: ['Fully Approved', 'Conditional Approval', 'In Review', 'Rejected'], width: 'w-36', isBadge: true }
    ]
  },
  4: {
    elementId: 4,
    nameEn: 'Design FMEA (DFMEA)',
    nameTh: '4. การวิเคราะห์ลักษณะความล้มเหลวและผลกระทบของการออกแบบ (Design FMEA)',
    standardRef: 'AIAG & VDA FMEA 1st Edition / AIAG PPAP 4.2.2.4',
    descriptionTh: 'ตารางการวิเคราะห์ความเสี่ยงด้านการออกแบบ ผลกระทบ สาเหตุ คะแนน S, O, D และ Action Priority (AP)',
    auditTipsTh: 'ต้องประเมินโหมดล้มเหลวที่กระทบต่อความปลอดภัย (S=9-10) และกำหนดมาตรการควบคุมเชิงป้องกัน',
    columns: [
      { key: 'itemFunction', label: 'System / Function', labelTh: 'ชิ้นส่วน / หน้าที่การทำงาน', type: 'text', width: 'w-56' },
      { key: 'failureMode', label: 'Failure Mode', labelTh: 'ลักษณะความล้มเหลว', type: 'text', width: 'w-56' },
      { key: 'failureEffect', label: 'Failure Effect', labelTh: 'ผลกระทบความล้มเหลว', type: 'text', width: 'w-60' },
      { key: 'severity', label: 'S', labelTh: 'ความรุนแรง (S)', type: 'number', width: 'w-16' },
      { key: 'cause', label: 'Potential Cause', labelTh: 'สาเหตุความล้มเหลว', type: 'text', width: 'w-60' },
      { key: 'prevention', label: 'Prevention Control', labelTh: 'การควบคุมเชิงป้องกัน', type: 'text', width: 'w-56' },
      { key: 'occurrence', label: 'O', labelTh: 'โอกาสเกิด (O)', type: 'number', width: 'w-16' },
      { key: 'detection', label: 'Detection Control', labelTh: 'การตรวจจับ', type: 'text', width: 'w-56' },
      { key: 'detectionScore', label: 'D', labelTh: 'ตรวจจับได้ (D)', type: 'number', width: 'w-16' },
      { key: 'actionPriority', label: 'AP', labelTh: 'ความสำคัญ (AP)', type: 'select', options: ['High', 'Medium', 'Low'], width: 'w-24', isBadge: true },
      { key: 'recommendedAction', label: 'Recommended Action', labelTh: 'มาตรการแก้ไขที่แนะนำ', type: 'text', width: 'w-64' },
      { key: 'responsibility', label: 'Responsibility', labelTh: 'ผู้รับผิดชอบ', type: 'text', width: 'w-36' }
    ]
  },
  8: {
    elementId: 8,
    nameEn: 'Measurement System Analysis (MSA)',
    nameTh: '8. การวิเคราะห์ระบบการวัด (Measurement System Analysis - MSA)',
    standardRef: 'AIAG MSA 4th Edition / AIAG PPAP 4.2.2.8 / IATF 7.1.5.1.1',
    descriptionTh: 'ตารางบันทึกผลการศึกษา Gage R&R, %GRR, Number of Distinct Categories (ndc), Bias และ Linearity',
    auditTipsTh: '%GRR < 10% ยอมรับได้ดีเลิศ, 10-30% ยอมรับได้ตามเงื่อนไขลูกค้า, >30% ต้องปรับปรุงเครื่องมือวัด, ndc ต้อง ≥ 5',
    columns: [
      { key: 'gageId', label: 'Gage / Tool ID', labelTh: 'รหัสเครื่องมือวัด', type: 'text', width: 'w-32' },
      { key: 'gageDescription', label: 'Gage Name & Model', labelTh: 'ชื่อเครื่องมือวัด', type: 'text', width: 'w-48' },
      { key: 'characteristic', label: 'Product Characteristic', labelTh: 'คุณลักษณะที่ตรวจวัด', type: 'text', width: 'w-56' },
      { key: 'studyType', label: 'Study Method', labelTh: 'วิธีการศึกษา', type: 'select', options: ['Gage R&R (Variable ANOVA)', 'Gage R&R (Xbar-R)', 'Attribute Gage Study (Kappa)', 'Bias & Linearity', 'Stability Study'], width: 'w-48' },
      { key: 'trials', label: 'Trials x Parts', labelTh: 'ผู้ตรวจ x ตัวอย่าง', type: 'text', width: 'w-40' },
      { key: 'percentGRR', label: '%GRR (% of Tol)', labelTh: '%GRR', type: 'number', width: 'w-28' },
      { key: 'ndc', label: 'ndc', labelTh: 'ค่า ndc', type: 'number', width: 'w-20' },
      { key: 'biasLinearity', label: 'Bias / Linearity', labelTh: 'ความเที่ยงตรง (Bias)', type: 'text', width: 'w-36' },
      { key: 'status', label: 'Acceptance Verdict', labelTh: 'ผลการประเมิน', type: 'select', options: ['Acceptable (%GRR < 10%)', 'Marginal (10% - 30%)', 'Unacceptable (> 30%)'], width: 'w-44', isBadge: true },
      { key: 'assessor', label: 'Assessed By', labelTh: 'ผู้ทำการศึกษา', type: 'text', width: 'w-36' }
    ]
  },
  10: {
    elementId: 10,
    nameEn: 'Material / Performance Test Results',
    nameTh: '10. ผลการทดสอบวัสดุและสมรรถนะ (Material & Performance Test Results)',
    standardRef: 'AIAG PPAP 4.2.2.10 / ASTM / ISO / Customer Engineering Standards',
    descriptionTh: 'ตารางบันทึกผลการทดสอบเชิงกล เคมี ความทนทาน และการเคลือบผิว เปรียบเทียบกับสเปกจริง',
    auditTipsTh: 'ต้องมีเลข Lot ผลิตที่สอดคล้องกับ Sample Production Parts และระบุมาตรฐานทดสอบ (ASTM/ISO). Refer to PPAP-forms-professional-layout.md for consolidated column structure matching Excel: PPAP_Forms_Suite_Automotive_Glass_Final.xlsx',
    columns: [
      { key: 'itemNo', label: 'Item #', labelTh: 'ลำดับ', type: 'number', width: 'w-16' },
      { key: 'materialCode', label: 'Material Code', labelTh: 'รหัสวัสดุ', type: 'text', width: 'w-40' },
      { key: 'materialName', label: 'Material Name', labelTh: 'ชื่อวัสดุ', type: 'text', width: 'w-56' },
      { key: 'chemicalComposition', label: 'Chemical Composition', labelTh: 'องค์ประกอบเคมี', type: 'text', width: 'w-60' },
      { key: 'specLimit', label: 'Specification Limit', labelTh: 'ขอบเขตสเปค', type: 'text', width: 'w-44' },
      { key: 'testResult', label: 'Test Result', labelTh: 'ผลการทดสอบ', type: 'text', width: 'w-40' },
      { key: 'compliance', label: 'Compliance', labelTh: 'ความสอดคล้อง', type: 'select', options: ['Complies', 'Partial', 'Non-Compliant'], width: 'w-32', isBadge: true },
      { key: 'testDate', label: 'Test Date', labelTh: 'วันที่ทดสอบ', type: 'date', width: 'w-32' },
      { key: 'testLab', label: 'Qualified Laboratory', labelTh: 'ห้องปฏิบัติการที่ทดสอบ', type: 'text', width: 'w-48' },
      { key: 'lotNumber', label: 'Lot / Heat Number', labelTh: 'เลข Lot / เลขความร้อน', type: 'text', width: 'w-36' }
    ]
  },
  11: {
    elementId: 11,
    nameEn: 'Initial Process Studies (Capability Studies)',
    nameTh: '11. การศึกษากระบวนการเบื้องต้น (Initial Process Studies - Cpk / Ppk)',
    standardRef: 'AIAG PPAP 4.2.2.11 / AIAG SPC 2nd Edition / IATF 9.1.1.1',
    descriptionTh: 'ตารางบันทึกค่าความสามารถของกระบวนการสำหรับคุณลักษณะพิเศษ (Special Characteristics - Cpk / Ppk)',
    auditTipsTh: 'ค่าดัชนี Cpk / Ppk สำหรับคุณลักษณะวิกฤตต้อง ≥ 1.67 (หากอยู่ระหว่าง 1.33-1.67 ต้องมีแผนควบคุม 100%)',
    columns: [
      { key: 'charId', label: 'Char #', labelTh: 'รหัสข้อกำหนด', type: 'text', width: 'w-24' },
      { key: 'characteristic', label: 'Product / Process Char', labelTh: 'คุณลักษณะพิเศษ', type: 'text', width: 'w-56' },
      { key: 'specification', label: 'Spec & Tolerance', labelTh: 'พิกัดความเผื่อ (USL/LSL)', type: 'text', width: 'w-48' },
      { key: 'sampleSize', label: 'Subgroups x Size', labelTh: 'กลุ่มตัวอย่าง x ขนาด', type: 'text', width: 'w-40' },
      { key: 'mean', label: 'Mean (X-bar)', labelTh: 'ค่าเฉลี่ย', type: 'number', width: 'w-28' },
      { key: 'stDev', label: 'Std Dev (Sigma)', labelTh: 'ค่าเบี่ยงเบน', type: 'number', width: 'w-28' },
      { key: 'cpk', label: 'Cpk', labelTh: 'ค่า Cpk', type: 'number', width: 'w-24' },
      { key: 'ppk', label: 'Ppk', labelTh: 'ค่า Ppk', type: 'number', width: 'w-24' },
      { key: 'benchmark', label: 'Target Benchmark', labelTh: 'เกณฑ์เป้าหมาย', type: 'text', width: 'w-36' },
      { key: 'capabilityStatus', label: 'Capability Status', labelTh: 'ความสามารถกระบวนการ', type: 'select', options: ['Capable (Cpk ≥ 1.67)', 'Marginal (1.33 ≤ Cpk < 1.67)', 'Not Capable (Cpk < 1.33)'], width: 'w-48', isBadge: true },
      { key: 'notes', label: 'Distribution & Notes', labelTh: 'หมายเหตุ', type: 'text', width: 'w-56' }
    ]
  },
  12: {
    elementId: 12,
    nameEn: 'Qualified Laboratory Documentation',
    nameTh: '12. เอกสารรับรองห้องปฏิบัติการที่ผ่านการรับรอง (Qualified Laboratory Docs)',
    standardRef: 'AIAG PPAP 4.2.2.12 / ISO/IEC 17025 / IATF 7.1.5.3',
    descriptionTh: 'ตารางบันทึกขอบข่ายการรับรองห้องปฏิบัติการทดสอบทั้งภายในและภายนอกโรงงาน',
    auditTipsTh: 'ต้องมีใบรับรอง ISO/IEC 17025 ที่ยังไม่หมดอายุ พร้อมขอบข่ายการทดสอบที่ครอบคลุมการทดสอบใน Element 10',
    columns: [
      { key: 'labName', label: 'Laboratory Facility Name', labelTh: 'ชื่อห้องปฏิบัติการ', type: 'text', width: 'w-60' },
      { key: 'accreditation', label: 'Accreditation Standard', labelTh: 'มาตรฐานการรับรอง', type: 'select', options: ['ISO/IEC 17025:2017', 'Customer Approved Internal Lab', 'TISI / ILAC-MRA Accredited', 'NADCAP Automotive Certified'], width: 'w-52' },
      { key: 'accreditationBody', label: 'Accreditation Body', labelTh: 'หน่วยงานผู้ให้การรับรอง', type: 'text', width: 'w-44' },
      { key: 'certNumber', label: 'Certificate / Scope #', labelTh: 'เลขที่ใบรับรอง', type: 'text', width: 'w-40' },
      { key: 'scopeOfTesting', label: 'Authorized Scope', labelTh: 'ขอบข่ายการทดสอบ', type: 'text', width: 'w-64' },
      { key: 'issueDate', label: 'Issue Date', labelTh: 'วันที่ออกใบรับรอง', type: 'date', width: 'w-32' },
      { key: 'expiryDate', label: 'Expiry Date', labelTh: 'วันหมดอายุ', type: 'date', width: 'w-32' },
      { key: 'status', label: 'Status', labelTh: 'สถานะ', type: 'select', options: ['Active & Compliant', 'Under Renewal', 'Audit Pending'], width: 'w-36', isBadge: true }
    ]
  },
  13: {
    elementId: 13,
    nameEn: 'Appearance Approval Report (AAR)',
    nameTh: '13. รายงานการอนุมัติด้านรูปลักษณ์ (Appearance Approval Report - AAR)',
    standardRef: 'AIAG PPAP 4.2.2.13 / AIAG AAR Guideline',
    descriptionTh: 'ตารางบันทึกการประเมินสี (Color Delta E), ความเงา (Gloss), ลวดลายพื้นผิว (Grain), และความเรียบเนียน',
    auditTipsTh: 'บังคับใช้กับชิ้นส่วนที่มองเห็นได้ภายนอก/ภายในห้องโดยสาร (Class A Surface) ตามเกณฑ์ AIAG AAR',
    columns: [
      { key: 'areaFeature', label: 'Area / Surface Zone', labelTh: 'บริเวณพื้นผิวที่ตรวจ', type: 'text', width: 'w-52' },
      { key: 'colorStandard', label: 'Color Standard & Delta E', labelTh: 'มาตรฐานสี / ค่า Delta E', type: 'text', width: 'w-48' },
      { key: 'glossLevel', label: 'Gloss Reading (GU @ 60°)', labelTh: 'ค่าความเงา (Gloss Unit)', type: 'text', width: 'w-44' },
      { key: 'textureGrain', label: 'Grain / Texture Spec', labelTh: 'ลวดลาย / ความหยาบผิว', type: 'text', width: 'w-44' },
      { key: 'visualDefects', label: 'Visual Inspection Criteria', labelTh: 'เกณฑ์ความสมบูรณ์ผิว', type: 'text', width: 'w-56' },
      { key: 'lightSource', label: 'Evaluation Light Source', labelTh: 'แหล่งกำเนิดแสงที่ตรวจ', type: 'select', options: ['D65 Artificial Daylight (1200 Lux)', 'CWF Cool White Fluorescent', 'Illuminant A Tungsten', 'Dual Source D65 + TL84'], width: 'w-48' },
      { key: 'customerDecision', label: 'Customer Decision', labelTh: 'ผลการพิจารณา', type: 'select', options: ['Approved', 'Conditional Match', 'Pending Review', 'Rejected'], width: 'w-36', isBadge: true },
      { key: 'signedBy', label: 'Evaluator / Specialist', labelTh: 'ผู้ตรวจประเมิน', type: 'text', width: 'w-36' }
    ]
  },
  14: {
    elementId: 14,
    nameEn: 'Sample Production Parts',
    nameTh: '14. ชิ้นส่วนตัวอย่างจากการผลิตจริง (Sample Production Parts)',
    standardRef: 'AIAG PPAP 4.2.2.14 / IATF Clause 8.3.4.4',
    descriptionTh: 'ตารางบันทึกการจัดเตรียม การสุ่ม และการติดตามชิ้นส่วนตัวอย่างจากสายการผลิตจริง (Significant Production Run)',
    auditTipsTh: 'ชิ้นส่วนตัวอย่างต้องมาจากสายการผลิตจริง แม่พิมพ์จริง ความเร็วปกติ และผลิตติดต่อกันไม่น้อยกว่า 300 ชิ้น หรือ 1 กะ',
    columns: [
      { key: 'sampleNo', label: 'Sample Unit #', labelTh: 'รหัสชิ้นงานตัวอย่าง', type: 'text', width: 'w-36' },
      { key: 'cavityMold', label: 'Tool / Die / Cavity ID', labelTh: 'แม่พิมพ์ / คาวิตี้', type: 'text', width: 'w-40' },
      { key: 'productionDate', label: 'Production Shift & Date', labelTh: 'วันและกะที่ผลิต', type: 'text', width: 'w-44' },
      { key: 'quantity', label: 'Sample Qty', labelTh: 'จำนวนสุ่ม', type: 'number', width: 'w-24' },
      { key: 'serialRange', label: 'Serial / Batch Number', labelTh: 'หมายเลขซีเรียล', type: 'text', width: 'w-44' },
      { key: 'inspectionVerdict', label: 'Inspection Status', labelTh: 'ผลการตรวจสอบตัวอย่าง', type: 'select', options: ['100% CMM & Visual Verified', 'Conforms to Drawing', 'Conditional Pass', 'Non-conforming'], width: 'w-48', isBadge: true },
      { key: 'storageLocation', label: 'Physical Storage Bay', labelTh: 'ตำแหน่งจัดเก็บชิ้นงาน', type: 'text', width: 'w-44' },
      { key: 'trackingBarcode', label: 'PPAP Container Barcode', labelTh: 'บาร์โค้ดกล่อง PPAP', type: 'text', width: 'w-40' }
    ]
  },
  15: {
    elementId: 15,
    nameEn: 'Master Sample',
    nameTh: '15. ชิ้นงานตัวอย่างมาตรฐาน (Master Sample - Golden Sample)',
    standardRef: 'AIAG PPAP 4.2.2.15 / IATF Clause 8.5.2',
    descriptionTh: 'ตารางบันทึกการเก็บรักษาและตรวจสอบชิ้นงานตัวอย่างมาตรฐาน (Golden Sample, Boundary Defect Limit)',
    auditTipsTh: 'ต้องมีป้ายชี้บ่งชัดเจน มีลายเซ็นวิศวกรผู้มีอำนาจ และเก็บรักษาในตู้ควบคุมสภาพแวดล้อมตลอดอายุโครงการ PPAP',
    columns: [
      { key: 'masterId', label: 'Master Sample ID', labelTh: 'รหัสชิ้นงาน Master', type: 'text', width: 'w-36' },
      { key: 'type', label: 'Master Category', labelTh: 'ประเภท Master', type: 'select', options: ['Golden Sample (Nominal)', 'Boundary Upper Limit (+Tol)', 'Boundary Lower Limit (-Tol)', 'Color & Grain Master', 'Acoustic / Vibration Benchmark'], width: 'w-48' },
      { key: 'partNumber', label: 'Part & ECL Level', labelTh: 'รหัสชิ้นส่วนและ Rev', type: 'text', width: 'w-40' },
      { key: 'storageLocation', label: 'Storage Facility / Cabinet', labelTh: 'ตู้จัดเก็บควบคุมพิเศษ', type: 'text', width: 'w-52' },
      { key: 'signedDate', label: 'Sign-off Date', labelTh: 'วันที่อนุมัติเก็บ', type: 'date', width: 'w-32' },
      { key: 'signee', label: 'Authorized Engineer', labelTh: 'วิศวกรผู้ลงนาม', type: 'text', width: 'w-36' },
      { key: 'retentionExpiry', label: 'Retention Period', labelTh: 'ระยะเวลาจัดเก็บ', type: 'text', width: 'w-40' },
      { key: 'condition', label: 'Preservation Method', labelTh: 'การรักษาสภาพ', type: 'text', width: 'w-56' }
    ]
  },
  16: {
    elementId: 16,
    nameEn: 'Checking Aids',
    nameTh: '16. อุปกรณ์ช่วยตรวจสอบ (Checking Aids - Fixtures & Gages)',
    standardRef: 'AIAG PPAP 4.2.2.16 / IATF Clause 7.1.5.2',
    descriptionTh: 'ตารางบันทึกอุปกรณ์ช่วยตรวจสอบ (Jigs, Holding Fixtures, Go/No-Go Pins, Contour Templates, CMM Nests)',
    auditTipsTh: 'ต้องผ่านการสอบเทียบตามรอบ ตรวจ Gage R&R ผ่าน และออกแบบตาม Datum Scheme ของ Drawing',
    columns: [
      { key: 'aidId', label: 'Fixture / Gage ID', labelTh: 'รหัสอุปกรณ์ตรวจสอบ', type: 'text', width: 'w-36' },
      { key: 'aidDescription', label: 'Description & Tool Type', labelTh: 'ชื่อและประเภทอุปกรณ์', type: 'text', width: 'w-56' },
      { key: 'partFeatureChecked', label: 'Verified Characteristic', labelTh: 'คุณลักษณะที่ใช้วัด', type: 'text', width: 'w-52' },
      { key: 'lastCalDate', label: 'Last Calibration', labelTh: 'สอบเทียบล่าสุด', type: 'date', width: 'w-32' },
      { key: 'nextCalDue', label: 'Next Due Date', labelTh: 'กำหนดสอบเทียบถัดไป', type: 'date', width: 'w-32' },
      { key: 'calibrationProvider', label: 'Calibration Provider', labelTh: 'ผู้ทำการสอบเทียบ', type: 'text', width: 'w-44' },
      { key: 'gageRRVerified', label: 'Gage R&R Done?', labelTh: 'ผ่าน Gage R&R หรือไม่', type: 'select', options: ['Yes (%GRR < 10%)', 'Yes (Conditional)', 'Pending Study', 'Not Applicable'], width: 'w-40', isBadge: true },
      { key: 'status', label: 'Operational Status', labelTh: 'สถานะการใช้งาน', type: 'select', options: ['In Service & Verified', 'Calibrated', 'Under Maintenance', 'Out of Service'], width: 'w-40', isBadge: true }
    ]
  },
  17: {
    elementId: 17,
    nameEn: 'Customer-Specific Requirements (CSR)',
    nameTh: '17. ข้อกำหนดเฉพาะของลูกค้า (Customer-Specific Requirements - CSR)',
    standardRef: 'AIAG PPAP 4.2.2.17 / IATF 16949 Applicable Customer Manuals',
    descriptionTh: 'ตารางบันทึกการปฏิบัติตามข้อกำหนดพิเศษของลูกค้า (IMDS Chemical Declaration, CQI Audits, Special Packaging, Barcode Labels)',
    auditTipsTh: 'ต้องมีเลข ID ระบบ IMDS ที่ลูกค้ากด Accepted และรายงานการประเมิน Special Process (CQI-9, CQI-11, CQI-12)',
    columns: [
      { key: 'csrClause', label: 'CSR Clause #', labelTh: 'ข้อกำหนดลูกค้า', type: 'text', width: 'w-32' },
      { key: 'requirementTitle', label: 'Requirement Title', labelTh: 'ชื่อข้อกำหนดเฉพาะ', type: 'text', width: 'w-56' },
      { key: 'customerStandard', label: 'Customer Std Document', labelTh: 'มาตรฐานอ้างอิงลูกค้า', type: 'text', width: 'w-48' },
      { key: 'complianceMethod', label: 'Compliance Method', labelTh: 'วิธีการปฏิบัติตาม', type: 'text', width: 'w-56' },
      { key: 'responsible', label: 'Responsible Lead', labelTh: 'ผู้รับผิดชอบ', type: 'text', width: 'w-36' },
      { key: 'evidenceAttachment', label: 'Evidence Document Ref', labelTh: 'เอกสารหลักฐานอ้างอิง', type: 'text', width: 'w-48' },
      { key: 'complianceStatus', label: 'Compliance Verdict', labelTh: 'สถานะความสอดคล้อง', type: 'select', options: ['Compliant & Customer Accepted', 'In Progress', 'Waiver Granted', 'Pending Submission'], width: 'w-48', isBadge: true }
    ]
  }
};

/** 
 * Generate authentic automotive seed rows for any given element 
 */ 
export function getDefaultRowsForElement(
  elementId: number,
  project: {
    partName: string;
    partNumber: string;
    customerName: string;
    responsibleEngineer: string;
    drawingNumber?: string;
    engineeringChangeLevel?: string;
  }
): any[] {
  const pName = project.partName || 'Automotive Component';
  const pNum = project.partNumber || 'AUTO-PART-001';
  const dwg = project.drawingNumber || `DWG-${pNum}`;
  const ecl = project.engineeringChangeLevel || 'Rev B';
  const cust = project.customerName || 'OEM Automotive Customer';
  const eng = project.responsibleEngineer || 'Quality Engineer';

  switch (elementId) {
    case 1: // Design Records
      return [
        {
          id: 'dr-1',
          itemNo: 1,
          docNumber: dwg,
          description: `${pName} - General Assembly & Critical Datum Schemes`,
          revLevel: ecl,
          releaseDate: '2026-01-15',
          format: '2D Drawing (PDF)',
          drawnBy: eng,
          changeNotice: 'ECN-2026-088',
          status: 'Customer Released'
        },
        {
          id: 'dr-2',
          itemNo: 2,
          docNumber: `CAD-3D-${pNum}`,
          description: `${pName} - Parametric 3D Solid Model with GD&T Annotation`,
          revLevel: ecl,
          releaseDate: '2026-01-18',
          format: '3D CAD (STEP)',
          drawnBy: 'Chaiwat B. (CAD Specialist)',
          changeNotice: 'ECN-2026-088',
          status: 'Customer Released'
        },
        {
          id: 'dr-3',
          itemNo: 3,
          docNumber: `SPEC-MAT-${pNum}-01`,
          description: `Raw Material Specification: High-Strength Low-Alloy Structural Steel`,
          revLevel: 'Rev 2',
          releaseDate: '2026-01-10',
          format: 'Material Spec (PDF)',
          drawnBy: 'Metallurgy Team',
          changeNotice: 'SPEC-CHG-14',
          status: 'Approved'
        }
      ];

    case 2: // Engineering Change Documents
      return [
        {
          id: 'ecn-1',
          changeNo: 'ECN-2026-088',
          changeDate: '2026-01-20',
          description: `Flange mounting wall thickness optimized from 3.0mm to 3.5mm to increase stiffness under high vibration load.`,
          reason: `Customer FEA fatigue life improvement requirement for powertrain duty cycle.`,
          revFrom: 'Rev A',
          revTo: ecl,
          authorizedBy: `Lead DRE (${cust})`,
          implementationDate: '2026-02-01',
          status: 'Approved & Cut-in'
        },
        {
          id: 'ecn-2',
          changeNo: 'ECN-2025-142',
          changeDate: '2025-11-12',
          description: `Chamfer angle at datum pilot hole adjusted to C1.0 to facilitate automated robotic bolt feeding.`,
          reason: `Assembly line cycle time reduction and zero-crossthread defect initiative.`,
          revFrom: 'Rev 0',
          revTo: 'Rev A',
          authorizedBy: `Production Engineering Lead`,
          implementationDate: '2025-12-01',
          status: 'Closed'
        }
      ];

    case 3: // Customer Engineering Approval
      return [
        {
          id: 'cea-1',
          approvalId: `CEA-${pNum}-01`,
          approvalItem: `Complete Structural Integrity & FEA Validation for ${pName}`,
          customerDept: `Chassis & Body Engineering Department`,
          customerContact: `Kenji Sato (Lead DRE - ${cust})`,
          approvalDate: '2026-02-10',
          documentRef: `TR-TOYOTA-FEA-99214`,
          conditions: `Approved subject to 100% confirmation in 500-hour salt spray and vibration test.`,
          status: 'Fully Approved'
        },
        {
          id: 'cea-2',
          approvalId: `CEA-${pNum}-02`,
          approvalItem: `Welding Protocol & Cathodic E-Coat Anti-Corrosion Specification`,
          customerDept: `Materials & Corrosion Prevention Lab`,
          customerContact: `Somchai Prasert / Customer Metallurgist`,
          approvalDate: '2026-02-14',
          documentRef: `CORR-VAL-2026-A1`,
          conditions: `Batch certification for zinc phosphate adhesion test must be submitted with each shipment.`,
          status: 'Fully Approved'
        }
      ];

    case 4: // Design FMEA
      return [
        {
          id: 'dfmea-1',
          itemFunction: `${pName} / Structural Support under 4.5G Dynamic Dynamic Shock`,
          failureMode: `Excessive elastic deflection under peak vertical acceleration`,
          failureEffect: `Misalignment with adjacent powertrain bracket; potential NVH rattle`,
          severity: 7,
          cause: `Inadequate local section modulus at primary bend radius`,
          prevention: `High tensile steel grade specified (JIS G3113 SAPH440); section rib reinforced`,
          occurrence: 2,
          detection: `FEA stress simulation & physical drop tower impact test`,
          detectionScore: 2,
          actionPriority: 'Low',
          recommendedAction: `Include automated laser scanning of bend radius in tooling buy-off`,
          responsibility: `R&D Team (${eng})`
        },
        {
          id: 'dfmea-2',
          itemFunction: `Mounting Flange Seal Interface`,
          failureMode: `Micro-fretting corrosion and surface galling at bolt clamping face`,
          failureEffect: `Clamp load loss over 150,000 km lifecycle`,
          severity: 8,
          cause: `Surface roughness Ra exceeding 3.2 um; inadequate coating lubricity`,
          prevention: `Fine blanking specified on contact zones; friction coefficient 0.12 - 0.18`,
          occurrence: 3,
          detection: `1,000,000 cycle bolt tension relaxation bench test`,
          detectionScore: 3,
          actionPriority: 'Low',
          recommendedAction: `Standardize automated torquing with angle monitoring at customer plant`,
          responsibility: `Fastener Lab`
        }
      ];

    case 8: // MSA
      return [
        {
          id: 'msa-1',
          gageId: 'GAGE-CMM-01',
          gageDescription: 'Mitutoyo Crysta-Apex S9106 CNC Coordinate Measuring Machine',
          characteristic: `Mounting Hole Center-to-Center Distance (140.0 ± 0.15 mm)`,
          studyType: 'Gage R&R (Variable ANOVA)',
          trials: '3 Appraisers x 3 Trials x 10 Parts',
          percentGRR: 6.8,
          ndc: 15,
          biasLinearity: 'Bias: 0.0006 mm / Linearity: Passed',
          status: 'Acceptable (%GRR < 10%)',
          assessor: `${eng} (Certified Metrologist)`
        },
        {
          id: 'msa-2',
          gageId: 'GAGE-MIC-04',
          gageDescription: 'Mitutoyo IP65 Digital Electronic Micrometer (0-25mm, Res 0.001mm)',
          characteristic: `Sheet Stock Thickness after Stamping (3.50 ± 0.08 mm)`,
          studyType: 'Gage R&R (Variable ANOVA)',
          trials: '3 Appraisers x 3 Trials x 10 Parts',
          percentGRR: 8.2,
          ndc: 12,
          biasLinearity: 'Bias: 0.0004 mm / Linearity: Passed',
          status: 'Acceptable (%GRR < 10%)',
          assessor: `Siriporn R. (CMM Inspector)`
        },
        {
          id: 'msa-3',
          gageId: 'GAGE-CHK-08',
          gageDescription: `Dedicated Pneumatic Go / No-Go Thread Pin Gage (M10 x 1.25-6H)`,
          characteristic: `Weld Nut Thread Pitch & Major Diameter Conformity`,
          studyType: 'Attribute Gage Study (Kappa)',
          trials: '3 Appraisers x 2 Trials x 50 Parts',
          percentGRR: 4.5,
          ndc: 99,
          biasLinearity: 'Kappa coefficient k = 1.00 (Perfect agreement)',
          status: 'Acceptable (%GRR < 10%)',
          assessor: `QA Tooling Specialist`
        }
      ];

    case 10: // Material / Performance Test Results
      return [
        {
          id: 'mat-1',
          itemNo: 1,
          materialCode: 'FG-SIO2',
          materialName: 'Float Glass SiO2',
          chemicalComposition: 'SiO2 >= 70.0 %',
          specLimit: 'SiO2 >= 70.0 %',
          testResult: '72.30 % (Complies)',
          compliance: 'Complies',
          testDate: '2026-10-13',
          testLab: 'Certified Central Metallurgy Testing Lab (ISO/IEC 17025)',
          lotNumber: 'COIL-2026-99'
        },
        {
          id: 'mat-2',
          itemNo: 2,
          materialCode: 'FG-CAO',
          materialName: 'Float Glass CaO',
          chemicalComposition: 'CaO 8.0 - 13.0 %',
          specLimit: 'CaO 8.0 - 13.0 %',
          testResult: '9.10 % (Complies)',
          compliance: 'Complies',
          testDate: '2026-10-13',
          testLab: 'Certified Central Metallurgy Testing Lab (ISO/IEC 17025)',
          lotNumber: 'COIL-2026-99'
        },
        {
          id: 'mat-3',
          itemNo: 3,
          materialCode: 'PVB-TS',
          materialName: 'PVB Interlayer',
          chemicalComposition: 'Tensile Strength >= 20.0 MPa',
          specLimit: 'Tensile Strength >= 20.0 MPa',
          testResult: '23.50 MPa (Complies)',
          compliance: 'Complies',
          testDate: '2026-10-13',
          testLab: 'Certified Central Metallurgy Testing Lab (ISO/IEC 17025)',
          lotNumber: 'PPAP-BATCH-001'
        },
        {
          id: 'mat-4',
          itemNo: 4,
          materialCode: 'PVB-MC',
          materialName: 'PVB Moisture Content',
          chemicalComposition: 'Moisture <= 0.40 %',
          specLimit: 'Moisture <= 0.40 %',
          testResult: '0.32 % (Complies)',
          compliance: 'Complies',
          testDate: '2026-10-13',
          testLab: 'Certified Central Metallurgy Testing Lab (ISO/IEC 17025)',
          lotNumber: 'PPAP-BATCH-001'
        }
      ];

    case 11: // Initial Process Studies
      return [
        {
          id: 'spc-1',
          charId: 'SC-01',
          characteristic: `Mounting Hole Center Distance (140.0 ± 0.15 mm)`,
          specification: 'USL: 140.15 mm, LSL: 139.85 mm (Nominal: 140.00)',
          sampleSize: '125 parts (25 subgroups of 5 consecutive pieces)',
          mean: 140.018,
          stDev: 0.0195,
          cpk: 2.25,
          ppk: 2.14,
          benchmark: 'AIAG PPAP Minimum Cpk ≥ 1.67',
          capabilityStatus: 'Capable (Cpk ≥ 1.67)',
          notes: 'Normal distribution verified (Anderson-Darling p=0.48 > 0.05). In statistical control.'
        },
        {
          id: 'spc-2',
          charId: 'SC-02',
          characteristic: `Bracket Bend Angle (90.0° ± 0.50°)`,
          specification: 'USL: 90.50°, LSL: 89.50° (Nominal: 90.00°)',
          sampleSize: '125 parts (25 subgroups of 5 consecutive pieces)',
          mean: 90.11,
          stDev: 0.068,
          cpk: 1.91,
          ppk: 1.83,
          benchmark: 'AIAG PPAP Minimum Cpk ≥ 1.67',
          capabilityStatus: 'Capable (Cpk ≥ 1.67)',
          notes: 'Zero tool wear drift detected over full 300-piece PPAP production run.'
        },
        {
          id: 'spc-3',
          charId: 'SC-03',
          characteristic: `Bolt Torque Retention Push-out Strength (Weld Nut)`,
          specification: 'Min 60.0 Nm push-out torque before failure',
          sampleSize: '30 destructive weld test parts',
          mean: 84.5,
          stDev: 3.2,
          cpk: 2.55,
          ppk: 2.42,
          benchmark: 'Customer Spec Minimum Cpk ≥ 1.67',
          capabilityStatus: 'Capable (Cpk ≥ 1.67)',
          notes: 'Parent metal tears before weld nugget fails. Optimal weld penetration.'
        }
      ];

    case 12: // Qualified Lab Documentation
      return [
        {
          id: 'lab-1',
          labName: 'Central Metallurgy & Materials Testing Institute (Thailand)',
          accreditation: 'ISO/IEC 17025:2017',
          accreditationBody: 'Department of Science Service (DSS) / ILAC-MRA',
          certNumber: 'TEST-TH-17025-0891',
          scopeOfTesting: 'Metallic Tensile Test, Charpy V-Notch Impact, OES Spark Chemical Analysis, Rockwell/Vickers Hardness',
          issueDate: '2024-04-10',
          expiryDate: '2027-04-09',
          status: 'Active & Compliant'
        },
        {
          id: 'lab-2',
          labName: 'Apex Internal Metrology & Environmental Quality Lab',
          accreditation: 'Customer Approved Internal Lab',
          accreditationBody: `Toyota / Honda / AutoAlliance QMS Audit Approved`,
          certNumber: 'INT-LAB-2026-CERT-B2',
          scopeOfTesting: '3D CMM Geometric Dimensioning, Cyclic Salt Spray ASTM B117, E-Coat Coating Thickness Gage (X-Ray Fluorescence)',
          issueDate: '2025-01-15',
          expiryDate: '2027-01-14',
          status: 'Active & Compliant'
        }
      ];

    case 13: // Appearance Approval Report
      return [
        {
          id: 'aar-1',
          areaFeature: 'Primary Exterior Upper Bracket Surface (Visible in Engine Bay)',
          colorStandard: 'Toyota Automotive Jet Black (RAL 9005 Ref, Delta E ≤ 0.45)',
          glossLevel: 'Semi-Gloss 42.5 GU @ 60° (Target 40 ± 5 GU)',
          textureGrain: 'Fine Smooth E-Coat (Ra ≤ 1.2 um, zero orange peel texture)',
          visualDefects: 'Zero blisters, craters, pinholes, dry spray, or paint runs observed',
          lightSource: 'D65 Artificial Daylight (1200 Lux)',
          customerDecision: 'Approved',
          signedBy: `Kenji Sato (Lead Appearance Specialist - ${cust})`
        },
        {
          id: 'aar-2',
          areaFeature: 'Weld Nut Seating Face & Thread Entry Area',
          colorStandard: 'Self-color cathodic conversion finish; thread free of excess paint accumulation',
          glossLevel: 'Not applicable (functional zone)',
          textureGrain: 'Machined thread surface conforming to JIS B 0209 6H',
          visualDefects: 'Zero weld spatter inside thread; 100% Go-gage engagement',
          lightSource: 'Dual Source D65 + TL84',
          customerDecision: 'Approved',
          signedBy: `Kenji Sato (Lead Appearance Specialist - ${cust})`
        }
      ];

    case 14: // Sample Production Parts
      return [
        {
          id: 'smp-1',
          sampleNo: 'SMP-2026-001 to 010',
          cavityMold: 'Progressive Stamping Die #PRG-01, Station 1-6',
          productionDate: '2026-02-05 (Morning Shift A, 08:30)',
          quantity: 10,
          serialRange: 'SN-20260205-0001 through 0010',
          inspectionVerdict: '100% CMM & Visual Verified',
          storageLocation: 'Quarantine Sample Shelf #A-01 (Tagged with Golden PPAP Tag)',
          trackingBarcode: `BAR-${pNum}-SMP-01`
        },
        {
          id: 'smp-2',
          sampleNo: 'SMP-2026-011 to 030',
          cavityMold: 'Progressive Stamping Die #PRG-01 + Robotic Weld Cell 1',
          productionDate: '2026-02-05 (Afternoon Shift B, 14:15)',
          quantity: 20,
          serialRange: 'SN-20260205-0150 through 0170',
          inspectionVerdict: '100% CMM & Visual Verified',
          storageLocation: 'Customer Submission Crate (Shipped with PSW Dossier)',
          trackingBarcode: `BAR-${pNum}-SMP-02`
        }
      ];

    case 15: // Master Sample
      return [
        {
          id: 'mst-1',
          masterId: `MST-GOLDEN-${pNum}`,
          type: 'Golden Sample (Nominal)',
          partNumber: `${pNum} (${ecl})`,
          storageLocation: 'QA Environment-Controlled Cabinet #M-01 (Temp 20 ± 2°C, Humidity < 50%)',
          signedDate: '2026-02-10',
          signee: 'Somchai Prasert ('
        }
      ];

    default:
      return [];
  }
}