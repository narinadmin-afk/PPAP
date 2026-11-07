import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  ChevronDown,
  Info,
  ArrowLeft,
  ExternalLink,
  FileText
} from 'lucide-react';
import { PPAPProject, ElementStatus } from '../../types/ppap';
import {
  ELEMENT_TABLE_DEFINITIONS,
  getDefaultRowsForElement,
  ElementTableColumn
} from '../../data/standardElementTemplates';
import { PPAP_18_ELEMENTS_DEFINITION } from '../../data/ppapElementsTemplate';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportElementTableToExcel, exportElementTableToPDF } from '../../utils/exportUtils';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

interface StandardElementTableEditorProps {
  project: PPAPProject;
  elementId: number;
  onClose?: () => void;
  onElementUpdated?: (updatedProject: PPAPProject) => void;
  onOpenAIGenerator?: () => void;
  onJumpToSpecializedTab?: (tabId: string) => void;
}

export const StandardElementTableEditor: React.FC<StandardElementTableEditorProps> = ({
  project,
  elementId,
  onClose,
  onElementUpdated,
  onOpenAIGenerator,
  onJumpToSpecializedTab
}) => {
  const { currentUser, canEdit } = useAuth();
  const [currentElementId, setCurrentElementId] = useState<number>(elementId);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // PDF Preview State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('document.pdf');

  // Modal state for adding/editing a row
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Element definition & config
  const elementDef = ELEMENT_TABLE_DEFINITIONS[currentElementId];
  const generalElement = project.elements.find(e => e.id === currentElementId);
  const elementMeta = PPAP_18_ELEMENTS_DEFINITION.find(e => e.id === currentElementId);

  // Check if element has a specialized dedicated visual tab
  const specializedTabs: Record<number, string> = {
    5: 'flow',
    6: 'pfmea',
    7: 'controlplan',
    9: 'dimensional',
    18: 'psw'
  };
  const specializedTab = specializedTabs[currentElementId];

  useEffect(() => {
    loadTableData(currentElementId);
  }, [currentElementId, project.id]);

  const loadTableData = async (elId: number) => {
    setLoading(true);
    try {
      const data = await api.getElementTable(project.id, elId);
      if (Array.isArray(data) && data.length > 0) {
        setRows(data);
      } else {
        const defaults = getDefaultRowsForElement(elId, project);
        setRows(defaults);
      }
    } catch (err) {
      console.warn('Could not fetch element table, generating defaults:', err);
      const defaults = getDefaultRowsForElement(elId, project);
      setRows(defaults);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (customRows?: any[]) => {
    setSaving(true);
    const dataToSave = customRows || rows;
    try {
      await api.saveElementTable(project.id, currentElementId, dataToSave, currentUser.name);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);

      // Refresh project to update audit logs and status
      const updatedProject = await api.getProjectById(project.id);
      if (onElementUpdated) {
        onElementUpdated(updatedProject);
      }
    } catch (err: any) {
      alert(`Error saving document table: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: ElementStatus) => {
    try {
      await api.updateElement(
        project.id,
        currentElementId,
        { status: newStatus },
        currentUser.name,
        currentUser.role
      );
      const updatedProject = await api.getProjectById(project.id);
      if (onElementUpdated) {
        onElementUpdated(updatedProject);
      }
    } catch (err: any) {
      alert(`Error updating element status: ${err.message}`);
    }
  };

  const handleResetToStandard = () => {
    if (confirm('Are you sure you want to reset this table to AIAG standard seed template? Unsaved changes will be replaced.')) {
      const defaults = getDefaultRowsForElement(currentElementId, project);
      setRows(defaults);
      handleSave(defaults);
    }
  };

  const handleOpenAddModal = () => {
    const initial: Record<string, any> = {
      id: `row-${Date.now()}`
    };
    if (elementDef) {
      elementDef.columns.forEach(col => {
        if (col.type === 'number') initial[col.key] = 0;
        else if (col.type === 'select' && col.options) initial[col.key] = col.options[0];
        else initial[col.key] = '';
      });
    }
    setFormData(initial);
    setEditingRow(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (row: any) => {
    setFormData({ ...row });
    setEditingRow(row);
    setIsModalOpen(true);
  };

  const handleDeleteRow = (id: string) => {
    if (confirm('Delete this row from the document table?')) {
      const filtered = rows.filter(r => r.id !== id);
      setRows(filtered);
      handleSave(filtered);
    }
  };

  const handleSaveModal = () => {
    let nextRows: any[];
    if (editingRow) {
      nextRows = rows.map(r => (r.id === editingRow.id ? { ...formData } : r));
    } else {
      nextRows = [...rows, { ...formData, id: formData.id || `row-${Date.now()}` }];
    }
    setRows(nextRows);
    setIsModalOpen(false);
    handleSave(nextRows);
  };

  const handleExportExcel = () => {
    if (!elementDef) return;
    exportElementTableToExcel(
      project,
      currentElementId,
      elementDef.nameEn,
      elementDef.columns.map(c => ({ key: c.key, label: c.label })),
      rows
    );
  };

  const handlePreviewPDF = () => {
    if (!elementDef) return;
    const doc = exportElementTableToPDF(
      project,
      currentElementId,
      elementDef.nameEn,
      elementDef.columns.map(c => ({ key: c.key, label: c.label })),
      rows
    );
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    const cleanName = elementDef.nameEn.replace(/[^a-zA-Z0-9]/g, '_');
    setPdfFileName(`${project.projectNumber}_Element_${currentElementId}_${cleanName}.pdf`);
    setShowPdfModal(true);
  };

  // Helper render for badge values (e.g. PASS/FAIL, Status, AP)
  const renderBadgeValue = (val: any) => {
    if (val === 'PASS' || val === 'Approved' || val === 'Active & Compliant' || val === 'Fully Approved' || val === 'Acceptable (%GRR < 10%)' || val === 'Capable (Cpk ≥ 1.67)' || val === 'Compliant & Customer Accepted' || val === 'Approved & Cut-in') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
          {val}
        </span>
      );
    }
    if (val === 'FAIL' || val === 'Rejected' || val === 'Unacceptable (> 30%)' || val === 'Not Capable (Cpk < 1.33)') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 whitespace-nowrap">
          {val}
        </span>
      );
    }
    if (val === 'High' || val === 'Critical') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 whitespace-nowrap">
          {val}
        </span>
      );
    }
    if (val === 'Medium' || val === 'Marginal (10% - 30%)' || val === 'Marginal (1.33 ≤ Cpk < 1.67)' || val === 'In Review' || val === 'Pending Review' || val === 'Conditional Match' || val === 'Conditional Pass') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap">
          {val}
        </span>
      );
    }
    if (val === 'Low') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
          {val}
        </span>
      );
    }
    return <span className="text-slate-300">{val || '-'}</span>;
  };

  const columns = elementDef ? elementDef.columns : [];

  return (
    <div className="space-y-4 text-slate-100">
      
      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Document Table Saved & Audit Logged Successfully!</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        
        {/* Navigation & Element Switcher Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Back to Overview"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                  Element #{currentElementId}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Level {project.submissionLevel}: {generalElement?.requiredForLevel[project.submissionLevel] === 'S' ? 'Submit (S)' : generalElement?.requiredForLevel[project.submissionLevel] === 'R' ? 'Retain (R)' : 'Applicable'}
                </span>
                
                {/* Status Switcher Dropdown */}
                <select
                  value={generalElement?.status || 'Not Started'}
                  onChange={(e) => handleStatusChange(e.target.value as ElementStatus)}
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border cursor-pointer outline-none ${
                    generalElement?.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    generalElement?.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    generalElement?.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    generalElement?.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <option value="Not Started" className="bg-slate-800 text-slate-300">Not Started</option>
                  <option value="In Progress" className="bg-slate-800 text-blue-400">In Progress</option>
                  <option value="Pending Review" className="bg-slate-800 text-amber-400">Pending Review</option>
                  <option value="Approved" className="bg-slate-800 text-emerald-400">Approved</option>
                  <option value="Rejected" className="bg-slate-800 text-rose-400">Rejected</option>
                  <option value="Not Applicable" className="bg-slate-800 text-slate-500">Not Applicable</option>
                </select>
              </div>

              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                {elementDef?.nameTh || generalElement?.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Standard: {elementDef?.standardRef || 'AIAG PPAP 4th Edition'}
              </p>
            </div>
          </div>

          {/* Element Quick Switcher */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">เลือก Element:</span>
            <select
              value={currentElementId}
              onChange={(e) => setCurrentElementId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {project.elements.map(el => (
                <option key={el.id} value={el.id}>
                  {el.id}. {el.name} [{el.status}]
                </option>
              ))}
            </select>

            {specializedTab && onJumpToSpecializedTab && (
              <button
                onClick={() => onJumpToSpecializedTab(specializedTab)}
                className="px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold flex items-center space-x-1.5 transition whitespace-nowrap"
                title="Open Dedicated Graphical Editor Tab"
              >
                <span>Specialized Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Audit Advice Guidance Alert */}
        {elementDef?.auditTipsTh && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-xs flex items-start space-x-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-200">ข้อกำหนดการตรวจประเมิน IATF 16949 / AIAG:</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {elementDef.auditTipsTh}
              </p>
            </div>
          </div>
        )}

        {/* Action Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>ตารางข้อมูล:</span>
            <strong className="text-white font-mono">{rows.length} แถว</strong>
            <span>•</span>
            <span>บันทึกล่าสุด: <strong className="text-slate-300">{generalElement?.updatedAt ? new Date(generalElement.updatedAt).toLocaleDateString() : 'Today'}</strong></span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {canEdit() && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มแถว (Add Row)</span>
              </button>
            )}

            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกเอกสาร (Save)'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
              title="Download Excel Sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handlePreviewPDF}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition shadow-sm"
              title="พรีวิวเอกสาร PDF เต็มรูปแบบ (Full In-App PDF Preview)"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>พรีวิว PDF (Preview PDF)</span>
            </button>

            {canEdit() && (
              <button
                onClick={handleResetToStandard}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs transition"
                title="Reset to AIAG Standard Seed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตตามมาตรฐาน</span>
              </button>
            )}

            {onOpenAIGenerator && (
              <button
                onClick={onOpenAIGenerator}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-medium shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Assist</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading standard element table...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium text-sm">ยังไม่มีข้อมูลในตารางสำหรับ Element #{currentElementId}</p>
            <p className="text-slate-500 max-w-md mx-auto">
              คุณสามารถกดปุ่ม "เพิ่มแถว (Add Row)" เพื่อกรอกข้อมูลด้วยตนเอง หรือกด "รีเซ็ตตามมาตรฐาน" เพื่อโหลดข้อมูลตั้งต้นอัตโนมัติ
            </p>
            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow"
              >
                + เพิ่มแถวแรก
              </button>
              <button
                onClick={handleResetToStandard}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
              >
                โหลดข้อมูลมาตรฐาน AIAG
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-850 text-slate-300 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                  <th className="p-3 text-center w-12 font-semibold text-slate-400">#</th>
                  {columns.map(col => (
                    <th key={col.key} className={`p-3 font-semibold ${col.width || 'w-44'}`}>
                      <div>{col.label}</div>
                      <div className="text-[10px] text-slate-500 normal-case font-normal">{col.labelTh}</div>
                    </th>
                  ))}
                  <th className="p-3 text-center w-24 font-semibold text-slate-400">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/50 transition group">
                    <td className="p-3 text-center font-mono text-slate-500 text-xs">
                      {idx + 1}
                    </td>

                    {columns.map(col => {
                      const val = row[col.key];
                      return (
                        <td key={col.key} className="p-3 text-slate-200">
                          {col.isBadge ? (
                            renderBadgeValue(val)
                          ) : (
                            <span className="line-clamp-2" title={String(val || '')}>
                              {val !== undefined && val !== null && val !== '' ? String(val) : '-'}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Actions Column */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {canEdit() && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(row)}
                              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition"
                              title="แก้ไขข้อมูลแถวนี้ (Edit Row)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(row.id)}
                              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
                              title="ลบแถวนี้ (Delete Row)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-xs text-slate-200 animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {editingRow ? 'แก้ไขข้อมูลในตาราง' : 'เพิ่มรายการใหม่ในตาราง (Add New Row)'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Element #{currentElementId}: {elementDef?.nameEn}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {columns.map(col => (
                <div key={col.key} className={col.type === 'textarea' ? 'sm:col-span-2 space-y-1' : 'space-y-1'}>
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    {col.label} <span className="text-slate-500 font-normal">({col.labelTh})</span>
                  </label>

                  {col.type === 'select' && col.options ? (
                    <select
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {col.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : col.type === 'number' ? (
                    <input
                      type="number"
                      step="any"
                      value={formData[col.key] ?? 0}
                      onChange={(e) => setFormData({ ...formData, [col.key]: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  ) : col.type === 'date' ? (
                    <input
                      type="date"
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : col.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก (Cancel)
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                บันทึกรายการ (Save Row)
              </button>
            </div>

          </div>
        </div>
      )}

      {showPdfModal && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={`พรีวิวเอกสาร PPAP Element #${currentElementId} - ${elementDef?.nameTh || ''}`}
          subtitle={`${project.projectNumber} | ${project.partName} (${project.partNumber})`}
          pdfBlobUrl={pdfBlobUrl}
          fileName={pdfFileName}
        />
      )}

    </div>
  );
};
