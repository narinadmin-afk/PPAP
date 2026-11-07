import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Building,
  User,
  ExternalLink,
  Edit2,
  Trash2,
  Archive,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PPAPProject, PPAPLevel, ProjectStatus, SubmissionReason } from '../../types/ppap';
import { exportPPAPChecklistToExcel } from '../../utils/exportUtils';

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onSelectProject,
  onOpenNewProject
}) => {
  const { t } = useLanguage();
  const { canCreateProject, canEdit } = useAuth();

  const [projects, setProjects] = useState<PPAPProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Edit Project Modal
  const [editingProject, setEditingProject] = useState<PPAPProject | null>(null);

  useEffect(() => {
    loadProjects();
  }, [statusFilter, levelFilter]);

  const loadProjects = () => {
    setLoading(true);
    api.getProjects({
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      level: levelFilter !== 'ALL' ? levelFilter : undefined,
      search: search || undefined
    })
      .then(res => setProjects(res))
      .catch(err => console.error('Failed to load projects:', err))
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProjects();
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this PPAP project? This action cannot be undone.')) {
      return;
    }
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      const updated = await api.updateProject(editingProject.id, editingProject);
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingProject(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update project');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.projects}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Manage PPAP submissions, 18 Elements compliance, and OEM customer approvals.
          </p>
        </div>

        {canCreateProject() && (
          <button
            onClick={onOpenNewProject}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-md shadow-blue-600/25 transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newProject}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
          />
        </form>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">{t.filterByStatus}: All</option>
            <option value="Draft">Draft</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">{t.filterByLevel}: All</option>
            <option value="1">Level 1 (Warrant Only)</option>
            <option value="2">Level 2 (Limited)</option>
            <option value="3">Level 3 (Standard All)</option>
            <option value="4">Level 4 (Customer Specific)</option>
            <option value="5">Level 5 (On-site)</option>
          </select>
        </div>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <FileCheck className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-semibold text-slate-200">No PPAP Projects Found</h3>
          <p className="text-xs max-w-sm mx-auto">
            Try adjusting your search criteria or create a new PPAP submission for your customer.
          </p>
          {canCreateProject() && (
            <button
              onClick={onOpenNewProject}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newProject}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {projects.map(project => {
            const completionPercent = Math.round((project.completedElements / (project.totalElements || 18)) * 100);

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between group space-y-4"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                        {project.projectNumber}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Level {project.submissionLevel}
                      </span>
                    </div>

                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      project.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      project.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      project.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                      {project.partName}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span>P/N: <strong className="text-slate-300 font-mono">{project.partNumber}</strong></span>
                      <span>•</span>
                      <span>ECL: <strong className="text-slate-300">{project.engineeringChangeLevel}</strong></span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center space-x-2 pt-1">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{project.customerName}</span>
                  </div>
                </div>

                {/* Progress of Elements */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Elements Approved:</span>
                    <span className="text-slate-200 font-medium">
                      {project.completedElements} / {project.totalElements} ({completionPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        completionPercent === 100 ? 'bg-emerald-500' :
                        completionPercent >= 70 ? 'bg-blue-500' :
                        completionPercent >= 40 ? 'bg-amber-500' : 'bg-slate-600'
                      }`}
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Meta & Action Buttons */}
                <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Target: <strong className="text-slate-300">{project.submissionDate}</strong></span>
                  </div>

                  <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => exportPPAPChecklistToExcel(project)}
                      title="Export PPAP Checklist Excel"
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {canEdit() && (
                      <button
                        onClick={() => setEditingProject(project)}
                        title="Edit Project"
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canEdit() && (
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        title="Delete Project"
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Edit PPAP Project: {editingProject.projectNumber}</h3>
              <button
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">{t.partName} *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.partName}
                    onChange={e => setEditingProject({ ...editingProject, partName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">{t.partNumber} *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.partNumber}
                    onChange={e => setEditingProject({ ...editingProject, partNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">{t.customerName} *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.customerName}
                    onChange={e => setEditingProject({ ...editingProject, customerName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">{t.drawingNumber}</label>
                  <input
                    type="text"
                    value={editingProject.drawingNumber}
                    onChange={e => setEditingProject({ ...editingProject, drawingNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">{t.submissionLevel}</label>
                  <select
                    value={editingProject.submissionLevel}
                    onChange={e => setEditingProject({ ...editingProject, submissionLevel: Number(e.target.value) as PPAPLevel })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  >
                    <option value={1}>Level 1 (Warrant Only)</option>
                    <option value={2}>Level 2 (Limited)</option>
                    <option value={3}>Level 3 (Standard)</option>
                    <option value={4}>Level 4 (Customer Specific)</option>
                    <option value={5}>Level 5 (On-site)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">{t.status}</label>
                  <select
                    value={editingProject.status}
                    onChange={e => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">{t.submissionDate}</label>
                  <input
                    type="date"
                    value={editingProject.submissionDate}
                    onChange={e => setEditingProject({ ...editingProject, submissionDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">{t.responsibleEngineer}</label>
                  <input
                    type="text"
                    value={editingProject.responsibleEngineer}
                    onChange={e => setEditingProject({ ...editingProject, responsibleEngineer: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
