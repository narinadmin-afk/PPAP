import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Clock,
  CheckCircle2,
  XCircle,
  FileWarning,
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles,
  Plus,
  Layers,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { PPAPProject } from '../../types/ppap';

interface DashboardProps {
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
  onOpenAIGenerator: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectProject,
  onOpenNewProject,
  onOpenAIGenerator
}) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setLoading(true);
    api.getDashboardStats()
      .then(res => setStats(res))
      .catch(err => console.error('Error fetching dashboard stats:', err))
      .finally(() => setLoading(false));
  };

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const kpis = [
    {
      title: t.totalProjects,
      value: stats.totalProjects,
      icon: FolderGit2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: t.pendingPPAP,
      value: stats.pendingPPAP,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      title: t.approvedPPAP,
      value: stats.approvedPPAP,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: t.rejectedPPAP,
      value: stats.rejectedPPAP,
      icon: XCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20'
    },
    {
      title: t.incompleteDocs,
      value: stats.documentsIncomplete,
      icon: FileWarning,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: t.overallCompliance,
      value: `${stats.overallComplianceRate}%`,
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Automotive IATF 16949 / AIAG PPAP 4th Ed.
              </span>
              <span className="text-xs text-slate-400">• Real-time Sync Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              PPAP Operations Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Centralized quality documentation hub for tracking 18 PPAP elements, AIAG-VDA PFMEAs, Control Plans, and customer electronic sign-offs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAIGenerator}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t.aiGenerator}</span>
            </button>
            <button
              onClick={onOpenNewProject}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-medium text-sm shadow transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{t.newProject}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-slate-900 border ${kpi.borderColor} rounded-xl p-4 shadow-sm transition hover:shadow-md hover:border-slate-700 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium truncate">{kpi.title}</span>
                <div className={`p-2 rounded-lg ${kpi.bgColor} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white tracking-tight">{kpi.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Submission Level Distribution + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Submission Levels Chart & Breakdown (1 column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold text-sm text-white">{t.submissionLevelDistribution}</h2>
            </div>
            <span className="text-xs text-slate-400">AIAG Levels</span>
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map(lvl => {
              const count = stats.byLevel[lvl] || 0;
              const percent = stats.totalProjects > 0 ? Math.round((count / stats.totalProjects) * 100) : 0;
              const levelDescriptions: Record<number, string> = {
                1: 'Level 1: Warrant (PSW) only',
                2: 'Level 2: Warrant + samples & limited data',
                3: 'Level 3: Warrant + samples & complete data (Standard)',
                4: 'Level 4: Warrant & per customer criteria',
                5: 'Level 5: On-site review at supplier plant'
              };

              return (
                <div key={lvl} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Level {lvl}</span>
                    <span className="text-slate-400 font-mono">{count} projects ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        lvl === 3 ? 'bg-blue-500' : lvl === 2 ? 'bg-cyan-500' : lvl === 4 ? 'bg-indigo-500' : 'bg-slate-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{levelDescriptions[lvl]}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Standard OEM Target:</span>
            <span className="text-blue-400 font-medium">Level 3 (Default)</span>
          </div>
        </div>

        {/* Upcoming Submission Deadlines (2 columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h2 className="font-semibold text-sm text-white">{t.upcomingDeadlines}</h2>
            </div>
            <span className="text-xs text-slate-400">Ordered by Target Date</span>
          </div>

          {stats.upcomingDeadlines.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No pending deadlines. All submissions up to date!
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {stats.upcomingDeadlines.map((item: any) => {
                const isOverdue = item.daysRemaining < 0;
                const isUrgent = item.daysRemaining >= 0 && item.daysRemaining <= 14;

                return (
                  <div
                    key={item.projectId}
                    onClick={() => onSelectProject(item.projectId)}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-850/60 p-2 rounded-lg cursor-pointer transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{item.projectNumber}</span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-blue-400 border border-slate-700 rounded font-semibold">
                          Level {item.submissionLevel}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          item.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium">
                        {item.partName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Customer: <span className="text-slate-300">{item.customerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Progress bar */}
                      <div className="w-24 text-right">
                        <div className="text-[10px] text-slate-400 mb-0.5">{item.completionRate}% ready</div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${item.completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Days Badge */}
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold text-center min-w-[90px] ${
                        isOverdue
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isUrgent
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {isOverdue
                          ? t.daysOverdue.replace('{n}', String(Math.abs(item.daysRemaining)))
                          : t.daysLeft.replace('{n}', String(item.daysRemaining))}
                        <span className="block text-[9px] font-normal text-slate-400 mt-0.5">
                          {item.submissionDate}
                        </span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Recent Activities Audit Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="font-semibold text-sm text-white">{t.recentActivities}</h2>
          </div>
          <span className="text-xs text-slate-400">IATF 16949 Audit Trail</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.recentActivities.map((log: any) => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-xs space-y-1 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-400">{log.projectNumber}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(log.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="text-slate-200 font-medium">
                {log.elementName ? `${log.elementName} - ` : ''}
                {log.action}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                {log.details}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60">
                <span>By: <strong className="text-slate-300">{log.user}</strong> ({log.userRole})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
