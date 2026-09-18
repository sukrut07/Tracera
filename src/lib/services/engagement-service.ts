import {
  getDb,
  getEngagementById,
  getAllEngagements,
  createDbEngagement,
  updateDbEngagement,
  getEngagementStages,
  updateEngagementStage,
  getEngagementChecklist,
  updateEngagementChecklistItem,
  getEngagementTasks,
  createEngagementTask,
  updateEngagementTask,
  getEngagementApprovals,
  updateEngagementApproval,
  insertAuditLog,
  createDbNotification,
  getUserById,
  getClientById,
} from '@/lib/db';
import { WorkflowError } from '@/lib/workflow/service';
import {
  Engagement,
  EngagementServiceType,
  EngagementStatus,
  EngagementStage,
  EngagementChecklistItem,
  EngagementTask,
  EngagementApproval,
  TaskStatus,
  TaskPriority,
  UserProfile,
} from '@/types';
import crypto from 'crypto';

export interface CreateEngagementParams {
  clientId: string;
  title: string;
  serviceType: EngagementServiceType;
  financialYear: string;
  dueDate: string;
  partnerId?: string;
  managerId?: string;
  staffId?: string;
  billingAmount?: number;
}

export interface ClosurePrerequisites {
  canClose: boolean;
  totalChecks: number;
  passedChecks: number;
  checks: {
    id: string;
    title: string;
    description: string;
    passed: boolean;
  }[];
}

export const engagementService = {
  /**
   * Fetch engagement by ID with full relations
   */
  async getEngagement(id: string): Promise<Engagement> {
    const engagement = getEngagementById(id);
    if (!engagement) {
      throw new WorkflowError(404, `Engagement ${id} not found`);
    }
    return engagement;
  },

  /**
   * List engagements with optional filtering
   */
  async listEngagements(user: UserProfile, filters?: {
    clientId?: string;
    status?: EngagementStatus;
    serviceType?: string;
    search?: string;
  }): Promise<Engagement[]> {
    const activeFilters = { ...filters };
    if (user.role === 'CLIENT' && user.client_id) {
      activeFilters.clientId = user.client_id;
    }
    return getAllEngagements(activeFilters);
  },

  /**
   * Create a new Engagement based on Service Type Template
   */
  async createEngagement(user: UserProfile, params: CreateEngagementParams): Promise<Engagement> {
    if (user.role !== 'AUDITOR' && user.role !== 'ADMIN' && user.role !== 'PARTNER') {
      throw new WorkflowError(403, 'Forbidden: Only auditors, partners, and practice managers can initiate engagements');
    }

    const client = getClientById(params.clientId);
    if (!client) {
      throw new WorkflowError(404, 'Client not found');
    }

    const db = getDb();
    const engId = `eng-${params.serviceType.toLowerCase().slice(0, 4)}-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const partner = params.partnerId ? getUserById(params.partnerId) : null;
    const manager = params.managerId ? getUserById(params.managerId) : null;
    const staff = params.staffId ? getUserById(params.staffId) : null;

    const baseAmount = params.billingAmount || (params.serviceType === 'STATUTORY_AUDIT' ? 25000 : 20000);
    const gstAmount = Math.round(baseAmount * 0.18);
    const totalAmount = baseAmount + gstAmount;

    // Build stages and checklist from template
    const template = getServiceTemplate(params.serviceType);

    const stagesCount = template.stages.length;

    db.transaction(() => {
      // 1. Insert master engagement
      db.prepare(`
        INSERT INTO engagements (
          id, client_id, title, service_type, financial_year, status,
          current_stage_index, total_stages, progress_percent, due_date,
          assigned_partner_id, assigned_partner_name,
          assigned_manager_id, assigned_manager_name,
          assigned_staff_id, assigned_staff_name,
          billing_amount, billing_gst, billing_total, billing_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'PLANNING', 0, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
      `).run(
        engId,
        params.clientId,
        params.title.trim(),
        params.serviceType,
        params.financialYear,
        stagesCount,
        params.dueDate,
        partner?.id || null,
        partner?.name || null,
        manager?.id || null,
        manager?.name || null,
        staff?.id || null,
        staff?.name || null,
        baseAmount,
        gstAmount,
        totalAmount,
        now,
        now
      );

      // 2. Insert template stages
      const insertStage = db.prepare(`
        INSERT INTO engagement_stages (id, engagement_id, stage_number, name, status, owner_id, owner_name, due_date, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      template.stages.forEach((st, idx) => {
        insertStage.run(
          `stg-${engId}-${st.number}`,
          engId,
          st.number,
          st.name,
          idx === 0 ? 'IN_PROGRESS' : 'PENDING',
          manager?.id || user.id,
          manager?.name || user.name,
          params.dueDate,
          null
        );
      });

      // 3. Insert template checklist items
      const insertChecklist = db.prepare(`
        INSERT INTO engagement_checklists (id, engagement_id, title, category, is_mandatory, status, due_date)
        VALUES (?, ?, ?, ?, ?, 'REQUIRED', ?)
      `);

      template.checklist.forEach((item, idx) => {
        insertChecklist.run(
          `chk-${engId}-${idx + 1}`,
          engId,
          item.title,
          item.category,
          item.isMandatory ? 1 : 0,
          params.dueDate
        );
      });

      // 4. Insert template tasks
      const insertTask = db.prepare(`
        INSERT INTO engagement_tasks (id, engagement_id, title, stage_number, assigned_to, assigned_to_name, status, priority, due_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'TODO', ?, ?, ?)
      `);

      template.tasks.forEach((tsk, idx) => {
        insertTask.run(
          `tsk-${engId}-${idx + 1}`,
          engId,
          tsk.title,
          tsk.stageNumber,
          staff?.id || user.id,
          staff?.name || user.name,
          tsk.priority,
          params.dueDate,
          now
        );
      });

      // 5. Insert Maker-Checker Gates
      const insertApproval = db.prepare(`
        INSERT INTO engagement_approvals (id, engagement_id, role_gate, status)
        VALUES (?, ?, ?, 'PENDING')
      `);

      ['PERFORMER', 'REVIEWER', 'PARTNER'].forEach((gate) => {
        insertApproval.run(`app-${engId}-${gate}`, engId, gate);
      });

      // 6. Audit log
      insertAuditLog({
        engagement_id: engId,
        actor_id: user.id,
        action: 'ENGAGEMENT_CREATED',
        metadata: {
          title: params.title,
          service_type: params.serviceType,
          financial_year: params.financialYear,
          created_by: user.name,
        },
      });

      // 7. Notification to client
      const clientUsers = db.prepare("SELECT id FROM users WHERE client_id = ?").all(params.clientId) as { id: string }[];
      clientUsers.forEach((cu) => {
        createDbNotification({
          recipientId: cu.id,
          type: 'ENGAGEMENT_INITIATED',
          title: 'New Audit Engagement Initiated',
          message: `Your engagement "${params.title}" has been started for FY ${params.financialYear}.`,
          engagementId: engId,
        });
      });
    })();

    return getEngagementById(engId)!;
  },

  /**
   * Advance or set operational workflow stage
   */
  async advanceStage(
    user: UserProfile,
    engagementId: string,
    targetStageNumber: number,
    notes?: string
  ): Promise<Engagement> {
    if (user.role !== 'AUDITOR' && user.role !== 'ADMIN' && user.role !== 'PARTNER') {
      throw new WorkflowError(403, 'Forbidden: Only auditors can advance engagement stages');
    }

    const engagement = await this.getEngagement(engagementId);
    const stages = engagement.stages || [];
    const targetStage = stages.find((s) => s.stage_number === targetStageNumber);

    if (!targetStage) {
      throw new WorkflowError(400, `Invalid stage number: ${targetStageNumber}`);
    }

    const now = new Date().toISOString();

    // Mark previous stages as COMPLETED if advancing forward
    stages.forEach((st) => {
      if (st.stage_number < targetStageNumber && st.status !== 'COMPLETED') {
        updateEngagementStage(engagementId, st.stage_number, {
          status: 'COMPLETED',
          completed_at: now,
        });
      }
    });

    // Mark target stage IN_PROGRESS
    updateEngagementStage(engagementId, targetStageNumber, {
      status: 'IN_PROGRESS',
      notes: notes || undefined,
    });

    // Recalculate progress percent
    const updatedStages = getEngagementStages(engagementId);
    const completedCount = updatedStages.filter((s) => s.status === 'COMPLETED').length;
    const progressPercent = Math.min(100, Math.round((completedCount / updatedStages.length) * 100));

    // Determine high level status
    let highLevelStatus: EngagementStatus = engagement.status;
    if (targetStageNumber === 1) highLevelStatus = 'ACCEPTED';
    else if (targetStageNumber === 2) highLevelStatus = 'PLANNING';
    else if (targetStageNumber === 3) highLevelStatus = 'DOCUMENT_COLLECTION';
    else if (targetStageNumber <= 5) highLevelStatus = 'FIELDWORK';
    else if (targetStageNumber === 6) highLevelStatus = 'MANAGER_REVIEW';
    else if (targetStageNumber === 7) highLevelStatus = 'PARTNER_REVIEW';
    else if (targetStageNumber === 8) highLevelStatus = 'CLIENT_CONFIRMATION';
    else if (targetStageNumber === 9) highLevelStatus = 'READY_TO_CLOSE';

    updateDbEngagement(engagementId, {
      current_stage_index: targetStageNumber - 1,
      progress_percent: progressPercent,
      status: highLevelStatus,
    });

    // Audit log
    insertAuditLog({
      engagement_id: engagementId,
      actor_id: user.id,
      action: 'STAGE_ADVANCED',
      metadata: {
        to_stage_number: targetStageNumber,
        to_stage_name: targetStage.name,
        notes: notes || undefined,
        advanced_by: user.name,
      },
    });

    // Notify client users
    const db = getDb();
    const clientUsers = db.prepare("SELECT id FROM users WHERE client_id = ?").all(engagement.client_id) as { id: string }[];
    clientUsers.forEach((cu) => {
      createDbNotification({
        recipientId: cu.id,
        type: 'STAGE_ADVANCED',
        title: `Stage Update: ${targetStage.name}`,
        message: `Your engagement has progressed to "${targetStage.name}".`,
        engagementId,
      });
    });

    return getEngagementById(engagementId)!;
  },

  /**
   * Request a document from client for a checklist item
   */
  async requestChecklistDocument(
    user: UserProfile,
    engagementId: string,
    checklistItemId: string,
    message?: string,
    dueDate?: string
  ): Promise<EngagementChecklistItem> {
    if (user.role !== 'AUDITOR' && user.role !== 'ADMIN' && user.role !== 'PARTNER') {
      throw new WorkflowError(403, 'Forbidden: Only auditors can request checklist documents');
    }

    const engagement = await this.getEngagement(engagementId);
    const item = engagement.checklists?.find((c) => c.id === checklistItemId);
    if (!item) {
      throw new WorkflowError(404, 'Checklist item not found');
    }

    const now = new Date().toISOString();
    const updated = updateEngagementChecklistItem(checklistItemId, {
      status: 'REQUESTED',
      request_message: message || `Auditor requested document for "${item.title}"`,
      requested_at: now,
      due_date: dueDate || item.due_date || undefined,
    });

    // Append-only audit log
    insertAuditLog({
      engagement_id: engagementId,
      actor_id: user.id,
      action: 'DOCUMENT_REQUESTED',
      metadata: {
        checklist_title: item.title,
        message: message || undefined,
        due_date: dueDate || item.due_date,
      },
    });

    // Notify client
    const db = getDb();
    const clientUsers = db.prepare("SELECT id FROM users WHERE client_id = ?").all(engagement.client_id) as { id: string }[];
    clientUsers.forEach((cu) => {
      createDbNotification({
        recipientId: cu.id,
        type: 'DOCUMENT_REQUESTED',
        title: `Action Required: Document Requested`,
        message: `Please upload "${item.title}" for ${engagement.title}. ${message ? `Note: "${message}"` : ''}`,
        engagementId,
      });
    });

    return updated!;
  },

  /**
   * Link an uploaded document to a checklist item
   */
  async linkDocumentToChecklist(
    user: UserProfile,
    engagementId: string,
    checklistItemId: string,
    documentId: string
  ): Promise<EngagementChecklistItem> {
    const engagement = await this.getEngagement(engagementId);
    const item = engagement.checklists?.find((c) => c.id === checklistItemId);
    if (!item) {
      throw new WorkflowError(404, 'Checklist item not found');
    }

    // Tag document with engagement
    const db = getDb();
    db.prepare('UPDATE documents SET engagement_id = ? WHERE id = ?').run(engagementId, documentId);

    const docRow = db.prepare('SELECT status, title FROM documents WHERE id = ?').get(documentId) as any;
    const checklistStatus = docRow?.status === 'APPROVED' ? 'APPROVED' : 'SUBMITTED';

    const updated = updateEngagementChecklistItem(checklistItemId, {
      document_id: documentId,
      status: checklistStatus,
    });

    // Audit log
    insertAuditLog({
      engagement_id: engagementId,
      document_id: documentId,
      actor_id: user.id,
      action: 'DOCUMENT_LINKED_TO_CHECKLIST',
      metadata: {
        checklist_title: item.title,
        document_title: docRow?.title,
      },
    });

    return updated!;
  },

  /**
   * Create work item / task
   */
  async createTask(
    user: UserProfile,
    engagementId: string,
    taskData: {
      title: string;
      stageNumber?: number;
      assignedToId?: string;
      priority?: TaskPriority;
      dueDate?: string;
    }
  ): Promise<EngagementTask> {
    if (user.role !== 'AUDITOR' && user.role !== 'ADMIN' && user.role !== 'PARTNER') {
      throw new WorkflowError(403, 'Forbidden: Only auditors can create engagement tasks');
    }

    const assignedUser = taskData.assignedToId ? getUserById(taskData.assignedToId) : user;

    const task = createEngagementTask({
      engagement_id: engagementId,
      title: taskData.title.trim(),
      stage_number: taskData.stageNumber || 1,
      assigned_to: assignedUser?.id || user.id,
      assigned_to_name: assignedUser?.name || user.name,
      priority: taskData.priority || 'MEDIUM',
      due_date: taskData.dueDate,
      status: 'TODO',
    });

    insertAuditLog({
      engagement_id: engagementId,
      actor_id: user.id,
      action: 'TASK_CREATED',
      metadata: {
        task_id: task.id,
        task_title: task.title,
        assigned_to: assignedUser?.name,
      },
    });

    return task;
  },

  /**
   * Update work item / task (including Blocker assignment)
   */
  async updateTask(
    user: UserProfile,
    engagementId: string,
    taskId: string,
    updates: {
      status?: TaskStatus;
      priority?: TaskPriority;
      blocker_reason?: string | null;
      blocked_by?: string | null;
      assigned_to?: string;
    }
  ): Promise<EngagementTask> {
    const tasks = getEngagementTasks(engagementId);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new WorkflowError(404, 'Task not found');
    }

    const now = new Date().toISOString();
    const taskUpdates: Partial<EngagementTask> = {};

    if (updates.status) {
      taskUpdates.status = updates.status;
      if (updates.status === 'COMPLETED') {
        taskUpdates.completed_at = now;
        taskUpdates.blocker_reason = null;
        taskUpdates.blocked_by = null;
      }
    }

    if (updates.priority) {
      taskUpdates.priority = updates.priority;
    }

    if (updates.status === 'BLOCKED' || updates.blocked_by) {
      taskUpdates.blocked_by = updates.blocked_by || 'Client';
      taskUpdates.blocker_reason = updates.blocker_reason || 'Pending client information';
      taskUpdates.status = 'BLOCKED';
    } else if (updates.status) {
      taskUpdates.blocker_reason = null;
      taskUpdates.blocked_by = null;
    }

    if (updates.assigned_to) {
      const assignee = getUserById(updates.assigned_to);
      if (assignee) {
        taskUpdates.assigned_to = assignee.id;
        taskUpdates.assigned_to_name = assignee.name;
      }
    }

    const updatedTask = updateEngagementTask(taskId, taskUpdates);

    // Audit log
    insertAuditLog({
      engagement_id: engagementId,
      actor_id: user.id,
      action: taskUpdates.status === 'BLOCKED' ? 'TASK_BLOCKED' : 'TASK_UPDATED',
      metadata: {
        task_id: taskId,
        task_title: task.title,
        status: updatedTask?.status,
        blocker_reason: updatedTask?.blocker_reason || undefined,
        blocked_by: updatedTask?.blocked_by || undefined,
      },
    });

    return updatedTask!;
  },

  /**
   * Multi-tier Maker-Checker Approval Sign-off
   */
  async submitApproval(
    user: UserProfile,
    engagementId: string,
    roleGate: 'PERFORMER' | 'REVIEWER' | 'PARTNER',
    status: 'APPROVED' | 'REJECTED',
    remarks?: string
  ): Promise<EngagementApproval> {
    if (user.role !== 'AUDITOR' && user.role !== 'ADMIN' && user.role !== 'PARTNER') {
      throw new WorkflowError(403, 'Forbidden: Only audit personnel can sign off approvals');
    }

    const engagement = await this.getEngagement(engagementId);
    const approvals = engagement.approvals || [];

    // Enforce Maker-Checker Hierarchy
    if (roleGate === 'REVIEWER') {
      const performerApproval = approvals.find((a) => a.role_gate === 'PERFORMER');
      if (!performerApproval || performerApproval.status !== 'APPROVED') {
        throw new WorkflowError(400, 'Sequence requirement: Staff Performer must complete sign-off before Manager Review');
      }
    } else if (roleGate === 'PARTNER') {
      const reviewerApproval = approvals.find((a) => a.role_gate === 'REVIEWER');
      if (!reviewerApproval || reviewerApproval.status !== 'APPROVED') {
        throw new WorkflowError(400, 'Sequence requirement: Manager Reviewer must approve before Partner Sign-off');
      }
    }

    const now = new Date().toISOString();
    const updated = updateEngagementApproval(engagementId, roleGate, {
      status,
      approver_id: user.id,
      approver_name: user.name,
      remarks: remarks || `Signed off by ${user.name}`,
      approved_at: status === 'APPROVED' ? now : null,
    });

    // Audit log
    insertAuditLog({
      engagement_id: engagementId,
      actor_id: user.id,
      action: 'MAKER_CHECKER_SIGN_OFF',
      metadata: {
        role_gate: roleGate,
        status,
        remarks: remarks || undefined,
        approver: user.name,
      },
    });

    // If Partner signs off, update engagement status to READY_TO_CLOSE
    if (roleGate === 'PARTNER' && status === 'APPROVED') {
      updateDbEngagement(engagementId, { status: 'READY_TO_CLOSE' });
    }

    return updated!;
  },

  /**
   * Record payment for engagement fee
   */
  async recordPayment(
    user: UserProfile,
    engagementId: string,
    paymentReference: string
  ): Promise<Engagement> {
    const engagement = await this.getEngagement(engagementId);
    const now = new Date().toISOString();

    updateDbEngagement(engagementId, {
      billing_status: 'PAID',
      payment_reference: paymentReference.trim(),
      paid_at: now,
    });

    insertAuditLog({
      engagement_id: engagementId,
      actor_id: user.id,
      action: 'PAYMENT_RECORDED',
      metadata: {
        amount: engagement.billing_total,
        payment_reference: paymentReference.trim(),
        recorded_by: user.name,
      },
    });

    // Notify client and auditor
    const db = getDb();
    const clientUsers = db.prepare("SELECT id FROM users WHERE client_id = ?").all(engagement.client_id) as { id: string }[];
    clientUsers.forEach((cu) => {
      createDbNotification({
        recipientId: cu.id,
        type: 'PAYMENT_CONFIRMED',
        title: 'Fee Payment Acknowledged',
        message: `Payment of ₹${engagement.billing_total.toLocaleString('en-IN')} for ${engagement.title} recorded (Ref: ${paymentReference}).`,
        engagementId,
      });
    });

    return getEngagementById(engagementId)!;
  },

  /**
   * Evaluate the 5 formal closure gate criteria
   */
  checkClosurePrerequisites(engagement: Engagement): ClosurePrerequisites {
    const stages = engagement.stages || [];
    const checklists = engagement.checklists || [];
    const tasks = engagement.tasks || [];
    const approvals = engagement.approvals || [];

    // 1. Mandatory Stages (Operational stages 1 through total_stages - 1)
    const incompleteStages = stages.filter(
      (s) => s.stage_number < stages.length - 1 && s.status !== 'COMPLETED'
    );
    const stagesCheck = {
      id: 'stages',
      title: 'Operational Workflow Stages',
      description: incompleteStages.length === 0
        ? `Operational fieldwork & review stages completed`
        : `${incompleteStages.length} operational stage(s) still pending completion`,
      passed: incompleteStages.length === 0,
    };

    // 2. Mandatory Checklist Documents
    const unapprovedDocs = checklists.filter((c) => c.is_mandatory && c.status !== 'APPROVED' && c.status !== 'WAIVED');
    const docsCheck = {
      id: 'documents',
      title: 'Mandatory Document Evidence',
      description: unapprovedDocs.length === 0
        ? `All ${checklists.filter((c) => c.is_mandatory).length} mandatory checklist documents approved`
        : `${unapprovedDocs.length} mandatory document(s) missing or not yet approved`,
      passed: unapprovedDocs.length === 0,
    };

    // 3. Open Tasks & Blockers
    const blockedOrOpenTasks = tasks.filter((t) => t.status === 'BLOCKED' || t.status === 'IN_PROGRESS');
    const tasksCheck = {
      id: 'tasks',
      title: 'Audit Procedures & Tasks',
      description: blockedOrOpenTasks.length === 0
        ? 'No active blockers or pending fieldwork tasks'
        : `${blockedOrOpenTasks.length} task(s) active or blocked`,
      passed: blockedOrOpenTasks.length === 0,
    };

    // 4. Maker-Checker 3-Tier Sign-off
    const partnerApproval = approvals.find((a) => a.role_gate === 'PARTNER');
    const managerApproval = approvals.find((a) => a.role_gate === 'REVIEWER');
    const performerApproval = approvals.find((a) => a.role_gate === 'PERFORMER');
    const approvalsPassed =
      partnerApproval?.status === 'APPROVED' &&
      managerApproval?.status === 'APPROVED' &&
      performerApproval?.status === 'APPROVED';

    const approvalsCheck = {
      id: 'approvals',
      title: 'Maker-Checker Sign-off Chain',
      description: approvalsPassed
        ? 'Staff Performer, Manager Reviewer & Partner Sign-off complete'
        : 'All 3 approval tiers (Performer, Manager, Partner) required prior to closure',
      passed: Boolean(approvalsPassed),
    };

    // 5. Open Issues & Blockers
    const openIssues = (engagement.issues || []).filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS');
    const issuesCheck = {
      id: 'issues',
      title: 'Open Issues & Client Blockers',
      description: openIssues.length === 0
        ? 'No active client blockers or unresolved audit issues'
        : `${openIssues.length} unresolved issue(s) remaining`,
      passed: openIssues.length === 0,
    };

    // 6. Billing & Fee Settlement
    const billingPassed = engagement.billing_status === 'PAID';
    const billingCheck = {
      id: 'billing',
      title: 'Professional Fee Settlement',
      description: billingPassed
        ? `Settled: ₹${engagement.billing_total.toLocaleString('en-IN')} (Ref: ${engagement.payment_reference || 'Confirmed'})`
        : `Outstanding: ₹${engagement.billing_total.toLocaleString('en-IN')} (Invoice ${engagement.billing_status})`,
      passed: billingPassed,
    };

    const checks = [stagesCheck, docsCheck, tasksCheck, approvalsCheck, issuesCheck, billingCheck];
    const passedCount = checks.filter((c) => c.passed).length;

    return {
      canClose: passedCount === checks.length,
      totalChecks: checks.length,
      passedChecks: passedCount,
      checks,
    };
  },

  /**
   * Finalize and seal CA Engagement Closure
   */
  async closeEngagement(
    user: UserProfile,
    engagementId: string,
    closureSummary: string
  ): Promise<Engagement> {
    if (user.role !== 'AUDITOR' && user.role !== 'ADMIN' && user.role !== 'PARTNER') {
      throw new WorkflowError(403, 'Forbidden: Only authorized CA partners/auditors can close an engagement');
    }

    const engagement = await this.getEngagement(engagementId);
    if (engagement.status === 'CLOSED') {
      throw new WorkflowError(400, 'Engagement is already closed');
    }

    const prereqs = this.checkClosurePrerequisites(engagement);
    if (!prereqs.canClose) {
      const failing = prereqs.checks.filter((c) => !c.passed).map((c) => c.title).join(', ');
      throw new WorkflowError(400, `Cannot close engagement. Pending requirements: ${failing}`);
    }

    const year = new Date().getFullYear();
    const closureRand = crypto.randomInt(10000, 100000);
    const closureId = `AUD-${year}-${closureRand}`;
    const now = new Date().toISOString();

    const db = getDb();
    db.transaction(() => {
      // Mark final stages completed
      updateEngagementStage(engagementId, engagement.total_stages - 1, {
        status: 'COMPLETED',
        completed_at: now,
      });
      updateEngagementStage(engagementId, engagement.total_stages, {
        status: 'COMPLETED',
        completed_at: now,
      });

      // Update engagement to CLOSED
      updateDbEngagement(engagementId, {
        status: 'CLOSED',
        progress_percent: 100,
        current_stage_index: engagement.total_stages - 1,
        closure_id: closureId,
        closed_at: now,
        closed_by_id: user.id,
        closed_by_name: user.name,
        closure_summary: closureSummary.trim() || 'Engagement successfully concluded in compliance with ICAI standards.',
      });

      // Audit log
      insertAuditLog({
        engagement_id: engagementId,
        actor_id: user.id,
        action: 'ENGAGEMENT_CLOSED',
        metadata: {
          closure_id: closureId,
          closed_by: user.name,
          summary: closureSummary,
        },
      });
    })();

    // Celebrate & notify client
    const clientUsers = db.prepare("SELECT id FROM users WHERE client_id = ?").all(engagement.client_id) as { id: string }[];
    clientUsers.forEach((cu) => {
      createDbNotification({
        recipientId: cu.id,
        type: 'ENGAGEMENT_CLOSED',
        title: `Audit Completed & Closed (ID: ${closureId})`,
        message: `Your engagement "${engagement.title}" has been successfully completed. Download the official signed CA Engagement Closure Report.`,
        engagementId,
      });
    });

    return getEngagementById(engagementId)!;
  },
};

/**
 * Service Templates for CA Practice Types
 */
function getServiceTemplate(type: EngagementServiceType) {
  switch (type) {
    case 'STATUTORY_AUDIT':
      return {
        stages: [
          { number: 1, name: '01 Engagement Acceptance' },
          { number: 2, name: '02 Planning & Risk Assessment' },
          { number: 3, name: '03 Document Collection' },
          { number: 4, name: '04 Preliminary Review' },
          { number: 5, name: '05 Fieldwork & Substantive Testing' },
          { number: 6, name: '06 Manager Review' },
          { number: 7, name: '07 Partner Review' },
          { number: 8, name: '08 Client Confirmation' },
          { number: 9, name: '09 Finalisation & Reporting' },
          { number: 10, name: '10 Engagement Closure' },
        ],
        checklist: [
          { title: 'Trial Balance', category: 'Financials', isMandatory: true },
          { title: 'General Ledger', category: 'Books of Accounts', isMandatory: true },
          { title: 'Bank Statements (All 4 Quarters)', category: 'Banking', isMandatory: true },
          { title: 'Purchase Register with GSTR-2B Recon', category: 'Purchases & GST', isMandatory: true },
          { title: 'Sales Register with GSTR-1 Recon', category: 'Sales & GST', isMandatory: true },
          { title: 'GST Returns (GSTR-3B & GSTR-1 Files)', category: 'Statutory', isMandatory: true },
          { title: 'TDS Returns & Form 26AS / AIS', category: 'Taxation', isMandatory: true },
          { title: 'Fixed Asset Register & Depreciation Schedule', category: 'Fixed Assets', isMandatory: true },
          { title: 'Debtor Ageing & Balance Confirmations', category: 'Receivables', isMandatory: true },
          { title: 'Creditor Ageing & MSME Classification', category: 'Payables', isMandatory: true },
          { title: 'Previous Year Signed Financial Statements', category: 'Prior Year', isMandatory: true },
          { title: 'Director Signing Declarations & MGT-7', category: 'Corporate Compliance', isMandatory: true },
        ],
        tasks: [
          { title: 'Verify Bank Reconciliation Statement (BRS)', stageNumber: 3, priority: 'HIGH' as TaskPriority },
          { title: 'Reconcile Purchase Register with GSTR-2B', stageNumber: 3, priority: 'URGENT' as TaskPriority },
          { title: 'Fixed Asset physical verification sample selection', stageNumber: 4, priority: 'MEDIUM' as TaskPriority },
          { title: 'TDS Challan & 26AS matching', stageNumber: 4, priority: 'MEDIUM' as TaskPriority },
          { title: 'Statutory Audit Checklist Sign-off', stageNumber: 5, priority: 'HIGH' as TaskPriority },
        ],
      };

    case 'TAX_AUDIT':
      return {
        stages: [
          { number: 1, name: '01 Engagement Acceptance' },
          { number: 2, name: '02 Planning & Scope' },
          { number: 3, name: '03 Books of Accounts Verification' },
          { number: 4, name: '04 Form 3CD Clause Testing' },
          { number: 5, name: '05 Manager Tax Review' },
          { number: 6, name: '06 Partner Sign-off' },
          { number: 7, name: '07 Form 3CA/3CB Upload' },
          { number: 8, name: '08 Engagement Closure' },
        ],
        checklist: [
          { title: 'Audited Financial Statements', category: 'Financials', isMandatory: true },
          { title: 'Form 3CD Clause Supporting Schedules', category: 'Tax Audit', isMandatory: true },
          { title: 'Tax Audit Working Papers & Computation', category: 'Tax Audit', isMandatory: true },
          { title: 'Section 40A(3) Cash Payments Statement', category: 'Disallowances', isMandatory: true },
          { title: 'Section 43B Statutory Dues Schedule', category: 'Disallowances', isMandatory: true },
          { title: 'Depreciation Schedule (IT Act vs Co Act)', category: 'Fixed Assets', isMandatory: true },
          { title: 'Form 26AS, AIS & TIS Tax Credit Dump', category: 'Taxation', isMandatory: true },
          { title: 'GSTR-9 & 9C Annual Returns', category: 'GST', isMandatory: true },
        ],
        tasks: [
          { title: 'Verify 43B delayed payment challans', stageNumber: 4, priority: 'HIGH' as TaskPriority },
          { title: 'Depreciation recalculation under Section 32', stageNumber: 4, priority: 'MEDIUM' as TaskPriority },
          { title: 'Verify MSME 45-day payment compliance', stageNumber: 4, priority: 'URGENT' as TaskPriority },
        ],
      };

    case 'GST_COMPLIANCE':
      return {
        stages: [
          { number: 1, name: '01 Acceptance' },
          { number: 2, name: '02 Data Ingestion & Recon' },
          { number: 3, name: '03 ITC Eligibility Testing' },
          { number: 4, name: '04 Annual Return Preparation' },
          { number: 5, name: '05 Partner Review' },
          { number: 6, name: '06 Engagement Closure' },
        ],
        checklist: [
          { title: 'Monthly GSTR-1 JSON and Filed Returns', category: 'Returns', isMandatory: true },
          { title: 'Monthly GSTR-3B Filed Returns', category: 'Returns', isMandatory: true },
          { title: 'GSTR-2B Full Year Consolidated Dump', category: 'ITC', isMandatory: true },
          { title: 'Books Turnover & Tax Rate Classification', category: 'Reconciliation', isMandatory: true },
          { title: 'RCM Liability Payment Proofs', category: 'Reverse Charge', isMandatory: true },
          { title: 'E-Way Bill vs Invoice Recon Register', category: 'Logistics', isMandatory: false },
        ],
        tasks: [
          { title: 'Perform Table 8A GSTR-2A/2B ITC reconciliation', stageNumber: 2, priority: 'URGENT' as TaskPriority },
          { title: 'Reconcile turnover with audited profit & loss statement', stageNumber: 4, priority: 'HIGH' as TaskPriority },
        ],
      };

    case 'ITR_FILING':
      return {
        stages: [
          { number: 1, name: '01 Scope & Information Collection' },
          { number: 2, name: '02 Computation of Total Income' },
          { number: 3, name: '03 Review & Tax Optimization' },
          { number: 4, name: '04 Client Confirmation & E-filing' },
          { number: 5, name: '05 Engagement Closure' },
        ],
        checklist: [
          { title: 'Audited Financials / P&L Balance Sheet', category: 'Financials', isMandatory: true },
          { title: 'Form 26AS, AIS, and TIS Summary', category: 'Tax Credits', isMandatory: true },
          { title: 'Advance Tax & Self Assessment Tax Challans', category: 'Challans', isMandatory: true },
          { title: 'Foreign Asset / Income Reporting Disclosures', category: 'Compliance', isMandatory: false },
          { title: 'Director / Signatory DSC Verification', category: 'Signing', isMandatory: true },
        ],
        tasks: [
          { title: 'Compute advance tax interest under Sec 234A/B/C', stageNumber: 2, priority: 'HIGH' as TaskPriority },
          { title: 'Verify TDS deductions with 26AS Part A/B', stageNumber: 2, priority: 'MEDIUM' as TaskPriority },
        ],
      };
  }
}
