import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Sparkles,
  ClipboardCheck,
  History,
  FileCheck2,
  ShieldCheck,
  Award,
  UploadCloud,
  FolderOpen,
  Users
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export type SidebarView = 'dashboard' | 'projects' | 'completeness' | 'audit' | 'files' | 'users';

interface SidebarProps {
  currentView: SidebarView;
  onNavigate: (view: SidebarView) => void;
  onOpenAIGenerator: () => void;
  projectsCount: number;
  pendingCount: number;
  externalFilesCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenAIGenerator,
  projectsCount,
  pendingCount,
  externalFilesCount = 6,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: t.dashboard || 'แดชบอร์ด',
      icon: LayoutDashboard,
      badge: null,
      onClick: () => onNavigate('dashboard')
    },
    {
      id: 'projects' as const,
      label: t.projects || 'โครงการ PPAP',
      icon: FolderGit2,
      badge: projectsCount,
      onClick: () => onNavigate('projects')
    },
    {
      id: 'files' as const,
      label: 'อัปโหลดไฟล์ภายนอก',
      icon: UploadCloud,
      badge: externalFilesCount > 0 ? `${externalFilesCount}` : 'New',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      onClick: () => onNavigate('files')
    },
    {
      id: 'ai-doc' as const,
      label: t.aiGenerator || 'AI Generator',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      onClick: onOpenAIGenerator
    },
    {
      id: 'completeness' as const,
      label: t.completenessChecker || 'ตรวจสอบความสมบูรณ์',
      icon: ClipboardCheck,
      badge: pendingCount > 0 ? `${pendingCount} req` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      onClick: () => onNavigate('completeness')
    },
    {
      id: 'audit' as const,
      label: t.auditTrail || 'Audit Trail',
      icon: History,
      badge: null,
      onClick: () => onNavigate('audit')
    },
    ...(currentUser.role === 'Administrator'
      ? [
          {
            id: 'users' as const,
            label: 'จัดการสมาชิก & สิทธิ์',
            icon: Users,
            badge: 'Admin',
            badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
            onClick: () => onNavigate('users')
          }
        ]
      : [])
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } transition-all duration-300 ease-in-out bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] select-none`}
    >
      <div className={`space-y-5 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        
        {/* Navigation Section */}
        <div>
          {!isCollapsed && (
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>Navigation</span>
              <span className="text-[10px] text-blue-400 font-normal">IATF 16949</span>
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  title={item.label}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center py-3 px-2' : 'justify-between px-3 py-2.5'
                  } rounded-xl text-xs sm:text-sm font-medium transition-all relative group cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    isCollapsed ? (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400" />
                    ) : (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          item.badgeColor || (isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )
                  )}

                  {/* Tooltip in collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Guidelines Card (only when expanded) */}
        {!isCollapsed && (
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <UploadCloud className="w-4 h-4" />
              <span>External Repository</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              รองรับการอัปโหลด Drawing CAD, Test Reports และเอกสารซัพพลายเออร์เพื่อเก็บเข้าสู่โปรเจกต์
            </p>
            <div className="pt-1.5 border-t border-slate-700 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Section 7.5.3</span>
              <span className="text-emerald-400 font-semibold">Ready</span>
            </div>
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className={`border-t border-slate-800 text-slate-500 text-xs ${isCollapsed ? 'p-3 flex justify-center' : 'p-4 flex items-center justify-between'}`}>
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          {!isCollapsed && <span className="text-[11px] font-medium text-slate-400">IATF 16949 QMS</span>}
        </div>
        {!isCollapsed && <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">v4.0</span>}
      </div>
    </aside>
  );
};
