import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Download,
  ArrowDown,
  Circle,
  Square,
  Truck,
  Archive,
  Clock,
  Sparkles,
  MoveUp,
  MoveDown,
  Layers,
  CheckCircle2,
  FileDown,
  FileText
} from 'lucide-react';
import { PPAPProject, ProcessFlowStep, ProcessNodeType } from '../../types/ppap';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportProcessFlowToPDF } from '../../utils/exportUtils';
import { PDFPreviewModal } from '../common/PDFPreviewModal';

interface ProcessFlowEditorProps {
  project: PPAPProject;
  onOpenAIGenerator: () => void;
  onSyncToControlPlan?: () => void;
}

export const ProcessFlowEditor: React.FC<ProcessFlowEditorProps> = ({
  project,
  onOpenAIGenerator,
  onSyncToControlPlan
}) => {
  const { currentUser, canEdit } = useAuth();
  const [steps, setSteps] = useState<ProcessFlowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const handlePreviewPDF = () => {
    const doc = exportProcessFlowToPDF(project, steps);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setShowPdfModal(true);
  };

  useEffect(() => {
    loadFlow();
  }, [project.id]);

  const loadFlow = () => {
    setLoading(true);
    api.getProcessFlow(project.id)
      .then(res => {
        setSteps(res);
        if (res.length > 0) setSelectedStepId(res[0].id);
      })
      .catch(err => console.error('Error fetching process flow:', err))
      .finally(() => setLoading(false));
  };

  const handleAddStep = (type: ProcessNodeType = 'operation') => {
    const nextNum = (steps.length + 1) * 10;
    const typeDefaults: Record<ProcessNodeType, { name: string; machine: string }> = {
      operation: { name: 'Machining / Stamping / Forming', machine: 'Automated Press or CNC Station' },
      inspection: { name: 'Quality Inspection & Verification', machine: 'Check Fixture / CMM Station' },
      transport: { name: 'Part Transportation / Conveyor Transfer', machine: 'Automated Overhead Conveyor' },
      storage: { name: 'Intermediate WIP Staging / Buffer', machine: 'WIP Storage Rack' },
      delay: { name: 'Thermal Cooling / Curing Delay', machine: 'Cooling Buffer Tunnel' }
    };

    const newStep: ProcessFlowStep = {
      id: `st-${Date.now()}`,
      stepNumber: String(nextNum),
      stepName: typeDefaults[type].name,
      type,
      machine: typeDefaults[type].machine,
      description: 'Define manufacturing parameter control and operator instructions',
      keyParameters: 'Parameters: Speed, pressure, temperature, torque',
      inspectionMethod: 'Visual & Dimensional Go/No-go check',
      x: 100,
      y: steps.length * 120 + 50
    };

    const updated = [...steps, newStep];
    setSteps(updated);
    setSelectedStepId(newStep.id);
  };

  const handleUpdateStep = (id: string, updates: Partial<ProcessFlowStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteStep = (id: string) => {
    const remaining = steps.filter(s => s.id !== id);
    setSteps(remaining);
    if (selectedStepId === id) {
      setSelectedStepId(remaining[0]?.id || null);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    const reordered = [...steps];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    // renumber steps 10, 20, 30...
    const renumbered = reordered.map((s, idx) => ({
      ...s,
      stepNumber: String((idx + 1) * 10)
    }));
    setSteps(renumbered);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await api.saveProcessFlow(project.id, steps, currentUser.name);
      setSteps(saved);
      alert('Process Flow Diagram saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save flow');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const doc = exportProcessFlowToPDF(project, steps);
    doc.save(`ProcessFlow_${project.partNumber}_${project.projectNumber}.pdf`);
  };

  const getTypeIcon = (type: ProcessNodeType) => {
    switch (type) {
      case 'operation':
        return <Circle className="w-5 h-5 text-blue-400 fill-blue-500/20" />;
      case 'inspection':
        return <Square className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />;
      case 'transport':
        return <Truck className="w-5 h-5 text-amber-400" />;
      case 'storage':
        return <Archive className="w-5 h-5 text-purple-400" />;
      case 'delay':
        return <Clock className="w-5 h-5 text-rose-400" />;
    }
  };

  const getTypeLabel = (type: ProcessNodeType) => {
    switch (type) {
      case 'operation': return 'Operation (Circle)';
      case 'inspection': return 'Inspection (Square)';
      case 'transport': return 'Transport (Arrow)';
      case 'storage': return 'Storage (Triangle)';
      case 'delay': return 'Delay (D-Shape)';
    }
  };

  const selectedStep = steps.find(s => s.id === selectedStepId);

  return (
    <div className="space-y-4">
      
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Process Flow Diagram (PFD)
            </h2>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              Element #5
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Depicts the sequential manufacturing operations, inspections, transports, and intermediate buffers from receiving to shipping.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviewPDF}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition flex items-center space-x-1.5 shadow-sm"
            title="พรีวิวผังกระบวนการผลิต Process Flow Diagram ในรูปแบบ PDF เต็มจอ"
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
              <span>{saving ? 'Saving...' : 'Save Flow'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Symbol Toolbar (Section 7) */}
      {canEdit() && (
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 text-[11px] uppercase mr-1">
            + Add Step Type:
          </span>
          <button
            onClick={() => handleAddStep('operation')}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center space-x-1.5 transition"
          >
            <Circle className="w-3.5 h-3.5" />
            <span>Operation (○)</span>
          </button>
          <button
            onClick={() => handleAddStep('inspection')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 transition"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Inspection (□)</span>
          </button>
          <button
            onClick={() => handleAddStep('transport')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 flex items-center space-x-1.5 transition"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Transport (→)</span>
          </button>
          <button
            onClick={() => handleAddStep('storage')}
            className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center space-x-1.5 transition"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Storage (▽)</span>
          </button>
          <button
            onClick={() => handleAddStep('delay')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center space-x-1.5 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Delay (D)</span>
          </button>
        </div>
      )}

      {/* Main Flow Canvas & Step Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Flow Canvas List (2 Cols) */}
        <div ref={canvasRef} className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 max-h-[700px] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading flow diagram...</div>
          ) : steps.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-600" />
              <p>No process steps defined yet.</p>
              <p className="text-xs">Click any step type above or generate with AI Assistant.</p>
            </div>
          ) : (
            steps.map((step, idx) => {
              const isSelected = step.id === selectedStepId;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="relative">
                  <div
                    onClick={() => setSelectedStepId(step.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-4 ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Icon & Step Number */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 shadow-inner">
                        {getTypeIcon(step.type)}
                      </div>
                      <span className="font-mono font-bold text-xs text-blue-400 mt-1">
                        OP {step.stepNumber}
                      </span>
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">
                          {step.stepName}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {step.type}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        <strong className="text-slate-400">Machine/Workstation:</strong> {step.machine}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="pt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-400">
                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-750">
                          ⚙️ {step.keyParameters}
                        </span>
                        {step.inspectionMethod && (
                          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-750 text-emerald-400">
                            🔍 {step.inspectionMethod}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reorder and Delete Controls */}
                    {canEdit() && (
                      <div className="flex flex-col space-y-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={isLast}
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700"
                          title="Delete Step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Flow Arrow connecting down */}
                  {!isLast && (
                    <div className="flex justify-center my-1.5 text-blue-500">
                      <ArrowDown className="w-5 h-5 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Step Properties Inspector (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-white">Step Inspector</h3>
            <p className="text-xs text-slate-400">Configure parameters for the selected operation.</p>
          </div>

          {selectedStep ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Step Number</label>
                  <input
                    type="text"
                    disabled={!canEdit()}
                    value={selectedStep.stepNumber}
                    onChange={e => handleUpdateStep(selectedStep.id, { stepNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Step Type</label>
                  <select
                    disabled={!canEdit()}
                    value={selectedStep.type}
                    onChange={e => handleUpdateStep(selectedStep.id, { type: e.target.value as ProcessNodeType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="operation">Operation (Circle)</option>
                    <option value="inspection">Inspection (Square)</option>
                    <option value="transport">Transportation (Arrow)</option>
                    <option value="storage">Storage (Triangle)</option>
                    <option value="delay">Delay (D-Shape)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Step Name *</label>
                <input
                  type="text"
                  disabled={!canEdit()}
                  value={selectedStep.stepName}
                  onChange={e => handleUpdateStep(selectedStep.id, { stepName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Machine / Equipment / Cell</label>
                <input
                  type="text"
                  disabled={!canEdit()}
                  value={selectedStep.machine}
                  onChange={e => handleUpdateStep(selectedStep.id, { machine: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Process Description</label>
                <textarea
                  rows={3}
                  disabled={!canEdit()}
                  value={selectedStep.description}
                  onChange={e => handleUpdateStep(selectedStep.id, { description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Key Process Parameters</label>
                <input
                  type="text"
                  disabled={!canEdit()}
                  value={selectedStep.keyParameters}
                  onChange={e => handleUpdateStep(selectedStep.id, { keyParameters: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Inspection Method</label>
                <input
                  type="text"
                  disabled={!canEdit()}
                  value={selectedStep.inspectionMethod || ''}
                  onChange={e => handleUpdateStep(selectedStep.id, { inspectionMethod: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Select a step in the flow canvas to inspect and edit details.
            </div>
          )}
        </div>

      </div>

      {showPdfModal && (
        <PDFPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={`Process Flow Diagram (PFD) - Element #5`}
          subtitle={`${project.projectNumber} | ${project.partName} (${project.partNumber})`}
          pdfBlobUrl={pdfBlobUrl}
          fileName={`ProcessFlow_${project.partNumber}_${project.projectNumber}.pdf`}
        />
      )}

    </div>
  );
};
