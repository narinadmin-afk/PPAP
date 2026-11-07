import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Download,
  Sparkles,
  Link2,
  ShieldAlert,
  Layers,
  ArrowRight,
  FileText
} from 'lucide-react';
import { PPAPProject, ControlPlanRow, SpecialCharacteristic } from '../../types/ppap';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportControlPlanToExcel, exportControlPlanToPDF } from '../../utils/exportUtils';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

interface ControlPlanManagerProps {
  project: PPAPProject;
  onOpenAIGenerator: () => void;
}

export const ControlPlanManager: React.FC<ControlPlanManagerProps> = ({
  project,
  onOpenAIGenerator
}) => {
  const { currentUser, canEdit } = useAuth();
  const [rows, setRows] = useState<ControlPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const handlePreviewPDF = () => {
    const doc = exportControlPlanToPDF(project, rows);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setShowPdfModal(true);
  };

  useEffect(() => {
    loadControlPlan();
  }, [project.id]);

  const loadControlPlan = () => {
    setLoading(true);
    api.getControlPlan(project.id)
      .then(res => setRows(res))
      .catch(err => console.error('Error fetching Control Plan:', err))
      .finally(() => setLoading(false));
  };

  const handleRowChange = (id: string, field: keyof ControlPlanRow, value: any) => {
    setRows(rows.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleAddRow = () => {
    const nextNo = (rows.length + 1) * 10;
    const newRow: ControlPlanRow = {
      id: `cp-${Date.now()}`,
      processNumber: String(nextNo),
      processName: 'Manufacturing Process Operation',
      machineEquipment: 'Automated Tooling / Line',
      productCharacteristic: 'Part dimension or functional attribute',
      processCharacteristic: 'Process parameter (pressure/temp/speed)',
      specialCharacteristic: 'None',
      specificationTolerance: 'Nominal ± Tolerance',
      measurementTechnique: 'Calibrated Gage / Dial Indicator',
      sampleSize: '5 pcs',
      frequency: 'Every 2 hours',
      controlMethod: 'X-bar / R Control Chart',
      reactionPlan: 'Quarantine suspect parts, adjust machine, notify QA'
    };
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await api.saveControlPlan(project.id, rows, currentUser.name);
      setRows(saved);
      alert('Control Plan saved successfully and logged to audit trail.');
    } catch (err: any) {
      alert(err.message || 'Failed to save Control Plan');
    } finally {
      setSaving(false);
    }
  };

  // Section 8 Requirement: Automatically link data from Process Flow & PFMEA
  const handleSyncFromFlowAndPFMEA = async () => {
    setSyncing(true);
    try {
      const [flowSteps, pfmeaRows] = await Promise.all([
        api.getProcessFlow(project.id),
        api.getPFMEA(project.id)
      ]);

      if (flowSteps.length === 0 && pfmeaRows.length === 0) {
        alert('No Process Flow or PFMEA records found to sync. Create or generate them first.');
        return;
      }

      const mergedRows: ControlPlanRow[] = [];

      flowSteps.forEach((step, idx) => {
        // Find matching PFMEA failure modes
        const matchingPFMEA = pfmeaRows.filter(p => p.processStep.includes(step.stepNumber));

        if (matchingPFMEA.length > 0) {
          matchingPFMEA.forEach(pf => {
            mergedRows.push({
              id: `cp-sync-${step.stepNumber}-${Math.random().toString(36).substring(2, 6)}`,
              processNumber: step.stepNumber,
              processName: step.stepName,
              machineEquipment: step.machine,
              productCharacteristic: pf.processFunction,
              processCharacteristic: step.keyParameters,
              specialCharacteristic: pf.actionPriority === 'High' ? 'Critical' : pf.actionPriority === 'Medium' ? 'Major' : 'Minor',
              specificationTolerance: 'Per Drawing & Engineering Spec',
              measurementTechnique: pf.detectionControl || step.inspectionMethod || 'Calibrated Gage',
              sampleSize: '5 pcs',
              frequency: 'Every 2 hours & 1st piece',
              controlMethod: pf.preventionControl || 'SPC Control Chart',
              reactionPlan: `Contain lot, 100% sort, execute action: ${pf.recommendedAction || 'Notify Quality Engineer'}`
            });
          });
        } else {
          mergedRows.push({
            id: `cp-sync-${step.stepNumber}-${idx}`,
            processNumber: step.stepNumber,
            processName: step.stepName,
            machineEquipment: step.machine,
            productCharacteristic: 'Part integrity and visual conformance',
            processCharacteristic: step.keyParameters,
            specialCharacteristic: 'None',
            specificationTolerance: 'Standard Drawing Tolerances',
            measurementTechnique: step.inspectionMethod || 'Check Fixture / Visual',
            sampleSize: '5 pcs',
            frequency: 'Every 2 hours',
            controlMethod: 'Daily Inspection Sheet',
            reactionPlan: 'Stop line, contain parts produced since last inspection, adjust setup'
          });
        }
      });

      setRows(mergedRows);
      alert(`Synchronized ${mergedRows.length} control plan lines from Process Flow and PFMEA.`);
    } catch (err: any) {
      alert(err.message || 'Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  const criticalCount = rows.filter(r => r.specialCharacteristic === 'Critical').length;
  const majorCount = rows.filter(r => r.specialCharacteristic === 'Major').length;

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Production Control Plan (CP)
            </h2>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              Element #7
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Defines special characteristics, inspection frequencies, sample sizes, measurement techniques, and containment reaction plans.
          </p>
        </div>

        {/* Counter of special characteristics */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical Char (▽): {criticalCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
            Major Char (◇): {majorCount}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {canEdit() && (
            <button
              onClick={handleSyncFromFlowAndPFMEA}
              disabled={syncing}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition flex items-center space-x-1.5"
              title="Automatically populate rows from Process Flow and PFMEA"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{syncing ? 'Syncing...' : 'Auto-Sync Flow & PFMEA'}</span>
            </button>
          )}

          <button
            onClick={() => exportControlPlanToExcel(project, rows)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePreviewPDF}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
            title="พรีวิวเอกสาร Control Plan ในรูปแบบ PDF เต็มจอ"
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
              <span>{saving ? 'Saving...' : 'Save Plan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Plan Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading Control Plan...</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-850 text-slate-300 border-b border-slate-800">
                <th className="p-2.5 font-semibold w-16">No</th>
                <th className="p-2.5 font-semibold w-40">Process Name</th>
                <th className="p-2.5 font-semibold w-36">Machine / Equipment</th>
                <th className="p-2.5 font-semibold w-44">Product Characteristic</th>
                <th className="p-2.5 font-semibold w-40">Process Characteristic</th>
                <th className="p-2.5 font-semibold w-24">Special Char</th>
                <th className="p-2.5 font-semibold w-40">Spec / Tolerance</th>
                <th className="p-2.5 font-semibold w-36">Measurement Technique</th>
                <th className="p-2.5 font-semibold w-20">Sample</th>
                <th className="p-2.5 font-semibold w-24">Freq</th>
                <th className="p-2.5 font-semibold w-36">Control Method</th>
                <th className="p-2.5 font-semibold w-48">Reaction Plan</th>
                {canEdit() && <th className="p-2.5 font-semibold w-10 text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-500">
                    No control plan rows. Click "Auto-Sync Flow & PFMEA", "Add Row", or use AI Assistant.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Process No */}
                    <td className="p-2">
                      <input
                        type="text"
                        disabled={!canEdit()}
                        value={row.processNumber}
                        onChange={e => handleRowChange(row.id, 'processNumber', e.target.value)}
                        className="w-12 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-center font-mono text-slate-200"
                      />
                    </td>

                    {/* Process Name */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.processName}
                        onChange={e => handleRowChange(row.id, 'processName', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200 resize-none"
                      />
                    </td>

                    {/* Machine */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.machineEquipment}
                        onChange={e => handleRowChange(row.id, 'machineEquipment', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200 resize-none"
                      />
                    </td>

                    {/* Product Char */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.productCharacteristic}
                        onChange={e => handleRowChange(row.id, 'productCharacteristic', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200 resize-none"
                      />
                    </td>

                    {/* Process Char */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.processCharacteristic}
                        onChange={e => handleRowChange(row.id, 'processCharacteristic', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-300 resize-none"
                      />
                    </td>

                    {/* Special Char */}
                    <td className="p-2">
                      <select
                        disabled={!canEdit()}
                        value={row.specialCharacteristic}
                        onChange={e => handleRowChange(row.id, 'specialCharacteristic', e.target.value as SpecialCharacteristic)}
                        className={`w-full border rounded px-1.5 py-1 text-xs font-bold ${
                          row.specialCharacteristic === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          row.specialCharacteristic === 'Major' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          row.specialCharacteristic === 'Minor' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="None">None</option>
                        <option value="Critical">Critical (▽)</option>
                        <option value="Major">Major (◇)</option>
                        <option value="Minor">Minor</option>
                      </select>
                    </td>

                    {/* Spec / Tolerance */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.specificationTolerance}
                        onChange={e => handleRowChange(row.id, 'specificationTolerance', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200 resize-none"
                      />
                    </td>

                    {/* Measurement Tech */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.measurementTechnique}
                        onChange={e => handleRowChange(row.id, 'measurementTechnique', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200 resize-none"
                      />
                    </td>

                    {/* Sample Size */}
                    <td className="p-2">
                      <input
                        type="text"
                        disabled={!canEdit()}
                        value={row.sampleSize}
                        onChange={e => handleRowChange(row.id, 'sampleSize', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-center text-slate-200"
                      />
                    </td>

                    {/* Frequency */}
                    <td className="p-2">
                      <input
                        type="text"
                        disabled={!canEdit()}
                        value={row.frequency}
                        onChange={e => handleRowChange(row.id, 'frequency', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-center text-slate-200"
                      />
                    </td>

                    {/* Control Method */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.controlMethod}
                        onChange={e => handleRowChange(row.id, 'controlMethod', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200 resize-none"
                      />
                    </td>

                    {/* Reaction Plan */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        disabled={!canEdit()}
                        value={row.reactionPlan}
                        onChange={e => handleRowChange(row.id, 'reactionPlan', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-amber-300 resize-none"
                      />
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

      {canEdit() && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleAddRow}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Control Plan Row</span>
          </button>

          <div className="text-xs text-slate-400">
            Total Characteristic Controls: <strong className="text-white">{rows.length}</strong>
          </div>
        </div>
      )}

      {showPdfModal && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={`Automotive Control Plan (Production) - Element #7`}
          subtitle={`${project.projectNumber} | ${project.partName} (${project.partNumber})`}
          pdfBlobUrl={pdfBlobUrl}
          fileName={`ControlPlan_${project.partNumber}_${project.projectNumber}.pdf`}
        />
      )}

    </div>
  );
};
