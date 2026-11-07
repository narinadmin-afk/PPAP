import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import {
  PPAPProject,
  PFMEARow,
  ControlPlanRow,
  DimensionalRow,
  ProcessFlowStep,
  PSWData
} from '../types/ppap';

// ==========================================
// Excel Export Utilities
// ==========================================

export function exportPFMEAToExcel(project: PPAPProject, rows: PFMEARow[]) {
  const wb = XLSX.utils.book_new();

  // Header info
  const headerData = [
    ['PROCESS FAILURE MODE AND EFFECTS ANALYSIS (PFMEA)'],
    ['Compliant with AIAG & VDA FMEA 1st Edition Standard'],
    [],
    ['Project Number:', project.projectNumber, 'Part Name:', project.partName],
    ['Part Number:', project.partNumber, 'Drawing Number:', project.drawingNumber],
    ['Customer:', project.customerName, 'Supplier:', project.supplierName],
    ['Responsible Engineer:', project.responsibleEngineer, 'Submission Level:', `Level ${project.submissionLevel}`],
    ['Date Exported:', new Date().toLocaleDateString()],
    []
  ];

  const tableHeaders = [
    'Process Step',
    'Process Function',
    'Failure Mode',
    'Failure Effect',
    'Failure Cause',
    'Prevention Control',
    'Detection Control',
    'Severity (S)',
    'Occurrence (O)',
    'Detection (D)',
    'Action Priority (AP)',
    'Recommended Action',
    'Responsibility',
    'Target Date',
    'Status'
  ];

  const tableRows = rows.map(r => [
    r.processStep,
    r.processFunction,
    r.failureMode,
    r.failureEffect,
    r.failureCause,
    r.preventionControl,
    r.detectionControl,
    r.severity,
    r.occurrence,
    r.detection,
    r.actionPriority,
    r.recommendedAction,
    r.responsibility,
    r.targetCompletionDate,
    r.status
  ]);

  const sheetData = [...headerData, tableHeaders, ...tableRows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 25 },
    { wch: 30 },
    { wch: 25 },
    { wch: 30 },
    { wch: 30 },
    { wch: 25 },
    { wch: 25 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 10 },
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'PFMEA AIAG-VDA');
  XLSX.writeFile(wb, `PFMEA_${project.partNumber}_${project.projectNumber}.xlsx`);
}

export function exportControlPlanToExcel(project: PPAPProject, rows: ControlPlanRow[]) {
  const wb = XLSX.utils.book_new();

  const headerData = [
    ['PRODUCTION CONTROL PLAN (AIAG / IATF 16949)'],
    ['Pre-Launch & Mass Production Process Control'],
    [],
    ['Project Number:', project.projectNumber, 'Part Name:', project.partName],
    ['Part Number:', project.partNumber, 'Manufacturing Plant:', project.manufacturingLocation],
    ['Customer:', project.customerName, 'Supplier:', project.supplierName],
    ['Prepared By:', project.responsibleEngineer, 'Revision:', project.engineeringChangeLevel],
    ['Date:', new Date().toLocaleDateString()],
    []
  ];

  const tableHeaders = [
    'Process No',
    'Process Name / Operation',
    'Machine / Equipment',
    'Product Characteristic',
    'Process Characteristic',
    'Special Char Class',
    'Specification / Tolerance',
    'Measurement Technique',
    'Sample Size',
    'Frequency',
    'Control Method',
    'Reaction Plan'
  ];

  const tableRows = rows.map(r => [
    r.processNumber,
    r.processName,
    r.machineEquipment,
    r.productCharacteristic,
    r.processCharacteristic,
    r.specialCharacteristic,
    r.specificationTolerance,
    r.measurementTechnique,
    r.sampleSize,
    r.frequency,
    r.controlMethod,
    r.reactionPlan
  ]);

  const sheetData = [...headerData, tableHeaders, ...tableRows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 22 },
    { wch: 25 },
    { wch: 25 },
    { wch: 14 },
    { wch: 25 },
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 25 },
    { wch: 35 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Control Plan');
  XLSX.writeFile(wb, `ControlPlan_${project.partNumber}_${project.projectNumber}.xlsx`);
}

export function exportDimensionalToExcel(project: PPAPProject, rows: DimensionalRow[]) {
  const wb = XLSX.utils.book_new();

  const headerData = [
    ['DIMENSIONAL INSPECTION REPORT (AIAG PPAP ELEMENT 9)'],
    ['Inspection of Production Trial Run Samples'],
    [],
    ['Project Number:', project.projectNumber, 'Part Name:', project.partName],
    ['Part Number:', project.partNumber, 'Drawing Number:', project.drawingNumber],
    ['Customer:', project.customerName, 'Supplier:', project.supplierName],
    ['Inspection Date:', new Date().toLocaleDateString(), 'Inspector:', rows[0]?.inspector || 'QA Metrology'],
    []
  ];

  const tableHeaders = [
    'Balloon No',
    'Drawing Requirement / Dimension',
    'Specification',
    'Upper Limit',
    'Lower Limit',
    'Sample 1',
    'Sample 2',
    'Sample 3',
    'Sample 4',
    'Sample 5',
    'Mean',
    'Min',
    'Max',
    'Measuring Equipment',
    'Inspector',
    'Result (PASS/FAIL)'
  ];

  const tableRows = rows.map(r => [
    r.characteristicNumber,
    r.drawingRequirement,
    r.specification,
    r.upperLimit,
    r.lowerLimit,
    r.samples[0] ?? '',
    r.samples[1] ?? '',
    r.samples[2] ?? '',
    r.samples[3] ?? '',
    r.samples[4] ?? '',
    r.mean,
    r.min,
    r.max,
    r.measuringEquipment,
    r.inspector,
    r.result
  ]);

  const sheetData = [...headerData, tableHeaders, ...tableRows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 10 },
    { wch: 30 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 25 },
    { wch: 18 },
    { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Dimensional Report');
  XLSX.writeFile(wb, `Dimensional_${project.partNumber}_${project.projectNumber}.xlsx`);
}

export function exportPPAPChecklistToExcel(project: PPAPProject) {
  const wb = XLSX.utils.book_new();

  const headerData = [
    ['PPAP 18 ELEMENTS SUBMISSION CHECKLIST (AIAG 4TH EDITION)'],
    ['Automotive Parts Production Approval Tracking'],
    [],
    ['Project Number:', project.projectNumber, 'Part Name:', project.partName],
    ['Part Number:', project.partNumber, 'Customer:', project.customerName],
    ['Submission Level:', `Level ${project.submissionLevel}`, 'Target Date:', project.submissionDate],
    ['Overall Status:', project.status, 'Completed Elements:', `${project.completedElements} / ${project.totalElements}`],
    ['Date Generated:', new Date().toLocaleDateString()],
    []
  ];

  const tableHeaders = [
    'Element No',
    'Element Name',
    'Submission / Retention Requirement',
    'Status',
    'Current Revision',
    'Prepared By',
    'Approved By',
    'Attachments Count',
    'Review Comments'
  ];

  const tableRows = project.elements.map(e => [
    e.id,
    e.name,
    e.requiredForLevel[project.submissionLevel] === 'S'
      ? 'Submit to Customer (S)'
      : e.requiredForLevel[project.submissionLevel] === 'R'
      ? 'Retain at Supplier (R)'
      : e.requiredForLevel[project.submissionLevel] === '*'
      ? 'Customer Specific (*)'
      : 'Not Applicable (NA)',
    e.status,
    e.currentRevision,
    e.preparedBy || project.responsibleEngineer,
    e.approvedBy || '-',
    e.attachments.length,
    e.comments || ''
  ]);

  const sheetData = [...headerData, tableHeaders, ...tableRows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 12 },
    { wch: 35 },
    { wch: 30 },
    { wch: 16 },
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
    { wch: 15 },
    { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'PPAP Checklist');
  XLSX.writeFile(wb, `PPAP_Checklist_${project.partNumber}.xlsx`);
}

// ==========================================
// PDF Export Utilities (jsPDF)
// ==========================================

export function exportPSWToPDF(project: PPAPProject, psw: PSWData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Banner
  doc.setFillColor(15, 23, 42); // Navy Blue (#0f172a)
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PART SUBMISSION WARRANT (PSW)', pageWidth / 2, 11, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('AUTOMOTIVE INDUSTRY ACTION GROUP (AIAG PPAP 4TH EDITION)', pageWidth / 2, 17, { align: 'center' });

  // Border & Grid
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(10, 28, pageWidth - 20, 255);

  // Section 1: Part Information
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 28, pageWidth - 20, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SECTION 1: PART INFORMATION', 12, 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Part Name: ${psw.partName}`, 12, 40);
  doc.text(`Part Number: ${psw.partNumber}`, 105, 40);
  doc.text(`Drawing Number: ${psw.drawingNumber}`, 12, 46);
  doc.text(`Eng. Change Level: ${psw.engineeringChangeLevel}`, 105, 46);
  doc.text(`Drawing Date: ${psw.drawingDate}`, 12, 52);
  doc.text(`PO Number: ${psw.purchaseOrderNo}`, 105, 52);
  doc.text(`Weight: ${psw.weightKg} kg`, 12, 58);
  doc.text(`Checking Aid No: ${psw.checkingAidNo}`, 105, 58);

  // Section 2: Organization / Supplier Info
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 63, pageWidth - 20, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION 2: SUPPLIER / MANUFACTURING INFORMATION', 12, 68);

  doc.setFont('helvetica', 'normal');
  doc.text(`Supplier Name: ${psw.supplierName}`, 12, 75);
  doc.text(`Vendor Code: ${psw.supplierVendorCode}`, 140, 75);
  doc.text(`Manufacturing Location: ${psw.supplierAddress}`, 12, 81);

  // Section 3: Customer Information
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 87, pageWidth - 20, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION 3: CUSTOMER INFORMATION & APPLICATION', 12, 92);

  doc.setFont('helvetica', 'normal');
  doc.text(`Customer Name: ${psw.customerName}`, 12, 99);
  doc.text(`Division / Plant: ${psw.customerDivision}`, 105, 99);
  doc.text(`Customer Buyer: ${psw.customerBuyer}`, 12, 105);
  doc.text(`Vehicle Application: ${psw.application}`, 105, 105);

  // Section 4: Submission Level & Reason
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 111, pageWidth - 20, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION 4: SUBMISSION LEVEL & REASON', 12, 116);

  doc.setFont('helvetica', 'normal');
  doc.text(`Submission Level Selected: LEVEL ${psw.submissionLevel}`, 12, 123);
  doc.text(`Reason for Submission: ${psw.submissionReason}`, 80, 123);

  // Section 5: Verification Checklist
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 131, pageWidth - 20, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION 5: SUBMISSION RESULTS VERIFICATION', 12, 136);

  doc.setFont('helvetica', 'normal');
  doc.text(`[ ${psw.dimensionalTestResults ? 'X' : ' '} ] Dimensional Results Verified`, 14, 144);
  doc.text(`[ ${psw.materialTestResults ? 'X' : ' '} ] Material Test Results Verified`, 14, 150);
  doc.text(`[ ${psw.performanceTestResults ? 'X' : ' '} ] Performance & Durability Tested`, 14, 156);
  doc.text(`[ ${psw.appearanceTestResults ? 'X' : ' '} ] Appearance Approval Report (AAR)`, 105, 144);
  doc.text(`[ ${psw.statisticalProcessPackage ? 'X' : ' '} ] Statistical Process Capability (Cpk/Ppk >= 1.67)`, 105, 150);
  doc.text(`[ ${psw.materialsReportedToIMDS ? 'X' : ' '} ] Materials Reported to IMDS (ID: ${psw.imdsIdNo || 'IMDS-TBD'})`, 105, 156);

  // Section 6: Supplier Declaration
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 164, pageWidth - 20, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION 6: SUPPLIER DECLARATION', 12, 169);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const declarationText =
    'I hereby affirm that the samples represented by this warrant are representative of our parts, which were made by a process that meets all Production Part Approval Process (PPAP) manual 4th Edition requirements. I further affirm that these samples were produced at the production rate of significant run volume and meet all drawing specifications.';
  doc.text(doc.splitTextToSize(declarationText, pageWidth - 24), 12, 175);

  doc.setFontSize(8);
  doc.text(`Molds / Cavities / Tooling: ${psw.moldsCavitiesProcesses}`, 12, 186);

  // Signature box
  doc.setDrawColor(180, 180, 180);
  doc.rect(12, 192, 90, 24);
  doc.rect(107, 192, 90, 24);

  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED SUPPLIER SIGNATURE', 14, 197);
  doc.setFont('helvetica', 'normal');
  doc.text(`Sign: /s/ ${psw.authorizedSignatureName}`, 14, 204);
  doc.text(`Title: ${psw.authorizedSignatureTitle}`, 14, 209);
  doc.text(`Date: ${psw.authorizedDate}`, 14, 214);

  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER APPROVAL (OEM USE ONLY)', 109, 197);
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${psw.customerApprovalStatus.toUpperCase()}`, 109, 204);
  doc.text(`Approved By: ${psw.customerApprovalName || 'Pending Final Review'}`, 109, 209);
  doc.text(`Date: ${psw.customerApprovalDate || '-'}`, 109, 214);

  // Customer Remarks
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 222, pageWidth - 20, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER REMARKS / DISPOSITION', 12, 227);
  doc.setFont('helvetica', 'normal');
  doc.text(psw.customerRemarks || 'None', 12, 235);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated by PPAP Management System | Project ${project.projectNumber} | Page 1 of 1`, pageWidth / 2, 290, {
    align: 'center'
  });

  return doc;
}

export function exportDimensionalToPDF(project: PPAPProject, rows: DimensionalRow[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('DIMENSIONAL INSPECTION REPORT (PPAP ELEMENT 9)', 14, 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${project.projectNumber} | Part: ${project.partName} (${project.partNumber}) | Level ${project.submissionLevel}`, 14, 16);

  // Table header
  let y = 28;
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, pageWidth - 20, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  doc.text('No', 12, y + 5.5);
  doc.text('Drawing Requirement', 22, y + 5.5);
  doc.text('Specification', 75, y + 5.5);
  doc.text('Upper', 115, y + 5.5);
  doc.text('Lower', 130, y + 5.5);
  doc.text('S1', 145, y + 5.5);
  doc.text('S2', 157, y + 5.5);
  doc.text('S3', 169, y + 5.5);
  doc.text('S4', 181, y + 5.5);
  doc.text('S5', 193, y + 5.5);
  doc.text('Mean', 207, y + 5.5);
  doc.text('Min/Max', 222, y + 5.5);
  doc.text('Equipment', 242, y + 5.5);
  doc.text('Result', 275, y + 5.5);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  rows.forEach((r, idx) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y - 4, pageWidth - 20, 7, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(String(r.characteristicNumber), 12, y);
    doc.text(r.drawingRequirement.substring(0, 32), 22, y);
    doc.text(r.specification.substring(0, 22), 75, y);
    doc.text(String(r.upperLimit), 115, y);
    doc.text(String(r.lowerLimit), 130, y);
    doc.text(String(r.samples[0] ?? '-'), 145, y);
    doc.text(String(r.samples[1] ?? '-'), 157, y);
    doc.text(String(r.samples[2] ?? '-'), 169, y);
    doc.text(String(r.samples[3] ?? '-'), 181, y);
    doc.text(String(r.samples[4] ?? '-'), 193, y);
    doc.text(String(r.mean), 207, y);
    doc.text(`${r.min}/${r.max}`, 222, y);
    doc.text(r.measuringEquipment.substring(0, 20), 242, y);

    if (r.result === 'PASS') {
      doc.setTextColor(22, 101, 52); // green
      doc.setFont('helvetica', 'bold');
      doc.text('PASS', 275, y);
    } else {
      doc.setTextColor(185, 28, 28); // red
      doc.setFont('helvetica', 'bold');
      doc.text('FAIL', 275, y);
    }
    doc.setFont('helvetica', 'normal');

    y += 7;
  });

  return doc;
}

export function exportProcessFlowToPDF(project: PPAPProject, steps: ProcessFlowStep[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PROCESS FLOW DIAGRAM (PPAP ELEMENT 5)', pageWidth / 2, 11, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${project.projectNumber} | Part: ${project.partName} (${project.partNumber})`, pageWidth / 2, 17, { align: 'center' });

  let y = 32;

  steps.forEach((step, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 30;
    }

    // Step Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, pageWidth - 30, 24, 2, 2, 'FD');

    // Step Number Badge
    doc.setFillColor(30, 58, 138); // blue
    doc.roundedRect(18, y + 3, 22, 18, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`OP ${step.stepNumber}`, 29, y + 14, { align: 'center' });

    // Details
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`${step.stepName} [Type: ${step.type.toUpperCase()}]`, 45, y + 8);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Workstation / Machine: ${step.machine}`, 45, y + 14);
    doc.text(`Parameters: ${step.keyParameters} | Inspection: ${step.inspectionMethod || 'Standard QA'}`, 45, y + 20);

    y += 28;

    // Arrow down if not last
    if (idx < steps.length - 1 && y <= 250) {
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(0.6);
      doc.line(pageWidth / 2, y - 4, pageWidth / 2, y);
      doc.triangle(pageWidth / 2 - 1.5, y - 1, pageWidth / 2 + 1.5, y - 1, pageWidth / 2, y + 1, 'FD');
      y += 4;
    }
  });

  return doc;
}

// ==========================================
// Complete PPAP Package (ZIP Archive)
// ==========================================

export async function exportCompletePPAPZip(
  project: PPAPProject,
  psw: PSWData | null,
  pfmea: PFMEARow[],
  controlPlan: ControlPlanRow[],
  processFlow: ProcessFlowStep[],
  dimensional: DimensionalRow[]
): Promise<void> {
  const zip = new JSZip();
  const folderName = `${project.projectNumber}_${project.partNumber}_Level_${project.submissionLevel}_PPAP_Package`;
  const folder = zip.folder(folderName);

  if (!folder) return;

  // 1. PSW PDF
  if (psw) {
    const pswDoc = exportPSWToPDF(project, psw);
    const pswBlob = pswDoc.output('blob');
    folder.file(`01_Part_Submission_Warrant_PSW_${project.partNumber}.pdf`, pswBlob);
  }

  // 2. Process Flow PDF
  if (processFlow && processFlow.length > 0) {
    const pfdDoc = exportProcessFlowToPDF(project, processFlow);
    const pfdBlob = pfdDoc.output('blob');
    folder.file(`02_Process_Flow_Diagram_${project.partNumber}.pdf`, pfdBlob);
  }

  // 3. PFMEA Excel
  if (pfmea && pfmea.length > 0) {
    const wb = XLSX.utils.book_new();
    const headers = [
      ['AIAG-VDA PFMEA MATRIX - ' + project.partName],
      ['Part No:', project.partNumber, 'Customer:', project.customerName],
      [],
      [
        'Process Step',
        'Function',
        'Failure Mode',
        'Failure Effect',
        'Failure Cause',
        'Prevention',
        'Detection',
        'S',
        'O',
        'D',
        'AP',
        'Action',
        'Resp'
      ]
    ];
    const rows = pfmea.map(r => [
      r.processStep,
      r.processFunction,
      r.failureMode,
      r.failureEffect,
      r.failureCause,
      r.preventionControl,
      r.detectionControl,
      r.severity,
      r.occurrence,
      r.detection,
      r.actionPriority,
      r.recommendedAction,
      r.responsibility
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'PFMEA');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    folder.file(`03_Process_FMEA_${project.partNumber}.xlsx`, excelBuffer);
  }

  // 4. Control Plan Excel
  if (controlPlan && controlPlan.length > 0) {
    const wb = XLSX.utils.book_new();
    const headers = [
      ['PRODUCTION CONTROL PLAN - ' + project.partName],
      ['Part No:', project.partNumber, 'Customer:', project.customerName],
      [],
      [
        'Process No',
        'Process Name',
        'Machine',
        'Product Char',
        'Process Char',
        'Special Char',
        'Spec',
        'Measurement',
        'Sample',
        'Freq',
        'Control Method',
        'Reaction Plan'
      ]
    ];
    const rows = controlPlan.map(r => [
      r.processNumber,
      r.processName,
      r.machineEquipment,
      r.productCharacteristic,
      r.processCharacteristic,
      r.specialCharacteristic,
      r.specificationTolerance,
      r.measurementTechnique,
      r.sampleSize,
      r.frequency,
      r.controlMethod,
      r.reactionPlan
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Control Plan');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    folder.file(`04_Control_Plan_${project.partNumber}.xlsx`, excelBuffer);
  }

  // 5. Dimensional Report PDF & Excel
  if (dimensional && dimensional.length > 0) {
    const dimDoc = exportDimensionalToPDF(project, dimensional);
    folder.file(`05_Dimensional_Inspection_Report_${project.partNumber}.pdf`, dimDoc.output('blob'));
  }

  // 6. Master Checklist Excel
  const checklistWb = XLSX.utils.book_new();
  const clHeader = [
    ['PPAP 18 ELEMENTS CHECKLIST - ' + project.projectNumber],
    ['Part Name:', project.partName, 'Part No:', project.partNumber],
    ['Level:', `Level ${project.submissionLevel}`, 'Status:', project.status],
    [],
    ['ID', 'Element Name', 'Req Level', 'Status', 'Revision', 'Prepared By', 'Approved By']
  ];
  const clRows = project.elements.map(e => [
    e.id,
    e.name,
    e.requiredForLevel[project.submissionLevel],
    e.status,
    e.currentRevision,
    e.preparedBy || project.responsibleEngineer,
    e.approvedBy || '-'
  ]);
  const clWs = XLSX.utils.aoa_to_sheet([...clHeader, ...clRows]);
  XLSX.utils.book_append_sheet(checklistWb, clWs, 'PPAP Checklist');
  const clBuffer = XLSX.write(checklistWb, { bookType: 'xlsx', type: 'array' });
  folder.file(`00_Master_PPAP_Checklist_${project.partNumber}.xlsx`, clBuffer);

  // Readme Index
  folder.file(
    '00_README_PPAP_PACKAGE_INDEX.txt',
    `AUTOMOTIVE PPAP SUBMISSION PACKAGE
=====================================
Project Number: ${project.projectNumber}
Customer: ${project.customerName}
Supplier: ${project.supplierName}
Part Name: ${project.partName}
Part Number: ${project.partNumber}
Submission Level: Level ${project.submissionLevel}
Submission Reason: ${project.submissionReason}
Status: ${project.status}
Date Exported: ${new Date().toISOString()}

Contents Included:
- 00_Master_PPAP_Checklist_${project.partNumber}.xlsx
- 01_Part_Submission_Warrant_PSW_${project.partNumber}.pdf
- 02_Process_Flow_Diagram_${project.partNumber}.pdf
- 03_Process_FMEA_${project.partNumber}.xlsx
- 04_Control_Plan_${project.partNumber}.xlsx
- 05_Dimensional_Inspection_Report_${project.partNumber}.pdf

Compliant with IATF 16949 and AIAG PPAP 4th Edition.
`
  );

  // Generate and download zip
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

// ==========================================
// Excel Import for Dimensional Report
// ==========================================

export async function importDimensionalFromExcel(file: File): Promise<DimensionalRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Locate header row containing "Balloon" or "Requirement" or first row
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(json.length, 10); i++) {
          const rowStr = JSON.stringify(json[i]).toLowerCase();
          if (rowStr.includes('balloon') || rowStr.includes('requirement') || rowStr.includes('drawing')) {
            headerRowIdx = i;
            break;
          }
        }

        const rows: DimensionalRow[] = [];
        for (let r = headerRowIdx + 1; r < json.length; r++) {
          const row = json[r];
          if (!row || row.length === 0 || !row[0]) continue;

          const balloonNo = Number(row[0]) || rows.length + 1;
          const drawingRequirement = String(row[1] || `Dimension #${balloonNo}`);
          const specification = String(row[2] || '');
          const upperLimit = Number(row[3]) || 0;
          const lowerLimit = Number(row[4]) || 0;

          // sample readings columns 5 to 9
          const samples = [
            Number(row[5]) || upperLimit,
            Number(row[6]) || upperLimit,
            Number(row[7]) || upperLimit,
            Number(row[8]) || upperLimit,
            Number(row[9]) || upperLimit
          ];

          const mean = Number((samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(3));
          const min = Number(Math.min(...samples).toFixed(3));
          const max = Number(Math.max(...samples).toFixed(3));
          const pass = samples.every(v => v >= lowerLimit && v <= upperLimit);

          rows.push({
            id: `dim-imp-${Date.now()}-${r}`,
            characteristicNumber: balloonNo,
            drawingRequirement,
            specification,
            upperLimit,
            lowerLimit,
            samples,
            mean,
            min,
            max,
            measuringEquipment: String(row[13] || 'CMM / Caliper'),
            inspector: String(row[14] || 'Inspector'),
            inspectionDate: new Date().toISOString().split('T')[0],
            result: pass ? 'PASS' : 'FAIL'
          });
        }

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export generic standard element table to Excel
 */
export function exportElementTableToExcel(
  project: PPAPProject,
  elementId: number,
  elementName: string,
  columns: Array<{ key: string; label: string }>,
  rows: any[]
) {
  const wb = XLSX.utils.book_new();
  const headerData = [
    [`PPAP ELEMENT #${elementId}: ${elementName.toUpperCase()}`],
    [`AIAG PPAP 4th Edition / IATF 16949 Standard Verification Table`],
    [],
    ['Project Number:', project.projectNumber, 'Part Name:', project.partName],
    ['Part Number:', project.partNumber, 'Customer:', project.customerName],
    ['Export Date:', new Date().toLocaleDateString(), 'Total Records:', rows.length],
    []
  ];

  const tableHeaders = columns.map(c => c.label);
  const tableRows = rows.map(r => columns.map(c => r[c.key] ?? ''));

  const ws = XLSX.utils.aoa_to_sheet([...headerData, tableHeaders, ...tableRows]);
  ws['!cols'] = columns.map(() => ({ wch: 22 }));

  const cleanName = elementName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  XLSX.utils.book_append_sheet(wb, ws, `Element_${elementId}`);
  XLSX.writeFile(wb, `${project.projectNumber}_Element_${elementId}_${cleanName}.xlsx`);
}

/**
 * Export generic standard element table to PDF
 */
export function exportElementTableToPDF(
  project: PPAPProject,
  elementId: number,
  elementName: string,
  columns: Array<{ key: string; label: string }>,
  rows: any[]
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Navy Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`PPAP ELEMENT #${elementId}: ${elementName.toUpperCase()}`, 14, 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Project: ${project.projectNumber} | Part: ${project.partName} (${project.partNumber}) | Customer: ${project.customerName} | Level ${project.submissionLevel}`,
    14,
    17
  );

  // Compute column widths dynamically across available table width
  const marginX = 10;
  const tableWidth = pageWidth - marginX * 2;
  const colCount = Math.max(columns.length, 1);
  const colWidth = tableWidth / colCount;

  let y = 30;

  // Header row
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, y, tableWidth, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  columns.forEach((col, idx) => {
    const text = col.label.length > 20 ? col.label.substring(0, 18) + '..' : col.label;
    doc.text(text, marginX + idx * colWidth + 2, y + 5.5);
  });

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  let pageNum = 1;

  rows.forEach((row, rowIdx) => {
    if (y > pageHeight - 20) {
      // Add page footer
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Page ${pageNum} | AIAG PPAP 4th Edition Standard Verification Document`, pageWidth / 2, pageHeight - 8, {
        align: 'center'
      });

      doc.addPage();
      pageNum++;
      y = 20;

      // Repeat header on new page
      doc.setFillColor(241, 245, 249);
      doc.rect(marginX, y, tableWidth, 8, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      columns.forEach((col, idx) => {
        const text = col.label.length > 20 ? col.label.substring(0, 18) + '..' : col.label;
        doc.text(text, marginX + idx * colWidth + 2, y + 5.5);
      });
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
    }

    if (rowIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y - 4, tableWidth, 7, 'F');
    }

    doc.setTextColor(15, 23, 42);

    columns.forEach((col, colIdx) => {
      const val = row[col.key];
      const strVal = val !== undefined && val !== null ? String(val) : '-';
      const cleanVal = strVal.length > 25 ? strVal.substring(0, 23) + '..' : strVal;

      if (strVal === 'PASS' || strVal === 'Approved' || strVal === 'Capable (Cpk ≥ 1.67)' || strVal === 'Fully Approved') {
        doc.setTextColor(22, 101, 52);
        doc.setFont('helvetica', 'bold');
        doc.text(cleanVal, marginX + colIdx * colWidth + 2, y);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
      } else if (strVal === 'FAIL' || strVal === 'Rejected' || strVal === 'Not Capable (Cpk < 1.33)') {
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.text(cleanVal, marginX + colIdx * colWidth + 2, y);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.text(cleanVal, marginX + colIdx * colWidth + 2, y);
      }
    });

    y += 7;
  });

  // Footer on last page
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Page ${pageNum} | AIAG PPAP 4th Edition Standard Verification Document | Generated by PPAP Management System`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  return doc;
}

/**
 * Export PFMEA to PDF (AIAG & VDA 1st Edition)
 */
export function exportPFMEAToPDF(project: PPAPProject, rows: PFMEARow[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('PROCESS FMEA MATRIX (AIAG & VDA 1ST EDITION)', 14, 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Project: ${project.projectNumber} | Part: ${project.partName} (${project.partNumber}) | Responsible: ${project.responsibleEngineer}`,
    14,
    17
  );

  let y = 30;
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, pageWidth - 20, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');

  doc.text('Step', 12, y + 5.5);
  doc.text('Function', 26, y + 5.5);
  doc.text('Failure Mode', 60, y + 5.5);
  doc.text('Failure Effect', 100, y + 5.5);
  doc.text('S', 140, y + 5.5);
  doc.text('Potential Cause', 146, y + 5.5);
  doc.text('O', 188, y + 5.5);
  doc.text('Prev / Det Control', 194, y + 5.5);
  doc.text('D', 234, y + 5.5);
  doc.text('AP', 240, y + 5.5);
  doc.text('Action', 252, y + 5.5);
  doc.text('Status', 278, y + 5.5);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);

  rows.forEach((r, idx) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y - 4, pageWidth - 20, 7, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(String(r.processStep).substring(0, 10), 12, y);
    doc.text(String(r.processFunction).substring(0, 20), 26, y);
    doc.text(String(r.failureMode).substring(0, 24), 60, y);
    doc.text(String(r.failureEffect).substring(0, 24), 100, y);
    doc.text(String(r.severity), 140, y);
    doc.text(String(r.failureCause).substring(0, 24), 146, y);
    doc.text(String(r.occurrence), 188, y);
    doc.text(String(r.preventionControl).substring(0, 24), 194, y);
    doc.text(String(r.detection), 234, y);

    // AP Badge
    if (r.actionPriority === 'High') {
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
      doc.text('HIGH', 240, y);
    } else if (r.actionPriority === 'Medium') {
      doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text('MED', 240, y);
    } else {
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
      doc.text('LOW', 240, y);
    }
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    doc.text(String(r.recommendedAction || '-').substring(0, 16), 252, y);
    doc.text(String(r.status || 'Open'), 278, y);

    y += 7;
  });

  return doc;
}

/**
 * Export Control Plan to PDF
 */
export function exportControlPlanToPDF(project: PPAPProject, rows: ControlPlanRow[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTOMOTIVE CONTROL PLAN (PPAP ELEMENT 7)', 14, 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Project: ${project.projectNumber} | Part: ${project.partName} (${project.partNumber}) | Plant: ${project.manufacturingLocation}`,
    14,
    17
  );

  let y = 30;
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, pageWidth - 20, 8, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');

  doc.text('No', 12, y + 5.5);
  doc.text('Process Name', 24, y + 5.5);
  doc.text('Machine / Tool', 60, y + 5.5);
  doc.text('Product Char', 95, y + 5.5);
  doc.text('Class', 135, y + 5.5);
  doc.text('Specification', 152, y + 5.5);
  doc.text('Evaluation Method', 192, y + 5.5);
  doc.text('Size/Freq', 230, y + 5.5);
  doc.text('Control Method', 255, y + 5.5);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);

  rows.forEach((r, idx) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y - 4, pageWidth - 20, 7, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(String(r.processNumber), 12, y);
    doc.text(String(r.processName).substring(0, 20), 24, y);
    doc.text(String(r.machineEquipment).substring(0, 18), 60, y);
    doc.text(String(r.productCharacteristic).substring(0, 22), 95, y);

    if (r.specialCharacteristic === 'Critical') {
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
      doc.text('CRITICAL', 135, y);
    } else if (r.specialCharacteristic === 'Major') {
      doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text('MAJOR', 135, y);
    } else {
      doc.text(String(r.specialCharacteristic || '-'), 135, y);
    }
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    doc.text(String(r.specificationTolerance).substring(0, 22), 152, y);
    doc.text(String(r.measurementTechnique).substring(0, 22), 192, y);
    doc.text(`${r.sampleSize} / ${r.frequency}`.substring(0, 16), 230, y);
    doc.text(String(r.controlMethod).substring(0, 24), 255, y);

    y += 7;
  });

  return doc;
}

/**
 * Export PPAP 18 Elements Submission Checklist to PDF
 */
export function exportChecklistToPDF(project: PPAPProject): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('PPAP 18 ELEMENTS MASTER SUBMISSION CHECKLIST', pageWidth / 2, 11, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `AIAG 4th Edition Compliance | Project: ${project.projectNumber} | Level ${project.submissionLevel}`,
    pageWidth / 2,
    17,
    { align: 'center' }
  );

  let y = 34;

  // Project Info Card
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, pageWidth - 20, 18, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Part Name: ${project.partName}`, 14, y + 6);
  doc.text(`Part Number: ${project.partNumber}`, 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer: ${project.customerName}`, 14, y + 12);
  doc.text(
    `Approval Readiness: ${project.completedElements} / ${project.totalElements} (${Math.round(
      (project.completedElements / (project.totalElements || 18)) * 100
    )}%)`,
    110,
    y + 12
  );

  y += 24;

  // Checklist Header
  doc.setFillColor(15, 23, 42);
  doc.rect(10, y, pageWidth - 20, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('#', 13, y + 5);
  doc.text('Element Description', 22, y + 5);
  doc.text('Requirement', 115, y + 5);
  doc.text('Status', 145, y + 5);
  doc.text('Rev', 178, y + 5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  project.elements.forEach((el, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y - 4, pageWidth - 20, 6.5, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(String(el.id), 13, y);
    doc.text(el.name.substring(0, 48), 22, y);

    const req = el.requiredForLevel[project.submissionLevel];
    doc.text(req === 'S' ? 'Submit (S)' : req === 'R' ? 'Retain (R)' : 'Special (*)', 115, y);

    if (el.status === 'Approved') {
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
      doc.text('Approved', 145, y);
    } else if (el.status === 'Pending Review') {
      doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text('In Review', 145, y);
    } else {
      doc.text(el.status, 145, y);
    }
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    doc.text(el.currentRevision || 'Rev 0', 178, y);

    y += 6.5;
  });

  return doc;
}


