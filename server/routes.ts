import { Router, Request, Response } from 'express';
import { db } from './db';
import { generatePPAPDocumentWithAI } from './ai';

export const apiRouter = Router();

// ========================
// Authentication & Users
// ========================
apiRouter.get('/auth/users', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getUsers() });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const users = db.getUsers();
  // Allow passing ?userId=... to test as any role
  const userId = req.query.userId as string;
  const user = (userId && db.getUserById(userId)) || users[0];
  res.json({ success: true, data: user });
});

// ========================
// Dashboard & Analytics
// ========================
apiRouter.get('/dashboard/stats', (_req: Request, res: Response) => {
  const projects = db.getProjects();
  const total = projects.length;
  const pending = projects.filter(p => p.status === 'Pending Review').length;
  const approved = projects.filter(p => p.status === 'Approved').length;
  const rejected = projects.filter(p => p.status === 'Rejected').length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;

  let totalIncompleteElements = 0;
  let totalApplicableElements = 0;
  let totalApprovedElements = 0;

  projects.forEach(p => {
    p.elements.forEach(el => {
      if (el.isApplicable) {
        totalApplicableElements++;
        if (el.status === 'Approved') {
          totalApprovedElements++;
        } else {
          totalIncompleteElements++;
        }
      }
    });
  });

  const overallComplianceRate = totalApplicableElements > 0
    ? Math.round((totalApprovedElements / totalApplicableElements) * 100)
    : 0;

  // Level breakdown
  const byLevel = {
    1: projects.filter(p => p.submissionLevel === 1).length,
    2: projects.filter(p => p.submissionLevel === 2).length,
    3: projects.filter(p => p.submissionLevel === 3).length,
    4: projects.filter(p => p.submissionLevel === 4).length,
    5: projects.filter(p => p.submissionLevel === 5).length,
  };

  // Deadlines
  const upcomingDeadlines = projects
    .filter(p => p.status !== 'Approved')
    .map(p => {
      const targetDate = new Date(p.submissionDate);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        projectId: p.id,
        projectNumber: p.projectNumber,
        customerName: p.customerName,
        partName: p.partName,
        submissionDate: p.submissionDate,
        submissionLevel: p.submissionLevel,
        daysRemaining: diffDays,
        status: p.status,
        completionRate: Math.round((p.completedElements / (p.totalElements || 1)) * 100)
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const recentActivities = db.getAuditLogs().slice(0, 8);

  res.json({
    success: true,
    data: {
      totalProjects: total,
      pendingPPAP: pending,
      approvedPPAP: approved,
      rejectedPPAP: rejected,
      inProgressPPAP: inProgress,
      documentsIncomplete: totalIncompleteElements,
      overallComplianceRate,
      byLevel,
      upcomingDeadlines,
      recentActivities
    }
  });
});

// ========================
// Projects Management
// ========================
apiRouter.get('/projects', (req: Request, res: Response) => {
  let projects = db.getProjects();
  const { status, level, customer, search } = req.query;

  if (status && status !== 'ALL') {
    projects = projects.filter(p => p.status === status);
  }
  if (level && level !== 'ALL') {
    projects = projects.filter(p => p.submissionLevel === Number(level));
  }
  if (customer && customer !== 'ALL') {
    projects = projects.filter(p => p.customerName.toLowerCase().includes(String(customer).toLowerCase()));
  }
  if (search) {
    const q = String(search).toLowerCase();
    projects = projects.filter(
      p =>
        p.projectNumber.toLowerCase().includes(q) ||
        p.partName.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.responsibleEngineer.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: projects });
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  res.json({ success: true, data: project });
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  try {
    const newProject = db.createProject(req.body);
    res.status(201).json({ success: true, data: newProject });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/projects/:id', (req: Request, res: Response) => {
  const updated = db.updateProject(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
  const ok = db.deleteProject(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  res.json({ success: true, message: 'Project deleted' });
});

// ========================
// 18 Elements Management
// ========================
apiRouter.put('/projects/:id/elements/:elementId', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const elementId = Number(req.params.elementId);
  const { user = 'System User', role = 'Quality Engineer', ...updates } = req.body;

  const updated = db.updateElement(projectId, elementId, updates, user, role);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Element or project not found' });
  }
  res.json({ success: true, data: updated });
});

apiRouter.post('/projects/:id/elements/:elementId/upload', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const elementId = Number(req.params.elementId);
  const { fileName, fileSize = 204800, fileType = 'application/pdf', user = 'Quality Engineer', revision = 'Rev A' } = req.body;

  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

  const element = project.elements.find(e => e.id === elementId);
  if (!element) return res.status(404).json({ success: false, error: 'Element not found' });

  const attachment = {
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fileName: fileName || `${element.shortCode}_attachment.pdf`,
    fileSize,
    fileType,
    uploadedBy: user,
    uploadedAt: new Date().toISOString(),
    url: `/files/${encodeURIComponent(fileName || 'document.pdf')}`,
    revision
  };

  element.attachments.push(attachment);
  element.status = 'Pending Review';
  element.currentRevision = revision;
  element.updatedAt = new Date().toISOString();

  db.addAuditLog({
    projectId,
    projectNumber: project.projectNumber,
    user,
    userRole: 'Quality Engineer',
    action: 'UPLOAD_DOCUMENT',
    elementName: element.name,
    details: `Uploaded ${attachment.fileName} (${attachment.revision}) for Element ${element.id}.`
  });

  db.updateProject(projectId, {});

  res.json({ success: true, data: element });
});

// ========================
// Generic Element Table (All 18 Elements)
// ========================
apiRouter.get('/projects/:id/elements/:elementId/table', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const elementId = Number(req.params.elementId);
  const rows = db.getElementTable(projectId, elementId);
  res.json({ success: true, data: rows });
});

apiRouter.post('/projects/:id/elements/:elementId/table', (req: Request, res: Response) => {
  const projectId = req.params.id;
  const elementId = Number(req.params.elementId);
  const { rows, user = 'Quality Engineer' } = req.body;
  if (!Array.isArray(rows)) {
    return res.status(400).json({ success: false, error: 'Rows array is required' });
  }
  const saved = db.saveElementTable(projectId, elementId, rows, user);
  res.json({ success: true, data: saved });
});

// ========================
// PFMEA (AIAG & VDA)
// ========================
apiRouter.get('/projects/:id/pfmea', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getPFMEA(req.params.id) });
});

apiRouter.post('/projects/:id/pfmea', (req: Request, res: Response) => {
  const { rows, user = 'Quality Engineer' } = req.body;
  if (!Array.isArray(rows)) {
    return res.status(400).json({ success: false, error: 'Rows array is required' });
  }
  const saved = db.savePFMEA(req.params.id, rows, user);
  res.json({ success: true, data: saved });
});

// ========================
// Process Flow Diagram
// ========================
apiRouter.get('/projects/:id/process-flow', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getProcessFlow(req.params.id) });
});

apiRouter.post('/projects/:id/process-flow', (req: Request, res: Response) => {
  const { steps, user = 'Production Engineer' } = req.body;
  if (!Array.isArray(steps)) {
    return res.status(400).json({ success: false, error: 'Steps array is required' });
  }
  const saved = db.saveProcessFlow(req.params.id, steps, user);
  res.json({ success: true, data: saved });
});

// ========================
// Control Plan
// ========================
apiRouter.get('/projects/:id/control-plan', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getControlPlan(req.params.id) });
});

apiRouter.post('/projects/:id/control-plan', (req: Request, res: Response) => {
  const { rows, user = 'Quality Engineer' } = req.body;
  if (!Array.isArray(rows)) {
    return res.status(400).json({ success: false, error: 'Rows array is required' });
  }
  const saved = db.saveControlPlan(req.params.id, rows, user);
  res.json({ success: true, data: saved });
});

// ========================
// Dimensional Inspection Report
// ========================
apiRouter.get('/projects/:id/dimensional', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getDimensionalReport(req.params.id) });
});

apiRouter.post('/projects/:id/dimensional', (req: Request, res: Response) => {
  const { rows, user = 'Inspector' } = req.body;
  if (!Array.isArray(rows)) {
    return res.status(400).json({ success: false, error: 'Rows array is required' });
  }
  const saved = db.saveDimensionalReport(req.params.id, rows, user);
  res.json({ success: true, data: saved });
});

// ========================
// Part Submission Warrant (PSW)
// ========================
apiRouter.get('/projects/:id/psw', (req: Request, res: Response) => {
  const psw = db.getPSW(req.params.id);
  res.json({ success: true, data: psw });
});

apiRouter.post('/projects/:id/psw', (req: Request, res: Response) => {
  const { psw, user = 'Quality Manager' } = req.body;
  if (!psw) {
    return res.status(400).json({ success: false, error: 'PSW data is required' });
  }
  const saved = db.savePSW(req.params.id, psw, user);
  res.json({ success: true, data: saved });
});

// ========================
// AI Document Generator
// ========================
apiRouter.post('/ai/generate', async (req: Request, res: Response) => {
  console.log('--- [AI ROUTE] Received body:', req.body);
  try {
    const result = await generatePPAPDocumentWithAI(req.body);
    console.log('--- [AI ROUTE] Generated title:', result?.title);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('AI route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'AI generation failed' });
  }
});

// ========================
// Notifications & Audit Logs
// ========================
apiRouter.get('/notifications', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getNotifications() });
});

apiRouter.put('/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

apiRouter.post('/notifications/read-all', (_req: Request, res: Response) => {
  db.markAllNotificationsRead();
  res.json({ success: true });
});

apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined;
  res.json({ success: true, data: db.getAuditLogs(projectId) });
});
