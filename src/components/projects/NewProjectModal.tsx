import React, { useState } from 'react';
import { X, Sparkles, Building2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PPAPLevel, SubmissionReason } from '../../types/ppap';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectNumber: `PPAP-2026-${Math.floor(100 + Math.random() * 900)}`,
    customerName: 'Toyota Motor Thailand Co., Ltd.',
    supplierName: 'Apex Automotive Precision Parts Ltd.',
    partName: '',
    partNumber: '',
    drawingNumber: '',
    engineeringChangeLevel: 'Rev 0',
    manufacturingLocation: 'Samut Prakan Plant 1, Line A',
    submissionLevel: 3 as PPAPLevel,
    submissionReason: 'Initial Submission' as SubmissionReason,
    submissionDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    responsibleEngineer: currentUser.name,
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await api.createProject({
        ...formData,
        status: 'Draft'
      });
      onClose();
      onProjectCreated(created.id);
    } catch (err: any) {
      alert(err.message || 'Failed to create PPAP project');
    } finally {
      setLoading(false);
    }
  };

  const samplePresets = [
    {
      name: 'Engine Bracket (Stamping)',
      partName: 'Engine Mount Bracket RH',
      partNumber: '51202-0K160',
      drawingNumber: 'DWG-51202-RH',
      ecl: 'ECL-01',
      customer: 'Toyota Motor Thailand Co., Ltd.'
    },
    {
      name: 'Bumper Grille (Plastic Injection)',
      partName: 'Radiator Lower Grille Bezel',
      partNumber: '71102-T0A-003',
      drawingNumber: 'HD-71102-003',
      ecl: 'Rev B',
      customer: 'Honda Automobile (Thailand) Co., Ltd.'
    },
    {
      name: 'Exhaust Heat Shield (Al-Stamping)',
      partName: 'Turbocharger Exhaust Heat Insulator',
      partNumber: '17271-58010',
      drawingNumber: 'ISZ-17271',
      ecl: 'Rev 2.0',
      customer: 'Isuzu Motors Co., (Thailand) Ltd.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.newProject}
              </h2>
              <p className="text-xs text-slate-400">
                AIAG PPAP 4th Edition / IATF 16949 Production Part Approval
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Presets */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Auto-Fill Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    partName: preset.partName,
                    partNumber: preset.partNumber,
                    drawingNumber: preset.drawingNumber,
                    engineeringChangeLevel: preset.ecl,
                    customerName: preset.customer
                  })
                }
                className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[11px] text-slate-200 transition"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.projectNumber} *
              </label>
              <input
                type="text"
                required
                value={formData.projectNumber}
                onChange={e => setFormData({ ...formData, projectNumber: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                {t.customerName} *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.partName} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Engine Mounting Support Bracket"
                value={formData.partName}
                onChange={e => setFormData({ ...formData, partName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.partNumber} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 51201-0K150"
                value={formData.partNumber}
                onChange={e => setFormData({ ...formData, partNumber: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.drawingNumber}
              </label>
              <input
                type="text"
                placeholder="DWG-51201-REV-04"
                value={formData.drawingNumber}
                onChange={e => setFormData({ ...formData, drawingNumber: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.changeLevel}
              </label>
              <input
                type="text"
                placeholder="ECL-04"
                value={formData.engineeringChangeLevel}
                onChange={e => setFormData({ ...formData, engineeringChangeLevel: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.submissionLevel} *
              </label>
              <select
                value={formData.submissionLevel}
                onChange={e => setFormData({ ...formData, submissionLevel: Number(e.target.value) as PPAPLevel })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none font-semibold text-blue-400"
              >
                <option value={1}>Level 1 - Warrant (PSW) only</option>
                <option value={2}>Level 2 - Warrant + samples & limited data</option>
                <option value={3}>Level 3 - Warrant + samples & full data (Default)</option>
                <option value={4}>Level 4 - Warrant + customer specified data</option>
                <option value={5}>Level 5 - Warrant + on-site supplier review</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.submissionReason} *
              </label>
              <select
                value={formData.submissionReason}
                onChange={e => setFormData({ ...formData, submissionReason: e.target.value as SubmissionReason })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Initial Submission">Initial Submission</option>
                <option value="Engineering Change(s)">Engineering Change(s)</option>
                <option value="Tooling: Transfer, Replacement, Refurbishment">Tooling: Transfer, Replacement, Refurbishment</option>
                <option value="Correction of Discrepancy">Correction of Discrepancy</option>
                <option value="Tooling Inactive > 1 Year">Tooling Inactive &gt; 1 Year</option>
                <option value="Sub-supplier or Material Source Change">Sub-supplier or Material Source Change</option>
                <option value="Change in Part Processing">Change in Part Processing</option>
                <option value="Parts Produced at Additional Location">Parts Produced at Additional Location</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.submissionDate} *
              </label>
              <input
                type="date"
                required
                value={formData.submissionDate}
                onChange={e => setFormData({ ...formData, submissionDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.supplierName}
              </label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {t.manufacturingLocation}
              </label>
              <input
                type="text"
                value={formData.manufacturingLocation}
                onChange={e => setFormData({ ...formData, manufacturingLocation: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {t.responsibleEngineer}
            </label>
            <input
              type="text"
              value={formData.responsibleEngineer}
              onChange={e => setFormData({ ...formData, responsibleEngineer: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md shadow-blue-600/25 transition disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Create PPAP Project'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
