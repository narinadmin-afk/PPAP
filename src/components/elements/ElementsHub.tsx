import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileCheck,
  History,
  MessageSquare,
  ShieldCheck,
  Paperclip,
  ExternalLink,
  Edit3,
  FileSpreadsheet
} from 'lucide-react';
import { PPAPProject, PPAPElement, ElementStatus } from '../../types/ppap';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StandardElementTableEditor } from './StandardElementTableEditor';
import { exportChecklistToPDF, exportElementTableToPDF } from '../../utils/exportUtils';
import { ELEMENT_TABLE_DEFINITIONS, getDefaultRowsForElement } from '../../data/standardElementTemplates';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

interface ElementsHubProps {
  project: PPAPProject;
  onRefreshProject: () => void;
  onNavigateTab: (tabId: string) => void;
  onOpenElementTable?: (elementId: number) => void;
  onOpenAIGenerator?: () => void;
}

export const ElementsHub: React.FC<ElementsHubProps> = ({
  project,
  onRefreshProject,
  onNavigateTab,
  onOpenElementTable,
  onOpenAIGenerator
}) => {
  const { currentUser, canApprove, canEdit } = useAuth();
  const { language } = useLanguage();

  // Dialog & active table editor states
  const [activeTableElementId, setActiveTableElementId] = useState<number | null>(null);
  const [approvalModalElement, setApprovalModalElement] = useState<PPAPElement | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [uploadModalElement, setUploadModalElement] = useState<PPAPElement | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadRevision, setUploadRevision] = useState('Rev A');
  const [historyElement, setHistoryElement] = useState<PPAPElement | null>(null);

  // PDF Preview Modal state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('พรีวิวเอกสาร PDF');
  const [pdfSubtitle, setPdfSubtitle] = useState('');
  const [pdfFileName, setPdfFileName] = useState('document.pdf');
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handlePreviewChecklistPDF = () => {
    const doc = exportChecklistToPDF(project);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setPdfTitle(`PPAP Master Submission Checklist - Level ${project.submissionLevel}`);
    setPdfSubtitle(`${project.projectNumber} | ${project.partName} (${project.partNumber})`);
    setPdfFileName(`${project.projectNumber}_PPAP_Checklist.pdf`);
    setShowPdfModal(true);
  };

  const handlePreviewElementPDF = async (elementId: number) => {
    const elDef = ELEMENT_TABLE_DEFINITIONS[elementId];
    if (!elDef) return;
    setLoadingPdf(true);
    try {
      let tableRows = await api.getElementTable(project.id, elementId);
      if (!Array.isArray(tableRows) || tableRows.length === 0) {
        tableRows = getDefaultRowsForElement(elementId, project);
      }
      const doc = exportElementTableToPDF(
        project,
        elementId,
        elDef.nameEn,
        elDef.columns.map(c => ({ key: c.key, label: c.label })),
        tableRows
      );
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setPdfTitle(`Element #${elementId}: ${elDef.nameTh} (${elDef.nameEn})`);
      setPdfSubtitle(`${project.projectNumber} | ${project.partName} (${project.partNumber}) | Level ${project.submissionLevel}`);
      setPdfFileName(`${project.projectNumber}_Element_${elementId}_${elDef.nameEn.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      setShowPdfModal(true);
    } catch (err) {
      console.error('Error generating element PDF preview:', err);
    } finally {
      setLoadingPdf(false);
    }
  };

  const level = project.submissionLevel;

  const handleApprove = async () => {
    if (!approvalModalElement) return;
    try {
      await api.updateElement(
        project.id,
        approvalModalElement.id,
        {
          status: 'Approved',
          approvedBy: currentUser.name,
          currentRevision: approvalModalElement.currentRevision || 'Rev A'
        },
        currentUser.name,
        currentUser.role
      );
      setApprovalModalElement(null);
      onRefreshProject();
    } catch (err: any) {
      alert(err.message || 'Failed to approve element');
    }
  };

  const handleReject = async () => {
    if (!approvalModalElement) return;
    if (!rejectComment.trim()) {
      alert('Please enter a rejection comment explaining what needs correction.');
      return;
    }
    try {
      await api.updateElement(
        project.id,
        approvalModalElement.id,
        {
          status: 'Rejected',
          comments: rejectComment
        },
        currentUser.name,
        currentUser.role
      );
      setApprovalModalElement(null);
      setRejectComment('');
      onRefreshProject();
    } catch (err: any) {
      alert(err.message || 'Failed to reject element');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalElement) return;

    try {
      await api.uploadElementFile(
        project.id,
        uploadModalElement.id,
        {
          fileName: uploadFileName || `${uploadModalElement.shortCode}_${project.partNumber}.pdf`,
          fileSize: 245000,
          fileType: 'application/pdf',
          revision: uploadRevision
        },
        currentUser.name
      );
      setUploadModalElement(null);
      setUploadFileName('');
      onRefreshProject();
      alert('Document uploaded and status set to Pending Review.');
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    }
  };

  const getRetentionBadge = (req: 'S' | 'R' | '*' | 'NA') => {
    switch (req) {
      case 'S':
        return (
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold" title="Submit to Customer">
            S (Submit)
          </span>
        );
      case 'R':
        return (
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title="Retain at Supplier Location">
            R (Retain)
          </span>
        );
      case '*':
        return (
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30" title="Customer Specific">
            * (Per OEM)
          </span>
        );
      case 'NA':
        return (
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-750">
            N/A
          </span>
        );
    }
  };

  const getStatusBadge = (status: ElementStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'Pending Review':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold">
            In Progress
          </span>
        );
      case 'Not Applicable':
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
            N/A
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Not Started
          </span>
        );
    }
  };

  const handleDirectTabJump = (elementId: number) => {
    if (elementId === 5) onNavigateTab('flow');
    else if (elementId === 6) onNavigateTab('pfmea');
    else if (elementId === 7) onNavigateTab('control-plan');
    else if (elementId === 9) onNavigateTab('dimensional');
    else if (elementId === 18) onNavigateTab('psw');
  };

  if (activeTableElementId !== null) {
    return (
      <StandardElementTableEditor
        project={project}
        elementId={activeTableElementId}
        onClose={() => setActiveTableElementId(null)}
        onElementUpdated={onRefreshProject}
        onJumpToSpecializedTab={onNavigateTab}
        onOpenAIGenerator={onOpenAIGenerator}
      />
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              PPAP 18 Elements Management Hub
            </h2>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              Level {level} Requirements
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full compliance control: S = Submit to customer, R = Retain at supplier facility, * = Customer specific requirements.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={handlePreviewChecklistPDF}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-medium transition flex items-center space-x-1.5 shadow-sm"
            title="พรีวิวเอกสาร PPAP Master Checklist ทั้งหมด 18 รายการเป็นไฟล์ PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>พรีวิว Checklist (PDF)</span>
          </button>

          <div className="text-right">
            <div className="text-slate-400">Approved Readiness:</div>
            <div className="text-sm font-bold text-emerald-400">
              {project.completedElements} / {project.totalElements} Elements
            </div>
          </div>
        </div>
      </div>

      {/* 18 Elements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-slate-850 text-slate-300 border-b border-slate-800">
              <th className="p-3 font-semibold text-center w-12">#</th>
              <th className="p-3 font-semibold w-72">Element Name</th>
              <th className="p-3 font-semibold text-center w-28">Requirement</th>
              <th className="p-3 font-semibold text-center w-32">Status</th>
              <th className="p-3 font-semibold text-center w-20">Revision</th>
              <th className="p-3 font-semibold w-36">Prepared By</th>
              <th className="p-3 font-semibold w-36">Approved By</th>
              <th className="p-3 font-semibold text-center w-20">Files</th>
              <th className="p-3 font-semibold text-center w-52">Actions / จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {project.elements.map(el => {
              const req = el.requiredForLevel[level] || 'R';
              const hasDirectEditor = [5, 6, 7, 9, 18].includes(el.id);

              return (
                <tr key={el.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-center font-bold text-slate-400">
                    {el.id}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => (onOpenElementTable ? onOpenElementTable(el.id) : setActiveTableElementId(el.id))}
                        className="font-semibold text-white hover:text-blue-400 transition text-left cursor-pointer"
                        title="คลิกเพื่อเปิดดูและแก้ไขตารางข้อมูลมาตรฐานสำหรับ Element นี้"
                      >
                        {el.name}
                      </button>
                      {hasDirectEditor && (
                        <button
                          onClick={() => handleDirectTabJump(el.id)}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white transition"
                          title="Open dedicated editor tab"
                        >
                          Specialized ↗
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{el.description}</p>
                    {el.comments && (
                      <div className="mt-1 text-[11px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 inline-block">
                        ⚠️ Rejection note: {el.comments}
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    {getRetentionBadge(req)}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center">
                      {getStatusBadge(el.status)}
                    </div>
                  </td>

                  <td className="p-3 text-center font-mono font-medium text-slate-300">
                    {el.currentRevision || 'Rev 0'}
                  </td>

                  <td className="p-3 text-slate-300 truncate max-w-[140px]">
                    {el.preparedBy || project.responsibleEngineer}
                  </td>

                  <td className="p-3 text-slate-300 truncate max-w-[140px]">
                    {el.approvedBy || '-'}
                  </td>

                  <td className="p-3 text-center">
                    {el.attachments.length > 0 ? (
                      <div className="flex items-center justify-center space-x-1 text-blue-400">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="font-semibold">{el.attachments.length}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {/* Standard Document Table Button */}
                      <button
                        onClick={() => (onOpenElementTable ? onOpenElementTable(el.id) : setActiveTableElementId(el.id))}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-semibold flex items-center space-x-1 transition shadow-sm shrink-0"
                        title="เปิดดูและแก้ไขตารางข้อมูลมาตรฐานสำหรับ Element นี้ (View & Edit Document Table)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>ตารางเอกสาร</span>
                      </button>

                      {/* Quick PDF Preview */}
                      <button
                        onClick={() => handlePreviewElementPDF(el.id)}
                        disabled={loadingPdf}
                        className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
                        title="พรีวิวเอกสาร Element นี้เป็น PDF เต็มรูปแบบ"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Upload */}
                      {canEdit() && (
                        <button
                          onClick={() => {
                            setUploadModalElement(el);
                            setUploadFileName(`${el.shortCode}_${project.partNumber}.pdf`);
                          }}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition"
                          title="Upload Attachment"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Download */}
                      <a
                        href={`/files/${encodeURIComponent(el.shortCode + '_' + project.partNumber + '.pdf')}`}
                        download
                        className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      {/* Approval / Review */}
                      {canApprove() && (
                        <button
                          onClick={() => {
                            setApprovalModalElement(el);
                            setRejectComment(el.comments || '');
                          }}
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
                          title="Electronic Review & Approval"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
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

      {/* Approval & Review Modal */}
      {approvalModalElement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Electronic Approval: Element #{approvalModalElement.id}
                </h3>
                <p className="text-[11px] text-slate-400">{approvalModalElement.name}</p>
              </div>
              <button
                onClick={() => setApprovalModalElement(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 space-y-1">
                <div><span className="text-slate-400">Current Status:</span> <strong className="text-white">{approvalModalElement.status}</strong></div>
                <div><span className="text-slate-400">Revision:</span> <strong className="text-white">{approvalModalElement.currentRevision}</strong></div>
                <div><span className="text-slate-400">Approver Role:</span> <strong className="text-blue-400">{currentUser.name} ({currentUser.role})</strong></div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Rejection or Approval Comment (Required if rejecting):
                </label>
                <textarea
                  rows={3}
                  value={rejectComment}
                  onChange={e => setRejectComment(e.target.value)}
                  placeholder="Specify review observations, compliance confirmation, or reasons for rejection..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 resize-none text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setApprovalModalElement(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold"
              >
                Reject with Comment
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
              >
                Approve Element
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload File Attachment Modal */}
      {uploadModalElement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">Upload Document Attachment</h3>
                <p className="text-[11px] text-slate-400">{uploadModalElement.name}</p>
              </div>
              <button onClick={() => setUploadModalElement(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Document Revision Level</label>
                <select
                  value={uploadRevision}
                  onChange={e => setUploadRevision(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="Rev 0">Rev 0 (Initial Prototype)</option>
                  <option value="Rev A">Rev A (Pre-Launch Trial)</option>
                  <option value="Rev B">Rev B (Mass Production Released)</option>
                  <option value="Rev C">Rev C (ECN Engineering Change)</option>
                </select>
              </div>

              <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center text-slate-400 space-y-1">
                <Upload className="w-8 h-8 mx-auto text-blue-500" />
                <div className="text-slate-200 font-medium">Click or drag file to attach</div>
                <div className="text-[10px]">PDF, XLSX, DOCX, DWG up to 50MB</div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalElement(null)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold"
                >
                  Attach & Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
