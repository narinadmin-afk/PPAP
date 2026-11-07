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

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const json = await res.json();
  return json.data;
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
