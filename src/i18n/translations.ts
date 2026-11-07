import { SupportedLanguage } from '../types/ppap';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  dashboard: string;
  projects: string;
  newProject: string;
  aiGenerator: string;
  completenessChecker: string;
  notifications: string;
  auditTrail: string;
  exportPackage: string;
  roleSwitcher: string;
  language: string;

  // KPI Dashboard
  totalProjects: string;
  pendingPPAP: string;
  approvedPPAP: string;
  rejectedPPAP: string;
  incompleteDocs: string;
  overallCompliance: string;
  submissionLevelDistribution: string;
  upcomingDeadlines: string;
  recentActivities: string;
  daysLeft: string;
  daysOverdue: string;

  // Project Fields
  projectNumber: string;
  customerName: string;
  supplierName: string;
  partName: string;
  partNumber: string;
  drawingNumber: string;
  changeLevel: string;
  manufacturingLocation: string;
  submissionLevel: string;
  submissionReason: string;
  submissionDate: string;
  responsibleEngineer: string;
  status: string;
  actions: string;
  searchPlaceholder: string;
  filterByStatus: string;
  filterByLevel: string;

  // Elements
  elements18: string;
  elementName: string;
  retentionRequirement: string;
  revision: string;
  preparedBy: string;
  approvedBy: string;
  uploadDoc: string;
  downloadDoc: string;
  reviewDoc: string;
  approveDoc: string;
  rejectDoc: string;
  notApplicable: string;

  // Tabs
  tabOverview: string;
  tabElements: string;
  tabProcessFlow: string;
  tabPFMEA: string;
  tabControlPlan: string;
  tabDimensional: string;
  tabPSW: string;
  tabCompleteness: string;
  tabExport: string;
  tabAudit: string;

  // Buttons
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  submit: string;
  close: string;
  downloadAllZip: string;
  exportExcel: string;
  exportPDF: string;
  importExcel: string;
  generateWithAI: string;
  applyToProject: string;

  // Statuses
  statusDraft: string;
  statusInProgress: string;
  statusPendingReview: string;
  statusApproved: string;
  statusRejected: string;
  statusNotStarted: string;

  // Roles
  roleAdmin: string;
  roleQualityManager: string;
  roleQualityEngineer: string;
  roleProductionEngineer: string;
  roleRndEngineer: string;
  roleInspector: string;
  roleViewer: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  th: {
    appTitle: 'ระบบบริหารจัดการ PPAP',
    appSubtitle: 'มาตรฐานอุตสาหกรรมยานยนต์ IATF 16949 / AIAG 4th Edition',
    dashboard: 'แดชบอร์ดภาพรวม',
    projects: 'โครงการ PPAP ทั้งหมด',
    newProject: 'สร้างโครงการ PPAP ใหม่',
    aiGenerator: 'ผู้ช่วย AI สร้างเอกสาร',
    completenessChecker: 'ตรวจสอบความครบถ้วน',
    notifications: 'การแจ้งเตือน',
    auditTrail: 'บันทึกประวัติการเปลี่ยนแปลง (Audit Trail)',
    exportPackage: 'ส่งออกชุดเอกสาร PPAP',
    roleSwitcher: 'สลับบทบาทผู้ใช้งาน (Role)',
    language: 'ภาษา',

    totalProjects: 'โครงการ PPAP ทั้งหมด',
    pendingPPAP: 'รอการตรวจสอบและอนุมัติ',
    approvedPPAP: 'อนุมัติเรียบร้อยแล้ว',
    rejectedPPAP: 'เอกสารถูกปฏิเสธ (Rejected)',
    incompleteDocs: 'เอกสารที่ยังไม่สมบูรณ์',
    overallCompliance: 'อัตราความพร้อมเอกสารเฉลี่ย',
    submissionLevelDistribution: 'การกระจายตามระดับการส่งมอบ (Level 1-5)',
    upcomingDeadlines: 'กำหนดการส่งมอบที่ใกล้มาถึง',
    recentActivities: 'กิจกรรมล่าสุดในระบบ',
    daysLeft: 'อีก {n} วัน',
    daysOverdue: 'เลยกำหนด {n} วัน',

    projectNumber: 'หมายเลขโครงการ',
    customerName: 'ชื่อลูกค้า (OEM / Tier 1)',
    supplierName: 'ชื่อผู้ผลิต / ซัพพลายเออร์',
    partName: 'ชื่อชิ้นส่วน',
    partNumber: 'หมายเลขชิ้นส่วน (Part Number)',
    drawingNumber: 'หมายเลขแบบ (Drawing Number)',
    changeLevel: 'ระดับการเปลี่ยนแปลงทางวิศวกรรม (ECL)',
    manufacturingLocation: 'สถานที่ผลิต / โรงงาน',
    submissionLevel: 'ระดับการส่งมอบ PPAP (Level 1-5)',
    submissionReason: 'เหตุผลในการส่งมอบ',
    submissionDate: 'กำหนดส่งมอบลูกค้า',
    responsibleEngineer: 'วิศวกรผู้รับผิดชอบ',
    status: 'สถานะ',
    actions: 'การจัดการ',
    searchPlaceholder: 'ค้นหาด้วยชื่อชิ้นส่วน, รหัสชิ้นส่วน, ลูกค้า หรือหมายเลขโครงการ...',
    filterByStatus: 'กรองตามสถานะ',
    filterByLevel: 'กรองตาม Level',

    elements18: 'เอกสาร PPAP ทั้ง 18 รายการ',
    elementName: 'ชื่อเอกสาร / รายการ',
    retentionRequirement: 'ข้อกำหนดตาม Level',
    revision: 'เวอร์ชัน (Revision)',
    preparedBy: 'ผู้จัดทำ',
    approvedBy: 'ผู้อนุมัติ',
    uploadDoc: 'อัปโหลดเอกสาร',
    downloadDoc: 'ดาวน์โหลด',
    reviewDoc: 'ตรวจสอบ',
    approveDoc: 'อนุมัติเอกสาร',
    rejectDoc: 'ปฏิเสธ (พร้อมระบุเหตุผล)',
    notApplicable: 'ไม่บังคับใช้ (N/A)',

    tabOverview: 'ข้อมูลทั่วไป',
    tabElements: '18 Elements',
    tabProcessFlow: 'Process Flow Diagram',
    tabPFMEA: 'PFMEA (AIAG & VDA)',
    tabControlPlan: 'Control Plan',
    tabDimensional: 'ผลการตรวจสอบมิติ (Dimensional)',
    tabPSW: 'ใบรับรอง PSW',
    tabCompleteness: 'ความครบถ้วนตาม Level',
    tabExport: 'ศูนย์ส่งออกเอกสาร',
    tabAudit: 'ประวัติการทำงาน (Audit Log)',

    save: 'บันทึกข้อมูล',
    cancel: 'ยกเลิก',
    delete: 'ลบข้อมูล',
    edit: 'แก้ไข',
    submit: 'ส่งเพื่อตรวจสอบ',
    close: 'ปิดหน้าต่าง',
    downloadAllZip: 'ดาวน์โหลดชุดเอกสาร PPAP ทั้งหมด (ZIP Package)',
    exportExcel: 'ส่งออกเป็น Excel (.xlsx)',
    exportPDF: 'ส่งออกเป็น PDF (.pdf)',
    importExcel: 'นำเข้าข้อมูลจาก Excel',
    generateWithAI: 'สร้างเอกสารด้วย AI',
    applyToProject: 'นำเข้าสู่โครงการนี้',

    statusDraft: 'แบบร่าง (Draft)',
    statusInProgress: 'กำลังดำเนินการ (In Progress)',
    statusPendingReview: 'รอการตรวจสอบ (Pending Review)',
    statusApproved: 'อนุมัติแล้ว (Approved)',
    statusRejected: 'ถูกปฏิเสธ (Rejected)',
    statusNotStarted: 'ยังไม่เริ่ม (Not Started)',

    roleAdmin: 'ผู้ดูแลระบบ (Administrator)',
    roleQualityManager: 'ผู้จัดการฝ่ายคุณภาพ (Quality Manager)',
    roleQualityEngineer: 'วิศวกรฝ่ายคุณภาพ (Quality Engineer)',
    roleProductionEngineer: 'วิศวกรฝ่ายผลิต (Production Engineer)',
    roleRndEngineer: 'วิศวกรวิจัยและพัฒนา (R&D Engineer)',
    roleInspector: 'เจ้าหน้าที่ตรวจสอบคุณภาพ (Inspector)',
    roleViewer: 'ผู้ดูข้อมูลทั่วไป (Viewer)'
  },
  en: {
    appTitle: 'PPAP Management System',
    appSubtitle: 'Automotive Quality Standard IATF 16949 / AIAG PPAP 4th Edition',
    dashboard: 'Dashboard',
    projects: 'PPAP Projects',
    newProject: 'Create PPAP Project',
    aiGenerator: 'AI Document Assistant',
    completenessChecker: 'Completeness Checker',
    notifications: 'Notifications',
    auditTrail: 'Audit Trail',
    exportPackage: 'Export PPAP Package',
    roleSwitcher: 'Switch Role',
    language: 'Language',

    totalProjects: 'Total PPAP Projects',
    pendingPPAP: 'Pending Review / Approval',
    approvedPPAP: 'Approved PPAP',
    rejectedPPAP: 'Rejected PPAP',
    incompleteDocs: 'Incomplete Documents',
    overallCompliance: 'Overall Compliance Rate',
    submissionLevelDistribution: 'Submission Level Distribution',
    upcomingDeadlines: 'Upcoming Submission Deadlines',
    recentActivities: 'Recent System Activities',
    daysLeft: '{n} days left',
    daysOverdue: '{n} days overdue',

    projectNumber: 'Project Number',
    customerName: 'Customer Name (OEM / Tier 1)',
    supplierName: 'Supplier / Manufacturer',
    partName: 'Part Name',
    partNumber: 'Part Number',
    drawingNumber: 'Drawing Number',
    changeLevel: 'Engineering Change Level',
    manufacturingLocation: 'Manufacturing Plant Location',
    submissionLevel: 'PPAP Submission Level (1-5)',
    submissionReason: 'Submission Reason',
    submissionDate: 'Submission Target Date',
    responsibleEngineer: 'Responsible Engineer',
    status: 'Status',
    actions: 'Actions',
    searchPlaceholder: 'Search part name, part no, customer, or project number...',
    filterByStatus: 'Filter by Status',
    filterByLevel: 'Filter by Level',

    elements18: 'PPAP 18 Elements Hub',
    elementName: 'Element Name',
    retentionRequirement: 'Submission / Retention Requirement',
    revision: 'Revision',
    preparedBy: 'Prepared By',
    approvedBy: 'Approved By',
    uploadDoc: 'Upload Document',
    downloadDoc: 'Download',
    reviewDoc: 'Review',
    approveDoc: 'Approve Document',
    rejectDoc: 'Reject with Comment',
    notApplicable: 'Not Applicable (N/A)',

    tabOverview: 'Overview',
    tabElements: '18 Elements Hub',
    tabProcessFlow: 'Process Flow Diagram',
    tabPFMEA: 'PFMEA (AIAG & VDA)',
    tabControlPlan: 'Control Plan',
    tabDimensional: 'Dimensional Results',
    tabPSW: 'Part Submission Warrant (PSW)',
    tabCompleteness: 'Completeness Matrix',
    tabExport: 'Export Center',
    tabAudit: 'Audit Trail',

    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    submit: 'Submit for Review',
    close: 'Close',
    downloadAllZip: 'Download Complete PPAP Package (ZIP)',
    exportExcel: 'Export to Excel (.xlsx)',
    exportPDF: 'Export to PDF (.pdf)',
    importExcel: 'Import from Excel',
    generateWithAI: 'Generate with AI',
    applyToProject: 'Apply to this Project',

    statusDraft: 'Draft',
    statusInProgress: 'In Progress',
    statusPendingReview: 'Pending Review',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusNotStarted: 'Not Started',

    roleAdmin: 'Administrator',
    roleQualityManager: 'Quality Manager',
    roleQualityEngineer: 'Quality Engineer',
    roleProductionEngineer: 'Production Engineer',
    roleRndEngineer: 'R&D Engineer',
    roleInspector: 'Inspector',
    roleViewer: 'Viewer'
  },
  zh: {
    appTitle: 'PPAP 汽车生产件批准管理系统',
    appSubtitle: '符合 IATF 16949 / AIAG PPAP 第四版汽车行业标准',
    dashboard: '仪表板概览',
    projects: 'PPAP 项目管理',
    newProject: '创建新 PPAP 项目',
    aiGenerator: 'AI 文件生成助手',
    completenessChecker: '文件完整性检查',
    notifications: '系统通知',
    auditTrail: '审计追踪记录 (Audit Trail)',
    exportPackage: '导出 PPAP 完整包',
    roleSwitcher: '切换用户角色',
    language: '语言',

    totalProjects: 'PPAP 项目总数',
    pendingPPAP: '待审核与批准',
    approvedPPAP: '已完全批准',
    rejectedPPAP: '被退回 / 拒绝 (Rejected)',
    incompleteDocs: '未完成文件项',
    overallCompliance: '整体文件完成率',
    submissionLevelDistribution: '提交等级分布 (Level 1-5)',
    upcomingDeadlines: '即将到期提交的项目',
    recentActivities: '最近系统动态',
    daysLeft: '剩余 {n} 天',
    daysOverdue: '逾期 {n} 天',

    projectNumber: '项目编号',
    customerName: '客户名称 (OEM / 主机厂)',
    supplierName: '供应商 / 制造工厂',
    partName: '零件名称',
    partNumber: '零件号 (Part Number)',
    drawingNumber: '图纸编号 (Drawing Number)',
    changeLevel: '工程变更等级 (ECL)',
    manufacturingLocation: '制造地点 / 工厂产线',
    submissionLevel: 'PPAP 提交等级 (Level 1-5)',
    submissionReason: '提交原因',
    submissionDate: '客户要求提交日期',
    responsibleEngineer: '责任工程师',
    status: '项目状态',
    actions: '操作',
    searchPlaceholder: '搜索零件名称、零件号、客户或项目编号...',
    filterByStatus: '按状态筛选',
    filterByLevel: '按等级筛选',

    elements18: 'PPAP 18 项要素控制中心',
    elementName: '要素名称',
    retentionRequirement: '提交/保存要求',
    revision: '版本 (Revision)',
    preparedBy: '编制人',
    approvedBy: '批准人',
    uploadDoc: '上传文件',
    downloadDoc: '下载',
    reviewDoc: '审核',
    approveDoc: '批准文件',
    rejectDoc: '退回并附评语',
    notApplicable: '不适用 (N/A)',

    tabOverview: '项目总览',
    tabElements: '18 项要素',
    tabProcessFlow: '过程流程图 (Process Flow)',
    tabPFMEA: '过程 FMEA (AIAG-VDA)',
    tabControlPlan: '控制计划 (Control Plan)',
    tabDimensional: '尺寸检验结果 (Dimensional)',
    tabPSW: '零件提交保证书 (PSW)',
    tabCompleteness: '完整性矩阵',
    tabExport: '导出中心',
    tabAudit: '审计日志',

    save: '保存数据',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    submit: '提交审核',
    close: '关闭',
    downloadAllZip: '下载完整 PPAP 压缩包 (ZIP)',
    exportExcel: '导出 Excel (.xlsx)',
    exportPDF: '导出 PDF (.pdf)',
    importExcel: '从 Excel 导入',
    generateWithAI: 'AI 智能生成',
    applyToProject: '应用至此项目',

    statusDraft: '草稿',
    statusInProgress: '进行中',
    statusPendingReview: '待审核',
    statusApproved: '已批准',
    statusRejected: '已退回',
    statusNotStarted: '未开始',

    roleAdmin: '系统管理员 (Administrator)',
    roleQualityManager: '质量经理 (Quality Manager)',
    roleQualityEngineer: '质量工程师 (Quality Engineer)',
    roleProductionEngineer: '生产/工艺工程师 (Production Engineer)',
    roleRndEngineer: '研发设计工程师 (R&D Engineer)',
    roleInspector: '质检员 (Inspector)',
    roleViewer: '观察者 (Viewer)'
  }
};
