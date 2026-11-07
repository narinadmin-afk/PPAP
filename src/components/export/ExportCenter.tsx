import React, { useState } from 'react';
import {
  Archive,
  Download,
  FileSpreadsheet,
  FileText,
  FileCheck2,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { PPAPProject } from '../../types/ppap';
import { api } from '../../services/api';
import {
  exportCompletePPAPZip,
  exportPPAPChecklistToExcel,
  exportPFMEAToExcel,
  exportControlPlanToExcel,
  exportDimensionalToExcel,
  exportPSWToPDF,
  exportDimensionalToPDF,
  exportProcessFlowToPDF
} from '../../utils/exportUtils';

interface ExportCenterProps {
  project: PPAPProject;
}

export const ExportCenter: React.FC<ExportCenterProps> = ({ project }) => {
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleDownloadCompleteZip = async () => {
    setDownloadingZip(true);
    try {
      const [psw, pfmea, controlPlan, processFlow, dimensional] = await Promise.all([
        api.getPSW(project.id),
        api.getPFMEA(project.id),
        api.getControlPlan(project.id),
        api.getProcessFlow(project.id),
        api.getDimensionalReport(project.id)
      ]);

      await exportCompletePPAPZip(project, psw, pfmea, controlPlan, processFlow, dimensional);
    } catch (err: any) {
      alert(err.message || 'Error compiling PPAP ZIP Package');
    } finally {
      setDownloadingZip(false);
    }
  };

  const exportItems = [
    {
      title: 'Complete PPAP Package (Official ZIP)',
      desc: 'All 18 elements consolidated: PSW (PDF), PFMEA (Excel), Control Plan (Excel), Process Flow (PDF), Dimensional Report (PDF/Excel), Master Checklist.',
      icon: Archive,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      action: handleDownloadCompleteZip,
      buttonText: downloadingZip ? 'Compiling ZIP...' : 'Download Complete ZIP',
      primary: true
    },
    {
      title: 'Part Submission Warrant (PSW)',
      desc: 'AIAG 4th Edition standard declaration with supplier authorized signature and customer OEM approval block.',
      icon: FileCheck2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      action: async () => {
        const psw = await api.getPSW(project.id);
        if (psw) {
          const doc = exportPSWToPDF(project, psw);
          doc.save(`PSW_${project.partNumber}_${project.projectNumber}.pdf`);
        }
      },
      buttonText: 'Export PDF'
    },
    {
      title: 'Process FMEA (AIAG-VDA)',
      desc: 'Full matrix with Action Priority (AP), S/O/D scoring, prevention/detection controls, and recommended actions.',
      icon: FileSpreadsheet,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      action: async () => {
        const rows = await api.getPFMEA(project.id);
        exportPFMEAToExcel(project, rows);
      },
      buttonText: 'Export Excel'
    },
    {
      title: 'Production Control Plan',
      desc: 'Complete control plan with special characteristics, sample sizes, frequencies, and reaction containment plans.',
      icon: FileSpreadsheet,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      action: async () => {
        const rows = await api.getControlPlan(project.id);
        exportControlPlanToExcel(project, rows);
      },
      buttonText: 'Export Excel'
    },
    {
      title: 'Process Flow Diagram',
      desc: 'Visual flow sequence connecting operations, inspections, transport, storage, and key machine parameters.',
      icon: FileText,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      action: async () => {
        const steps = await api.getProcessFlow(project.id);
        const doc = exportProcessFlowToPDF(project, steps);
        doc.save(`ProcessFlow_${project.partNumber}.pdf`);
      },
      buttonText: 'Export PDF'
    },
    {
      title: 'Dimensional Inspection Report',
      desc: 'Characteristic balloon records with multi-sample readings, tolerance limits, and automated PASS/FAIL calculations.',
      icon: FileSpreadsheet,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      action: async () => {
        const rows = await api.getDimensionalReport(project.id);
        exportDimensionalToExcel(project, rows);
      },
      buttonText: 'Export Excel'
    },
    {
      title: 'PPAP 18 Elements Checklist',
      desc: 'Master checklist verifying submission/retention status across Level 1-5 for OEM customer submission review.',
      icon: FileSpreadsheet,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      action: () => exportPPAPChecklistToExcel(project),
      buttonText: 'Export Excel'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2">
          <Archive className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            PPAP Document Package Export Center
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Compile and export official, IATF 16949-compliant quality deliverables for submission to OEM customers ({project.customerName}). All generated documents include company header, project number, revision, and electronic sign-offs.
        </p>
      </div>

      {/* Grid of export deliverables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`bg-slate-900 border ${item.borderColor} rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-600 transition ${
                item.primary ? 'md:col-span-2 lg:col-span-3 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg ${item.bgColor} ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {item.primary && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Recommended for OEM Delivery
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={item.action}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                    item.primary
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>{item.buttonText}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
