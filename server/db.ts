import fs from 'fs';
import path from 'path';
import {
  PPAPProject,
  User,
  PFMEARow,
  ProcessFlowStep,
  ControlPlanRow,
  DimensionalRow,
  PSWData,
  Notification,
  AuditLog,
  PPAPLevel
} from '../src/types/ppap';
import { PPAP_18_ELEMENTS_DEFINITION, generateDefaultElements } from '../src/data/ppapElementsTemplate';
import { getDefaultRowsForElement } from '../src/data/standardElementTemplates';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'ppap_store.json');

export interface DatabaseSchema {
  users: User[];
  projects: PPAPProject[];
  pfmeas: Record<string, PFMEARow[]>; // projectId -> rows
  processFlows: Record<string, ProcessFlowStep[]>; // projectId -> steps
  controlPlans: Record<string, ControlPlanRow[]>; // projectId -> rows
  dimensionalReports: Record<string, DimensionalRow[]>; // projectId -> rows
  pswRecords: Record<string, PSWData>; // projectId -> psw
  elementTables?: Record<string, any[]>; // `${projectId}_${elementId}` -> rows
  notifications: Notification[];
  auditLogs: AuditLog[];
}

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Somchai Prasert (สมชาย ประเสริฐ)',
    email: 'somchai.p@autoquality.com',
    role: 'Quality Manager',
    department: 'Quality Assurance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    signature: 'Somchai Prasert (QA Mgr)'
  },
  {
    id: 'u-2',
    name: 'Nattaporn Chaiyasin (ณัฐพร ชัยสิน)',
    email: 'nattaporn.c@autoquality.com',
    role: 'Quality Engineer',
    department: 'Quality Control',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    signature: 'Nattaporn C. (QE)'
  },
  {
    id: 'u-3',
    name: 'Kittisak Wongsuwan (กิตติศักดิ์ วงษ์สุวรรณ)',
    email: 'kittisak.w@autoquality.com',
    role: 'Production Engineer',
    department: 'Manufacturing Eng',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    signature: 'Kittisak W. (PE)'
  },
  {
    id: 'u-4',
    name: 'Dr. Akira Tanaka (田中 晃)',
    email: 'akira.tanaka@toyota-oem.com',
    role: 'Administrator',
    department: 'OEM Engineering & Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    signature: 'A. Tanaka (Director)'
  },
  {
    id: 'u-5',
    name: 'Siriporn Rattanaporn (ศิริพร รัตนพร)',
    email: 'siriporn.r@autoquality.com',
    role: 'Inspector',
    department: 'CMM & Metrology Lab',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    signature: 'Siriporn R. (Lead Inspector)'
  },
  {
    id: 'u-6',
    name: 'Chaiwat Boonsri (ชัยวัฒน์ บุญศรี)',
    email: 'chaiwat.b@autoquality.com',
    role: 'R&D Engineer',
    department: 'Product Design',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    signature: 'Chaiwat B. (R&D)'
  }
];

function seedDefaultProject(
  id: string,
  projectNumber: string,
  customerName: string,
  supplierName: string,
  partName: string,
  partNumber: string,
  drawingNumber: string,
  changeLevel: string,
  location: string,
  level: PPAPLevel,
  reason: any,
  subDate: string,
  engineer: string,
  status: any
): PPAPProject {
  const elements = generateDefaultElements(level);
  
  // Custom status per element for richness
  if (status === 'Pending Review' || status === 'Approved') {
    elements.forEach((el, index) => {
      if (index < 16) {
        el.status = 'Approved';
        el.approvedBy = 'Somchai Prasert (Quality Manager)';
        el.reviewedBy = 'Nattaporn Chaiyasin (Quality Engineer)';
        el.currentRevision = 'Rev A';
      } else if (index === 16) {
        el.status = status === 'Approved' ? 'Approved' : 'Pending Review';
        el.currentRevision = 'Rev A';
      } else {
        el.status = status === 'Approved' ? 'Approved' : 'Pending Review';
        el.currentRevision = 'Rev 0';
      }
      el.attachments.push({
        id: `att-${id}-${el.id}`,
        fileName: `${el.shortCode}_${partNumber}_${el.currentRevision}.pdf`,
        fileSize: 1024 * (180 + el.id * 45),
        fileType: 'application/pdf',
        uploadedBy: engineer,
        uploadedAt: new Date(Date.now() - (18 - el.id) * 86400000).toISOString(),
        url: `/uploads/${el.shortCode}_${partNumber}.pdf`,
        revision: el.currentRevision
      });
    });
  } else if (status === 'In Progress') {
    elements.forEach((el, index) => {
      if (index < 7) {
        el.status = 'Approved';
        el.currentRevision = 'Rev A';
      } else if (index < 12) {
        el.status = 'In Progress';
        el.currentRevision = 'Rev 0';
      } else {
        el.status = 'Not Started';
      }
    });
  } else if (status === 'Rejected') {
    elements.forEach((el, index) => {
      if (index === 5 || index === 8) {
        el.status = 'Rejected';
        el.comments = index === 5
          ? 'PFMEA S/O/D ratings under-evaluated. Occurrence must be revised due to past stamping tooling wear data.'
          : 'CMM inspection points 4 & 7 show Ppk < 1.33. Corrective action plan required before resubmission.';
        el.currentRevision = 'Rev 0';
      } else if (index < 12) {
        el.status = 'Approved';
        el.currentRevision = 'Rev A';
      } else {
        el.status = 'In Progress';
      }
    });
  }

  const completed = elements.filter(e => e.status === 'Approved').length;

  return {
    id,
    projectNumber,
    customerName,
    supplierName,
    partName,
    partNumber,
    drawingNumber,
    engineeringChangeLevel: changeLevel,
    manufacturingLocation: location,
    submissionLevel: level,
    submissionReason: reason,
    submissionDate: subDate,
    responsibleEngineer: engineer,
    status,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    totalElements: elements.length,
    completedElements: completed,
    elements
  };
}

import { calculateActionPriority } from '../src/utils/fmeaUtils';
export { calculateActionPriority };

function getInitialDatabase(): DatabaseSchema {
  const p1 = seedDefaultProject(
    'p-1',
    'PPAP-2026-001',
    'Toyota Motor Thailand Co., Ltd.',
    'Apex Automotive Precision Parts Ltd.',
    'Engine Mounting Support Bracket LH',
    '51201-0K150-C',
    'DWG-51201-REV-04',
    'ECL-04 (High Tensile Steel Upgrade)',
    'Samut Prakan Plant 2, Line B',
    3,
    'Engineering Change(s)',
    '2026-11-20',
    'Nattaporn Chaiyasin (Quality Engineer)',
    'Pending Review'
  );

  const p2 = seedDefaultProject(
    'p-2',
    'PPAP-2026-002',
    'Honda Automobile (Thailand) Co., Ltd.',
    'Apex Automotive Precision Parts Ltd.',
    'Front Suspension Subframe Reinforcement Lower',
    '74111-T5A-000',
    'HD-74111-T5A',
    'Rev C',
    'Ayutthaya Industrial Estate, Unit 4',
    3,
    'Initial Submission',
    '2026-12-05',
    'Kittisak Wongsuwan (Production Engineer)',
    'In Progress'
  );

  const p3 = seedDefaultProject(
    'p-3',
    'PPAP-2026-003',
    'AutoAlliance (Thailand) Co., Ltd. (Ford / Mazda)',
    'Apex Automotive Precision Parts Ltd.',
    'Instrument Panel Center Bezel Housing',
    'JB3B-15043-AA',
    'FRD-JB3B-15043',
    'ECN-2026-88',
    'Rayong Eastern Seaboard Line 1',
    2,
    'Tooling: Transfer, Replacement, Refurbishment',
    '2026-10-15',
    'Chaiwat Boonsri (R&D Engineer)',
    'Approved'
  );

  const p4 = seedDefaultProject(
    'p-4',
    'PPAP-2026-004',
    'Isuzu Motors Co., (Thailand) Ltd.',
    'Apex Automotive Precision Parts Ltd.',
    'Common Rail High-Pressure Fuel Pipe Clamp',
    '8-98012345-0',
    'ISZ-898012',
    'Level 2.1',
    'Gateway City Chachoengsao',
    4,
    'Change in Part Processing',
    '2026-11-28',
    'Nattaporn Chaiyasin (Quality Engineer)',
    'Rejected'
  );

  // Sample PFMEA for p-1
  const pfmea1: PFMEARow[] = [
    {
      id: 'pf-101',
      processStep: 'OP 10: Blanking & Piercing',
      processFunction: 'Cut high-strength steel sheet (SPFC 590) to blank shape and punch locating pilot holes',
      failureMode: 'Burr height exceeds limit (> 0.08 mm)',
      failureEffect: 'Poor seating in subsequent forming die; potential crack at bend radius',
      failureCause: 'Punch/die clearance worn or incorrect punch sharpness',
      preventionControl: 'Tooling preventive maintenance every 25,000 strokes; carbide punch inserts',
      detectionControl: 'Optical profile projector inspection 5 pcs per 2 hours',
      severity: 7,
      occurrence: 3,
      detection: 3,
      actionPriority: calculateActionPriority(7, 3, 3),
      recommendedAction: 'Install automated acoustic die wear acoustic sensor monitor',
      responsibility: 'Kittisak W. (PE)',
      targetCompletionDate: '2026-11-15',
      status: 'In Progress'
    },
    {
      id: 'pf-102',
      processStep: 'OP 20: Progressive Stamping & Forming',
      processFunction: 'Draw and form 90-degree bracket flange ribs to required CAD geometry',
      failureMode: 'Flange spring-back angle out of tolerance (89.0° vs 90.0° ± 0.5°)',
      failureEffect: 'Assembly interference during chassis bracket robot bolting at OEM line',
      failureCause: 'Yield strength variation in raw coil lot; cushion nitrogen pressure decay',
      preventionControl: 'Coil tensile cert verification per batch; nitrogen pressure transducer interlock',
      detectionControl: 'Dedicated check fixture with dial indicator 100% go/no-go pin',
      severity: 8,
      occurrence: 4,
      detection: 2,
      actionPriority: calculateActionPriority(8, 4, 2),
      recommendedAction: 'Implement automated servo cushion closed-loop pressure feedback',
      responsibility: 'Kittisak W. (PE)',
      targetCompletionDate: '2026-11-18',
      status: 'In Progress'
    },
    {
      id: 'pf-103',
      processStep: 'OP 30: Robotic MIG Welding of Nut Plate',
      processFunction: 'Join M10 weld nuts to reinforcement bracket with structural weld penetration',
      failureMode: 'Incomplete weld penetration or spatter inside thread',
      failureEffect: 'Weld nut detachment under 45 kN crash load test or thread jamming',
      failureCause: 'Welding wire tip positioning error; shielding gas flow rate drop below 15 L/min',
      preventionControl: 'Automated wire nozzle cleaner after every 15 cycles; gas flow digital interlock',
      detectionControl: 'Push-out torque proof test (60 Nm) 3 pcs/shift + destructive cut macro once/day',
      severity: 9,
      occurrence: 2,
      detection: 3,
      actionPriority: calculateActionPriority(9, 2, 3),
      recommendedAction: 'Add digital camera vision inspection for thread spatter detection',
      responsibility: 'Somchai P. (QA)',
      targetCompletionDate: '2026-11-25',
      status: 'Completed'
    },
    {
      id: 'pf-104',
      processStep: 'OP 40: Cathodic Electro-Deposition (E-Coat)',
      processFunction: 'Apply anti-corrosion black coating (film thickness 15 - 25 μm)',
      failureMode: 'Film thickness below 15 μm or orange peel pinholes',
      failureEffect: 'Premature rust failure before 720h salt spray requirement (TSH6528G)',
      failureCause: 'Paint bath conductivity out of range; ultrafiltration rinse flow low',
      preventionControl: 'Automated bath titration replenishment & pH dosing system',
      detectionControl: 'Electromagnetic coating thickness gage 5 pcs per rack; daily salt spray coupon',
      severity: 7,
      occurrence: 2,
      detection: 2,
      actionPriority: calculateActionPriority(7, 2, 2),
      recommendedAction: 'Maintain daily bath log and calibrate probe weekly',
      responsibility: 'Nattaporn C. (QE)',
      targetCompletionDate: '2026-11-10',
      status: 'Completed'
    }
  ];

  // Sample Process Flow for p-1
  const flow1: ProcessFlowStep[] = [
    {
      id: 'st-10',
      stepNumber: '10',
      stepName: 'Raw Material Receiving & Inspection',
      type: 'storage',
      machine: 'Steel Coil Receiving Bay',
      description: 'Receive SPFC 590 high-strength steel coil, check Mill Test Certificate (MTC), verify thickness & hardness.',
      keyParameters: 'Thickness 2.50 ± 0.05 mm, Tensile > 590 MPa',
      inspectionMethod: 'Micrometer + Portable Hardness Tester',
      x: 100,
      y: 60
    },
    {
      id: 'st-20',
      stepNumber: '20',
      stepName: 'Blanking & Piercing (OP 10)',
      type: 'operation',
      machine: 'AIDA 300T Mechanical Press',
      description: 'Blank outer contour and pierce 4 datum locating holes.',
      keyParameters: 'Stroke speed 35 SPM, Die shut height 450 mm',
      inspectionMethod: 'Check Fixture CF-51201-1',
      x: 100,
      y: 180
    },
    {
      id: 'st-30',
      stepNumber: '30',
      stepName: 'Forming & Flanging (OP 20)',
      type: 'operation',
      machine: 'Komatsu 400T Link Motion Press',
      description: 'Draw 3D stiffener bead and form 90-degree mounting flanges.',
      keyParameters: 'Forming tonnage 320T, Nitrogen cushion pressure 140 bar',
      inspectionMethod: 'Dial indicator fixture & visual',
      x: 100,
      y: 300
    },
    {
      id: 'st-40',
      stepNumber: '40',
      stepName: 'In-Process Dimension Inspection',
      type: 'inspection',
      machine: 'Quality Inspection Station 1',
      description: 'Verify 6 critical hole-to-hole center distances and flange angle.',
      keyParameters: 'Hole pitch 140.0 ± 0.2 mm, Angle 90.0° ± 0.5°',
      inspectionMethod: 'CMM Mitutoyo Crysta-Apex / Check Fixture',
      x: 100,
      y: 420
    },
    {
      id: 'st-50',
      stepNumber: '50',
      stepName: 'Robotic Nut Welding (OP 30)',
      type: 'operation',
      machine: 'Yaskawa Motoman 6-Axis Robotic Cell',
      description: 'Arc weld 2x M10 high-strength weld nuts on rear face.',
      keyParameters: 'Current 185A, Voltage 21V, Ar+CO2 80/20 gas 16 L/min',
      inspectionMethod: 'Push-out torque test (60 Nm) & visual',
      x: 100,
      y: 540
    },
    {
      id: 'st-60',
      stepNumber: '60',
      stepName: 'E-Coat Surface Treatment (OP 40)',
      type: 'operation',
      machine: 'Automated 11-Stage Cathodic E-Coat Line',
      description: 'Degrease, zinc phosphate pretreat, electrocoat black epoxy, oven cure 180°C 20 min.',
      keyParameters: 'Bath temp 28 ± 1°C, Voltage 220V, Oven 185°C',
      inspectionMethod: 'Fischer coating thickness gage',
      x: 100,
      y: 660
    },
    {
      id: 'st-70',
      stepNumber: '70',
      stepName: 'Final 100% Quality & Packaging',
      type: 'inspection',
      machine: 'Final Assembly & Packaging Cell',
      description: '100% check fixture verification, thread go/no-go gage, label barcode scanning into returnable steel pallet.',
      keyParameters: 'Toyota Standard Returnable Pallet (50 pcs/pallet)',
      inspectionMethod: '100% Go/No-go pin fixture + Barcode scanner',
      x: 100,
      y: 780
    }
  ];

  // Sample Control Plan for p-1
  const cp1: ControlPlanRow[] = [
    {
      id: 'cp-01',
      processNumber: '10',
      processName: 'Raw Material Receiving',
      machineEquipment: 'Coil Storage Bay',
      productCharacteristic: 'Material Grade & Sheet Thickness',
      processCharacteristic: 'Cleanliness / No rust & dent',
      specialCharacteristic: 'Critical',
      specificationTolerance: 'SPFC 590 Steel, 2.50 ± 0.05 mm',
      measurementTechnique: 'MTC Review + Digital Micrometer',
      sampleSize: '3 coils / lot',
      frequency: 'Every heat lot',
      controlMethod: 'Receiving Inspection Sheet & ERP Hold',
      reactionPlan: 'Reject coil lot, notify purchasing and steel mill immediately'
    },
    {
      id: 'cp-02',
      processNumber: '20',
      processName: 'Blanking & Piercing (OP 10)',
      machineEquipment: 'AIDA 300T Press',
      productCharacteristic: 'Hole Ø12.5 and Outer Contour',
      processCharacteristic: 'Die Alignment & Burr Height',
      specialCharacteristic: 'Major',
      specificationTolerance: 'Ø12.50 +0.10/-0.00 mm, Burr < 0.08 mm',
      measurementTechnique: 'Pin Gage + Toolmakers Microscope',
      sampleSize: '5 pcs',
      frequency: 'First/Last piece & every 2 hrs',
      controlMethod: 'X-bar & R Control Chart at Press',
      reactionPlan: 'Stop press, adjust die clearance or replace punch pins'
    },
    {
      id: 'cp-03',
      processNumber: '30',
      processName: 'Forming & Flanging (OP 20)',
      machineEquipment: 'Komatsu 400T Press',
      productCharacteristic: 'Mounting Flange Angle & Flatness',
      processCharacteristic: 'Nitrogen Cushion Pressure',
      specialCharacteristic: 'Critical',
      specificationTolerance: '90.0° ± 0.5°, Flatness < 0.25 mm',
      measurementTechnique: 'Check Fixture CF-51201 + Feeler Gage',
      sampleSize: '5 pcs',
      frequency: 'Every 2 hours',
      controlMethod: 'SPC Ppk tracking (target > 1.67)',
      reactionPlan: 'Contain last 2 hours production, 100% sort, readjust die shim'
    },
    {
      id: 'cp-04',
      processNumber: '50',
      processName: 'Robotic Nut Welding (OP 30)',
      machineEquipment: 'Yaskawa Welding Robot',
      productCharacteristic: 'Weld Nut Push-off Strength & Thread Quality',
      processCharacteristic: 'Shielding gas flow rate & Arc current',
      specialCharacteristic: 'Critical',
      specificationTolerance: 'Min 60 Nm torque, Thread M10x1.25-6H Go gage',
      measurementTechnique: 'Torque Wrench Proof Tester + Thread Plug Gage',
      sampleSize: '3 pcs / shift',
      frequency: 'Start of shift and after electrode service',
      controlMethod: 'Daily destructive weld section + Torque log',
      reactionPlan: 'Stop welding cell, 100% quarantine lot, repair weld parameters'
    },
    {
      id: 'cp-05',
      processNumber: '60',
      processName: 'E-Coat Painting (OP 40)',
      machineEquipment: 'Cathodic E-Coat Line',
      productCharacteristic: 'Paint Film Thickness & Salt Spray Resistance',
      processCharacteristic: 'Bath temperature & Oven curing time',
      specialCharacteristic: 'Major',
      specificationTolerance: '15 - 25 μm, 720h Salt Spray without blister',
      measurementTechnique: 'Electromagnetic Thickness Meter + ASTM B117',
      sampleSize: '5 pcs / rack',
      frequency: 'Every 4 hours / 1 panel per day',
      controlMethod: 'Coating thickness run chart',
      reactionPlan: 'Adjust voltage/conveyor speed, strip and recoat affected lot'
    }
  ];

  // Sample Dimensional Report for p-1
  const dim1: DimensionalRow[] = [
    {
      id: 'dim-1',
      characteristicNumber: 1,
      drawingRequirement: 'Total Bracket Length (Datum A-B)',
      specification: '245.00 ± 0.30 mm',
      upperLimit: 245.30,
      lowerLimit: 244.70,
      samples: [245.05, 245.12, 244.98, 245.08, 245.15],
      mean: 245.076,
      min: 244.98,
      max: 245.15,
      measuringEquipment: 'Mitutoyo Crysta-Apex CMM (Cal: 2026-08-15)',
      inspector: 'Siriporn R. (CMM Inspector)',
      inspectionDate: '2026-11-04',
      result: 'PASS'
    },
    {
      id: 'dim-2',
      characteristicNumber: 2,
      drawingRequirement: 'Hole Pitch Distance (Datum C to Hole #2)',
      specification: '140.00 ± 0.15 mm',
      upperLimit: 140.15,
      lowerLimit: 139.85,
      samples: [140.02, 140.05, 139.98, 140.06, 140.01],
      mean: 140.024,
      min: 139.98,
      max: 140.06,
      measuringEquipment: 'Mitutoyo Crysta-Apex CMM',
      inspector: 'Siriporn R. (CMM Inspector)',
      inspectionDate: '2026-11-04',
      result: 'PASS'
    },
    {
      id: 'dim-3',
      characteristicNumber: 3,
      drawingRequirement: 'Mounting Flange Angle (Degree)',
      specification: '90.00° ± 0.50°',
      upperLimit: 90.50,
      lowerLimit: 89.50,
      samples: [90.15, 90.22, 89.95, 90.10, 90.18],
      mean: 90.12,
      min: 89.95,
      max: 90.22,
      measuringEquipment: 'Optical Bevel Goniometer / CMM',
      inspector: 'Siriporn R. (CMM Inspector)',
      inspectionDate: '2026-11-04',
      result: 'PASS'
    },
    {
      id: 'dim-4',
      characteristicNumber: 4,
      drawingRequirement: 'Mounting Hole Diameter (2x)',
      specification: 'Ø 12.50 +0.15 / -0.00 mm',
      upperLimit: 12.65,
      lowerLimit: 12.50,
      samples: [12.56, 12.58, 12.54, 12.57, 12.55],
      mean: 12.56,
      min: 12.54,
      max: 12.58,
      measuringEquipment: 'Mitutoyo Holtest Digital Micrometer',
      inspector: 'Siriporn R. (CMM Inspector)',
      inspectionDate: '2026-11-04',
      result: 'PASS'
    },
    {
      id: 'dim-5',
      characteristicNumber: 5,
      drawingRequirement: 'Bracket Mounting Face Flatness',
      specification: '0.20 mm max',
      upperLimit: 0.20,
      lowerLimit: 0.00,
      samples: [0.08, 0.11, 0.09, 0.13, 0.07],
      mean: 0.096,
      min: 0.07,
      max: 0.13,
      measuringEquipment: 'CMM Surface Scanning Probe',
      inspector: 'Siriporn R. (CMM Inspector)',
      inspectionDate: '2026-11-04',
      result: 'PASS'
    },
    {
      id: 'dim-6',
      characteristicNumber: 6,
      drawingRequirement: 'M10 Nut Thread Pitch Diameter',
      specification: 'M10 x 1.25 - 6H',
      upperLimit: 10.20,
      lowerLimit: 10.00,
      samples: [10.08, 10.10, 10.07, 10.09, 10.08],
      mean: 10.084,
      min: 10.07,
      max: 10.10,
      measuringEquipment: 'Thread Plug Gage GO/NOGO + CMM',
      inspector: 'Siriporn R. (CMM Inspector)',
      inspectionDate: '2026-11-04',
      result: 'PASS'
    }
  ];

  // Sample PSW for p-1
  const psw1: PSWData = {
    partName: 'Engine Mounting Support Bracket LH',
    partNumber: '51201-0K150-C',
    drawingNumber: 'DWG-51201-REV-04',
    engineeringChangeLevel: 'ECL-04 (High Tensile Steel Upgrade)',
    drawingDate: '2026-09-15',
    additionalEngineeringChanges: 'ECN-2026-TMT-119',
    shownOnDrawingNo: 'DWG-51201-REV-04',
    purchaseOrderNo: 'PO-TMT-2026-99812',
    weightKg: 1.485,
    checkingAidNo: 'CF-51201-LH-V2',
    checkingAidDate: '2026-10-01',
    supplierName: 'Apex Automotive Precision Parts Ltd.',
    supplierAddress: '88/1 Moo 4, Bangna-Trad Km. 29, Bang Bo, Samut Prakan 10560 Thailand',
    supplierVendorCode: 'V-TMT-7421',
    customerName: 'Toyota Motor Thailand Co., Ltd.',
    customerDivision: 'Chassis & Engine Mounting Purchasing & QA Division',
    customerBuyer: 'Prasert Suksomboon',
    application: 'Toyota Hilux Revo / Fortuner 2.8L GD Turbo Diesel',
    submissionLevel: 3,
    submissionReason: 'Engineering Change(s)',
    dimensionalTestResults: true,
    materialTestResults: true,
    performanceTestResults: true,
    appearanceTestResults: true,
    statisticalProcessPackage: true,
    materialsReportedToIMDS: true,
    imdsIdNo: 'IMDS-TH-9843219',
    moldsCavitiesProcesses: 'Die Line #B2 (Tandem 400T / 300T), Robot Weld Cell #R3',
    declarationAuthorized: true,
    authorizedSignatureName: 'Somchai Prasert',
    authorizedSignatureTitle: 'Quality Assurance Manager',
    authorizedDate: '2026-11-05',
    customerApprovalName: 'Dr. Akira Tanaka',
    customerApprovalDate: '2026-11-05',
    customerApprovalStatus: 'Pending',
    customerRemarks: 'Pending final review of Cpk study on weld nut torque.'
  };

  const notifications: Notification[] = [
    {
      id: 'notif-1',
      title: 'PPAP Submitted for Review',
      message: 'Project PPAP-2026-001 (Toyota Hilux Bracket) was submitted by Nattaporn Chaiyasin for Quality Manager review.',
      type: 'info',
      projectId: 'p-1',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      read: false
    },
    {
      id: 'notif-2',
      title: 'Element Rejection Alert',
      message: 'Project PPAP-2026-004 (Isuzu Fuel Pipe Clamp): Element #6 (PFMEA) and #9 (Dimensional) were rejected by Customer QA.',
      type: 'alert',
      projectId: 'p-4',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      read: false
    },
    {
      id: 'notif-3',
      title: 'Upcoming Submission Deadline',
      message: 'Project PPAP-2026-001 submission target is in 15 days (2026-11-20). 2 elements remaining for final sign-off.',
      type: 'warning',
      projectId: 'p-1',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      read: true
    },
    {
      id: 'notif-4',
      title: 'PPAP Approved by Customer',
      message: 'Project PPAP-2026-003 (Ford Ranger Bezel) has received full PSW sign-off from Ford AAT Quality Engineering.',
      type: 'success',
      projectId: 'p-3',
      timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
      read: true
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      projectId: 'p-1',
      projectNumber: 'PPAP-2026-001',
      user: 'Nattaporn Chaiyasin',
      userRole: 'Quality Engineer',
      action: 'SUBMIT_FOR_REVIEW',
      elementName: 'All Elements',
      details: 'Submitted Level 3 package for internal Quality Manager approval.',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'log-2',
      projectId: 'p-1',
      projectNumber: 'PPAP-2026-001',
      user: 'Siriporn Rattanaporn',
      userRole: 'Inspector',
      action: 'UPDATE_DIMENSIONAL',
      elementName: '9. Dimensional Results',
      details: 'Uploaded CMM inspection data for 5 sample parts. All 6 balloon items passed.',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString()
    },
    {
      id: 'log-3',
      projectId: 'p-4',
      projectNumber: 'PPAP-2026-004',
      user: 'Somchai Prasert',
      userRole: 'Quality Manager',
      action: 'REJECT_ELEMENT',
      elementName: '6. Process FMEA (PFMEA)',
      details: 'Rejected with comment: S/O/D ratings need re-evaluation due to historic die wear.',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      id: 'log-4',
      projectId: 'p-3',
      projectNumber: 'PPAP-2026-003',
      user: 'Somchai Prasert',
      userRole: 'Quality Manager',
      action: 'APPROVE_PSW',
      elementName: '18. Part Submission Warrant',
      details: 'Signed PSW and issued final Level 2 approval package.',
      timestamp: new Date(Date.now() - 48 * 3600000).toISOString()
    }
  ];

  return {
    users: INITIAL_USERS,
    projects: [p1, p2, p3, p4],
    pfmeas: { 'p-1': pfmea1 },
    processFlows: { 'p-1': flow1 },
    controlPlans: { 'p-1': cp1 },
    dimensionalReports: { 'p-1': dim1 },
    pswRecords: { 'p-1': psw1 },
    elementTables: {},
    notifications,
    auditLogs
  };
}

class PPAPDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to load DB file, using initial data:', err);
    }
    const initial = getInitialDatabase();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist DB to file:', err);
    }
  }

  private save() {
    this.persist(this.data);
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  // Projects
  getProjects(): PPAPProject[] {
    return this.data.projects;
  }

  getProjectById(id: string): PPAPProject | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  createProject(projectData: Omit<PPAPProject, 'id' | 'createdAt' | 'updatedAt' | 'totalElements' | 'completedElements' | 'elements'>): PPAPProject {
    const id = `p-${Date.now()}`;
    const elements = generateDefaultElements(projectData.submissionLevel);
    const newProject: PPAPProject = {
      ...projectData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalElements: elements.length,
      completedElements: 0,
      elements
    };
    this.data.projects.unshift(newProject);
    
    // Seed initial flow, pfmea, cp, dim, psw
    this.data.processFlows[id] = [];
    this.data.pfmeas[id] = [];
    this.data.controlPlans[id] = [];
    this.data.dimensionalReports[id] = [];
    this.data.pswRecords[id] = {
      partName: newProject.partName,
      partNumber: newProject.partNumber,
      drawingNumber: newProject.drawingNumber,
      engineeringChangeLevel: newProject.engineeringChangeLevel,
      drawingDate: new Date().toISOString().split('T')[0],
      additionalEngineeringChanges: 'None',
      shownOnDrawingNo: newProject.drawingNumber,
      purchaseOrderNo: 'Pending',
      weightKg: 1.0,
      checkingAidNo: 'CF-TBD',
      checkingAidDate: new Date().toISOString().split('T')[0],
      supplierName: newProject.supplierName,
      supplierAddress: newProject.manufacturingLocation,
      supplierVendorCode: 'V-AUTO-01',
      customerName: newProject.customerName,
      customerDivision: 'Purchasing & Quality Assurance',
      customerBuyer: 'Responsible Buyer',
      application: 'Automotive OEM Application',
      submissionLevel: newProject.submissionLevel,
      submissionReason: newProject.submissionReason,
      dimensionalTestResults: false,
      materialTestResults: false,
      performanceTestResults: false,
      appearanceTestResults: false,
      statisticalProcessPackage: false,
      materialsReportedToIMDS: false,
      moldsCavitiesProcesses: 'Main Production Line',
      declarationAuthorized: false,
      authorizedSignatureName: newProject.responsibleEngineer,
      authorizedSignatureTitle: 'Lead Quality Engineer',
      authorizedDate: new Date().toISOString().split('T')[0],
      customerApprovalStatus: 'Pending'
    };

    this.addAuditLog({
      projectId: id,
      projectNumber: newProject.projectNumber,
      user: projectData.responsibleEngineer,
      userRole: 'Quality Engineer',
      action: 'CREATE_PROJECT',
      details: `Created PPAP project ${newProject.projectNumber} (${newProject.partName}) Level ${newProject.submissionLevel}`
    });

    this.addNotification({
      title: 'New PPAP Project Created',
      message: `Project ${newProject.projectNumber} for ${newProject.customerName} has been initialized.`,
      type: 'info',
      projectId: id
    });

    this.save();
    return newProject;
  }

  updateProject(id: string, updates: Partial<PPAPProject>): PPAPProject | null {
    const project = this.getProjectById(id);
    if (!project) return null;
    Object.assign(project, updates, { updatedAt: new Date().toISOString() });
    
    // Recalculate completed elements
    project.completedElements = project.elements.filter(e => e.status === 'Approved').length;
    this.save();
    return project;
  }

  deleteProject(id: string): boolean {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const removed = this.data.projects.splice(idx, 1)[0];
    delete this.data.pfmeas[id];
    delete this.data.processFlows[id];
    delete this.data.controlPlans[id];
    delete this.data.dimensionalReports[id];
    delete this.data.pswRecords[id];

    this.addAuditLog({
      projectId: id,
      projectNumber: removed.projectNumber,
      user: 'Administrator',
      userRole: 'Administrator',
      action: 'DELETE_PROJECT',
      details: `Deleted PPAP project ${removed.projectNumber}`
    });

    this.save();
    return true;
  }

  // Elements
  updateElement(projectId: string, elementId: number, updates: Partial<any>, user: string, role: string): any {
    const project = this.getProjectById(projectId);
    if (!project) return null;
    const element = project.elements.find(e => e.id === elementId);
    if (!element) return null;

    const previousStatus = element.status;
    Object.assign(element, updates, { updatedAt: new Date().toISOString() });

    // Handle status change revision or audit
    if (updates.status && updates.status !== previousStatus) {
      if (updates.status === 'Approved') {
        element.approvedBy = user;
      }
      this.addAuditLog({
        projectId,
        projectNumber: project.projectNumber,
        user,
        userRole: role,
        action: updates.status === 'Approved' ? 'APPROVE_ELEMENT' : updates.status === 'Rejected' ? 'REJECT_ELEMENT' : 'UPDATE_ELEMENT',
        elementName: element.name,
        details: `Element ${element.id} (${element.name}) status changed from ${previousStatus} to ${updates.status}. ${updates.comments || ''}`
      });

      if (updates.status === 'Rejected') {
        this.addNotification({
          title: `Element Rejected: ${element.shortCode}`,
          message: `${element.name} in ${project.projectNumber} was rejected: ${updates.comments || 'No comment'}`,
          type: 'alert',
          projectId
        });
      }
    }

    project.completedElements = project.elements.filter(e => e.status === 'Approved').length;
    project.updatedAt = new Date().toISOString();
    this.save();
    return element;
  }

  // PFMEA
  getPFMEA(projectId: string): PFMEARow[] {
    return this.data.pfmeas[projectId] || [];
  }

  savePFMEA(projectId: string, rows: PFMEARow[], user: string): PFMEARow[] {
    // calculate AP for all rows
    const updated = rows.map(r => ({
      ...r,
      actionPriority: calculateActionPriority(r.severity, r.occurrence, r.detection)
    }));
    this.data.pfmeas[projectId] = updated;
    const project = this.getProjectById(projectId);
    if (project) {
      this.addAuditLog({
        projectId,
        projectNumber: project.projectNumber,
        user,
        userRole: 'Quality Engineer',
        action: 'UPDATE_PFMEA',
        elementName: '6. Process FMEA (PFMEA)',
        details: `Updated PFMEA matrix with ${updated.length} process failure modes.`
      });
    }
    this.save();
    return updated;
  }

  // Process Flow
  getProcessFlow(projectId: string): ProcessFlowStep[] {
    return this.data.processFlows[projectId] || [];
  }

  saveProcessFlow(projectId: string, steps: ProcessFlowStep[], user: string): ProcessFlowStep[] {
    this.data.processFlows[projectId] = steps;
    const project = this.getProjectById(projectId);
    if (project) {
      this.addAuditLog({
        projectId,
        projectNumber: project.projectNumber,
        user,
        userRole: 'Production Engineer',
        action: 'UPDATE_PROCESS_FLOW',
        elementName: '5. Process Flow Diagram',
        details: `Saved Process Flow diagram with ${steps.length} operation steps.`
      });
    }
    this.save();
    return steps;
  }

  // Control Plan
  getControlPlan(projectId: string): ControlPlanRow[] {
    return this.data.controlPlans[projectId] || [];
  }

  saveControlPlan(projectId: string, rows: ControlPlanRow[], user: string): ControlPlanRow[] {
    this.data.controlPlans[projectId] = rows;
    const project = this.getProjectById(projectId);
    if (project) {
      this.addAuditLog({
        projectId,
        projectNumber: project.projectNumber,
        user,
        userRole: 'Quality Engineer',
        action: 'UPDATE_CONTROL_PLAN',
        elementName: '7. Control Plan',
        details: `Updated Control Plan with ${rows.length} characteristic controls.`
      });
    }
    this.save();
    return rows;
  }

  // Dimensional Report
  getDimensionalReport(projectId: string): DimensionalRow[] {
    return this.data.dimensionalReports[projectId] || [];
  }

  saveDimensionalReport(projectId: string, rows: DimensionalRow[], user: string): DimensionalRow[] {
    // compute pass/fail & mean/min/max
    const computed = rows.map((r, i) => {
      const samples = (r.samples && r.samples.length > 0) ? r.samples : [0];
      const mean = Number((samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(3));
      const min = Number(Math.min(...samples).toFixed(3));
      const max = Number(Math.max(...samples).toFixed(3));
      const pass = samples.every(v => v >= r.lowerLimit && v <= r.upperLimit);
      return {
        ...r,
        characteristicNumber: r.characteristicNumber || i + 1,
        mean,
        min,
        max,
        result: pass ? ('PASS' as const) : ('FAIL' as const)
      };
    });
    this.data.dimensionalReports[projectId] = computed;
    const project = this.getProjectById(projectId);
    if (project) {
      this.addAuditLog({
        projectId,
        projectNumber: project.projectNumber,
        user,
        userRole: 'Inspector',
        action: 'UPDATE_DIMENSIONAL',
        elementName: '9. Dimensional Results',
        details: `Updated Dimensional Inspection Report with ${computed.length} balloon items.`
      });
    }
    this.save();
    return computed;
  }

  // PSW
  getPSW(projectId: string): PSWData | null {
    return this.data.pswRecords[projectId] || null;
  }

  savePSW(projectId: string, psw: PSWData, user: string): PSWData {
    this.data.pswRecords[projectId] = psw;
    const project = this.getProjectById(projectId);
    if (project) {
      if (psw.customerApprovalStatus === 'Approved') {
        project.status = 'Approved';
      }
      this.addAuditLog({
        projectId,
        projectNumber: project.projectNumber,
        user,
        userRole: 'Quality Manager',
        action: 'UPDATE_PSW',
        elementName: '18. Part Submission Warrant (PSW)',
        details: `Updated Part Submission Warrant (PSW) declaration. Status: ${psw.customerApprovalStatus}`
      });
    }
    this.save();
    return psw;
  }

  // Generic Element Table (for all 18 elements)
  getElementTable(projectId: string, elementId: number): any[] {
    if (!this.data.elementTables) {
      this.data.elementTables = {};
    }
    const key = `${projectId}_${elementId}`;
    if (this.data.elementTables[key] && this.data.elementTables[key].length > 0) {
      return this.data.elementTables[key];
    }

    const project = this.getProjectById(projectId);
    if (!project) return [];

    // Fallback/sync for elements with specialized dedicated tables
    if (elementId === 6) return this.getPFMEA(projectId);
    if (elementId === 5) return this.getProcessFlow(projectId);
    if (elementId === 7) return this.getControlPlan(projectId);
    if (elementId === 9) return this.getDimensionalReport(projectId);
    if (elementId === 18) {
      const psw = this.getPSW(projectId);
      return psw ? [psw] : [];
    }

    // Default seed rows from automotive template
    const defaultRows = getDefaultRowsForElement(elementId, project);
    this.data.elementTables[key] = defaultRows;
    this.save();
    return defaultRows;
  }

  saveElementTable(projectId: string, elementId: number, rows: any[], user: string): any[] {
    if (!this.data.elementTables) {
      this.data.elementTables = {};
    }
    const key = `${projectId}_${elementId}`;
    this.data.elementTables[key] = rows;

    const project = this.getProjectById(projectId);
    if (project) {
      const element = project.elements.find(e => e.id === elementId);
      if (element) {
        if (element.status === 'Not Started') {
          element.status = 'In Progress';
        }
        element.updatedAt = new Date().toISOString();
        element.preparedBy = user;
      }
      this.addAuditLog({
        projectId,
        projectNumber: project.projectNumber,
        user,
        userRole: 'Quality Engineer',
        action: 'UPDATE_ELEMENT_TABLE',
        elementName: element ? element.name : `Element ${elementId}`,
        details: `Saved standard document table with ${rows.length} rows for Element ${elementId}.`
      });
    }

    this.save();
    return rows;
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.data.notifications;
  }

  addNotification(notif: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const item: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.data.notifications.unshift(item);
    if (this.data.notifications.length > 50) this.data.notifications.pop();
    this.save();
    return item;
  }

  markNotificationRead(id: string): void {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.save();
    }
  }

  markAllNotificationsRead(): void {
    this.data.notifications.forEach(n => (n.read = true));
    this.save();
  }

  // Audit Logs
  getAuditLogs(projectId?: string): AuditLog[] {
    if (projectId) {
      return this.data.auditLogs.filter(l => l.projectId === projectId);
    }
    return this.data.auditLogs;
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const item: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(item);
    if (this.data.auditLogs.length > 100) this.data.auditLogs.pop();
    this.save();
    return item;
  }
}

export const db = new PPAPDatabase();
