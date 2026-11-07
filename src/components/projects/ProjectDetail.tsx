import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Layers,
  FileCheck2,
  GitBranch,
  ShieldAlert,
  ClipboardList,
  Ruler,
  Award,
  Download,
  History,
  Building,
  Calendar,
  Sparkles,
  CheckCircle,
  Clock,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { PPAPProject } from '../../types/ppap';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { ElementsHub } from '../elements/ElementsHub';
import { StandardElementTableEditor } from '../elements/StandardElementTableEditor';
import { ProcessFlowEditor } from '../processflow/ProcessFlowEditor';
import { PFMEAManager } from '../pfmea/PFMEAManager';
import { ControlPlanManager } from '../controlplan/ControlPlanManager';
import { DimensionalManager } from '../dimensional/DimensionalManager';
import { PSWViewer } from '../psw/PSWViewer';
import { CompletenessMatrix } from '../completeness/CompletenessMatrix';
import { ExportCenter } from '../export/ExportCenter';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onOpenAIGenerator: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  projectId,
  onBack,
  onOpenAIGenerator
}) => {
  const { t } = useLanguage();
  const [project, setProject] = useState<PPAPProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedElementTableId, setSelectedElementTableId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<
    | 'elements'
    | 'standard-tables'
    | 'flow'
    | 'pfmea'
    | 'control-plan'
    | 'dimensional'
    | 'psw'
    | 'completeness'
    | 'export'
    | 'audit'
  >('elements');

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = () => {
    setLoading(true);
    api.getProjectById(projectId)
      .then(p => {
        setProject(p);
        return api.getAuditLogs(projectId);
      })
      .then(logs => setAuditLogs(logs))
      .catch(err => console.error('Error loading project details:', err))
      .finally(() => setLoading(false));
  };

  if (loading || !project) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const completionPercent = Math.round((project.completedElements / (project.totalElements || 18)) * 100);

  const tabs = [
    { id: 'elements', label: t.tabElements, icon: Layers, badge: `${project.completedElements}/${project.totalElements}` },
    { id: 'standard-tables', label: '18 Elements Tables (ตารางเอกสารมาตรฐาน)', icon: FileSpreadsheet, badge: 'All 18' },
    { id: 'flow', label: t.tabProcessFlow, icon: GitBranch },
    { id: 'pfmea', label: t.tabPFMEA, icon: ShieldAlert },
    { id: 'control-plan', label: t.tabControlPlan, icon: ClipboardList },
    { id: 'dimensional', label: t.tabDimensional, icon: Ruler },
    { id: 'psw', label: t.tabPSW, icon: Award },
    { id: 'completeness', label: t.tabCompleteness, icon: FileCheck2 },
    { id: 'export', label: t.tabExport, icon: Download },
    { id: 'audit', label: t.tabAudit, icon: History }
  ];

  return (
    <div className="space-y-5">
      
      {/* Top Project Context Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Navigation & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Back to Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                  {project.projectNumber}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Level {project.submissionLevel}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  project.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  project.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  project.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}>
                  {project.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {project.partName}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={onOpenAIGenerator}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Quality Assistant</span>
            </button>
          </div>
        </div>

        {/* Part & Customer Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Part Number:</span>
            <strong className="text-slate-200 font-mono text-xs">{project.partNumber}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Drawing Number:</span>
            <strong className="text-slate-200 font-mono text-xs">{project.drawingNumber || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">ECL Level:</span>
            <strong className="text-slate-200 text-xs">{project.engineeringChangeLevel}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Customer:</span>
            <strong className="text-slate-200 text-xs truncate block">{project.customerName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Target Date:</span>
            <strong className="text-slate-200 text-xs">{project.submissionDate}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Readiness:</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-emerald-400 font-bold text-[11px]">{completionPercent}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Navigation Tab Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-sm overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content Area */}
      <div>
        {activeTab === 'elements' && (
          <ElementsHub
            project={project}
            onRefreshProject={loadProject}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onOpenElementTable={(elId) => {
              setSelectedElementTableId(elId);
              setActiveTab('standard-tables');
            }}
            onOpenAIGenerator={onOpenAIGenerator}
          />
        )}

        {activeTab === 'standard-tables' && (
          <StandardElementTableEditor
            project={project}
            elementId={selectedElementTableId}
            onClose={() => setActiveTab('elements')}
            onElementUpdated={(updated) => setProject(updated)}
            onOpenAIGenerator={onOpenAIGenerator}
            onJumpToSpecializedTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === 'flow' && (
          <ProcessFlowEditor
            project={project}
            onOpenAIGenerator={onOpenAIGenerator}
            onSyncToControlPlan={() => setActiveTab('control-plan')}
          />
        )}

        {activeTab === 'pfmea' && (
          <PFMEAManager
            project={project}
            onOpenAIGenerator={onOpenAIGenerator}
            onLinkToControlPlan={() => setActiveTab('control-plan')}
          />
        )}

        {activeTab === 'control-plan' && (
          <ControlPlanManager
            project={project}
            onOpenAIGenerator={onOpenAIGenerator}
          />
        )}

        {activeTab === 'dimensional' && (
          <DimensionalManager
            project={project}
            onOpenAIGenerator={onOpenAIGenerator}
          />
        )}

        {activeTab === 'psw' && (
          <PSWViewer project={project} />
        )}

        {activeTab === 'completeness' && (
          <CompletenessMatrix
            project={project}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === 'export' && (
          <ExportCenter project={project} />
        )}

        {activeTab === 'audit' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-400" />
                <span>Project Electronic Audit Trail (IATF 16949 Section 7.5.3)</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Immutable Log</span>
            </div>

            <div className="divide-y divide-slate-800 text-xs">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No audit records logged yet.</div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">{log.action}</span>
                        {log.elementName && (
                          <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-[10px]">
                            {log.elementName}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{log.details}</p>
                    </div>

                    <div className="text-right shrink-0 text-[11px] text-slate-400">
                      <div><strong className="text-slate-300">{log.user}</strong> ({log.userRole})</div>
                      <div className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
