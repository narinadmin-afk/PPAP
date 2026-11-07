import React, { useState, useEffect } from 'react';
import {
  Save,
  Download,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  ShieldCheck,
  FileDown,
  FileText
} from 'lucide-react';
import { PPAPProject, PSWData, PPAPLevel } from '../../types/ppap';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportPSWToPDF } from '../../utils/exportUtils';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

interface PSWViewerProps {
  project: PPAPProject;
}

export const PSWViewer: React.FC<PSWViewerProps> = ({ project }) => {
  const { currentUser, canApprove, canEdit } = useAuth();
  const [psw, setPsw] = useState<PSWData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    loadPSW();
  }, [project.id]);

  const loadPSW = () => {
    setLoading(true);
    api.getPSW(project.id)
      .then(res => setPsw(res))
      .catch(err => console.error('Error fetching PSW:', err))
      .finally(() => setLoading(false));
  };

  const handleUpdate = (field: keyof PSWData, value: any) => {
    if (!psw) return;
    setPsw({ ...psw, [field]: value });
  };

  const handleSave = async () => {
    if (!psw) return;
    setSaving(true);
    try {
      const saved = await api.savePSW(project.id, psw, currentUser.name);
      setPsw(saved);
      alert('Part Submission Warrant (PSW) saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save PSW');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPDF = () => {
    if (!psw) return;
    const doc = exportPSWToPDF(project, psw);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setShowPdfModal(true);
  };

  const handleExportPDF = () => {
    if (!psw) return;
    const doc = exportPSWToPDF(project, psw);
    doc.save(`PSW_${project.partNumber}_${project.projectNumber}.pdf`);
  };

  const handleSignDeclaration = () => {
    if (!psw) return;
    setPsw({
      ...psw,
      declarationAuthorized: true,
      authorizedSignatureName: currentUser.name,
      authorizedSignatureTitle: currentUser.role,
      authorizedDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleCustomerApproval = (status: 'Approved' | 'Rejected' | 'Interim Approved') => {
    if (!psw) return;
    setPsw({
      ...psw,
      customerApprovalStatus: status,
      customerApprovalName: currentUser.name,
      customerApprovalDate: new Date().toISOString().split('T')[0]
    });
  };

  if (loading || !psw) {
    return <div className="p-12 text-center text-slate-400">Loading Part Submission Warrant...</div>;
  }

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Part Submission Warrant (PSW)
            </h2>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              Element #18 (Mandatory Warrant)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Official declaration form certifying that parts were produced from production tooling and meet all customer specifications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviewPDF}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
            title="พรีวิวเอกสาร PSW เป็นไฟล์ PDF เต็มรูปแบบ"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>พรีวิว PDF (Preview PDF)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Download PDF</span>
          </button>

          {canEdit() && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Warrant'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Official AIAG Warrant Styled Form Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl max-w-6xl w-full mx-auto text-xs text-slate-200">
        
        {/* Document Header */}
        <div className="border-b border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest block">
              AIAG PPAP 4th Edition Standard
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              PART SUBMISSION WARRANT
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Project Reference:</span>
            <div className="font-mono font-bold text-sm text-blue-400">{project.projectNumber}</div>
            <span className="text-[10px] text-slate-500">IATF 16949 Section 8.3.4.4</span>
          </div>
        </div>

        {/* Section 1: Part Information */}
        <div className="space-y-3">
          <div className="bg-slate-800/80 px-3 py-1.5 rounded font-bold text-slate-200 text-xs tracking-wider uppercase">
            1. Part Information
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Part Name</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.partName}
                onChange={e => handleUpdate('partName', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Part Number</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.partNumber}
                onChange={e => handleUpdate('partNumber', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Drawing Number</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.drawingNumber}
                onChange={e => handleUpdate('drawingNumber', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Engineering Change Level</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.engineeringChangeLevel}
                onChange={e => handleUpdate('engineeringChangeLevel', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Drawing Date</label>
              <input
                type="date"
                disabled={!canEdit()}
                value={psw.drawingDate}
                onChange={e => handleUpdate('drawingDate', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Purchase Order No</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.purchaseOrderNo}
                onChange={e => handleUpdate('purchaseOrderNo', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Part Weight (kg)</label>
              <input
                type="number"
                step="0.001"
                disabled={!canEdit()}
                value={psw.weightKg}
                onChange={e => handleUpdate('weightKg', Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Checking Aid Number</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.checkingAidNo}
                onChange={e => handleUpdate('checkingAidNo', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Supplier & Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded font-bold text-slate-200 text-xs tracking-wider uppercase">
              2. Supplier Manufacturing Information
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Supplier Name</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.supplierName}
                onChange={e => handleUpdate('supplierName', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Vendor Code</label>
                <input
                  type="text"
                  disabled={!canEdit()}
                  value={psw.supplierVendorCode}
                  onChange={e => handleUpdate('supplierVendorCode', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Tooling / Cavity</label>
                <input
                  type="text"
                  disabled={!canEdit()}
                  value={psw.moldsCavitiesProcesses}
                  onChange={e => handleUpdate('moldsCavitiesProcesses', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Manufacturing Address</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.supplierAddress}
                onChange={e => handleUpdate('supplierAddress', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded font-bold text-slate-200 text-xs tracking-wider uppercase">
              3. Customer Information & Application
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Customer Name</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.customerName}
                onChange={e => handleUpdate('customerName', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Division / Plant</label>
              <input
                type="text"
                disabled={!canEdit()}
                value={psw.customerDivision}
                onChange={e => handleUpdate('customerDivision', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Customer Buyer</label>
                <input
                  type="text"
                  disabled={!canEdit()}
                  value={psw.customerBuyer}
                  onChange={e => handleUpdate('customerBuyer', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Vehicle Application</label>
                <input
                  type="text"
                  disabled={!canEdit()}
                  value={psw.application}
                  onChange={e => handleUpdate('application', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Submission Level & Reason */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="bg-slate-800/80 px-3 py-1.5 rounded font-bold text-slate-200 text-xs tracking-wider uppercase mb-2">
              4. Submission Level
            </div>
            <div className="p-3 rounded-lg bg-slate-850 border border-slate-800 space-y-1">
              <span className="font-bold text-blue-400 text-sm">LEVEL {psw.submissionLevel}</span>
              <p className="text-xs text-slate-400">
                {psw.submissionLevel === 3
                  ? 'Warrant with product samples and complete supporting data submitted to customer.'
                  : `Submission Level ${psw.submissionLevel} per AIAG Table 4.1`}
              </p>
            </div>
          </div>

          <div>
            <div className="bg-slate-800/80 px-3 py-1.5 rounded font-bold text-slate-200 text-xs tracking-wider uppercase mb-2">
              5. Submission Reason
            </div>
            <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
              <span className="font-semibold text-slate-200 text-sm">{psw.submissionReason}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Verification Checklist */}
        <div className="space-y-3">
          <div className="bg-slate-800/80 px-3 py-1.5 rounded font-bold text-slate-200 text-xs tracking-wider uppercase">
            6. Submission Results Verification
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-850 rounded-xl border border-slate-800">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit()}
                checked={psw.dimensionalTestResults}
                onChange={e => handleUpdate('dimensionalTestResults', e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Dimensional Test Results</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit()}
                checked={psw.materialTestResults}
                onChange={e => handleUpdate('materialTestResults', e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Material Test Results</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit()}
                checked={psw.performanceTestResults}
                onChange={e => handleUpdate('performanceTestResults', e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Performance & Durability Tests</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit()}
                checked={psw.appearanceTestResults}
                onChange={e => handleUpdate('appearanceTestResults', e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Appearance Approval Report (AAR)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit()}
                checked={psw.statisticalProcessPackage}
                onChange={e => handleUpdate('statisticalProcessPackage', e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Capability Package (Cpk/Ppk &gt;= 1.67)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit()}
                checked={psw.materialsReportedToIMDS}
                onChange={e => handleUpdate('materialsReportedToIMDS', e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Materials Reported to IMDS</span>
            </label>
          </div>
        </div>

        {/* Section 6: Supplier Declaration & Customer Sign-off */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Supplier Authorization */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-xs">AUTHORIZED SUPPLIER DECLARATION</h3>
              {psw.declarationAuthorized && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Signed Electronically
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "I hereby affirm that the samples represented by this warrant are representative of our parts, which were made by a process that meets all Production Part Approval Process (PPAP) manual 4th Edition requirements."
            </p>

            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-500">Signatory:</span> <strong className="text-white">{psw.authorizedSignatureName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Title:</span> <span className="text-slate-300">{psw.authorizedSignatureTitle}</span>
              </div>
              <div>
                <span className="text-slate-500">Date:</span> <span className="text-slate-300">{psw.authorizedDate}</span>
              </div>
            </div>

            {canApprove() && !psw.declarationAuthorized && (
              <button
                onClick={handleSignDeclaration}
                className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
              >
                Sign Warrant Electronically (QA Manager)
              </button>
            )}
          </div>

          {/* Customer Approval Section */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-xs">CUSTOMER OEM DISPOSITION</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                psw.customerApprovalStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                psw.customerApprovalStatus === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {psw.customerApprovalStatus.toUpperCase()}
              </span>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Customer Remarks / Notes</label>
              <textarea
                rows={2}
                disabled={!canApprove()}
                value={psw.customerRemarks || ''}
                onChange={e => handleUpdate('customerRemarks', e.target.value)}
                placeholder="Enter customer disposition conditions or interim approval requirements..."
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 resize-none text-xs"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
              <div>
                <span className="text-slate-500">Approver:</span> <strong className="text-white">{psw.customerApprovalName || 'Pending'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Date:</span> <span className="text-slate-300">{psw.customerApprovalDate || '-'}</span>
              </div>
            </div>

            {canApprove() && (
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => handleCustomerApproval('Approved')}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
                >
                  Approve Warrant
                </button>
                <button
                  onClick={() => handleCustomerApproval('Rejected')}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                >
                  Reject Warrant
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {showPdfModal && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={`Part Submission Warrant (PSW) - AIAG 4th Edition`}
          subtitle={`${project.projectNumber} | ${project.partName} (${project.partNumber}) | Level ${project.submissionLevel}`}
          pdfBlobUrl={pdfBlobUrl}
          fileName={`PSW_${project.partNumber}_${project.projectNumber}.pdf`}
        />
      )}

    </div>
  );
};
