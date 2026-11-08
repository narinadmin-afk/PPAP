import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, SidebarView } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { ExternalFileRepository } from './components/files/ExternalFileRepository';
import { UserManagementView } from './components/admin/UserManagementView';
import { NewProjectModal } from './components/projects/NewProjectModal';
import { AIDocumentGeneratorModal } from './components/ai/AIDocumentGeneratorModal';
import { api } from './services/api';
import { PPAPProject } from './types/ppap';
import { History, ClipboardCheck, Layers, UploadCloud } from 'lucide-react';

// Fallback seed projects for offline / standalone mode
const FALLBACK_PROJECTS: PPAPProject[] = [
  {
    id: 'p-1',
    projectNumber: 'PPAP-2026-001',
    customerName: 'Toyota Motor Thailand Co., Ltd.',
    supplierName: 'Apex Automotive Precision Parts Ltd.',
    partName: 'Engine Mounting Support Bracket LH',
    partNumber: '51201-0K150-C',
    drawingNumber: 'DWG-51201-REV-04',
    engineeringChangeLevel: 'ECL-04 (High Tensile Steel Upgrade)',
    manufacturingLocation: 'Samut Prakan Plant 2, Line B',
    submissionLevel: 3,
    submissionReason: 'Engineering Change(s)',
    submissionDate: '2026-11-20',
    responsibleEngineer: 'Nattaporn Chaiyasin (Quality Engineer)',
    status: 'Pending Review',
    createdAt: '2026-10-06T16:17:26.987Z',
    updatedAt: '2026-11-05T16:17:26.987Z',
    totalElements: 18,
    completedElements: 16,
    elements: []
  },
  {
    id: 'p-2',
    projectNumber: 'PPAP-2026-002',
    customerName: 'Honda Automobile (Thailand) Co., Ltd.',
    supplierName: 'Apex Automotive Precision Parts Ltd.',
    partName: 'Front Suspension Subframe Reinforcement Lower',
    partNumber: '74111-T5A-000',
    drawingNumber: 'HD-74111-T5A',
    engineeringChangeLevel: 'Rev C',
    manufacturingLocation: 'Ayutthaya Industrial Estate, Unit 4',
    submissionLevel: 3,
    submissionReason: 'Initial Submission',
    submissionDate: '2026-12-05',
    responsibleEngineer: 'Kittisak Wongsuwan (Production Engineer)',
    status: 'In Progress',
    createdAt: '2026-10-06T16:17:26.987Z',
    updatedAt: '2026-11-05T16:17:26.987Z',
    totalElements: 18,
    completedElements: 7,
    elements: []
  }
];

function MainApp() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const [currentView, setCurrentView] = useState<SidebarView>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showAIGeneratorModal, setShowAIGeneratorModal] = useState(false);

  const [projects, setProjects] = useState<PPAPProject[]>(FALLBACK_PROJECTS);
  const [projectsCount, setProjectsCount] = useState(2);
  const [pendingCount, setPendingCount] = useState(1);
  const [externalFilesCount, setExternalFilesCount] = useState(6);
  const [activeProject, setActiveProject] = useState<PPAPProject | null>(null);
  const [allAuditLogs, setAllAuditLogs] = useState<any[]>([]);

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
    loadData();
  }, [selectedProjectId, currentView]);

  const loadData = () => {
    // 1. Fetch projects
    api.getProjects()
      .then(projs => {
        if (Array.isArray(projs) && projs.length > 0) {
          setProjects(projs);
          setProjectsCount(projs.length);
          const pending = projs.filter(p => p.status === 'Pending Review').length;
          setPendingCount(pending);
        }
      })
      .catch(() => {
        // Fallback already pre-set
      });

    // 2. Fetch external files count
    try {
      const savedFiles = localStorage.getItem('ppap_external_files');
      if (savedFiles) {
        const parsed = JSON.parse(savedFiles);
        if (Array.isArray(parsed)) setExternalFilesCount(parsed.length);
      }
    } catch {}

    // 3. Fetch audit logs
    api.getAuditLogs()
      .then(logs => {
        if (Array.isArray(logs)) setAllAuditLogs(logs);
      })
      .catch(() => {});

    // 4. Fetch active project if selected
    if (selectedProjectId) {
      api.getProjectById(selectedProjectId)
        .then(p => setActiveProject(p))
        .catch(() => {
          const fallback = projects.find(p => p.id === selectedProjectId) || null;
          setActiveProject(fallback);
        });
    } else {
      setActiveProject(null);
    }
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleProjectCreated = (newId: string) => {
    setSelectedProjectId(newId);
    loadData();
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
        {/* Left Sidebar Menu */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setSelectedProjectId(null);
            setCurrentView(view);
          }}
          onOpenAIGenerator={() => setShowAIGeneratorModal(true)}
          projectsCount={projectsCount}
          pendingCount={pendingCount}
          externalFilesCount={externalFilesCount}
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
                loadData();
              }}
              onOpenAIGenerator={() => setShowAIGeneratorModal(true)}
            />
          ) : currentView === 'files' ? (
            <ExternalFileRepository
              projects={projects}
              selectedProjectId={null}
              onSelectProject={handleSelectProject}
            />
          ) : currentView === 'users' ? (
            <UserManagementView />
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
            />
          ) : currentView === 'completeness' ? (
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
                  Immutable quality logs tracking all document revisions, approvals, rejections, external file uploads, and test result updates.
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
          )}
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
          loadData();
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;