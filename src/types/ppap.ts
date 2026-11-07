/**
 * PPAP Management System - Data Models and Type Definitions
 * Compliant with IATF 16949 & AIAG PPAP 4th Edition / AIAG-VDA FMEA 1st Edition
 */

export type UserRole =
  | 'Administrator'
  | 'Quality Manager'
  | 'Quality Engineer'
  | 'Production Engineer'
  | 'R&D Engineer'
  | 'Inspector'
  | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  signature?: string;
}

export type PPAPLevel = 1 | 2 | 3 | 4 | 5;

export type ProjectStatus =
  | 'Draft'
  | 'In Progress'
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Interim Approved';

export type ElementStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Not Applicable';

export type SubmissionReason =
  | 'Initial Submission'
  | 'Engineering Change(s)'
  | 'Tooling: Transfer, Replacement, Refurbishment'
  | 'Correction of Discrepancy'
  | 'Tooling Inactive > 1 Year'
  | 'Sub-supplier or Material Source Change'
  | 'Change in Part Processing'
  | 'Parts Produced at Additional Location';

export interface FileAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  revision: string;
}

export interface DocumentRevision {
  revision: string; // 'Rev A', 'Rev B'
  changeDescription: string;
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  date: string;
  status: ElementStatus;
  comment?: string;
}

export interface PPAPElement {
  id: number; // 1 to 18
  name: string;
  description: string;
  shortCode: string;
  status: ElementStatus;
  currentRevision: string;
  isApplicable: boolean;
  requiredForLevel: Record<PPAPLevel, 'S' | 'R' | '*' | 'NA'>; // S: Submit to customer, R: Retain at supplier, *: Special, NA: Not Applicable
  preparedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  updatedAt: string;
  attachments: FileAttachment[];
  revisions: DocumentRevision[];
  comments?: string;
}

export interface PPAPProject {
  id: string;
  projectNumber: string; // e.g. "PPAP-2026-001"
  customerName: string;
  supplierName: string;
  partName: string;
  partNumber: string;
  drawingNumber: string;
  engineeringChangeLevel: string;
  manufacturingLocation: string;
  submissionLevel: PPAPLevel;
  submissionReason: SubmissionReason;
  submissionDate: string;
  responsibleEngineer: string;
  status: ProjectStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalElements: number;
  completedElements: number;
  elements: PPAPElement[];
}

// AIAG & VDA FMEA
export type ActionPriority = 'High' | 'Medium' | 'Low';

export interface PFMEARow {
  id: string;
  processStep: string;
  processFunction: string;
  failureMode: string;
  failureEffect: string;
  failureCause: string;
  preventionControl: string;
  detectionControl: string;
  severity: number; // 1-10
  occurrence: number; // 1-10
  detection: number; // 1-10
  actionPriority: ActionPriority;
  recommendedAction: string;
  responsibility: string;
  targetCompletionDate: string;
  status: 'Open' | 'In Progress' | 'Completed';
  notes?: string;
}

// Process Flow Diagram
export type ProcessNodeType = 'operation' | 'inspection' | 'transport' | 'storage' | 'delay';

export interface ProcessFlowStep {
  id: string;
  stepNumber: string; // e.g. "10", "20", "30"
  stepName: string;
  type: ProcessNodeType;
  machine: string;
  description: string;
  keyParameters: string;
  inspectionMethod?: string;
  x: number;
  y: number;
}

// Control Plan
export type SpecialCharacteristic = 'Critical' | 'Major' | 'Minor' | 'None';

export interface ControlPlanRow {
  id: string;
  processNumber: string;
  processName: string;
  machineEquipment: string;
  productCharacteristic: string;
  processCharacteristic: string;
  specialCharacteristic: SpecialCharacteristic;
  specificationTolerance: string;
  measurementTechnique: string;
  sampleSize: string;
  frequency: string;
  controlMethod: string;
  reactionPlan: string;
}

// Dimensional Inspection Report
export interface DimensionalRow {
  id: string;
  characteristicNumber: number; // Balloon number
  drawingRequirement: string;
  specification: string;
  upperLimit: number;
  lowerLimit: number;
  samples: number[]; // 5 part actual readings
  mean: number;
  min: number;
  max: number;
  measuringEquipment: string;
  inspector: string;
  inspectionDate: string;
  result: 'PASS' | 'FAIL';
  notes?: string;
}

// Part Submission Warrant (PSW)
export interface PSWData {
  partName: string;
  partNumber: string;
  drawingNumber: string;
  engineeringChangeLevel: string;
  drawingDate: string;
  additionalEngineeringChanges: string;
  shownOnDrawingNo: string;
  purchaseOrderNo: string;
  weightKg: number;
  checkingAidNo: string;
  checkingAidDate: string;
  supplierName: string;
  supplierAddress: string;
  supplierVendorCode: string;
  customerName: string;
  customerDivision: string;
  customerBuyer: string;
  application: string; // e.g. "Toyota Hilux 2.8L GD Turbo"
  submissionLevel: PPAPLevel;
  submissionReason: SubmissionReason;
  // Test Results Verification
  dimensionalTestResults: boolean;
  materialTestResults: boolean;
  performanceTestResults: boolean;
  appearanceTestResults: boolean;
  statisticalProcessPackage: boolean;
  // Declaration
  materialsReportedToIMDS: boolean;
  imdsIdNo?: string;
  moldsCavitiesProcesses: string;
  declarationAuthorized: boolean;
  authorizedSignatureName: string;
  authorizedSignatureTitle: string;
  authorizedDate: string;
  customerApprovalName?: string;
  customerApprovalDate?: string;
  customerApprovalStatus: 'Pending' | 'Approved' | 'Rejected' | 'Interim Approved';
  customerRemarks?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  projectId?: string;
  timestamp: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  projectId: string;
  projectNumber: string;
  user: string;
  userRole: string;
  action: string;
  elementName?: string;
  details: string;
  timestamp: string;
}

export type SupportedLanguage = 'th' | 'en' | 'zh';
