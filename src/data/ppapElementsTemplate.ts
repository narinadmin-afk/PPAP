import { PPAPElement, PPAPLevel } from '../types/ppap';

export interface PPAPElementMeta {
  id: number;
  name: string;
  nameTh: string;
  nameZh: string;
  description: string;
  shortCode: string;
  retentionLevel: Record<PPAPLevel, 'S' | 'R' | '*' | 'NA'>;
}

export const PPAP_18_ELEMENTS_DEFINITION: PPAPElementMeta[] = [
  {
    id: 1,
    name: 'Design Records',
    nameTh: '1. บันทึกการออกแบบ (Design Records / 2D-3D Drawings)',
    nameZh: '1. 设计记录 (Design Records)',
    description: 'A copy of the engineering drawing or CAD model. If customer is design-responsible, this is customer drawing; if supplier is design-responsible, this is supplier released drawing.',
    shortCode: 'DR',
    retentionLevel: { 1: 'R', 2: 'S', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 2,
    name: 'Engineering Change Documents',
    nameTh: '2. เอกสารการเปลี่ยนแปลงทางวิศวกรรม (Engineering Change Documents)',
    nameZh: '2. 工程变更文件 (Engineering Change Documents)',
    description: 'Approved engineering change documents (ECN/ECO) not yet recorded in the design record but incorporated into the part or tooling.',
    shortCode: 'ECD',
    retentionLevel: { 1: 'R', 2: 'S', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 3,
    name: 'Customer Engineering Approval',
    nameTh: '3. การอนุมัติทางวิศวกรรมจากลูกค้า (Customer Engineering Approval)',
    nameZh: '3. 顾客工程批准 (Customer Engineering Approval)',
    description: 'Evidence of customer engineering department approval where required by the customer.',
    shortCode: 'CEA',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 4,
    name: 'Design FMEA (DFMEA)',
    nameTh: '4. การวิเคราะห์ลักษณะความล้มเหลวในการออกแบบ (Design FMEA)',
    nameZh: '4. 设计失效模式及后果分析 (DFMEA)',
    description: 'Design Failure Mode and Effects Analysis if the supplier is design-responsible.',
    shortCode: 'DFMEA',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 5,
    name: 'Process Flow Diagram',
    nameTh: '5. แผนภูมิกระบวนการผลิต (Process Flow Diagram)',
    nameZh: '5. 过程流程图 (Process Flow Diagram)',
    description: 'Diagram clearly depicting the manufacturing process steps and sequence from receiving through shipping.',
    shortCode: 'PFD',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 6,
    name: 'Process FMEA (PFMEA)',
    nameTh: '6. การวิเคราะห์ลักษณะความล้มเหลวในกระบวนการ (Process FMEA)',
    nameZh: '6. 过程失效模式及后果分析 (PFMEA)',
    description: 'Process Failure Mode and Effects Analysis compliant with AIAG & VDA methodology evaluating potential product quality risks in production.',
    shortCode: 'PFMEA',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 7,
    name: 'Control Plan',
    nameTh: '7. แผนควบคุมกระบวนการ (Control Plan)',
    nameZh: '7. 控制计划 (Control Plan)',
    description: 'Pre-launch and production control plan defining all special characteristics, controls, inspection frequencies, sample sizes, and reaction plans.',
    shortCode: 'CP',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 8,
    name: 'Measurement System Analysis (MSA)',
    nameTh: '8. การวิเคราะห์ระบบการวัด (Measurement System Analysis - MSA)',
    nameZh: '8. 测量系统分析 (MSA)',
    description: 'Applicable MSA studies (e.g. Gage R&R, Bias, Linearity, Stability) for all equipment referenced in the Control Plan.',
    shortCode: 'MSA',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 9,
    name: 'Dimensional Results',
    nameTh: '9. ผลการตรวจสอบมิติชิ้นงาน (Dimensional Results)',
    nameZh: '9. 尺寸结果报告 (Dimensional Results)',
    description: 'Evidence that dimensional verifications have been completed and results indicate compliance with all specified requirements on ballooned drawings.',
    shortCode: 'DIM',
    retentionLevel: { 1: 'R', 2: 'S', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 10,
    name: 'Material, Performance Test Results',
    nameTh: '10. ผลการทดสอบวัสดุและสมรรถนะ (Material / Performance Test Results)',
    nameZh: '10. 材料/性能试验结果 (Material & Performance Tests)',
    description: 'Records of material tests (tensile, chemical, hardness, salt spray, flammability) and functional performance test results according to OEM specifications.',
    shortCode: 'MPTR',
    retentionLevel: { 1: 'R', 2: 'S', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 11,
    name: 'Initial Process Studies',
    nameTh: '11. การศึกษาสมรรถนะกระบวนการเบื้องต้น (Initial Process Studies - Cpk / Ppk)',
    nameZh: '11. 初始过程能力研究 (Initial Process Studies Cpk/Ppk)',
    description: 'Short-term statistical process capability index (Ppk >= 1.67) for all customer-designated special and safety characteristics.',
    shortCode: 'IPS',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 12,
    name: 'Qualified Laboratory Documentation',
    nameTh: '12. เอกสารรับรองห้องปฏิบัติการ (Qualified Laboratory Documentation)',
    nameZh: '12. 合格实验室文件 (ISO/IEC 17025)',
    description: 'Laboratory scope and accreditation evidence (e.g. ISO/IEC 17025) for internal or external commercial testing laboratories.',
    shortCode: 'QLD',
    retentionLevel: { 1: 'R', 2: 'S', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 13,
    name: 'Appearance Approval Report (AAR)',
    nameTh: '13. รายงานการอนุมัติลักษณะภายนอก (Appearance Approval Report - AAR)',
    nameZh: '13. 外观批准报告 (AAR)',
    description: 'Completed Appearance Approval Report for parts with color, grain, gloss, or visual surface criteria designated by customer.',
    shortCode: 'AAR',
    retentionLevel: { 1: 'S', 2: 'S', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 14,
    name: 'Sample Production Parts',
    nameTh: '14. ชิ้นงานตัวอย่างจากการผลิตจริง (Sample Production Parts)',
    nameZh: '14. 生产样品 (Sample Production Parts)',
    description: 'Sample parts taken from significant production run (min 300 pieces or 1-8 hour run) provided per customer instructions.',
    shortCode: 'SPP',
    retentionLevel: { 1: 'R', 2: 'S', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 15,
    name: 'Master Sample',
    nameTh: '15. ชิ้นงานแม่แบบ (Master Sample / Golden Sample)',
    nameZh: '15. 标准样品 (Master Sample)',
    description: 'Retained master sample parts identified and preserved at supplier facility for the same period as the production part approval records.',
    shortCode: 'MS',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'R', 4: '*', 5: 'R' }
  },
  {
    id: 16,
    name: 'Checking Aids',
    nameTh: '16. อุปกรณ์ช่วยตรวจสอบ (Checking Aids / Fixtures / Jigs)',
    nameZh: '16. 检查辅具 (Checking Aids)',
    description: 'Certification, dimensional calibration report, and Gage R&R for part-specific inspection fixtures, checking aids, templates, and gages.',
    shortCode: 'CA',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'R', 4: '*', 5: 'R' }
  },
  {
    id: 17,
    name: 'Customer-Specific Requirements',
    nameTh: '17. ข้อกำหนดเฉพาะของลูกค้า (Customer-Specific Requirements - CSR)',
    nameZh: '17. 顾客特殊要求记录 (Customer-Specific Requirements)',
    description: 'Records of compliance to customer-specific requirements (e.g. IMDS certification, CQI assessments, OEM packaging approval).',
    shortCode: 'CSR',
    retentionLevel: { 1: 'R', 2: 'R', 3: 'S', 4: '*', 5: 'R' }
  },
  {
    id: 18,
    name: 'Part Submission Warrant (PSW)',
    nameTh: '18. ใบรับรองการส่งมอบชิ้นงาน (Part Submission Warrant - PSW)',
    nameZh: '18. 零件提交保证书 (Part Submission Warrant - PSW)',
    description: 'The mandatory declaration document summarizing the submission level, reason, verification checklist, supplier declaration, and OEM sign-off.',
    shortCode: 'PSW',
    retentionLevel: { 1: 'S', 2: 'S', 3: 'S', 4: 'S', 5: 'R' }
  }
];

export function generateDefaultElements(level: PPAPLevel = 3): PPAPElement[] {
  return PPAP_18_ELEMENTS_DEFINITION.map((def) => {
    const requirement = def.retentionLevel[level];
    const isApplicable = requirement !== 'NA';
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      shortCode: def.shortCode,
      status: 'Not Started',
      currentRevision: 'Rev 0',
      isApplicable,
      requiredForLevel: def.retentionLevel,
      updatedAt: new Date().toISOString(),
      attachments: [],
      revisions: [
        {
          revision: 'Rev 0',
          changeDescription: 'Initial document draft placeholder',
          preparedBy: 'Quality Engineer',
          date: new Date().toISOString().split('T')[0],
          status: 'Not Started'
        }
      ]
    };
  });
}
