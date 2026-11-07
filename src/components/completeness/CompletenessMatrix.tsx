import React from 'react';
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PPAPProject, PPAPLevel } from '../../types/ppap';
import { exportPPAPChecklistToExcel } from '../../utils/exportUtils';
import { useLanguage } from '../../context/LanguageContext';

interface CompletenessMatrixProps {
  project: PPAPProject;
  onNavigateTab: (tabId: string) => void;
}

export const CompletenessMatrix: React.FC<CompletenessMatrixProps> = ({
  project,
  onNavigateTab
}) => {
  const { t } = useLanguage();
  const level = project.submissionLevel;

  // AIAG PPAP 4th Edition Retention Table 4.1 definitions
  // S = Submit to customer
  // R = Retain at supplier manufacturing location
  // * = Customer specific requirements
  // NA = Not Applicable

  const requiredToSubmit = project.elements.filter(
    e => e.requiredForLevel[level] === 'S'
  );

  const submittedAndApproved = requiredToSubmit.filter(e => e.status === 'Approved');
  const pendingSubmission = requiredToSubmit.filter(e => e.status === 'Pending Review');
  const rejectedSubmission = requiredToSubmit.filter(e => e.status === 'Rejected');
  const missingSubmission = requiredToSubmit.filter(
    e => e.status === 'Not Started' || e.status === 'In Progress'
  );

  const submissionReadinessPercent = requiredToSubmit.length > 0
    ? Math.round((submittedAndApproved.length / requiredToSubmit.length) * 100)
    : 100;

  const handleExportChecklist = () => {
    exportPPAPChecklistToExcel(project);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              PPAP Completeness & Level Verification Matrix
            </h2>
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              Level {level} Compliance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audits your PPAP package against AIAG Table 4.1 requirements. Only mandatory elements for Level {level} are enforced for customer submission.
          </p>
        </div>

        <button
          onClick={handleExportChecklist}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow transition self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export PPAP Checklist (Excel)</span>
        </button>
      </div>

      {/* Readiness Gauge & Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Customer Submission Readiness</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-black ${
              submissionReadinessPercent === 100 ? 'text-emerald-400' :
              submissionReadinessPercent >= 70 ? 'text-blue-400' :
              submissionReadinessPercent >= 40 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {submissionReadinessPercent}%
            </span>
            <span className="text-xs text-slate-500">
              ({submittedAndApproved.length} / {requiredToSubmit.length} submitted)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                submissionReadinessPercent === 100 ? 'bg-emerald-500' :
                submissionReadinessPercent >= 70 ? 'bg-blue-500' :
                submissionReadinessPercent >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${submissionReadinessPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Mandatory to Submit (S)</span>
          <div className="mt-2 text-2xl font-bold text-white">
            {requiredToSubmit.length} <span className="text-xs text-slate-400 font-normal">of 18 elements</span>
          </div>
          <span className="text-[11px] text-blue-400 mt-2">
            {level === 1 ? 'PSW Only' : level === 2 ? 'Samples & Key Data' : level === 3 ? 'Full 18 Elements' : 'Custom'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Missing / Incomplete</span>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {missingSubmission.length} <span className="text-xs text-slate-400 font-normal">elements</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            Requires documentation draft
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Rejected Documents</span>
          <div className="mt-2 text-2xl font-bold text-rose-400">
            {rejectedSubmission.length} <span className="text-xs text-slate-400 font-normal">elements</span>
          </div>
          <span className="text-[11px] text-rose-400 mt-2">
            Action required before sign-off
          </span>
        </div>
      </div>

      {/* Warnings & Actionable Alerts */}
      {(missingSubmission.length > 0 || rejectedSubmission.length > 0) && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>PPAP Submission Gaps & Action Items</span>
          </div>

          <div className="space-y-2 text-xs">
            {rejectedSubmission.map(el => (
              <div key={el.id} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between">
                <div>
                  <strong>Element #{el.id} ({el.name}):</strong> Rejected. {el.comments || 'Revision needed.'}
                </div>
                <button
                  onClick={() => onNavigateTab('elements')}
                  className="px-2 py-1 rounded bg-rose-600/30 text-rose-200 hover:bg-rose-600 hover:text-white transition"
                >
                  Resolve →
                </button>
              </div>
            ))}

            {missingSubmission.map(el => (
              <div key={el.id} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-between">
                <div>
                  <strong>Element #{el.id} ({el.name}):</strong> Status is {el.status}. Needs to be prepared and approved for Level {level}.
                </div>
                <button
                  onClick={() => onNavigateTab('elements')}
                  className="px-2 py-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white transition"
                >
                  Prepare →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full 18 Elements Level Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-850 text-slate-300 border-b border-slate-800">
              <th className="p-3 font-semibold text-center w-12">#</th>
              <th className="p-3 font-semibold w-72">Element Name</th>
              <th className="p-3 font-semibold text-center w-20">L1</th>
              <th className="p-3 font-semibold text-center w-20">L2</th>
              <th className="p-3 font-semibold text-center w-20 bg-blue-900/30 text-blue-200">L3 (Active)</th>
              <th className="p-3 font-semibold text-center w-20">L4</th>
              <th className="p-3 font-semibold text-center w-20">L5</th>
              <th className="p-3 font-semibold text-center w-36">Current Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {project.elements.map(el => {
              const isActiveLevelMandatory = el.requiredForLevel[level] === 'S';

              return (
                <tr key={el.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-center font-bold text-slate-400">
                    {el.id}
                  </td>
                  <td className="p-3 font-semibold text-white">
                    {el.name}
                  </td>
                  <td className="p-3 text-center text-slate-400">{el.requiredForLevel[1]}</td>
                  <td className="p-3 text-center text-slate-400">{el.requiredForLevel[2]}</td>
                  <td className={`p-3 text-center font-bold bg-blue-900/20 ${isActiveLevelMandatory ? 'text-blue-400' : 'text-slate-500'}`}>
                    {el.requiredForLevel[level]}
                  </td>
                  <td className="p-3 text-center text-slate-400">{el.requiredForLevel[4]}</td>
                  <td className="p-3 text-center text-slate-400">{el.requiredForLevel[5]}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      el.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      el.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      el.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {el.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
