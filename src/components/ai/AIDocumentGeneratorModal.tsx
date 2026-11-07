import React, { useState } from 'react';
import {
  Sparkles,
  X,
  FileSpreadsheet,
  CheckCircle,
  Copy,
  Download,
  AlertCircle,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { PPAPProject } from '../../types/ppap';

interface AIDocumentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject?: PPAPProject | null;
  onApplyResult?: (type: string, data: any) => void;
}

export const AIDocumentGeneratorModal: React.FC<AIDocumentGeneratorModalProps> = ({
  isOpen,
  onClose,
  activeProject,
  onApplyResult
}) => {
  const { language } = useLanguage();

  const [documentType, setDocumentType] = useState<
    | 'PFMEA'
    | 'Process Flow'
    | 'Control Plan'
    | 'Work Instruction'
    | 'Inspection Standard'
    | 'Dimensional Report'
    | 'MSA Report'
    | 'PSW'
  >('PFMEA');

  const [partName, setPartName] = useState(activeProject?.partName || 'Engine Mount Support Bracket LH');
  const [partNumber, setPartNumber] = useState(activeProject?.partNumber || '51201-0K150-C');
  const [manufacturingProcess, setManufacturingProcess] = useState('Progressive Stamping, Robotic Welding, & E-Coat');
  const [rawMaterial, setRawMaterial] = useState('High Tensile Automotive Steel SPFC 590 (Thickness 2.5mm)');
  const [machineEquipment, setMachineEquipment] = useState('AIDA 300T & Komatsu 400T Press Line, Panasonic Welding Robot');
  const [customerRequirements, setCustomerRequirements] = useState('IATF 16949, Toyota TSH6528G Salt Spray 720h, Ppk >= 1.67');

  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.generateAIDocument({
        documentType,
        partName,
        partNumber,
        manufacturingProcess,
        rawMaterial,
        machineEquipment,
        customerRequirements,
        language
      });
      setGeneratedResult(res);
    } catch (err: any) {
      alert(err.message || 'Failed to generate document with AI');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToActiveProject = async () => {
    if (!generatedResult || !activeProject) return;

    try {
      if (documentType === 'PFMEA') {
        const rows = generatedResult.rows.map((r: any, idx: number) => ({
          id: `pf-ai-${Date.now()}-${idx}`,
          processStep: r.processStep || r['Process Step'] || `OP ${idx * 10 + 10}`,
          processFunction: r.processFunction || r['Process Function'] || '',
          failureMode: r.failureMode || r['Failure Mode'] || '',
          failureEffect: r.failureEffect || r['Failure Effect'] || '',
          failureCause: r.failureCause || r['Failure Cause'] || '',
          preventionControl: r.preventionControl || r['Prevention Control'] || '',
          detectionControl: r.detectionControl || r['Detection Control'] || '',
          severity: Number(r.severity || r['Severity'] || 7),
          occurrence: Number(r.occurrence || r['Occurrence'] || 3),
          detection: Number(r.detection || r['Detection'] || 3),
          actionPriority: r.actionPriority || 'Medium',
          recommendedAction: r.recommendedAction || r['Recommended Action'] || '',
          responsibility: r.responsibility || r['Responsibility'] || 'QA Engineer',
          targetCompletionDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          status: 'Open' as const
        }));
        await api.savePFMEA(activeProject.id, rows, 'AI Assistant');
        alert('PFMEA rows successfully loaded into Project!');
      } else if (documentType === 'Control Plan') {
        const rows = generatedResult.rows.map((r: any, idx: number) => ({
          id: `cp-ai-${Date.now()}-${idx}`,
          processNumber: r.processNumber || String((idx + 1) * 10),
          processName: r.processName || '',
          machineEquipment: r.machineEquipment || machineEquipment,
          productCharacteristic: r.productCharacteristic || '',
          processCharacteristic: r.processCharacteristic || '',
          specialCharacteristic: (r.specialCharacteristic || 'Major') as any,
          specificationTolerance: r.specificationTolerance || '',
          measurementTechnique: r.measurementTechnique || 'Check Fixture',
          sampleSize: r.sampleSize || '5 pcs',
          frequency: r.frequency || 'Every 2 hours',
          controlMethod: r.controlMethod || 'Control Chart',
          reactionPlan: r.reactionPlan || 'Quarantine suspect parts'
        }));
        await api.saveControlPlan(activeProject.id, rows, 'AI Assistant');
        alert('Control Plan rows successfully loaded into Project!');
      } else if (documentType === 'Process Flow') {
        const steps = generatedResult.rows.map((r: any, idx: number) => ({
          id: `st-ai-${Date.now()}-${idx}`,
          stepNumber: r.stepNumber || String((idx + 1) * 10),
          stepName: r.stepName || '',
          type: (r.type || 'operation') as any,
          machine: r.machine || machineEquipment,
          description: r.description || r.parameters || '',
          keyParameters: r.parameters || 'Standard cycle time and pressure',
          inspectionMethod: r.inspection || 'Visual inspection',
          x: 100,
          y: idx * 120 + 50
        }));
        await api.saveProcessFlow(activeProject.id, steps, 'AI Assistant');
        alert('Process Flow Diagram steps successfully loaded into Project!');
      }

      onApplyResult?.(documentType, generatedResult);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error applying AI document to project');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl lg:max-w-6xl w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5 text-xs text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>AI Automotive PPAP Generator</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  IATF 16949 / AIAG-VDA
                </span>
              </h2>
              <p className="text-slate-400 text-xs">
                Drafts production-grade quality documents for stamping, molding, machining, welding, and assembly.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Target Document */}
            <div className="sm:col-span-2 md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Select Document to Generate *
              </label>
              <select
                value={documentType}
                onChange={e => setDocumentType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-blue-400 font-bold focus:border-blue-500 focus:outline-none"
              >
                <option value="PFMEA">Process FMEA (AIAG & VDA 1st Edition Matrix)</option>
                <option value="Process Flow">Process Flow Diagram (ASME / AIAG Symbols)</option>
                <option value="Control Plan">Production Control Plan (Characteristics & Reactions)</option>
                <option value="Dimensional Report">Dimensional Report (Balloon Requirements Template)</option>
                <option value="Work Instruction">Standard Work Instruction (Shopfloor SOP)</option>
                <option value="Inspection Standard">Quality Inspection Standard (QIS)</option>
                <option value="MSA Report">Measurement System Analysis (MSA Plan)</option>
                <option value="PSW">Part Submission Warrant (Warrant Draft)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Part Name *</label>
              <input
                type="text"
                required
                value={partName}
                onChange={e => setPartName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Part Number *</label>
              <input
                type="text"
                required
                value={partNumber}
                onChange={e => setPartNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Manufacturing Process *</label>
              <input
                type="text"
                required
                value={manufacturingProcess}
                onChange={e => setManufacturingProcess(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                placeholder="e.g. Progressive Stamping, Plastic Injection, Robotic MIG Welding"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Raw Material & Spec *</label>
              <input
                type="text"
                required
                value={rawMaterial}
                onChange={e => setRawMaterial(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                placeholder="e.g. SPFC 590 High Strength Steel / PA66 GF30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Machine / Equipment / Line</label>
              <input
                type="text"
                value={machineEquipment}
                onChange={e => setMachineEquipment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                placeholder="e.g. 400T Tandem Press, 6-Axis Robot, CMM Mitutoyo"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Customer & Quality Requirements</label>
              <input
                type="text"
                value={customerRequirements}
                onChange={e => setCustomerRequirements(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                placeholder="e.g. Ppk >= 1.67, Salt spray 720h, Zero weld spatter"
              />
            </div>
          </div>

          {/* Automotive Audit Notice (User prompt requirement: "AI must not hallucinate actual measurements") */}
          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/60 flex items-start space-x-2 text-[11px] text-blue-300">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>IATF 16949 Audit Policy:</strong> AI will generate standardized failure mechanisms, control specifications, and inspection methods. Physical measurement readings are left for actual shopfloor CMM verification.
            </span>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Document</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Output Preview & Editable Table */}
        {generatedResult && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>{generatedResult.title}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-normal">
                    Ready to Apply
                  </span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {generatedResult.rows?.length || 0} items generated • AIAG & VDA Compliant
                </span>
              </div>

              {activeProject && (
                <button
                  type="button"
                  onClick={handleApplyToActiveProject}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Apply to Project ({activeProject.projectNumber})</span>
                </button>
              )}
            </div>

            {/* Render Output Table */}
            <div className="max-h-80 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60 p-2">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-850 text-slate-300 border-b border-slate-800">
                    {generatedResult.headers?.map((h: string, idx: number) => (
                      <th key={idx} className="p-2 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {generatedResult.rows?.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-800/30">
                      {Object.values(row).map((val: any, cIdx: number) => (
                        <td key={cIdx} className="p-2 text-slate-300 max-w-[200px] truncate">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {generatedResult.notes && (
              <div className="p-3 bg-slate-800/60 rounded-lg text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300">Engineering Notes:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {generatedResult.notes.map((n: string, i: number) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
