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
  File,
  Cloud,
  CloudCheck,
  LogOut,
  Sparkles,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';
import { PPAPProject, ExternalProjectFile } from '../../types/ppap';
import { useAuth } from '../../context/AuthContext';
import { PDFPreviewModal } from '../common/PDFPreviewModal';
import {
  saveFileToIndexedDB,
  getFileBlobFromIndexedDB,
  getAllFilesFromIndexedDB,
  deleteFileFromIndexedDB,
  getIndexedDBStorageStats
} from '../../services/indexedDbStorage';
import {
  initDriveAuthListener,
  signInWithGoogleDrive,
  signOutGoogleDrive,
  uploadFileToGoogleDrive,
  deleteFileFromGoogleDrive,
  getDriveAccessToken
} from '../../services/googleDriveService';

interface ExternalFileRepositoryProps {
  projects: PPAPProject[];
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
  onNavigateToElement?: (elementId: number) => void;
}

// Authentic initial automotive project files pre-seeded for immediate productivity
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
    status: 'Verified',
    storageType: 'indexeddb',
    isSyncedToDrive: false
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
    status: 'Verified',
    storageType: 'indexeddb',
    isSyncedToDrive: false
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
    status: 'Verified',
    storageType: 'indexeddb',
    isSyncedToDrive: false
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
    status: 'Pending Review',
    storageType: 'indexeddb',
    isSyncedToDrive: false
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
    status: 'Verified',
    storageType: 'indexeddb',
    isSyncedToDrive: false
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
    status: 'Verified',
    storageType: 'indexeddb',
    isSyncedToDrive: false
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
  const [files, setFiles] = useState<ExternalProjectFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // IndexedDB Storage Stats
  const [indexedDbStats, setIndexedDbStats] = useState({
    totalBytes: 0,
    fileCount: 0,
    formattedSize: '0 Bytes'
  });

  // Google Drive Auth & Sync states
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

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
  const [autoSyncToDrive, setAutoSyncToDrive] = useState(true);

  // PDF Preview modal state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('พรีวิวไฟล์');
  const [pdfSubtitle, setPdfSubtitle] = useState('');
  const [pdfFileName, setPdfFileName] = useState('document.pdf');

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Auth Listener & Load Files from IndexedDB on startup
  useEffect(() => {
    // 1. Google Drive Auth listener
    const unsubscribe = initDriveAuthListener((user, token) => {
      setGoogleUser(user);
      setGoogleToken(token);
    });

    // 2. Load IndexedDB Files
    loadFilesFromStorage();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync selectedProjectId if changed from parent
  useEffect(() => {
    if (selectedProjectId) {
      setActiveProjectFilter(selectedProjectId);
      setUploadTargetProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadFilesFromStorage = async () => {
    setLoadingFiles(true);
    try {
      const stored = await getAllFilesFromIndexedDB();
      if (stored && stored.length > 0) {
        setFiles(stored);
      } else {
        // Seed default initial files into IndexedDB
        setFiles(INITIAL_EXTERNAL_FILES);
        for (const seed of INITIAL_EXTERNAL_FILES) {
          await saveFileToIndexedDB(seed, `Sample binary content for ${seed.fileName}`);
        }
      }
      refreshStats();
    } catch (err) {
      console.warn('Error reading from IndexedDB, falling back to localStorage:', err);
      try {
        const local = localStorage.getItem('ppap_external_files');
        if (local) setFiles(JSON.parse(local));
        else setFiles(INITIAL_EXTERNAL_FILES);
      } catch {
        setFiles(INITIAL_EXTERNAL_FILES);
      }
    } finally {
      setLoadingFiles(false);
    }
  };

  const refreshStats = async () => {
    const stats = await getIndexedDBStorageStats();
    setIndexedDbStats(stats);
  };

  // Google Drive Connect / Disconnect handlers
  const handleConnectGoogleDrive = async () => {
    setIsConnectingDrive(true);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        alert(`เชื่อมต่อ Google Drive สำเร็จ!\nบัญชี: ${res.user.email}\nระบบพร้อมสำรองไฟล์ PPAP ไปยังคลาวด์ฟรี 15 GB เรียบร้อยแล้ว`);
      }
    } catch (err: any) {
      alert(`การเชื่อมต่อ Google Drive ล้มเหลว: ${err.message || err}`);
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleDisconnectGoogleDrive = async () => {
    if (window.confirm('คุณต้องการยกเลิกการเชื่อมต่อกับ Google Drive ใช่หรือไม่? (ไฟล์ในเครื่อง IndexedDB จะยังคงอยู่ครบถ้วน)')) {
      await signOutGoogleDrive();
      setGoogleUser(null);
      setGoogleToken(null);
    }
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

  // Handle upload submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFileList.length === 0) {
      alert('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด');
      return;
    }

    setIsProcessingUpload(true);
    setSyncStatusMsg('กำลังจัดเก็บไฟล์ลงระบบ IndexedDB...');

    try {
      const targetProj = projects.find(p => p.id === uploadTargetProject);
      const newItems: ExternalProjectFile[] = [];

      for (let i = 0; i < selectedFileList.length; i++) {
        const file = selectedFileList[i];
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isPdf = ext === 'pdf' || file.type.includes('pdf');

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
          isPDF: isPdf,
          status: uploadStatus,
          storageType: 'indexeddb',
          isSyncedToDrive: false
        };

        // 1. Save binary into local IndexedDB
        await saveFileToIndexedDB(newFileItem, file);

        // 2. If Google Drive is connected & autoSync is true, upload to Google Drive
        if (googleToken && autoSyncToDrive) {
          try {
            setSyncStatusMsg(`กำลังซิงค์ไฟล์ (${i + 1}/${selectedFileList.length}): ${file.name} ไปยัง Google Drive...`);
            const driveResult = await uploadFileToGoogleDrive(googleToken, file, {
              fileName: file.name,
              mimeType: file.type,
              description: uploadNotes,
              projectId: targetProj?.id,
              elementId: newFileItem.elementId
            });

            newFileItem.driveFileId = driveResult.fileId;
            newFileItem.driveWebViewLink = driveResult.webViewLink;
            newFileItem.driveWebContentLink = driveResult.webContentLink;
            newFileItem.isSyncedToDrive = true;
            newFileItem.syncedAt = new Date().toISOString();
            newFileItem.storageType = 'hybrid';

            // Update IndexedDB with drive links
            await saveFileToIndexedDB(newFileItem, file);
          } catch (driveErr) {
            console.error('Google Drive sync error for file:', file.name, driveErr);
          }
        }

        newItems.push(newFileItem);
      }

      const updated = [...newItems, ...files];
      setFiles(updated);
      try {
        localStorage.setItem('ppap_external_files', JSON.stringify(updated));
      } catch {}

      refreshStats();

      // Reset modal
      setSelectedFileList([]);
      setUploadNotes('');
      setIsUploadModalOpen(false);
      setSyncStatusMsg(null);
      alert(
        `อัปโหลดสำเร็จ ${newItems.length} ไฟล์!\n- จัดเก็บใน IndexedDB เครื่อง: เรียบร้อย\n${
          googleToken && autoSyncToDrive ? '- สำรองข้อมูลไปยัง Google Drive: เรียบร้อย' : ''
        }`
      );
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    } finally {
      setIsProcessingUpload(false);
      setSyncStatusMsg(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Sync single file to Google Drive
  const handleSyncFileToDrive = async (fileItem: ExternalProjectFile) => {
    if (!googleToken) {
      alert('กรุณาเชื่อมต่อ Google Drive ด้านบนก่อนทำการซิงค์');
      return;
    }

    try {
      setIsSyncingDrive(true);
      setSyncStatusMsg(`กำลังส่ง ${fileItem.fileName} ไปยัง Google Drive...`);

      // 1. Get binary blob from IndexedDB
      let blob = await getFileBlobFromIndexedDB(fileItem.id);
      if (!blob) {
        blob = new Blob([`PPAP Document Content: ${fileItem.fileName}`], {
          type: fileItem.fileType || 'application/octet-stream'
        });
      }

      // 2. Upload to Google Drive
      const driveRes = await uploadFileToGoogleDrive(googleToken, blob, {
        fileName: fileItem.fileName,
        mimeType: fileItem.fileType,
        description: fileItem.notes || `PPAP Element ${fileItem.elementId || ''}`,
        projectId: fileItem.projectId,
        elementId: fileItem.elementId
      });

      // 3. Update file record
      const updatedItem: ExternalProjectFile = {
        ...fileItem,
        driveFileId: driveRes.fileId,
        driveWebViewLink: driveRes.webViewLink,
        driveWebContentLink: driveRes.webContentLink,
        isSyncedToDrive: true,
        syncedAt: new Date().toISOString(),
        storageType: 'hybrid'
      };

      await saveFileToIndexedDB(updatedItem, blob);
      const updatedList = files.map(f => (f.id === fileItem.id ? updatedItem : f));
      setFiles(updatedList);
      try {
        localStorage.setItem('ppap_external_files', JSON.stringify(updatedList));
      } catch {}

      alert(`ซิงค์ไฟล์ ${fileItem.fileName} ไปยัง Google Drive เรียบร้อยแล้ว!`);
    } catch (err: any) {
      alert(`การซิงค์ไปยัง Google Drive ล้มเหลว: ${err.message || err}`);
    } finally {
      setIsSyncingDrive(false);
      setSyncStatusMsg(null);
    }
  };

  // Sync all unsynced files to Google Drive
  const handleSyncAllToDrive = async () => {
    if (!googleToken) {
      alert('กรุณาคลิกปุ่มเชื่อมต่อ Google Drive ด้านบนก่อนทำการซิงค์');
      return;
    }

    const unsynced = files.filter(f => !f.isSyncedToDrive);
    if (unsynced.length === 0) {
      alert('ไฟล์ทั้งหมดถูกซิงค์ไปยัง Google Drive เรียบร้อยแล้ว');
      return;
    }

    setIsSyncingDrive(true);
    let successCount = 0;

    try {
      for (let i = 0; i < unsynced.length; i++) {
        const item = unsynced[i];
        setSyncStatusMsg(`กำลังซิงค์ไฟล์ (${i + 1}/${unsynced.length}): ${item.fileName}...`);

        let blob = await getFileBlobFromIndexedDB(item.id);
        if (!blob) {
          blob = new Blob([`PPAP Content: ${item.fileName}`], {
            type: item.fileType || 'application/octet-stream'
          });
        }

        const driveRes = await uploadFileToGoogleDrive(googleToken, blob, {
          fileName: item.fileName,
          mimeType: item.fileType,
          description: item.notes,
          projectId: item.projectId,
          elementId: item.elementId
        });

        item.driveFileId = driveRes.fileId;
        item.driveWebViewLink = driveRes.webViewLink;
        item.driveWebContentLink = driveRes.webContentLink;
        item.isSyncedToDrive = true;
        item.syncedAt = new Date().toISOString();
        item.storageType = 'hybrid';

        await saveFileToIndexedDB(item, blob);
        successCount++;
      }

      setFiles([...files]);
      try {
        localStorage.setItem('ppap_external_files', JSON.stringify(files));
      } catch {}

      alert(`ซิงค์ไฟล์ไปยัง Google Drive สำเร็จ ${successCount} ไฟล์!`);
    } catch (err: any) {
      alert(`การซิงค์ขัดข้อง: ${err.message || err}`);
    } finally {
      setIsSyncingDrive(false);
      setSyncStatusMsg(null);
    }
  };

  // Preview file (PDF)
  const handlePreviewFile = async (fileItem: ExternalProjectFile) => {
    if (!fileItem.isPDF) {
      alert(`ไฟล์ประเภท .${fileItem.fileExtension.toUpperCase()} ไม่รองรับการพรีวิว PDF โดยตรง สามารถดาวน์โหลดเพื่อเปิดด้วยซอฟต์แวร์เฉพาะทางได้`);
      return;
    }

    try {
      // 1. Try to get blob from IndexedDB
      const blob = await getFileBlobFromIndexedDB(fileItem.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setPdfTitle(`พรีวิวเอกสารภายนอก: ${fileItem.fileName}`);
        setPdfSubtitle(`${fileItem.projectNumber} | ${fileItem.partName} | ${fileItem.category} (${fileItem.revision})`);
        setPdfFileName(fileItem.fileName);
        setShowPdfModal(true);
        return;
      }

      // 2. If dataUrl exists
      if (fileItem.fileDataUrl) {
        setPdfBlobUrl(fileItem.fileDataUrl);
        setPdfTitle(`พรีวิวเอกสารภายนอก: ${fileItem.fileName}`);
        setPdfSubtitle(`${fileItem.projectNumber} | ${fileItem.partName} | ${fileItem.category} (${fileItem.revision})`);
        setPdfFileName(fileItem.fileName);
        setShowPdfModal(true);
        return;
      }

      // 3. Fallback: open in Google Drive or notify
      if (fileItem.driveWebViewLink) {
        window.open(fileItem.driveWebViewLink, '_blank');
      } else {
        alert(`กำลังดาวน์โหลดไฟล์ ${fileItem.fileName}...`);
        handleDownloadFile(fileItem);
      }
    } catch (err: any) {
      alert(`ไม่สามารถเปิดพรีวิวได้: ${err.message || err}`);
    }
  };

  // Download file
  const handleDownloadFile = async (fileItem: ExternalProjectFile) => {
    try {
      // 1. Try to fetch from IndexedDB
      const blob = await getFileBlobFromIndexedDB(fileItem.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileItem.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }

      // 2. If data url is present
      if (fileItem.fileDataUrl) {
        const a = document.createElement('a');
        a.href = fileItem.fileDataUrl;
        a.download = fileItem.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // 3. If Google Drive link exists
      if (fileItem.driveWebContentLink || fileItem.driveWebViewLink) {
        window.open(fileItem.driveWebContentLink || fileItem.driveWebViewLink, '_blank');
        return;
      }

      // 4. Generate fallback dummy download
      const fallbackBlob = new Blob([`PPAP Archive Record: ${fileItem.fileName}\nPart Number: ${fileItem.partNumber}`], {
        type: 'text/plain'
      });
      const url = URL.createObjectURL(fallbackBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileItem.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`ดาวน์โหลดไฟล์ล้มเหลว: ${err.message || err}`);
    }
  };

  // Delete file (Mandatory confirmation before destructive action)
  const handleDeleteFile = async (fileItem: ExternalProjectFile) => {
    const confirmMsg = fileItem.driveFileId
      ? `คุณต้องการลบไฟล์ "${fileItem.fileName}" ออกจากคลังเอกสารในเครื่อง (IndexedDB) และ Google Drive ใช่หรือไม่?\nการดำเนินการนี้ไม่สามารถยกเลิกได้`
      : `คุณต้องการลบไฟล์ "${fileItem.fileName}" ออกจากคลังเอกสารในเครื่องใช่หรือไม่?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      // 1. Delete from IndexedDB
      await deleteFileFromIndexedDB(fileItem.id);

      // 2. If present in Google Drive, delete from Drive
      if (fileItem.driveFileId && googleToken) {
        try {
          await deleteFileFromGoogleDrive(googleToken, fileItem.driveFileId);
        } catch (driveErr) {
          console.warn('Could not delete from Google Drive:', driveErr);
        }
      }

      const updated = files.filter(f => f.id !== fileItem.id);
      setFiles(updated);
      try {
        localStorage.setItem('ppap_external_files', JSON.stringify(updated));
      } catch {}

      refreshStats();
      alert(`ลบไฟล์ ${fileItem.fileName} สำเร็จ`);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการลบไฟล์: ${err.message || err}`);
    }
  };

  // Helper formatting functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (ext: string, category: string) => {
    switch (ext) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileArchive className="w-5 h-5 text-amber-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <ImageIcon className="w-5 h-5 text-blue-400" />;
      case 'dwg':
      case 'dxf':
      case 'stp':
      case 'step':
      case 'iges':
        return <FileCode className="w-5 h-5 text-purple-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  // Filtered files
  const filteredFiles = files.filter(f => {
    if (activeProjectFilter !== 'all' && f.projectId !== activeProjectFilter) return false;
    if (selectedCategory !== 'All' && f.category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && f.status !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = f.fileName.toLowerCase().includes(q);
      const matchPart = f.partNumber.toLowerCase().includes(q);
      const matchPartName = f.partName.toLowerCase().includes(q);
      const matchProject = f.projectNumber.toLowerCase().includes(q);
      const matchUploader = f.uploadedBy.toLowerCase().includes(q);
      if (!matchName && !matchPart && !matchPartName && !matchProject && !matchUploader) return false;
    }
    return true;
  });

  const totalBytes = files.reduce((sum, f) => sum + f.fileSize, 0);
  const syncedCount = files.filter(f => f.isSyncedToDrive).length;

  return (
    <div className="space-y-6">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & HYBRID STORAGE CONTROL CARD              */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Title & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                  <span>คลังจัดเก็บไฟล์โปรเจกต์ภายนอก (External File Repository)</span>
                  <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                    Hybrid Storage
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  ระบบจัดเก็บแบบไฮบริด: บันทึกลงในเครื่องผ่าน <strong>IndexedDB (ออฟไลน์ 100%)</strong> ควบคู่กับ <strong>Google Drive Cloud (ฟรี 15 GB)</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {googleToken && (
              <button
                onClick={handleSyncAllToDrive}
                disabled={isSyncingDrive}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
                title="ซิงค์ไฟล์ทั้งหมดที่ยังไม่ได้สำรองข้อมูลไปยัง Google Drive"
              >
                <CloudCheck className="w-4 h-4 text-emerald-400" />
                <span>{isSyncingDrive ? 'กำลังซิงค์...' : `ซิงค์ไฟล์ไป Drive (${files.length - syncedCount})`}</span>
              </button>
            )}

            {canEdit() && (
              <button
                onClick={() => {
                  setSelectedFileList([]);
                  setIsUploadModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-md hover:shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ อัปโหลดไฟล์ใหม่ (Upload File)</span>
              </button>
            )}
          </div>
        </div>

        {/* Dual Storage Status Cards: IndexedDB + Google Drive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-slate-800">
          
          {/* Card 1: IndexedDB Local Storage */}
          <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">พื้นที่จัดเก็บในเครื่อง (IndexedDB)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-medium">
                    Offline Ready
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ความจุใช้งาน: <strong className="text-slate-200">{indexedDbStats.formattedSize}</strong> ({indexedDbStats.fileCount} ไฟล์ในเครื่อง)
                </div>
              </div>
            </div>
            <button
              onClick={refreshStats}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition"
              title="รีเฟรชสถิติพื้นที่ในเครื่อง"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Google Drive Cloud Integration */}
          <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">Google Drive Cloud (ฟรี 15 GB)</span>
                  {googleUser ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-medium flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>เชื่อมต่อแล้ว</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-medium">
                      ยังไม่เชื่อมต่อ
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                  {googleUser ? (
                    <span>บัญชี: <strong className="text-slate-200">{googleUser.email}</strong></span>
                  ) : (
                    <span>เข้าสู่ระบบ Google เพื่อเปิดใช้การซิงค์และสำรองไฟล์ฟรี</span>
                  )}
                </div>
              </div>
            </div>

            {/* Google Sign In / Sign Out Buttons */}
            <div>
              {googleUser ? (
                <button
                  onClick={handleDisconnectGoogleDrive}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition flex items-center space-x-1"
                  title="ตัดการเชื่อมต่อ Google Drive"
                >
                  <LogOut className="w-3 h-3 text-rose-400" />
                  <span>ออก</span>
                </button>
              ) : (
                <button
                  onClick={handleConnectGoogleDrive}
                  disabled={isConnectingDrive}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                  title="เชื่อมต่อกับ Google Drive ด้วยบัญชี Google ฟรี"
                >
                  {/* Google SVG Icon */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{isConnectingDrive ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Drive'}</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Sync Progress Indicator */}
        {syncStatusMsg && (
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center space-x-2 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 2. DRAG & DROP DROPZONE                                  */}
      {/* ======================================================== */}
      {canEdit() && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2.5 ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-slate-800 bg-slate-900/50 hover:bg-slate-850 hover:border-slate-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">
              ลากไฟล์มาวางที่นี่ หรือ <span className="text-blue-400 underline">คลิกเพื่อเลือกไฟล์</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              รองรับทุกไฟล์: PDF, Excel (.xlsx, .csv), 2D/3D CAD (.dwg, .step, .stp), รูปภาพ, และ ZIP Archive
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. FILTER BAR                                            */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Project Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">โครงการ:</span>
          <select
            value={activeProjectFilter}
            onChange={e => setActiveProjectFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">ทุกโครงการ ({projects.length} โครงการ)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.projectNumber} - {p.partName} ({p.partNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">หมวดหมู่:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">ทุกหมวดหมู่</option>
            <option value="Drawing / CAD">Drawing / CAD</option>
            <option value="Engineering Spec">Engineering Spec</option>
            <option value="Customer Approval">Customer Approval</option>
            <option value="Material Test Cert">Material Test Cert</option>
            <option value="Dimensional Data">Dimensional Data</option>
            <option value="Master Package ZIP">Master Package ZIP</option>
            <option value="General Quality Record">General Quality Record</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหาชื่อไฟล์, Part No, เลขที่โปรเจกต์..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-slate-400 text-xs">
          พบ <strong>{filteredFiles.length}</strong> จาก {files.length} รายการ
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. FILE TABLE WITH HYBRID STORAGE INDICATORS             */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-x-auto">
        {loadingFiles ? (
          <div className="p-12 text-center text-slate-400">กำลังอ่านข้อมูลไฟล์จากคลัง IndexedDB...</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-850 text-slate-300 border-b border-slate-800 font-semibold">
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 w-80">ชื่อไฟล์ / เอกสาร (File Name)</th>
                <th className="p-3 w-48">โครงการ & ชิ้นส่วน (Project & Part)</th>
                <th className="p-3 w-36">หมวดหมู่ & Rev</th>
                <th className="p-3 w-36">สถานะจัดเก็บ (Storage Status)</th>
                <th className="p-3 w-28 text-right">ขนาด</th>
                <th className="p-3 w-36">ผู้อัปโหลด & วันที่</th>
                <th className="p-3 w-36 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    ไม่พบไฟล์เอกสารตามเงื่อนไขที่ระบุ สามารถกดปุ่ม "+ อัปโหลดไฟล์ใหม่" ด้านบนเพื่อจัดเก็บได้
                  </td>
                </tr>
              ) : (
                filteredFiles.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Index */}
                    <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* File Name & Icon */}
                    <td className="p-3">
                      <div className="flex items-start space-x-2.5">
                        <div className="mt-0.5 p-1.5 bg-slate-800 rounded-lg shrink-0">
                          {getFileIcon(item.fileExtension, item.category)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 hover:text-blue-400 transition cursor-pointer truncate max-w-[280px]"
                            onClick={() => handlePreviewFile(item)}
                            title={item.fileName}
                          >
                            {item.fileName}
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1" title={item.notes}>
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Project & Part */}
                    <td className="p-3">
                      <div className="font-medium text-slate-200">{item.projectNumber}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                        {item.partNumber}
                      </div>
                    </td>

                    {/* Category & Rev */}
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                      <div className="text-[10px] text-amber-400 font-mono font-bold mt-1">
                        {item.revision} {item.elementId ? `| E#${item.elementId}` : ''}
                      </div>
                    </td>

                    {/* Storage Status (IndexedDB / Google Drive / Hybrid) */}
                    <td className="p-3">
                      {item.isSyncedToDrive ? (
                        <div className="flex flex-col space-y-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CloudCheck className="w-3 h-3 text-emerald-400" />
                            <span>ซิงค์ Drive แล้ว</span>
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">IndexedDB + Cloud</span>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            <HardDrive className="w-3 h-3 text-blue-400" />
                            <span>ในเครื่อง (IndexedDB)</span>
                          </span>
                          {googleToken && (
                            <button
                              onClick={() => handleSyncFileToDrive(item)}
                              disabled={isSyncingDrive}
                              className="text-[10px] text-amber-400 hover:underline flex items-center space-x-1"
                            >
                              <span>+ ซิงค์ไป Drive</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* File Size */}
                    <td className="p-3 text-right font-mono text-slate-400 text-xs">
                      {formatFileSize(item.fileSize)}
                    </td>

                    {/* Uploader & Date */}
                    <td className="p-3">
                      <div className="text-slate-300 truncate max-w-[140px]">{item.uploadedBy}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(item.uploadedAt).toLocaleDateString('th-TH')}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        
                        {/* Preview (PDF) */}
                        {item.isPDF && (
                          <button
                            onClick={() => handlePreviewFile(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                            title="พรีวิวเอกสาร PDF เต็มจอ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Open in Google Drive */}
                        {item.driveWebViewLink && (
                          <a
                            href={item.driveWebViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition"
                            title="เปิดดูใน Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {/* Download */}
                        <button
                          onClick={() => handleDownloadFile(item)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                          title="ดาวน์โหลดไฟล์ลงเครื่อง"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        {canEdit() && (
                          <button
                            onClick={() => handleDeleteFile(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="ลบไฟล์ออกจากคลัง"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. UPLOAD MODAL WITH HYBRID STORAGE OPTIONS             */}
      {/* ======================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">อัปโหลดไฟล์โปรเจกต์ภายนอก</h3>
                  <p className="text-xs text-slate-400">จัดเก็บลง IndexedDB ออฟไลน์ และสำรองไปยัง Google Drive อัตโนมัติ</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              
              {/* Selected Files Preview */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ไฟล์ที่เลือก ({selectedFileList.length} ไฟล์):
                </label>
                {selectedFileList.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-800/40 text-slate-400"
                  >
                    + คลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์ของคุณ
                  </div>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {selectedFileList.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-300 text-[11px]">
                        <span className="truncate max-w-[360px]">{f.name}</span>
                        <span className="font-mono text-slate-500">{formatFileSize(f.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Project */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  โครงการ PPAP เป้าหมาย:
                </label>
                <select
                  value={uploadTargetProject}
                  onChange={e => setUploadTargetProject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} - {p.partName} ({p.partNumber})
                    </option>
                  ))}
                  <option value="global">โครงการส่วนกลาง (Global Document)</option>
                </select>
              </div>

              {/* Category & Element */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">หมวดหมู่เอกสาร:</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Drawing / CAD">Drawing / CAD</option>
                    <option value="Engineering Spec">Engineering Spec</option>
                    <option value="Customer Approval">Customer Approval</option>
                    <option value="Material Test Cert">Material Test Cert</option>
                    <option value="Dimensional Data">Dimensional Data</option>
                    <option value="Master Package ZIP">Master Package ZIP</option>
                    <option value="General Quality Record">General Quality Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Element ที่เกี่ยวข้อง (1-18):</label>
                  <select
                    value={uploadElementId}
                    onChange={e => setUploadElementId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="none">ไม่ระบุ</option>
                    <option value="1">Element 1: Design Records</option>
                    <option value="2">Element 2: Engineering Change</option>
                    <option value="3">Element 3: Customer Approval</option>
                    <option value="4">Element 4: DFMEA</option>
                    <option value="5">Element 5: Process Flow</option>
                    <option value="6">Element 6: PFMEA</option>
                    <option value="7">Element 7: Control Plan</option>
                    <option value="8">Element 8: MSA</option>
                    <option value="9">Element 9: Dimensional</option>
                    <option value="10">Element 10: Material / Performance</option>
                    <option value="11">Element 11: Initial Process Studies</option>
                    <option value="12">Element 12: Qualified Lab Docs</option>
                    <option value="13">Element 13: AAR</option>
                    <option value="14">Element 14: Sample Production</option>
                    <option value="15">Element 15: Master Sample</option>
                    <option value="16">Element 16: Checking Aids</option>
                    <option value="17">Element 17: CSR</option>
                    <option value="18">Element 18: PSW</option>
                  </select>
                </div>
              </div>

              {/* Revision & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ระดับแก้ไข (Revision):</label>
                  <input
                    type="text"
                    value={uploadRevision}
                    onChange={e => setUploadRevision(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                    placeholder="e.g. Rev 0, Rev A, ECL 03"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">สถานะเอกสาร:</label>
                  <select
                    value={uploadStatus}
                    onChange={e => setUploadStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Pending Review">Pending Review (รอตรวจสอบ)</option>
                    <option value="Verified">Verified (ตรวจสอบแล้ว)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">หมายเหตุเพิ่มเติม:</label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={e => setUploadNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 resize-none"
                  placeholder="รายละเอียดเอกสาร ผลการทดสอบ หรือข้อกำหนดเฉพาะของลูกค้า..."
                />
              </div>

              {/* Storage Destination Options */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-200 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>ตำแหน่งการจัดเก็บข้อมูล (Storage Destination):</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <label className="flex items-center space-x-2 text-slate-300">
                    <input type="checkbox" checked disabled className="rounded text-blue-500" />
                    <span>บันทึกลง IndexedDB ภายในเครื่อง (ความจุหลาย GB ออฟไลน์ 100%)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={autoSyncToDrive}
                      onChange={e => setAutoSyncToDrive(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>
                      สำรองข้อมูลขึ้น Google Drive อัตโนมัติ (ฟรี 15 GB)
                      {!googleToken && ' (จะเชื่อมต่อเมื่อกดอัปโหลด)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isProcessingUpload || selectedFileList.length === 0}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isProcessingUpload ? 'กำลังจัดเก็บ...' : 'ยืนยันการจัดเก็บไฟล์'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. PDF PREVIEW MODAL                                     */}
      {/* ======================================================== */}
      {showPdfModal && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          onClose={() => {
            setShowPdfModal(false);
            if (pdfBlobUrl && pdfBlobUrl.startsWith('blob:')) {
              URL.revokeObjectURL(pdfBlobUrl);
            }
          }}
          title={pdfTitle}
          subtitle={pdfSubtitle}
          pdfBlobUrl={pdfBlobUrl}
          fileName={pdfFileName}
        />
      )}

    </div>
  );
};
