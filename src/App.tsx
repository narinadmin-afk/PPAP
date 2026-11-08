import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { NewProjectModal } from './components/projects/NewProjectModal';
import { AIDocumentGeneratorModal } from './components/ai/AIDocumentGeneratorModal';
import { api } from './services/api';
import { PPAPProject } from './types/ppap';
import { History, ClipboardCheck, Layers } from 'lucide-react';

function MainApp() {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'completeness' | 'audit' | 'upload'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showAIGeneratorModal, setShowAIGeneratorModal] = useState(false);

  const [projectsCount, setProjectsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeProject, setActiveProject] = useState<PPAPProject | null>(null);
  const [allAuditLogs, setAllAuditLogs] = useState<any[]>([]);
  const [uploadedProjectId, setUploadedProjectId] = useState<string | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ppap_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('ppap_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    loadCounts();
  }, [selectedProjectId, currentView]);

  const loadCounts = () => {
    api.getProjects()
      .then(projects => {
        setProjectsCount(projects.length);
        const pending = projects.filter(p => p.status === 'Pending Review').length;
        setPendingCount(pending);
      })
      .catch(err => console.warn('Could not load counts:', err));

    api.getAuditLogs()
      .then(logs => setAllAuditLogs(logs))
      .catch(err => console.warn('Could not load audit logs:', err));

    if (selectedProjectId) {
      api.getProjectById(selectedProjectId)
        .then(p => setActiveProject(p))
        .catch(err => console.warn('Could not load active project:', err));
    } else {
      setActiveProject(null);
    }
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleProjectCreated = (newId: string) => {
    setSelectedProjectId(newId);
    loadCounts();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenNewProject={() => setShowNewProjectModal(true)}
        onOpenAIGenerator={() => setShowAIGeneratorModal(true)}
        onNavigate={(view) => {
          setSelectedProjectId(null);
          setCurrentView(view);
        }}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="flex-1 flex w-full min-h-0">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setSelectedProjectId(null);
            setCurrentView(view);
          }}
          onOpenAIGenerator={() => setShowAIGeneratorModal(true)}
          projectsCount={projectsCount}
          pendingCount={pendingCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Content View */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 min-w-0 overflow-y-auto w-full">
          {selectedProjectId ? (
            <ProjectDetail
              projectId={selectedProjectId}
              onBack={() => {
                setSelectedProjectId(null);
                loadCounts();
              }}
              onOpenAIGenerator={() => setShowAIGeneratorModal(true)}
            />
          ) : currentView === 'dashboard' ? (
            <Dashboard
              onSelectProject={handleSelectProject}
              onOpenNewProject={() => setShowNewProjectModal(true)}
              onOpenAIGenerator={() => setShowAIGeneratorModal(true)}
            />
          ) : currentView === 'projects' ? (
            <ProjectList
              onSelectProject={handleSelectProject}
              onOpenNewProject={() => setShowNewProjectModal(true)}
            />): currentView === 'completeness' ? (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-400" />
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    PPAP Submission Completeness Center
                  </h1>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Select any active project to run the 18 Elements Level Completeness Audit against AIAG PPAP 4th Edition retention requirements.
                </p>
              </div>

              <ProjectList
                onSelectProject={handleSelectProject}
                onOpenNewProject={() => setShowNewProjectModal(true)}
              />
            </div>
          ) : currentView === 'upload' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h1 className="text-xl font-bold text-white tracking-tight">Upload PPAP Project</h1>
              <p className="text-slate-400 text-xs mt-1">Select a PPAP project file to import from outside.</p>
              <input
                type="file"
                accept=".json,.zip"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e: any) => {
                      const projectData = JSON.parse(e.target.result);
                      const newProjectId = crypto.randomUUID();
                      const projectWithId = { ...projectData, id: newProjectId };
                      api.createProject(projectWithId)
                        .then(() => {
                          setUploadedProjectId(newProjectId);
                          setSelectedProjectId(newProjectId);
                          setCurrentView('projects');
                          loadCounts();
                        })
                        .catch(err => alert('Failed to import project: ' + err.message));
                    };
                    reader.readAsText(file);
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 hover:border-blue-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-blue-400" />
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Enterprise Audit Trail (IATF 16949 Section 7.5.3)
                  </h1>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Immutable quality logs tracking all document revisions, approvals, rejections, and test result updates.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="divide-y divide-slate-800 text-xs">
                  {allAuditLogs.map(log => (
                    <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-blue-400">{log.projectNumber}</span>
                          <span className="font-semibold text-slate-200">{log.action}</span>
                          {log.elementName && (
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
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
                  ))}
                </div>
              </div>
            </div>
          )
        </main>
      </div>

      {/* Global Modals */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />

      <AIDocumentGeneratorModal
        isOpen={showAIGeneratorModal}
        onClose={() => setShowAIGeneratorModal(false)}
        activeProject={activeProject}
        onApplyResult={() => {
          loadCounts();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
