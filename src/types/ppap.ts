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
  revision: string;
  changeDescription: string;
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  date: string;
  status: ElementStatus;
  comment?: string;
}

export interface PPAPElement {
  id: number;
  name: string;
  nameTh?: string;
  description: string;
  shortCode: string;
  status: ElementStatus;
  currentRevision: string;
  isApplicable: boolean;
  requiredForLevel: Record<number | string, 'S' | 'R' | '*' | 'NA'>;
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
  projectNumber: string;
  customerName: string;
  supplierName?: string;
  partName: string;
  partNumber: string;
  drawingNumber?: string;
  engineeringChangeLevel?: string;
  manufacturingLocation?: string;
  submissionLevel: PPAPLevel | number;
  submissionReason?: SubmissionReason | string;
  submissionDate?: string;
  responsibleEngineer: string;
  status?: ProjectStatus;
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
  lineNo?: number;
  lineNumber?: number;
  processStage?: string;
  processStep: string;
  processFunction: string;
  failureMode: string;
  failureEffect: string;
  severity: number;
  classification?: string;
  failureCause: string;
  occurrence: number;
  currentProcessControls?: string;
  preventionControl: string;
  detectionControl: string;
  detection: number;
  rpn?: number;
  recommendedAction: string;
  responsibility: string;
  targetCompletionDate: string;
  actionTaken?: string;
  revisedSeverity?: number;
  revisedOccurrence?: number;
  revisedDetection?: number;
  revisedRpn?: number;
  actionPriority: ActionPriority;
  status: 'Open' | 'In Progress' | 'Completed';
  notes?: string;
}

// Process Flow Diagram
export type ProcessNodeType = 'operation' | 'inspection' | 'transport' | 'storage' | 'delay';

export interface ProcessFlowStep {
  id: string;
  stepNumber: string;
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
  characteristicNumber: number;
  drawingRequirement: string;
  specification: string;
  upperLimit: number;
  lowerLimit: number;
  samples: number[];
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
  application: string;
  submissionLevel: PPAPLevel;
  submissionReason: SubmissionReason;
  dimensionalTestResults: boolean;
  materialTestResults: boolean;
  performanceTestResults: boolean;
  appearanceTestResults: boolean;
  statisticalProcessPackage: boolean;
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

export interface ElementTableColumn {
  key: string;
  label: string;
  labelTh?: string;
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

// External Project File Management
export interface ExternalProjectFile {
  id: string;
  projectId: string;
  projectNumber: string;
  partNumber: string;
  partName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileExtension: string;
  category:
    | 'Drawing / CAD'
    | 'Engineering Spec'
    | 'Customer Approval'
    | 'PFMEA / Control Plan'
    | 'Material Test Cert'
    | 'Dimensional Data'
    | 'Supplier Submission'
    | 'Master Package ZIP'
    | 'General Quality Record';
  elementId?: number;
  revision: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
  fileDataUrl?: string;
  isPDF?: boolean;
  status: 'Verified' | 'Pending Review' | 'Archived';
}

export interface PPAPFormData {
  formNumber: string;
  formRevDate: string;
  companyInfo: CompanyInfoData;
  ppapInitiation: PPAPInitiationData;
  processFMEA: ProcessFMEAData;
  controlPlan: ControlPlanData;
  dimensionalTests: DimensionalTestData;
  materialTests: MaterialTestData;
  perforTests: PerforTestData;
}

export interface CompanyInfoData {
  partNumber: string;
  customerPartNumber: string;
  partName: string;
  drawingNumber: string;
  revisionLevel: string;
  revisionDate: string;
  partWeight: string;
  vehicleApplication: string;
  organizationName: string;
  organizationAddress: string;
  supplierCode: string;
  authorizedRep: string;
  phoneNumber: string;
  customerName: string;
  customerBuyer: string;
  testingLab: string;
}

export interface PPAPInitiationData {
  partItemNumber: string;
  drawingRevision: string;
  drawingRevisionDate: string;
  supplierName: string;
  contactPerson: string;
  address: string;
  country: string;
  recommendedLevel: string;
  reasonForInitiation: string;
  describeChange: string;
  effectOfChange: string;
  estimatedProductionDate: string;
  specialRequirements: string;
  purchasingApproval: { name: string; status: string; date: string };
  rdApproval: { name: string; status: string; date: string };
  qualityApproval: { name: string; status: string; date: string };
}

export interface ProcessFMEAData {
  partItemNumber: string;
  drawingRevision: string;
  fmeaNumber: string;
  dateOrig: string;
  dateRev: string;
  partName: string;
  processResp: string;
  preparedBy: string;
  failureModes: Array<{
    lineNo: number;
    processStage: string;
    processFunction: string;
    potentialFailureMode: string;
    potentialEffect: string;
    severity: number;
    classification: string;
    potentialCause: string;
    occurrence: number;
    currentProcessControls: string;
    detection: number;
    rpn: number;
    recommendedAction: string;
    responsibility: string;
    targetDate: string;
    actionTaken?: string;
    sevRev?: number;
    occRev?: number;
    detRev?: number;
    rpnRev?: number;
  }>;
}

export interface ControlPlanData {
  controlPlanNo: string;
  partNumber: string;
  partName: string;
  drawingRevision: string;
  origDate: string;
  coreTeam: string;
  customerEngApproval?: { date: string };
  customerQualityApproval?: { date: string };
  otherApproval?: { date: string };
  operations: Array<{
    opNo: number;
    processName: string;
    machineTools: string;
    charNo: number;
    productCharacteristic: string;
    processCharacteristic: string;
    classification: string;
    specificationTolerance: string;
    evaluationMeasurementTechnique: string;
    sampleSize: string;
    sampleFreq: string;
    controlMethod: string;
    reactionPlan: string;
  }>;
}

export interface DimensionalTestData {
  item: number;
  dimensionParameter: string;
  specificationLimits: string;
  testDate: string;
  qtyTested: number;
  sample1: string;
  sample2: string;
  sample3: string;
  measurementMethod: string;
  status: string;
}

export interface MaterialTestData {
  item: number;
  materialSpecification: string;
  specificationLimits: string;
  testDate: string;
  qtyTested: number;
  testResults: string;
  status: string;
}

export interface PerforTestData {
  item: number;
  testDescription: string;
  specificationLimits: string;
  testDate: string;
  qtyTested: number;
  results: string;
  status: string;
}