import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Sparkles,
  Calculator,
  FileDown,
  FileText
} from 'lucide-react';
import { PPAPProject, DimensionalRow } from '../../types/ppap';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  exportDimensionalToExcel,
  exportDimensionalToPDF,
  importDimensionalFromExcel
} from '../../utils/exportUtils';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

interface DimensionalManagerProps {
  project: PPAPProject;
  onOpenAIGenerator: () => void;
}

export const DimensionalManager: React.FC<DimensionalManagerProps> = ({
  project,
  onOpenAIGenerator
}) => {
  const { currentUser, canEdit } = useAuth();
  const [rows, setRows] = useState<DimensionalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePreviewPDF = () => {
    const doc = exportDimensionalToPDF(project, rows);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setShowPdfModal(true);
  };

  useEffect(() => {
    loadDimensional();
  }, [project.id]);

  const loadDimensional = () => {
    setLoading(true);
    api.getDimensionalReport(project.id)
      .then(res => setRows(res))
      .catch(err => console.error('Error fetching Dimensional Report:', err))
      .finally(() => setLoading(false));
  };

  const calculateRowValues = (row: DimensionalRow): DimensionalRow => {
    const samples = row.samples && row.samples.length > 0 ? row.samples : [0];
    const mean = Number((samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(3));
    const min = Number(Math.min(...samples).toFixed(3));
    const max = Number(Math.max(...samples).toFixed(3));
    const pass = samples.every(v => v >= row.lowerLimit && v <= row.upperLimit);

    return {
      ...row,
      mean,
      min,
      max,
      result: pass ? 'PASS' : 'FAIL'
    };
  };

  const handleRowChange = (id: string, field: keyof DimensionalRow, value: any) => {
    setRows(rows.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      return calculateRowValues(updated);
    }));
  };

  const handleSampleChange = (id: string, sampleIndex: number, value: number) => {
    setRows(rows.map(r => {
      if (r.id !== id) return r;
      const samples = [...r.samples];
      samples[sampleIndex] = value;
      return calculateRowValues({ ...r, samples });
    }));
  };

  const handleAddRow = () => {
    const nextBalloon = rows.length + 1;
    const newRow: DimensionalRow = {
      id: `dim-${Date.now()}`,
      characteristicNumber: nextBalloon,
      drawingRequirement: `Dimension #${nextBalloon} per Drawing`,
      specification: '50.00 ± 0.20 mm',
      upperLimit: 50.20,
      lowerLimit: 49.80,
      samples: [50.02, 50.05, 49.98, 50.06, 50.01],
      mean: 50.024,
      min: 49.98,
      max: 50.06,
      measuringEquipment: 'Digital Caliper / CMM',
      inspector: currentUser.name,
      inspectionDate: new Date().toISOString().split('T')[0],
      result: 'PASS'
    };
    setRows([...rows, calculateRowValues(newRow)]);
  };

  const handleDeleteRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await api.saveDimensionalReport(project.id, rows, currentUser.name);
      setRows(saved);
      alert('Dimensional Inspection Report saved and verified.');
    } catch (err: any) {
      alert(err.message || 'Failed to save dimensional report');
    } finally {
      setSaving(false);
    }
  };

  // Excel Import handler
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importDimensionalFromExcel(file);
      if (imported.length === 0) {
        alert('No valid dimensional rows found in uploaded file.');
        return;
      }
      setRows(imported);
      alert(`Successfully imported ${imported.length} balloon inspection dimensions from Excel.`);
    } catch (err: any) {
      alert(err.message || 'Error parsing Excel file');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportPDF = () => {
    const doc = exportDimensionalToPDF(project, rows);
    doc.save(`Dimensional_${project.partNumber}_${project.projectNumber}.pdf`);
  };

  const totalPoints = rows.length;
  const passCount = rows.filter(r => r.result === 'PASS').length;
  const failCount = rows.filter(r => r.result === 'FAIL').length;
  const conformanceRate = totalPoints > 0 ? Math.round((passCount / totalPoints) * 100) : 100;

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Dimensional Inspection Report (Element #9)
            </h2>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              AIAG PPAP 4th Ed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Logs physical verification results across trial production samples (1 to 5) with automated tolerance calculations and PASS/FAIL verdict.
          </p>
        </div>

        {/* Statistics Badge */}
        <div className="flex items-center space-x-2 text-xs">
          <div className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 ${
            failCount > 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {failCount > 0 ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            <span>Rate: {conformanceRate}% ({passCount}/{totalPoints} Passed)</span>
          </div>
          {failCount > 0 && (
            <div className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              {failCount} Out of Spec
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelImport}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          {canEdit() && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center space-x-1.5"
              title="Import dimensions from Excel (.xlsx)"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import Excel</span>
            </button>
          )}

          <button
            onClick={() => exportDimensionalToExcel(project, rows)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePreviewPDF}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
            title="พรีวิวรายงาน Dimensional Report ในรูปแบบ PDF เต็มจอ"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>พรีวิว PDF (Preview PDF)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Download PDF</span>
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
              <span>{saving ? 'Saving...' : 'Save Report'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading Dimensional data...</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-slate-850 text-slate-300 border-b border-slate-800">
                <th className="p-2.5 font-semibold text-center w-14">Balloon #</th>
                <th className="p-2.5 font-semibold w-56">Drawing Requirement / Characteristic</th>
                <th className="p-2.5 font-semibold w-36">Specification</th>
                <th className="p-2.5 font-semibold text-center w-20">Upper Limit</th>
                <th className="p-2.5 font-semibold text-center w-20">Lower Limit</th>
                <th className="p-2.5 font-semibold text-center w-16">Sample 1</th>
                <th className="p-2.5 font-semibold text-center w-16">Sample 2</th>
                <th className="p-2.5 font-semibold text-center w-16">Sample 3</th>
                <th className="p-2.5 font-semibold text-center w-16">Sample 4</th>
                <th className="p-2.5 font-semibold text-center w-16">Sample 5</th>
                <th className="p-2.5 font-semibold text-center w-16 bg-slate-800/60 text-slate-200">Mean</th>
                <th className="p-2.5 font-semibold text-center w-24">Min / Max</th>
                <th className="p-2.5 font-semibold w-40">Measuring Equipment</th>
                <th className="p-2.5 font-semibold text-center w-20">Result</th>
                {canEdit() && <th className="p-2.5 font-semibold w-10 text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-slate-500">
                    No dimensional records yet. Click "Add Characteristic", "Import Excel", or use AI Assistant.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Balloon Number */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        disabled={!canEdit()}
                        value={row.characteristicNumber}
                        onChange={e => handleRowChange(row.id, 'characteristicNumber', Number(e.target.value))}
                        className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center font-bold text-blue-400"
                      />
                    </td>

                    {/* Requirement */}
                    <td className="p-2">
                      <input
                        type="text"
                        disabled={!canEdit()}
                        value={row.drawingRequirement}
                        onChange={e => handleRowChange(row.id, 'drawingRequirement', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200"
                      />
                    </td>

                    {/* Specification */}
                    <td className="p-2">
                      <input
                        type="text"
                        disabled={!canEdit()}
                        value={row.specification}
                        onChange={e => handleRowChange(row.id, 'specification', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded px-2 py-1 text-slate-200"
                      />
                    </td>

                    {/* Upper */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        step="0.001"
                        disabled={!canEdit()}
                        value={row.upperLimit}
                        onChange={e => handleRowChange(row.id, 'upperLimit', Number(e.target.value))}
                        className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center font-mono text-slate-200"
                      />
                    </td>

                    {/* Lower */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        step="0.001"
                        disabled={!canEdit()}
                        value={row.lowerLimit}
                        onChange={e => handleRowChange(row.id, 'lowerLimit', Number(e.target.value))}
                        className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center font-mono text-slate-200"
                      />
                    </td>

                    {/* Sample 1 to 5 */}
                    {[0, 1, 2, 3, 4].map(sIdx => {
                      const val = row.samples[sIdx];
                      const isOutOfSpec = val !== undefined && (val < row.lowerLimit || val > row.upperLimit);

                      return (
                        <td key={sIdx} className="p-2 text-center">
                          <input
                            type="number"
                            step="0.001"
                            disabled={!canEdit()}
                            value={val ?? ''}
                            onChange={e => handleSampleChange(row.id, sIdx, Number(e.target.value))}
                            className={`w-14 border rounded px-1 py-1 text-center font-mono text-xs ${
                              isOutOfSpec
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                                : 'bg-slate-800 border-slate-700 text-slate-100'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Mean */}
                    <td className="p-2 text-center font-mono font-semibold bg-slate-850/50 text-slate-200">
                      {row.mean}
                    </td>

                    {/* Min/Max */}
                    <td className="p-2 text-center font-mono text-[11px] text-slate-400">
                      {row.min} / {row.max}
                    </td>

                    {/* Equipment */}
                    <td className="p-2">
                      <input
                        type="text"
                        disabled={!canEdit()}
                        value={row.measuringEquipment}
                        onChange={e => handleRowChange(row.id, 'measuringEquipment', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200"
                      />
                    </td>

                    {/* Result */}
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        row.result === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {row.result}
                      </span>
                    </td>

                    {/* Delete */}
                    {canEdit() && (
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete Characteristic"
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
            <span>Add Characteristic Balloon</span>
          </button>

          <div className="text-xs text-slate-400">
            Total Inspection Characteristics: <strong className="text-white">{rows.length}</strong>
          </div>
        </div>
      )}

      {showPdfModal && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={`Dimensional Inspection Report (Balloon Verification) - Element #9`}
          subtitle={`${project.projectNumber} | ${project.partName} (${project.partNumber})`}
          pdfBlobUrl={pdfBlobUrl}
          fileName={`Dimensional_${project.partNumber}_${project.projectNumber}.pdf`}
        />
      )}

    </div>
  );
};
