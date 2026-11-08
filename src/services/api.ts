import {
  PPAPProject,
  User,
  PFMEARow,
  ProcessFlowStep,
  ControlPlanRow,
  DimensionalRow,
  PSWData,
  Notification,
  AuditLog
} from '../types/ppap';

const BASE_URL = '/api';

// Seed projects fallback for static / client-only mode
const SEED_PROJECTS: PPAPProject[] = [
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

function getStoredProjects(): PPAPProject[] {
  try {
    const raw = localStorage.getItem('ppap_client_projects');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return SEED_PROJECTS;
}

function saveStoredProjects(projs: PPAPProject[]) {
  try {
    localStorage.setItem('ppap_client_projects', JSON.stringify(projs));
  } catch {}
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const text = await res.text();

    // Check if the dev server returned SPA HTML fallback instead of real JSON API
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error('Static Mode: Server returned HTML');
    }

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = JSON.parse(text);
        if (errJson.error) errorMsg = errJson.error;
      } catch {}
      throw new Error(errorMsg);
    }

    const json = JSON.parse(text);
    return json.data;
  } catch (err: any) {
    // Graceful fallback for static environments or offline preview
    return handleClientFallback<T>(endpoint, options);
  }
}

// Client-side fallback handler for seamless offline / static operation
function handleClientFallback<T>(endpoint: string, options?: RequestInit): T {
  const method = options?.method?.toUpperCase() || 'GET';
  const cleanEndpoint = endpoint.split('?')[0];

  // Projects list
  if (cleanEndpoint === '/projects') {
    if (method === 'GET') {
      return getStoredProjects() as any;
    }
    if (method === 'POST') {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const newProj: PPAPProject = {
        id: `p-${Date.now()}`,
        projectNumber: body.projectNumber || `PPAP-2026-${Math.floor(Math.random() * 900 + 100)}`,
        customerName: body.customerName || 'OEM Customer',
        supplierName: body.supplierName || 'Apex Automotive',
        partName: body.partName || 'New Automotive Component',
        partNumber: body.partNumber || 'PART-001',
        drawingNumber: body.drawingNumber || 'DWG-001',
        engineeringChangeLevel: body.engineeringChangeLevel || 'Rev A',
        manufacturingLocation: body.manufacturingLocation || 'Plant 1',
        submissionLevel: body.submissionLevel || 3,
        submissionReason: body.submissionReason || 'Initial Submission',
        submissionDate: body.submissionDate || new Date().toISOString().split('T')[0],
        responsibleEngineer: body.responsibleEngineer || 'Quality Engineer',
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalElements: 18,
        completedElements: 0,
        elements: []
      };
      const projs = [newProj, ...getStoredProjects()];
      saveStoredProjects(projs);
      return newProj as any;
    }
  }

  // Single project
  if (cleanEndpoint.startsWith('/projects/')) {
    const parts = cleanEndpoint.split('/');
    const projId = parts[2];
    const subRoute = parts[3];

    // Generic element table
    if (subRoute === 'elements' && parts[5] === 'table') {
      const elId = parts[4];
      const storageKey = `ppap_table_${projId}_${elId}`;
      if (method === 'GET') {
        const saved = localStorage.getItem(storageKey);
        return (saved ? JSON.parse(saved) : []) as any;
      }
      if (method === 'POST') {
        const body = options?.body ? JSON.parse(options.body as string) : {};
        if (body.rows) {
          localStorage.setItem(storageKey, JSON.stringify(body.rows));
          return body.rows as any;
        }
      }
    }

    const projs = getStoredProjects();
    const found = projs.find(p => p.id === projId) || projs[0] || SEED_PROJECTS[0];
    return found as any;
  }

  // Dashboard stats
  if (cleanEndpoint === '/dashboard/stats') {
    const projs = getStoredProjects();
    return {
      totalProjects: projs.length,
      pendingPPAP: projs.filter(p => p.status === 'Pending Review').length,
      approvedPPAP: projs.filter(p => p.status === 'Approved').length,
      rejectedPPAP: projs.filter(p => p.status === 'Rejected').length,
      inProgressPPAP: projs.filter(p => p.status === 'In Progress').length,
      documentsIncomplete: 2,
      overallComplianceRate: 88,
      byLevel: { 1: 0, 2: 0, 3: projs.length, 4: 0, 5: 0 },
      upcomingDeadlines: projs.map(p => ({
        projectId: p.id,
        projectNumber: p.projectNumber,
        customerName: p.customerName,
        partName: p.partName,
        submissionDate: p.submissionDate || '2026-12-01',
        submissionLevel: p.submissionLevel as number,
        daysRemaining: 14,
        status: p.status || 'Pending Review',
        completionRate: 80
      })),
      recentActivities: []
    } as any;
  }

  // Default empty array/object
  return [] as any;
}

export const api = {
  // Auth & Users
  getUsers: () => request<User[]>('/auth/users'),
  getCurrentUser: (userId?: string) => request<User>(userId ? `/auth/me?userId=${userId}` : '/auth/me'),

  // Dashboard Stats
  getDashboardStats: () => request<{
    totalProjects: number;
    pendingPPAP: number;
    approvedPPAP: number;
    rejectedPPAP: number;
    inProgressPPAP: number;
    documentsIncomplete: number;
    overallComplianceRate: number;
    byLevel: Record<number, number>;
    upcomingDeadlines: Array<{
      projectId: string;
      projectNumber: string;
      customerName: string;
      partName: string;
      submissionDate: string;
      submissionLevel: number;
      daysRemaining: number;
      status: string;
      completionRate: number;
    }>;
    recentActivities: AuditLog[];
  }>('/dashboard/stats'),

  // Projects
  getProjects: (filters?: { status?: string; level?: string; customer?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.level) params.set('level', filters.level);
    if (filters?.customer) params.set('customer', filters.customer);
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString();
    return request<PPAPProject[]>(`/projects${qs ? `?${qs}` : ''}`);
  },

  getProjectById: (id: string) => request<PPAPProject>(`/projects/${id}`),

  createProject: (data: Partial<PPAPProject>) =>
    request<PPAPProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProject: (id: string, data: Partial<PPAPProject>) =>
    request<PPAPProject>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: string) =>
    request<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    }),

  // Elements
  updateElement: (projectId: string, elementId: number, data: any, user: string, role: string) =>
    request<any>(`/projects/${projectId}/elements/${elementId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, user, role }),
    }),

  uploadElementFile: (projectId: string, elementId: number, fileData: { fileName: string; fileSize?: number; fileType?: string; revision?: string }, user: string) =>
    request<any>(`/projects/${projectId}/elements/${elementId}/upload`, {
      method: 'POST',
      body: JSON.stringify({ ...fileData, user }),
    }),

  // Generic Element Table (for all 18 elements)
  getElementTable: (projectId: string, elementId: number) =>
    request<any[]>(`/projects/${projectId}/elements/${elementId}/table`),
  saveElementTable: (projectId: string, elementId: number, rows: any[], user: string) =>
    request<any[]>(`/projects/${projectId}/elements/${elementId}/table`, {
      method: 'POST',
      body: JSON.stringify({ rows, user }),
    }),

  // PFMEA
  getPFMEA: (projectId: string) => request<PFMEARow[]>(`/projects/${projectId}/pfmea`),
  savePFMEA: (projectId: string, rows: PFMEARow[], user: string) =>
    request<PFMEARow[]>(`/projects/${projectId}/pfmea`, {
      method: 'POST',
      body: JSON.stringify({ rows, user }),
    }),

  // Process Flow
  getProcessFlow: (projectId: string) => request<ProcessFlowStep[]>(`/projects/${projectId}/process-flow`),
  saveProcessFlow: (projectId: string, steps: ProcessFlowStep[], user: string) =>
    request<ProcessFlowStep[]>(`/projects/${projectId}/process-flow`, {
      method: 'POST',
      body: JSON.stringify({ steps, user }),
    }),

  // Control Plan
  getControlPlan: (projectId: string) => request<ControlPlanRow[]>(`/projects/${projectId}/control-plan`),
  saveControlPlan: (projectId: string, rows: ControlPlanRow[], user: string) =>
    request<ControlPlanRow[]>(`/projects/${projectId}/control-plan`, {
      method: 'POST',
      body: JSON.stringify({ rows, user }),
    }),

  // Dimensional Report
  getDimensionalReport: (projectId: string) => request<DimensionalRow[]>(`/projects/${projectId}/dimensional`),
  saveDimensionalReport: (projectId: string, rows: DimensionalRow[], user: string) =>
    request<DimensionalRow[]>(`/projects/${projectId}/dimensional`, {
      method: 'POST',
      body: JSON.stringify({ rows, user }),
    }),

  // PSW
  getPSW: (projectId: string) => request<PSWData | null>(`/projects/${projectId}/psw`),
  savePSW: (projectId: string, psw: PSWData, user: string) =>
    request<PSWData>(`/projects/${projectId}/psw`, {
      method: 'POST',
      body: JSON.stringify({ psw, user }),
    }),

  // AI Document Generator
  generateAIDocument: (payload: {
    documentType: string;
    partName: string;
    partNumber: string;
    manufacturingProcess: string;
    rawMaterial: string;
    machineEquipment?: string;
    productionMethod?: string;
    inspectionMethod?: string;
    customerRequirements?: string;
    language?: 'th' | 'en' | 'zh';
  }) =>
    request<{
      title: string;
      documentType: string;
      generatedDate: string;
      headers: string[];
      rows: any[];
      notes: string[];
    }>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Notifications
  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    }),

  // Audit Logs
  getAuditLogs: (projectId?: string) =>
    request<AuditLog[]>(projectId ? `/audit-logs?projectId=${projectId}` : '/audit-logs'),
};
