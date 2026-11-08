import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Download,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Layers,
  ArrowRight,
  FileText,
  RotateCcw,
  SlidersHorizontal,
  Table,
  Eye
} from 'lucide-react';
import { PPAPProject, PFMEARow, ActionPriority } from '../../types/ppap';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportPFMEAToExcel, exportPFMEAToPDF } from '../../utils/exportUtils';
import { calculateActionPriority } from '../../utils/fmeaUtils';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

interface PFMEAManagerProps {
  project: PPAPProject;
  onOpenAIGenerator: () => void;
  onLinkToControlPlan?: () => void;
}

export const PFMEAManager: React.FC<PFMEAManagerProps> = ({
  project,
  onOpenAIGenerator,
  onLinkToControlPlan
}) => {
  const { currentUser, canEdit } = useAuth();
  const [rows, setRows] = useState<PFMEARow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterHighRPN, setFilterHighRPN] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [viewTheme, setViewTheme] = useState<'ww-standard' | 'dark-modern'>('ww-standard');

  // Form WW-PPAP-102 Header Metadata
  const [meta, setMeta] = useState({
    fmeaNumber: `FMEA-${project.partNumber || 'PRT'}-01`,
    drawingRev: project.engineeringChangeLevel || 'Rev. 03',
    dateOrig: project.createdAt?.split('T')[0] || '2026-01-15',
    dateRev: project.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    processResp: project.manufacturingLocation || 'Manufacturing & Stamping Dept',
    preparedBy: currentUser.name || project.responsibleEngineer,
    analysisTeam: 'QA, Tooling, Stamping Engineering, Maintenance, R&D Core Team',
    pageCurrent: 1,
    pageTotal: 1
  });

  const handlePreviewPDF = () => {
    const doc = exportPFMEAToPDF(project, rows, meta);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setShowPdfModal(true);
  };

  useEffect(() => {
    loadPFMEA();
  }, [project.id]);

  const loadPFMEA = () => {
    setLoading(true);
    api.getPFMEA(project.id)
      .then(res => {
        // Ensure WW-PPAP-102 fields are populated
        const enriched = (res || []).map((r, idx) => {
          const s = r.severity || 7;
          const o = r.occurrence || 3;
          const d = r.detection || 3;
          const rpn = r.rpn !== undefined ? r.rpn : (s * o * d);
          const revS = r.revisedSeverity || s;
          const revO = r.revisedOccurrence || (o > 1 ? o - 1 : 1);
          const revD = r.revisedDetection || (d > 1 ? d - 1 : 1);
          const revRpn = r.revisedRpn !== undefined ? r.revisedRpn : (revS * revO * revD);

          return {
            ...r,
            lineNumber: r.lineNumber || r.lineNo || (idx + 1),
            lineNo: r.lineNo || r.lineNumber || (idx + 1),
            processStage: r.processStage || r.processStep || `OP ${idx * 10 + 10} Operation`,
            classification: r.classification || 'None',
            currentProcessControls: r.currentProcessControls || `${r.preventionControl || ''} / ${r.detectionControl || ''}`,
            rpn,
            actionTaken: r.actionTaken || 'Applied tooling Poka-Yoke and optical sensor inspection',
            revisedSeverity: revS,
            revisedOccurrence: revO,
            revisedDetection: revD,
            revisedRpn: revRpn
          };
        });
        setRows(enriched);
      })
      .catch(err => console.error('Error fetching PFMEA:', err))
      .finally(() => setLoading(false));
  };

  const handleRowChange = (id: string, field: keyof PFMEARow, value: any) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };

        // Recalculate original RPN & AP
        if (field === 'severity' || field === 'occurrence' || field === 'detection') {
          const s = field === 'severity' ? Number(value) : (r.severity || 1);
          const o = field === 'occurrence' ? Number(value) : (r.occurrence || 1);
          const d = field === 'detection' ? Number(value) : (r.detection || 1);
          updated.rpn = s * o * d;
          updated.actionPriority = calculateActionPriority(s, o, d);
        }

        // Recalculate revised RPN
        if (field === 'revisedSeverity' || field === 'revisedOccurrence' || field === 'revisedDetection') {
          const revS = field === 'revisedSeverity' ? Number(value) : (r.revisedSeverity || r.severity || 1);
          const revO = field === 'revisedOccurrence' ? Number(value) : (r.revisedOccurrence || r.occurrence || 1);
          const revD = field === 'revisedDetection' ? Number(value) : (r.revisedDetection || r.detection || 1);
          updated.revisedRpn = revS * revO * revD;
        }

        return updated;
      })
    );
  };

  const handleAddRow = () => {
    const nextLine = rows.length + 1;
    const newRow: PFMEARow = {
      id: `pf-${Date.now()}`,
      lineNumber: nextLine,
      lineNo: nextLine,
      processStage: `OP ${nextLine * 10}: New Operation Stage`,
      processStep: `OP ${nextLine * 10}: New Operation Stage`,
      processFunction: 'Specify operation function and tolerance requirements',
      failureMode: 'Potential failure mode (e.g. Burr, dimension out of spec)',
      failureEffect: 'Impact on vehicle assembly or customer function',
      classification: 'None',
      failureCause: 'Tooling wear, improper clamping, or parameter drift',
      occurrence: 3,
      currentProcessControls: 'Poka-Yoke jig, regular maintenance & CMM check',
      preventionControl: 'Tool life monitoring & automated shutoff',
      detectionControl: 'In-line sensor & go/no-go gage',
      severity: 7,
      detection: 3,
      rpn: 7 * 3 * 3, // 63
      actionPriority: calculateActionPriority(7, 3, 3),
      recommendedAction: 'Install automated vision sensor to eliminate defects',
      responsibility: currentUser.name,
      targetCompletionDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      actionTaken: 'Installed keyence vision camera & calibrated test limits',
      revisedSeverity: 7,
      revisedOccurrence: 2,
      revisedDetection: 1,
      revisedRpn: 7 * 2 * 1, // 14
      status: 'Open'
    };
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await api.savePFMEA(project.id, rows, currentUser.name);
      setRows(saved);
      alert('บันทึกเอกสาร Process FMEA (Form WW-PPAP-102) เรียบร้อยแล้ว');
    } catch (err: any) {
      alert(err.message || 'Failed to save PFMEA');
    } finally {
      setSaving(false);
    }
  };

  // RPN statistics
  const highRpnCount = rows.filter(r => (r.rpn || 0) >= 100).length;
  const avgRpn = rows.length > 0
    ? Math.round(rows.reduce((sum, r) => sum + (r.rpn || 0), 0) / rows.length)
    : 0;

  const displayedRows = filterHighRPN
    ? rows.filter(r => (r.rpn || 0) >= 100)
    : rows;

  return (
    <div className="space-y-4">
      {/* Top Controls & Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Process FMEA (Form WW-PPAP-102 / AIAG Standard)
            </h2>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              Element #6
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
              WW-PPAP-102
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            แบบฟอร์มวิเคราะห์ลักษณะความล้มเหลวและผลกระทบของกระบวนการ คำนวณค่า RPN (S × O × D) และผลลัพธ์ Action Results
          </p>
        </div>

        {/* High RPN Statistics */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>High RPN (≥100): {highRpnCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
            Avg RPN: {avgRpn}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewTheme('ww-standard')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center space-x-1 ${
                viewTheme === 'ww-standard'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="สลับมุมมองแบบฟอร์มคลาสสิก WW-PPAP-102 สีเหลืองมาตรฐานยานยนต์"
            >
              <Table className="w-3.5 h-3.5" />
              <span>WW-PPAP-102</span>
            </button>
            <button
              onClick={() => setViewTheme('dark-modern')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center space-x-1 ${
                viewTheme === 'dark-modern'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="สลับมุมมอง Dark Mode ทันสมัย"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Dark UI</span>
            </button>
          </div>

          <button
            onClick={() => setFilterHighRPN(!filterHighRPN)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              filterHighRPN
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5 inline mr-1" />
            {filterHighRPN ? 'Show All Rows' : 'RPN ≥ 100 Only'}
          </button>

          <button
            onClick={() => exportPFMEAToExcel(project, rows, meta)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center space-x-1.5"
            title="ส่งออก Excel ตามฟอร์ม WW-PPAP-102"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePreviewPDF}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
            title="เปิดพรีวิวแบบฟอร์ม WW-PPAP-102 เต็มจอเป็น PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>พรีวิว PDF (Preview PDF)</span>
          </button>

          <button
            onClick={onOpenAIGenerator}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center space-x-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Assistant</span>
          </button>

          {canEdit() && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึก (Save)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* FORM WW-PPAP-102 CONTAINER                               */}
      {/* Exact styling matching user provided screenshot         */}
      {/* ======================================================== */}
      <div className={`rounded-xl border shadow-lg overflow-hidden ${
        viewTheme === 'ww-standard'
          ? 'bg-white border-black text-black'
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>

        {/* 1. Centered Title Box */}
        <div className="p-3 border-b-2 border-black">
          <div className={`max-w-xl mx-auto text-center border-2 py-2 px-6 rounded-sm ${
            viewTheme === 'ww-standard'
              ? 'border-black bg-white shadow-sm'
              : 'border-slate-700 bg-slate-850'
          }`}>
            <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase">
              PROCESS FMEA
            </h1>
          </div>
        </div>

        {/* 2. Metadata Information Block (Matching Screenshot) */}
        <div className={`p-4 border-b-2 border-black text-xs ${
          viewTheme === 'ww-standard' ? 'bg-[#FCFCFA]' : 'bg-slate-900/80'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-2.5">
            
            {/* Row 1 */}
            <div className="md:col-span-5 flex items-center space-x-2">
              <span className="font-bold min-w-[130px] text-slate-900">Part / Item Number:</span>
              <input
                type="text"
                disabled={!canEdit()}
                value={project.partNumber}
                readOnly
                className="flex-1 bg-transparent border-b border-black px-1.5 py-0.5 text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex items-center space-x-2">
              <span className="font-bold min-w-[90px] text-slate-900">Drawing Rev.:</span>
              <input
                type="text"
                disabled={!canEdit()}
                value={meta.drawingRev}
                onChange={e => setMeta({ ...meta, drawingRev: e.target.value })}
                className="flex-1 bg-transparent border-b border-black px-1.5 py-0.5 text-xs focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
              <span className="font-bold min-w-[90px] text-slate-900">FMEA Number:</span>
              <input
                type="text"
                disabled={!canEdit()}
                value={meta.fmeaNumber}
                onChange={e => setMeta({ ...meta, fmeaNumber: e.target.value })}
                className="w-full bg-[#FEF9C3] border border-black px-2 py-0.5 text-xs font-mono font-semibold text-slate-900"
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
              <span className="font-bold min-w-[80px] text-slate-900">Date (Orig.):</span>
              <input
                type="date"
                disabled={!canEdit()}
                value={meta.dateOrig}
                onChange={e => setMeta({ ...meta, dateOrig: e.target.value })}
                className="w-full bg-[#FEF9C3] border border-black px-1.5 py-0.5 text-xs text-slate-900"
              />
            </div>

            {/* Row 2 */}
            <div className="md:col-span-5 flex items-center space-x-2">
              <span className="font-bold min-w-[130px] text-slate-900">Part Name:</span>
              <input
                type="text"
                disabled={!canEdit()}
                value={project.partName}
                readOnly
                className="flex-1 bg-transparent border-b border-black px-1.5 py-0.5 text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex items-center space-x-2">
              <span className="font-bold min-w-[90px] text-slate-900">Process Resp.:</span>
              <input
                type="text"
                disabled={!canEdit()}
                value={meta.processResp}
                onChange={e => setMeta({ ...meta, processResp: e.target.value })}
                className="w-full bg-[#FEF9C3] border border-black px-2 py-0.5 text-xs text-slate-900"
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
              <span className="font-bold min-w-[90px] text-slate-900">Prepared by:</span>
              <input
                type="text"
                disabled={!canEdit()}
                value={meta.preparedBy}
                onChange={e => setMeta({ ...meta, preparedBy: e.target.value })}
                className="w-full bg-[#FEF9C3] border border-black px-2 py-0.5 text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
              <span className="font-bold min-w-[80px] text-slate-900">Date (Rev.):</span>
              <input
                type="date"
                disabled={!canEdit()}
                value={meta.dateRev}
                onChange={e => setMeta({ ...meta, dateRev: e.target.value })}
                className="w-full bg-[#FEF9C3] border border-black px-1.5 py-0.5 text-xs text-slate-900"
              />
            </div>

            {/* Row 3 */}
            <div className="md:col-span-8 flex items-center space-x-2">
              <span className="font-bold min-w-[130px] text-slate-900">Analysis Team:</span>
              <input
                type="text"
                disabled={!canEdit()}
                value={meta.analysisTeam}
                onChange={e => setMeta({ ...meta, analysisTeam: e.target.value })}
                className="w-full bg-[#FEF9C3] border border-black px-2 py-0.5 text-xs text-slate-900"
              />
            </div>

            <div className="md:col-span-4 flex items-center justify-end space-x-2">
              <span className="font-bold text-slate-900">Page</span>
              <input
                type="number"
                disabled={!canEdit()}
                value={meta.pageCurrent}
                onChange={e => setMeta({ ...meta, pageCurrent: Number(e.target.value) })}
                className="w-12 bg-[#FEF9C3] border border-black px-1 py-0.5 text-center text-xs text-slate-900"
              />
              <span className="font-bold text-slate-900">Of</span>
              <input
                type="number"
                disabled={!canEdit()}
                value={meta.pageTotal}
                onChange={e => setMeta({ ...meta, pageTotal: Number(e.target.value) })}
                className="w-12 bg-[#FEF9C3] border border-black px-1 py-0.5 text-center text-xs text-slate-900"
              />
            </div>

          </div>
        </div>

        {/* 3. The Interactive Matrix Table (Form WW-PPAP-102 Exact Column Layout) */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading Form WW-PPAP-102 data...</div>
          ) : (
            <table className={`w-full text-left text-xs border-collapse min-w-[1700px] ${
              viewTheme === 'ww-standard' ? 'border-t-2 border-black' : ''
            }`}>
              
              {/* Table Headers */}
              <thead>
                {/* Header Row 1 */}
                <tr className={viewTheme === 'ww-standard' ? 'bg-white text-black' : 'bg-slate-800 text-slate-200'}>
                  <th rowSpan={2} className="border border-black p-2 font-bold text-center w-14">
                    Line Number
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold w-40">
                    Process Stages
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold w-52">
                    Process Functions / Requirements
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold w-48">
                    Potential Failure Mode
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold w-52">
                    Potential Effect(s) of Failure
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold text-center w-12" title="Severity (1-10)">
                    Sev.
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold text-center w-16" title="Classification / Special Characteristic">
                    Class
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold w-52">
                    Potential Cause(s) / Mechanism(s) of Failure
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold text-center w-12" title="Occurrence (1-10)">
                    Occur.
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold w-56">
                    Current Process Controls
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold text-center w-12" title="Detection (1-10)">
                    Detec
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold text-center w-16 bg-amber-100/50 text-slate-900" title="Risk Priority Number (S × O × D)">
                    RPN
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold w-52">
                    Recomm-ended Action
                  </th>
                  <th rowSpan={2} className="border border-black p-2 font-bold w-36">
                    Responsibility & Target Completi-on Date
                  </th>

                  {/* Group Header for Action Results */}
                  <th colSpan={5} className="border border-black p-1.5 font-bold text-center bg-slate-100 text-slate-900">
                    Action Results
                  </th>

                  {canEdit() && (
                    <th rowSpan={2} className="border border-black p-2 font-bold text-center w-12 bg-slate-50 text-slate-700">
                      Action
                    </th>
                  )}
                </tr>

                {/* Header Row 2 (Sub-headers for Action Results) */}
                <tr className={viewTheme === 'ww-standard' ? 'bg-white text-black' : 'bg-slate-800 text-slate-200'}>
                  <th className="border border-black p-1.5 font-bold w-44">Action Taken</th>
                  <th className="border border-black p-1.5 font-bold text-center w-12" title="Revised Severity">Sev.</th>
                  <th className="border border-black p-1.5 font-bold text-center w-12" title="Revised Occurrence">Occ.</th>
                  <th className="border border-black p-1.5 font-bold text-center w-12" title="Revised Detection">Det.</th>
                  <th className="border border-black p-1.5 font-bold text-center w-16 bg-emerald-100/60 text-slate-900" title="Revised RPN (Sev × Occ × Det)">
                    RPN
                  </th>
                </tr>
              </thead>

              {/* Table Body - Characteristic Pale Yellow Cells matching screenshot */}
              <tbody>
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="p-8 text-center text-slate-500 bg-white border border-black">
                      No PFMEA rows found. Click "Add Process Stage" below or generate with AI Assistant.
                    </td>
                  </tr>
                ) : (
                  displayedRows.map((row, idx) => {
                    const rpn = row.rpn || ((row.severity || 1) * (row.occurrence || 1) * (row.detection || 1));
                    const revRpn = row.revisedRpn || ((row.revisedSeverity || row.severity || 1) * (row.revisedOccurrence || 1) * (row.revisedDetection || 1));

                    const cellBg = viewTheme === 'ww-standard' ? 'bg-[#FFFDE7]' : 'bg-slate-900';
                    const inputBg = viewTheme === 'ww-standard'
                      ? 'bg-transparent text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500'
                      : 'bg-slate-800 text-slate-200 border-slate-700 focus:border-blue-500';

                    return (
                      <tr key={row.id} className="hover:brightness-95 transition">
                        
                        {/* 1. Line Number */}
                        <td className={`border border-black p-1.5 text-center font-bold ${cellBg}`}>
                          <input
                            type="number"
                            disabled={!canEdit()}
                            value={row.lineNumber || row.lineNo || (idx + 1)}
                            onChange={e => handleRowChange(row.id, 'lineNumber', Number(e.target.value))}
                            className={`w-10 text-center font-mono font-bold py-0.5 rounded text-xs ${inputBg}`}
                          />
                        </td>

                        {/* 2. Process Stages */}
                        <td className={`border border-black p-1.5 ${cellBg}`}>
                          <textarea
                            rows={2}
                            disabled={!canEdit()}
                            value={row.processStage || row.processStep}
                            onChange={e => {
                              handleRowChange(row.id, 'processStage', e.target.value);
                              handleRowChange(row.id, 'processStep', e.target.value);
                            }}
                            className={`w-full px-1.5 py-1 text-xs rounded resize-none border-0 ${inputBg}`}
                            placeholder="e.g. OP 10 Stamping"
                          />
                        </td>

                        {/* 3. Process Functions / Requirements */}
                        <td className={`border border-black p-1.5 ${cellBg}`}>
                          <textarea
                            rows={2}
                            disabled={!canEdit()}
                            value={row.processFunction}
                            onChange={e => handleRowChange(row.id, 'processFunction', e.target.value)}
                            className={`w-full px-1.5 py-1 text-xs rounded resize-none border-0 ${inputBg}`}
                            placeholder="Function & tolerances"
                          />
                        </td>

                        {/* 4. Potential Failure Mode */}
                        <td className={`border border-black p-1.5 ${cellBg}`}>
                          <textarea
                            rows={2}
                            disabled={!canEdit()}
                            value={row.failureMode}
                            onChange={e => handleRowChange(row.id, 'failureMode', e.target.value)}
                            className={`w-full px-1.5 py-1 text-xs rounded resize-none border-0 font-medium ${inputBg}`}
                            placeholder="Potential failure"
                          />
                        </td>

                        {/* 5. Potential Effect(s) of Failure */}
                        <td className={`border border-black p-1.5 ${cellBg}`}>
                          <textarea
                            rows={2}
                            disabled={!canEdit()}
                            value={row.failureEffect}
                            onChange={e => handleRowChange(row.id, 'failureEffect', e.target.value)}
                            className={`w-full px-1.5 py-1 text-xs rounded resize-none border-0 ${inputBg}`}
                            placeholder="Impact on OEM / user"
                          />
                        </td>

                        {/* 6. Sev. (Severity 1-10) */}
                        <td className={`border border-black p-1.5 text-center ${cellBg}`}>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            disabled={!canEdit()}
                            value={row.severity}
                            onChange={e => handleRowChange(row.id, 'severity', e.target.value)}
                            className={`w-10 text-center font-bold text-xs py-1 rounded ${inputBg}`}
                          />
                        </td>

                        {/* 7. Class (Classification) */}
                        <td className={`border border-black p-1.5 text-center ${cellBg}`}>
                          <select
                            disabled={!canEdit()}
                            value={row.classification || 'None'}
                            onChange={e => handleRowChange(row.id, 'classification', e.target.value)}
                            className={`w-full px-1 py-1 text-xs rounded text-center font-semibold ${inputBg}`}
                          >
                            <option value="None">-</option>
                            <option value="Critical">Critical ⚡</option>
                            <option value="Significant">Significant ▽</option>
                            <option value="Major">Major</option>
                            <option value="Safety">Safety ⚠️</option>
                          </select>
                        </td>

                        {/* 8. Potential Cause(s) / Mechanism(s) of Failure */}
                        <td className={`border border-black p-1.5 ${cellBg}`}>
                          <textarea
                            rows={2}
                            disabled={!canEdit()}
                            value={row.failureCause}
                            onChange={e => handleRowChange(row.id, 'failureCause', e.target.value)}
                            className={`w-full px-1.5 py-1 text-xs rounded resize-none border-0 ${inputBg}`}
                            placeholder="Root cause"
                          />
                        </td>

                        {/* 9. Occur. (1-10) */}
                        <td className={`border border-black p-1.5 text-center ${cellBg}`}>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            disabled={!canEdit()}
                            value={row.occurrence}
                            onChange={e => handleRowChange(row.id, 'occurrence', e.target.value)}
                            className={`w-10 text-center font-bold text-xs py-1 rounded ${inputBg}`}
                          />
                        </td>

                        {/* 10. Current Process Controls */}
                        <td className={`border border-black p-1.5 ${cellBg}`}>
                          <textarea
                            rows={2}
                            disabled={!canEdit()}
                            value={row.currentProcessControls || `${row.preventionControl || ''}; ${row.detectionControl || ''}`}
                            onChange={e => handleRowChange(row.id, 'currentProcessControls', e.target.value)}
                            className={`w-full px-1.5 py-1 text-xs rounded resize-none border-0 ${inputBg}`}
                            placeholder="Prevention & Detection controls"
                          />
                        </td>

                        {/* 11. Detec (1-10) */}
                        <td className={`border border-black p-1.5 text-center ${cellBg}`}>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            disabled={!canEdit()}
                            value={row.detection}
                            onChange={e => handleRowChange(row.id, 'detection', e.target.value)}
                            className={`w-10 text-center font-bold text-xs py-1 rounded ${inputBg}`}
                          />
                        </td>

                        {/* 12. RPN (Risk Priority Number = S × O × D) */}
                        <td className={`border border-black p-1.5 text-center font-mono font-bold ${cellBg}`}>
                          <div className={`px-1.5 py-1 rounded text-xs font-black inline-block ${
                            rpn >= 100
                              ? 'bg-rose-500 text-white shadow-sm ring-1 ring-rose-600'
                              : rpn >= 50
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'bg-emerald-500/20 text-emerald-800'
                          }`}>
                            {rpn}
                          </div>
                        </td>

                        {/* 13. Recommended Action */}
                        <td className={`border border-black p-1.5 ${cellBg}`}>
                          <textarea
                            rows={2}
                            disabled={!canEdit()}
                            value={row.recommendedAction}
                            onChange={e => handleRowChange(row.id, 'recommendedAction', e.target.value)}
                            className={`w-full px-1.5 py-1 text-xs rounded resize-none border-0 ${inputBg}`}
                            placeholder="Recommended corrective action"
                          />
                        </td>

                        {/* 14. Responsibility & Target Completion Date */}
                        <td className={`border border-black p-1.5 space-y-1 ${cellBg}`}>
                          <input
                            type="text"
                            disabled={!canEdit()}
                            value={row.responsibility}
                            onChange={e => handleRowChange(row.id, 'responsibility', e.target.value)}
                            className={`w-full px-1 py-0.5 text-[11px] rounded ${inputBg}`}
                            placeholder="Resp. Engineer"
                          />
                          <input
                            type="date"
                            disabled={!canEdit()}
                            value={row.targetCompletionDate}
                            onChange={e => handleRowChange(row.id, 'targetCompletionDate', e.target.value)}
                            className={`w-full px-1 py-0.5 text-[10px] rounded ${inputBg}`}
                          />
                        </td>

                        {/* 15. Action Results -> Action Taken */}
                        <td className={`border border-black p-1.5 ${cellBg}`}>
                          <textarea
                            rows={2}
                            disabled={!canEdit()}
                            value={row.actionTaken || ''}
                            onChange={e => handleRowChange(row.id, 'actionTaken', e.target.value)}
                            className={`w-full px-1.5 py-1 text-xs rounded resize-none border-0 ${inputBg}`}
                            placeholder="Action taken details"
                          />
                        </td>

                        {/* 16. Action Results -> Revised Sev */}
                        <td className={`border border-black p-1.5 text-center ${cellBg}`}>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            disabled={!canEdit()}
                            value={row.revisedSeverity ?? row.severity}
                            onChange={e => handleRowChange(row.id, 'revisedSeverity', e.target.value)}
                            className={`w-10 text-center font-bold text-xs py-1 rounded ${inputBg}`}
                          />
                        </td>

                        {/* 17. Action Results -> Revised Occ */}
                        <td className={`border border-black p-1.5 text-center ${cellBg}`}>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            disabled={!canEdit()}
                            value={row.revisedOccurrence ?? (row.occurrence > 1 ? row.occurrence - 1 : 1)}
                            onChange={e => handleRowChange(row.id, 'revisedOccurrence', e.target.value)}
                            className={`w-10 text-center font-bold text-xs py-1 rounded ${inputBg}`}
                          />
                        </td>

                        {/* 18. Action Results -> Revised Det */}
                        <td className={`border border-black p-1.5 text-center ${cellBg}`}>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            disabled={!canEdit()}
                            value={row.revisedDetection ?? (row.detection > 1 ? row.detection - 1 : 1)}
                            onChange={e => handleRowChange(row.id, 'revisedDetection', e.target.value)}
                            className={`w-10 text-center font-bold text-xs py-1 rounded ${inputBg}`}
                          />
                        </td>

                        {/* 19. Action Results -> Revised RPN */}
                        <td className={`border border-black p-1.5 text-center font-mono font-bold ${cellBg}`}>
                          <div className={`px-1.5 py-1 rounded text-xs font-black inline-block ${
                            revRpn >= 100
                              ? 'bg-rose-500 text-white'
                              : 'bg-emerald-500/20 text-emerald-800'
                          }`}>
                            {revRpn}
                          </div>
                        </td>

                        {/* Row Delete */}
                        {canEdit() && (
                          <td className={`border border-black p-1.5 text-center ${cellBg}`}>
                            <button
                              onClick={() => handleDeleteRow(row.id)}
                              className="p-1 text-slate-500 hover:text-rose-600 transition"
                              title="Delete Row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 4. Form Footer (Matching Screenshot) */}
        <div className={`p-3 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between text-xs font-bold ${
          viewTheme === 'ww-standard' ? 'bg-[#FCFCFA] text-slate-800' : 'bg-slate-900 text-slate-300'
        }`}>
          <div className="space-y-0.5">
            <div>Form Number: &nbsp; &nbsp; &nbsp; <span className="font-mono">WW-PPAP-102</span></div>
            <div>Form Revision Date: <span className="font-mono">22-Mar-2010</span></div>
          </div>

          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            {canEdit() && (
              <button
                onClick={handleAddRow}
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center space-x-1.5 transition shadow-sm text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มขั้นตอนกระบวนการ (Add Process Stage)</span>
              </button>
            )}
            <div className="text-xs text-slate-500 font-normal">
              Total Stages: <strong className="text-slate-900">{rows.length}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* PDF Full Preview Modal */}
      {showPdfModal && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={`Process FMEA (Form WW-PPAP-102) - Element #6`}
          subtitle={`${project.projectNumber} | ${project.partName} (${project.partNumber})`}
          pdfBlobUrl={pdfBlobUrl}
          fileName={`PFMEA_WW-PPAP-102_${project.partNumber}.pdf`}
        />
      )}

    </div>
  );
};
