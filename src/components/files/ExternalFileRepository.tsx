import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  FileCode,
  Download,
  Trash2,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  Plus,
  RefreshCw,
  HardDrive,
  Layers,
  ChevronDown,
  Tag,
  ExternalLink,
  ShieldCheck,
  File
} from 'lucide-react';
import { PPAPProject, ExternalProjectFile } from '../../types/ppap';
import { useAuth } from '../../context/AuthContext';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

interface ExternalFileRepositoryProps {
  projects: PPAPProject[];
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
  onNavigateToElement?: (elementId: number) => void;
}

// Authentic initial automotive project files pre-seeded
const INITIAL_EXTERNAL_FILES: ExternalProjectFile[] = [
  {
    id: 'ext-file-001',
    projectId: 'p-1',
    projectNumber: 'PPAP-2026-001',
    partNumber: '51201-0K150-C',
    partName: 'Engine Mounting Support Bracket LH',
    fileName: 'TOYOTA_TS_ENGINEERING_SPEC_TES-9014.pdf',
    fileSize: 2458900,
    fileType: 'application/pdf',
    fileExtension: 'pdf',
    category: 'Engineering Spec',
    elementId: 1,
    revision: 'Rev 4.2',
    uploadedBy: 'Dr. Akira Tanaka (OEM Quality)',
    uploadedAt: '2026-10-15T09:30:00.000Z',
    notes: 'Official Toyota Technical Standard for Engine Mounting High-Tensile Steel Bracket Durability and Corrosion Specification.',
    isPDF: true,
    status: 'Verified'
  },
  {
    id: 'ext-file-002',
    projectId: 'p-1',
    projectNumber: 'PPAP-2026-001',
    partNumber: '51201-0K150-C',
    partName: 'Engine Mounting Support Bracket LH',
    fileName: 'CAD_3D_MODEL_51201_REV04_STEP.stp',
    fileSize: 18450000,
    fileType: 'application/step',
    fileExtension: 'stp',
    category: 'Drawing / CAD',
    elementId: 1,
    revision: 'Rev 04',
    uploadedBy: 'Chaiwat Boonsri (R&D)',
    uploadedAt: '2026-10-18T14:15:00.000Z',
    notes: 'Native 3D CAD STEP file exported for tooling and fixture coordinate verification.',
    isPDF: false,
    status: 'Verified'
  },
  {
    id: 'ext-file-003',
    projectId: 'p-1',
    projectNumber: 'PPAP-2026-001',
    partNumber: '51201-0K150-C',
    partName: 'Engine Mounting Support Bracket LH',
    fileName: 'STEEL_COIL_HEAT_TREATMENT_MILL_CERT_LOT99.pdf',
    fileSize: 1320400,
    fileType: 'application/pdf',
    fileExtension: 'pdf',
    category: 'Material Test Cert',
    elementId: 10,
    revision: 'Rev A',
    uploadedBy: 'Nattaporn Chaiyasin (QE)',
    uploadedAt: '2026-10-22T11:00:00.000Z',
    notes: 'JFE Steel Corporation Material Test Certificate with chemical analysis and yield strength test results.',
    isPDF: true,
    status: 'Verified'
  },
  {
    id: 'ext-file-004',
    projectId: 'p-1',
    projectNumber: 'PPAP-2026-001',
    partNumber: '51201-0K150-C',
    partName: 'Engine Mounting Support Bracket LH',
    fileName: 'CMM_ZEISS_3D_RAW_SCAN_DATASET.xlsx',
    fileSize: 850200,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileExtension: 'xlsx',
    category: 'Dimensional Data',
    elementId: 9,
    revision: 'Rev 1',
    uploadedBy: 'Siriporn Rattanaporn (Inspector)',
    uploadedAt: '2026-10-25T16:45:00.000Z',
    notes: 'Complete coordinate measurement point dataset from Zeiss CMM with 45 balloon dimensions across 5 samples.',
    isPDF: false,
    status: 'Pending Review'
  },
  {
    id: 'ext-file-005',
    projectId: 'p-2',
    projectNumber: 'PPAP-2026-002',
    partNumber: '74111-T5A-000',
    partName: 'Front Suspension Subframe Reinforcement Lower',
    fileName: 'HONDA_ENGINEERING_APPROVAL_SIGNOFF_ECL03.pdf',
    fileSize: 3120000,
    fileType: 'application/pdf',
    fileExtension: 'pdf',
    category: 'Customer Approval',
    elementId: 3,
    revision: 'Rev C',
    uploadedBy: 'Somchai Prasert (Quality Manager)',
    uploadedAt: '2026-10-28T10:20:00.000Z',
    notes: 'Customer Engineering Approval sheet signed by Honda Engineering R&D Center (Prachinburi).',
    isPDF: true,
    status: 'Verified'
  },
  {
    id: 'ext-file-006',
    projectId: 'p-1',
    projectNumber: 'PPAP-2026-001',
    partNumber: '51201-0K150-C',
    partName: 'Engine Mounting Support Bracket LH',
    fileName: 'MASTER_TOOLING_AND_CHECKING_FIXTURE_ARCHIVE.zip',
    fileSize: 34500000,
    fileType: 'application/zip',
    fileExtension: 'zip',
    category: 'Master Package ZIP',
    elementId: 16,
    revision: 'Rev 2.0',
    uploadedBy: 'Kittisak Wongsuwan (PE)',
    uploadedAt: '2026-11-02T13:10:00.000Z',
    notes: 'Compressed backup containing checking aid maintenance manuals, dial indicator calibration certs, and photos.',
    isPDF: false,
    status: 'Verified'
  }
];

export const ExternalFileRepository: React.FC<ExternalFileRepositoryProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onNavigateToElement
}) => {
  const { currentUser, canEdit } = useAuth();

  // Storage state
  const [files, setFiles] = useState<ExternalProjectFile[]>(() => {
    try {
      const saved = localStorage.getItem('ppap_external_files');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_EXTERNAL_FILES;
  });

  // Filter & Search states
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>(selectedProjectId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadTargetProject, setUploadTargetProject] = useState<string>(
    selectedProjectId || (projects.length > 0 ? projects[0].id : 'global')
  );
  const [uploadCategory, setUploadCategory] = useState<ExternalProjectFile['category']>('Drawing / CAD');
  const [uploadElementId, setUploadElementId] = useState<string>('none');
  const [uploadRevision, setUploadRevision] = useState('Rev A');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'Verified' | 'Pending Review'>('Pending Review');
  const [selectedFileList, setSelectedFileList] = useState<File[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // PDF Preview modal state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('พรีวิวไฟล์');
  const [pdfSubtitle, setPdfSubtitle] = useState('');
  const [pdfFileName, setPdfFileName] = useState('document.pdf');

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedProjectId if changed from parent
  useEffect(() => {
    if (selectedProjectId) {
      setActiveProjectFilter(selectedProjectId);
      setUploadTargetProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Save to localStorage whenever files list changes
  const saveFiles = (updated: ExternalProjectFile[]) => {
    setFiles(updated);
    try {
      localStorage.setItem('ppap_external_files', JSON.stringify(updated));
    } catch {}
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFileList(Array.from(e.dataTransfer.files));
      setIsUploadModalOpen(true);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFileList(Array.from(e.target.files));
      setIsUploadModalOpen(true);
    }
  };

  // Convert File to base64 Data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle upload submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFileList.length === 0) {
      alert('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด');
      return;
    }

    setIsProcessingUpload(true);
    try {
      const targetProj = projects.find(p => p.id === uploadTargetProject);
      const newItems: ExternalProjectFile[] = [];

      for (const file of selectedFileList) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isPdf = ext === 'pdf' || file.type.includes('pdf');
        
        let dataUrl: string | undefined = undefined;
        // If file is under 15MB, store data URL for direct in-app preview/download
        if (file.size < 15 * 1024 * 1024) {
          try {
            dataUrl = await readFileAsDataURL(file);
          } catch {}
        }

        const newFileItem: ExternalProjectFile = {
          id: `ext-file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          projectId: targetProj ? targetProj.id : 'global',
          projectNumber: targetProj ? targetProj.projectNumber : 'GLOBAL-AUTOMOTIVE',
          partNumber: targetProj ? targetProj.partNumber : 'SHARED-SPEC',
          partName: targetProj ? targetProj.partName : 'Global Document Package',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || `application/${ext}`,
          fileExtension: ext,
          category: uploadCategory,
          elementId: uploadElementId !== 'none' ? parseInt(uploadElementId, 10) : undefined,
          revision: uploadRevision || 'Rev 0',
          uploadedBy: currentUser.name,
          uploadedAt: new Date().toISOString(),
          notes: uploadNotes,
          fileDataUrl: dataUrl,
          isPDF: isPdf,
          status: uploadStatus
        };

        newItems.push(newFileItem);
      }

      const updated = [...newItems, ...files];
      saveFiles(updated);

      // Reset modal
      setSelectedFileList([]);
      setUploadNotes('');
      setIsUploadModalOpen(false);
      alert(`อัปโหลดไฟล์ภายนอกสำเร็จ ${newItems.length} รายการและจัดเก็บเข้าสู่คลังเอกสารเรียบร้อยแล้ว`);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Preview file
  const handlePreviewFile = (fileItem: ExternalProjectFile) => {
    if (fileItem.isPDF && fileItem.fileDataUrl) {
      setPdfBlobUrl(fileItem.fileDataUrl);
      setPdfTitle(`พรีวิวเอกสารภายนอก: ${fileItem.fileName}`);
      setPdfSubtitle(`${fileItem.projectNumber} | ${fileItem.partName} | ${fileItem.category} (${fileItem.revision})`);
      setPdfFileName(fileItem.fileName);
      setShowPdfModal(true);
    } else if (fileItem.isPDF) {
      // Create a dummy PDF blob if no raw binary was stored
      alert(`เอกสาร PDF: ${fileItem.fileName}\nกำลังดาวน์โหลดหรือเปิดผ่านตัวอ่านในระบบ`);
      handleDownloadFile(fileItem);
    } else {
      alert(`ไฟล์ประเภท .${fileItem.fileExtension.toUpperCase()} ไม่รองรับการพรีวิวในหน้าจอโดยตรง สามารถคลิกปุ่มดาวน์โหลดเพื่อเปิดด้วยโปรแกรมเฉพาะทางได้`);
    }
  };

  // Download file
  const handleDownloadFile = (fileItem: ExternalProjectFile) => {
    if (fileItem.fileDataUrl) {
      const a = document.createElement('a');
      a.href = fileItem.fileDataUrl;
      a.download = fileItem.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Simulated export blob
      const content = `AUTOMOTIVE PPAP EXTERNAL FILE ARCHIVE
========================================
File Name: ${fileItem.fileName}
Project Number: ${fileItem.projectNumber}
Part Number: ${fileItem.partNumber}
Category: ${fileItem.category}
Revision: ${fileItem.revision}
Uploaded By: ${fileItem.uploadedBy}
Date: ${fileItem.uploadedAt}
Notes: ${fileItem.notes || '-'}
IATF 16949 / AIAG PPAP 4th Edition Compliant Repository File.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileItem.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Delete file
  const handleDeleteFile = (id: string, name: string) => {
    if (confirm(`คุณต้องการลบไฟล์ "${name}" ออกจากคลังจัดเก็บใช่หรือไม่?`)) {
      const filtered = files.filter(f => f.id !== id);
      saveFiles(filtered);
    }
  };

  // Reset to sample automotive files
  const handleResetToDefault = () => {
    if (confirm('คุณต้องการรีเซ็ตคลังไฟล์เป็นชุดไฟล์ตัวอย่างมาตรฐานยานยนต์เริ่มต้นใช่หรือไม่?')) {
      saveFiles(INITIAL_EXTERNAL_FILES);
    }
  };

  // File Icon helper
  const getFileIcon = (ext: string) => {
    const cleanExt = ext.toLowerCase();
    if (cleanExt === 'pdf') return <FileText className="w-5 h-5 text-rose-400" />;
    if (cleanExt === 'xlsx' || cleanExt === 'xls' || cleanExt === 'csv') return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (cleanExt === 'zip' || cleanExt === 'rar' || cleanExt === '7z') return <FileArchive className="w-5 h-5 text-amber-400" />;
    if (cleanExt === 'dwg' || cleanExt === 'dxf' || cleanExt === 'stp' || cleanExt === 'step') return <FileCode className="w-5 h-5 text-blue-400" />;
    if (cleanExt === 'png' || cleanExt === 'jpg' || cleanExt === 'jpeg') return <ImageIcon className="w-5 h-5 text-purple-400" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filtered files
  const filteredFiles = files.filter(f => {
    // Project filter
    if (activeProjectFilter !== 'all' && f.projectId !== activeProjectFilter) return false;
    // Category filter
    if (selectedCategory !== 'All' && f.category !== selectedCategory) return false;
    // Status filter
    if (selectedStatus !== 'All' && f.status !== selectedStatus) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.fileName.toLowerCase().includes(q);
      const matchPart = f.partNumber.toLowerCase().includes(q);
      const matchProj = f.projectNumber.toLowerCase().includes(q);
      const matchNotes = (f.notes || '').toLowerCase().includes(q);
      const matchUploader = f.uploadedBy.toLowerCase().includes(q);
      return matchName || matchPart || matchProj || matchNotes || matchUploader;
    }
    return true;
  });

  // Calculate statistics
  const totalStorageBytes = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
  const pdfCount = files.filter(f => f.isPDF).length;
  const cadCount = files.filter(f => ['dwg', 'dxf', 'stp', 'step'].includes(f.fileExtension.toLowerCase())).length;
  const verifiedCount = files.filter(f => f.status === 'Verified').length;

  const categories = [
    'All',
    'Drawing / CAD',
    'Engineering Spec',
    'Customer Approval',
    'Material Test Cert',
    'Dimensional Data',
    'Supplier Submission',
    'Master Package ZIP',
    'General Quality Record'
  ];

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Hub Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
                  <span>คลังจัดเก็บไฟล์โปรเจกต์ภายนอก</span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    External Repository
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  จัดเก็บ จัดหมวดหมู่ และพรีวิวไฟล์จากซัพพลายเออร์และลูกค้าตามข้อกำหนด IATF 16949 Section 7.5.3 (Drawing, CAD, Specs, Test Reports, ZIP)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            <button
              onClick={() => {
                setSelectedFileList([]);
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center space-x-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>อัปโหลดไฟล์ใหม่ (Upload File)</span>
            </button>

            <button
              onClick={handleResetToDefault}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition"
              title="รีเซ็ตเป็นไฟล์ตัวอย่างมาตรฐาน"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">รีเซ็ตตัวอย่าง</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Total External Files</div>
            <div className="text-xl font-bold text-white mt-0.5 flex items-center space-x-1.5">
              <span>{files.length}</span>
              <span className="text-[11px] text-blue-400 font-normal">ไฟล์</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Storage Consumption</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {formatBytes(totalStorageBytes)}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">PDF Documents</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5 flex items-center space-x-1.5">
              <span>{pdfCount}</span>
              <span className="text-[10px] text-slate-500 font-normal">พร้อมพรีวิว</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Verified Compliance</div>
            <div className="text-xl font-bold text-blue-400 mt-0.5 flex items-center space-x-1.5">
              <span>{verifiedCount}</span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                {Math.round((verifiedCount / (files.length || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Quick Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-600/10 scale-[1.005]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-200">
              คลิกหรือลากไฟล์เอกสารโปรเจกต์มาวางที่นี่
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              รองรับไฟล์ PDF, Excel (.xlsx, .xls), Word (.docx), CAD/Drawing (.dwg, .stp, .step), ZIP และภาพถ่าย
            </p>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">.PDF</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">.XLSX</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">.DWG / .STP</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">.ZIP</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
              Max 50MB
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Project Switcher Select */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 shrink-0 font-medium">โครงการ PPAP:</span>
            <select
              value={activeProjectFilter}
              onChange={e => {
                setActiveProjectFilter(e.target.value);
                if (onSelectProject && e.target.value !== 'all') {
                  onSelectProject(e.target.value);
                }
              }}
              className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="all">📂 ทุกโครงการ (All Projects - {files.length} ไฟล์)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.projectNumber} - {p.partName} ({p.partNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อไฟล์, Part No, หมายเหตุ หรือผู้อัปโหลด..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg pl-9 pr-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-500"
            />
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg transition whitespace-nowrap text-xs ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Table List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-200">รายการไฟล์ที่จัดเก็บ</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[11px]">
              {filteredFiles.length} รายการ
            </span>
          </div>

          <div className="text-xs text-slate-400">
            IATF 16949 Section 7.5.3 Compliant Retention
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FolderOpen className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
            <div className="text-sm font-semibold text-slate-300">ไม่พบไฟล์ที่ตรงกับเงื่อนไขการค้นหา</div>
            <p className="text-xs text-slate-500">
              ลองเปลี่ยนคำค้นหา หรือคลิกปุ่ม &quot;อัปโหลดไฟล์ใหม่&quot; เพื่อเพิ่มไฟล์ภายนอก
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-850 text-slate-300 border-b border-slate-800">
                  <th className="p-3.5 font-semibold w-12 text-center">ประเภท</th>
                  <th className="p-3.5 font-semibold w-72">ชื่อไฟล์ / รายละเอียด</th>
                  <th className="p-3.5 font-semibold w-48">โครงการ / Part Number</th>
                  <th className="p-3.5 font-semibold w-36">หมวดหมู่</th>
                  <th className="p-3.5 font-semibold text-center w-20">Rev</th>
                  <th className="p-3.5 font-semibold text-right w-24">ขนาด</th>
                  <th className="p-3.5 font-semibold w-36">วันที่ / ผู้อัปโหลด</th>
                  <th className="p-3.5 font-semibold text-center w-28">สถานะ</th>
                  <th className="p-3.5 font-semibold text-center w-36">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredFiles.map(file => {
                  return (
                    <tr key={file.id} className="hover:bg-slate-800/40 transition group">
                      
                      {/* Icon */}
                      <td className="p-3 text-center">
                        <div className="flex justify-center">
                          {getFileIcon(file.fileExtension)}
                        </div>
                      </td>

                      {/* File Name & Notes */}
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          <span
                            onClick={() => (file.isPDF ? handlePreviewFile(file) : handleDownloadFile(file))}
                            className="font-bold text-white hover:text-blue-400 cursor-pointer transition break-all"
                            title="คลิกเพื่อพรีวิวหรือดาวน์โหลดไฟล์"
                          >
                            {file.fileName}
                          </span>
                        </div>
                        {file.notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {file.notes}
                          </p>
                        )}
                        {file.elementId && (
                          <div className="mt-1 flex items-center space-x-1">
                            <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.2 rounded font-medium">
                              PPAP Element #{file.elementId}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Project & Part Number */}
                      <td className="p-3">
                        <div className="font-mono text-blue-400 font-semibold">{file.projectNumber}</div>
                        <div className="text-slate-300 truncate max-w-[180px]">{file.partName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{file.partNumber}</div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                          {file.category}
                        </span>
                      </td>

                      {/* Revision */}
                      <td className="p-3 text-center font-mono font-medium text-slate-200">
                        {file.revision}
                      </td>

                      {/* File Size */}
                      <td className="p-3 text-right font-mono text-slate-300">
                        {formatBytes(file.fileSize)}
                      </td>

                      {/* Date & Uploader */}
                      <td className="p-3 text-slate-300">
                        <div className="text-slate-200 truncate max-w-[140px]">{file.uploadedBy}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        {file.status === 'Verified' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>In Review</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          
                          {/* Preview Button (if PDF) */}
                          {file.isPDF && (
                            <button
                              onClick={() => handlePreviewFile(file)}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition"
                              title="พรีวิวไฟล์ PDF เต็มหน้าจอ"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Download Button */}
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition"
                            title="ดาวน์โหลดไฟล์ (Download)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          {canEdit() && (
                            <button
                              onClick={() => handleDeleteFile(file.id, file.fileName)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                              title="ลบไฟล์ออกจากคลัง"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    อัปโหลดไฟล์โปรเจกต์ภายนอก
                  </h3>
                  <p className="text-xs text-slate-400">
                    บันทึกเอกสารและหลักฐานประกอบเข้าสู่คลัง IATF 16949
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              
              {/* Selected Files Display or Drop trigger */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ไฟล์ที่เลือก ({selectedFileList.length} ไฟล์)
                </label>
                {selectedFileList.length > 0 ? (
                  <div className="max-h-28 overflow-y-auto space-y-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {selectedFileList.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-200">
                        <span className="truncate max-w-[320px] font-mono text-[11px]">{f.name}</span>
                        <span className="text-slate-400 text-[10px] shrink-0 font-mono">{formatBytes(f.size)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-slate-700 rounded-xl text-center cursor-pointer hover:border-blue-500 bg-slate-950/40"
                  >
                    <UploadCloud className="w-6 h-6 mx-auto text-blue-400 mb-1" />
                    <span className="text-slate-300 font-medium">คลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์ของคุณ</span>
                  </div>
                )}
              </div>

              {/* Target Project */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ผูกกับโครงการ PPAP (Target Project) *
                </label>
                <select
                  value={uploadTargetProject}
                  onChange={e => setUploadTargetProject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  <option value="global">🌐 เอกสารส่วนกลาง / Shared Automotive Spec</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} - {p.partName} ({p.partNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category & Revision */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">หมวดหมู่เอกสาร *</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="Drawing / CAD">Drawing / CAD Model</option>
                    <option value="Engineering Spec">Engineering Specification</option>
                    <option value="Customer Approval">Customer Approval Form</option>
                    <option value="PFMEA / Control Plan">PFMEA / Control Plan</option>
                    <option value="Material Test Cert">Material Test Certificate</option>
                    <option value="Dimensional Data">Dimensional Inspection Report</option>
                    <option value="Supplier Submission">Supplier Supporting Data</option>
                    <option value="Master Package ZIP">Master Package (ZIP)</option>
                    <option value="General Quality Record">General Quality Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Revision *</label>
                  <input
                    type="text"
                    value={uploadRevision}
                    onChange={e => setUploadRevision(e.target.value)}
                    placeholder="Rev A, Rev 0, Rev 1.0..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              {/* PPAP Element Tagging & Verification Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">แท็กกับ PPAP Element (ไม่บังคับ)</label>
                  <select
                    value={uploadElementId}
                    onChange={e => setUploadElementId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="none">-- ไม่ระบุ (General Document) --</option>
                    <option value="1">Element 1: Design Records</option>
                    <option value="2">Element 2: Engineering Change Documents</option>
                    <option value="3">Element 3: Customer Engineering Approval</option>
                    <option value="4">Element 4: Design FMEA (DFMEA)</option>
                    <option value="5">Element 5: Process Flow Diagram</option>
                    <option value="6">Element 6: Process FMEA (PFMEA)</option>
                    <option value="7">Element 7: Control Plan</option>
                    <option value="8">Element 8: Measurement System Analysis (MSA)</option>
                    <option value="9">Element 9: Dimensional Results</option>
                    <option value="10">Element 10: Material & Performance Results</option>
                    <option value="11">Element 11: Initial Process Studies</option>
                    <option value="12">Element 12: Qualified Laboratory Documentation</option>
                    <option value="13">Element 13: Appearance Approval Report (AAR)</option>
                    <option value="14">Element 14: Sample Production Parts</option>
                    <option value="15">Element 15: Master Sample</option>
                    <option value="16">Element 16: Checking Aids</option>
                    <option value="17">Element 17: Customer-Specific Requirements</option>
                    <option value="18">Element 18: Part Submission Warrant (PSW)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">สถานะการตรวจรับ</label>
                  <select
                    value={uploadStatus}
                    onChange={e => setUploadStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="Pending Review">รอการตรวจทาน (Pending Review)</option>
                    <option value="Verified">ตรวจรับถูกต้องแล้ว (Verified)</option>
                  </select>
                </div>
              </div>

              {/* Description / Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">คำอธิบายเพิ่มเติม / หมายเหตุ</label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={e => setUploadNotes(e.target.value)}
                  placeholder="เช่น มาตรฐานการทดสอบ, ผู้มีอำนาจลงนาม, แหล่งที่มาของไฟล์..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 resize-none"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                >
                  ยกเลิก (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isProcessingUpload || selectedFileList.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold shadow-md transition flex items-center space-x-2"
                >
                  {isProcessingUpload ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังประมวลผล...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>บันทึกเข้าสู่คลังเอกสาร (Save Files)</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* In-App PDF Preview Modal */}
      {showPdfModal && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={pdfTitle}
          subtitle={pdfSubtitle}
          pdfBlobUrl={pdfBlobUrl}
          fileName={pdfFileName}
        />
      )}

    </div>
  );
};
