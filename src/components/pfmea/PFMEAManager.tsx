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
  FileText
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
  const [filterHighAP, setFilterHighAP] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const handlePreviewPDF = () => {
    const doc = exportPFMEAToPDF(project, rows);
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
      .then(res => setRows(res))
      .catch(err => console.error('Error fetching PFMEA:', err))
      .finally(() => setLoading(false));
  };

  const handleRowChange = (id: string, field: keyof PFMEARow, value: any) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === 'severity' || field === 'occurrence' || field === 'detection') {
          const s = field === 'severity' ? Number(value) : r.severity;
          const o = field === 'occurrence' ? Number(value) : r.occurrence;
          const d = field === 'detection' ? Number(value) : r.detection;
          updated.actionPriority = calculateActionPriority(s, o, d);
        }
        return updated;
      })
    );
  };

  const handleAddRow = () => {
    const newRow: PFMEARow = {
      id: `pf-${Date.now()}`,
      processStep: `OP ${rows.length * 10 + 10}: Operation Name`,
      processFunction: 'Specify process function and quality requirements',
      failureMode: 'Potential failure mode (how it can fail)',
      failureEffect: 'Impact on vehicle safety, OEM assembly, or customer',
      failureCause: 'Root cause in machine, tooling, or material',
      preventionControl: 'Preventive maintenance, error-proofing (Poka-Yoke)',
      detectionControl: 'In-line sensor, gage inspection, vision camera',
      severity: 7,
      occurrence: 3,
      detection: 3,
      actionPriority: calculateActionPriority(7, 3, 3),
      recommendedAction: 'Action to reduce occurrence or enhance detection',
      responsibility: currentUser.name,
      targetCompletionDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
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
      alert('PFMEA matrix successfully saved and logged to audit trail.');
    } catch (err: any) {
      alert(err.message || 'Failed to save PFMEA');
    } finally {
      setSaving(false);
    }
  };

  const highAPCount = rows.filter(r => r.actionPriority === 'High').length;
  const mediumAPCount = rows.filter(r => r.actionPriority === 'Medium').length;
  const lowAPCount = rows.filter(r => r.actionPriority === 'Low').length;

  const displayedRows = filterHighAP ? rows.filter(r => r.actionPriority === 'High') : rows;

  return (
    <div className="space-y-4">
      
      {/* Top Banner & AIAG-VDA Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Process FMEA (AIAG & VDA 1st Edition)
            </h2>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              Element #6
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates failure modes, mechanisms, and assigns Action Priority (AP: High / Medium / Low) for automotive production risk mitigation.
          </p>
        </div>

        {/* Action Priority Counter */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>High AP: {highAPCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
            Med AP: {mediumAPCount}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
            Low AP: {lowAPCount}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterHighAP(!filterHighAP)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              filterHighAP
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5 inline mr-1" />
            {filterHighAP ? 'Show All Rows' : 'Filter High AP Only'}
          </button>

          <button
            onClick={() => exportPFMEAToExcel(project, rows)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePreviewPDF}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
            title="พรีวิวเอกสาร PFMEA Matrix ในรูปแบบ PDF เต็มจอ"
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
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
        </div>
      </div>

      {/* PFMEA Interactive Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading PFMEA records...</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-slate-850 text-slate-300 border-b border-slate-800">
                <th className="p-2.5 font-semibold w-40">Process Step</th>
                <th className="p-2.5 font-semibold w-48">Function / Purpose</th>
                <th className="p-2.5 font-semibold w-44">Failure Mode</th>
                <th className="p-2.5 font-semibold w-48">Failure Effect</th>
                <th className="p-2.5 font-semibold w-48">Failure Cause</th>
                <th className="p-2.5 font-semibold w-44">Prevention Control</th>
                <th className="p-2.5 font-semibold w-44">Detection Control</th>
                <th className="p-2.5 font-semibold text-center w-12" title="Severity (1-10)">S</th>
                <th className="p-2.5 font-semibold text-center w-12" title="Occurrence (1-10)">O</th>
                <th className="p-2.5 font-semibold text-center w-12" title="Detection (1-10)">D</th>
                <th className="p-2.5 font-semibold text-center w-16" title="Action Priority">AP</th>
                <th className="p-2.5 font-semibold w-48">Recommended Action</th>
                <th className="p-2.5 font-semibold w-28">Resp / Target</th>
                <th className="p-2.5 font-semibold w-20">Status</th>
                {canEdit() && <th className="p-2.5 font-semibold w-10 text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-slate-500">
                    No PFMEA rows found. Click "Add Step" or use the AI Assistant to generate.
                  </td>
                </tr>
              ) : (
                displayedRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Step */}
                    <td className="p-2">
                      <input
                        type="text"
                        disabled={!canEdit()}
                        value={row.processStep}
                        onChange={e => handleRowChange(row.id, 'processStep', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* Function */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.processFunction}
                        onChange={e => handleRowChange(row.id, 'processFunction', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200 text-xs focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </td>

                    {/* Failure Mode */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.failureMode}
                        onChange={e => handleRowChange(row.id, 'failureMode', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-amber-200 text-xs focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </td>

                    {/* Effect */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.failureEffect}
                        onChange={e => handleRowChange(row.id, 'failureEffect', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-300 text-xs focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </td>

                    {/* Cause */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.failureCause}
                        onChange={e => handleRowChange(row.id, 'failureCause', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-300 text-xs focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </td>

                    {/* Prevention */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.preventionControl}
                        onChange={e => handleRowChange(row.id, 'preventionControl', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-300 text-xs focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </td>

                    {/* Detection */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.detectionControl}
                        onChange={e => handleRowChange(row.id, 'detectionControl', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-300 text-xs focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </td>

                    {/* S (Severity) */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        disabled={!canEdit()}
                        value={row.severity}
                        onChange={e => handleRowChange(row.id, 'severity', e.target.value)}
                        className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center font-bold text-slate-100"
                      />
                    </td>

                    {/* O (Occurrence) */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        disabled={!canEdit()}
                        value={row.occurrence}
                        onChange={e => handleRowChange(row.id, 'occurrence', e.target.value)}
                        className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center font-bold text-slate-100"
                      />
                    </td>

                    {/* D (Detection) */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        disabled={!canEdit()}
                        value={row.detection}
                        onChange={e => handleRowChange(row.id, 'detection', e.target.value)}
                        className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center font-bold text-slate-100"
                      />
                    </td>

                    {/* AP (Action Priority) */}
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase inline-block ${
                        row.actionPriority === 'High' ? 'bg-rose-500 text-white shadow-sm' :
                        row.actionPriority === 'Medium' ? 'bg-amber-500 text-slate-900 font-extrabold' :
                        'bg-emerald-600/40 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {row.actionPriority}
                      </span>
                    </td>

                    {/* Recommended Action */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.recommendedAction}
                        onChange={e => handleRowChange(row.id, 'recommendedAction', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200 text-xs focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </td>

                    {/* Resp / Date */}
                    <td className="p-2 space-y-1">
                      <input
                        type="text"
                        disabled={!canEdit()}
                        value={row.responsibility}
                        onChange={e => handleRowChange(row.id, 'responsibility', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
                        placeholder="Engineer"
                      />
                      <input
                        type="date"
                        disabled={!canEdit()}
                        value={row.targetCompletionDate}
                        onChange={e => handleRowChange(row.id, 'targetCompletionDate', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-400"
                      />
                    </td>

                    {/* Status */}
                    <td className="p-2">
                      <select
                        disabled={!canEdit()}
                        value={row.status}
                        onChange={e => handleRowChange(row.id, 'status', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1 py-1 text-xs text-slate-200"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    {/* Delete */}
                    {canEdit() && (
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom controls */}
      {canEdit() && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleAddRow}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Process Step</span>
          </button>

          <div className="text-xs text-slate-400">
            Total Failure Modes Analyzed: <strong className="text-white">{rows.length}</strong>
          </div>
        </div>
      )}

      {showPdfModal && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={`Process FMEA Matrix (AIAG & VDA 1st Edition) - Element #6`}
          subtitle={`${project.projectNumber} | ${project.partName} (${project.partNumber})`}
          pdfBlobUrl={pdfBlobUrl}
          fileName={`PFMEA_${project.partNumber}_${project.projectNumber}.pdf`}
        />
      )}

    </div>
  );
};
