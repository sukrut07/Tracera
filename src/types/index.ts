export type Role = 'CLIENT' | 'AUDITOR' | 'ADMIN' | 'PARTNER';

export type DocumentType =
  | 'BANK_STATEMENT'
  | 'SALES_REGISTER'
  | 'PURCHASE_REGISTER'
  | 'GST_DOCUMENT'
  | 'EXPENSE_SUMMARY'
  | 'INVOICE'
  | 'TDS_CERTIFICATE'
  | 'FIXED_ASSET_REGISTER'
  | 'OTHER';

export type DocumentStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'APPROVED';

export type AuditAction =
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_ASSIGNED'
  | 'REVIEW_STARTED'
  | 'CORRECTION_REQUESTED'
  | 'CORRECTION_UPLOADED'
  | 'DOCUMENT_APPROVED'
  | 'STAGE_CHANGED'
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'ISSUE_CREATED'
  | 'ISSUE_RESOLVED'
  | 'PAYMENT_RECORDED'
  | 'ENGAGEMENT_CREATED'
  | 'ENGAGEMENT_CLOSED'
  | 'APPROVAL_SUBMITTED';

export interface Firm {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  client_id: string | null;
  firm_id?: string | null;
  organization?: string | null;
  phone?: string | null;
  firebase_uid?: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company_name: string;
  firm_id?: string | null;
  legal_name?: string | null;
  contact_person?: string | null;
  gstin?: string | null;
  pan?: string | null;
  financial_year: string;
  phone?: string | null;
  address?: string | null;
  industry?: string | null;
  assigned_auditor?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_by: string;
  uploaded_at: string;
  notes?: string | null;
  uploader?: UserProfile;
}

export interface Review {
  id: string;
  document_id: string;
  version_id: string;
  reviewer_id: string;
  status: 'APPROVED' | 'CORRECTION_REQUIRED';
  comment?: string | null;
  remarks?: string | null;
  created_at: string;
  reviewer?: UserProfile;
}

export interface AuditLog {
  id: string;
  document_id?: string;
  engagement_id?: string;
  actor_id: string;
  actor_name?: string;
  actor_role?: Role;
  performed_by_name?: string;
  performed_by_role?: Role;
  action: string;
  metadata: {
    version?: number;
    reason?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    comment?: string;
    file_name?: string;
    assigned_to_name?: string;
    previous_status?: DocumentStatus | EngagementStatus;
    new_status?: DocumentStatus | EngagementStatus;
    stage?: string;
    amount?: number;
    reference?: string;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface AuditDocument {
  id: string;
  client_id: string;
  firm_id?: string | null;
  engagement_id?: string | null;
  title: string;
  document_type: DocumentType;
  status: DocumentStatus;
  current_version: number;
  assigned_to: string | null;
  file_name?: string;
  latest_correction_reason?: string;
  latest_review?: Review;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  client?: Client;
  assigned_auditor?: UserProfile;
  versions?: DocumentVersion[];
  reviews?: Review[];
  audit_logs?: AuditLog[];
  current_review?: Review;
}

export interface DashboardStats {
  total_documents: number;
  pending_reviews: number;
  under_review: number;
  corrections_required: number;
  approved_today: number;
  approved_total: number;
}

export interface Notification {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  document_id?: string;
  engagement_id?: string;
  read?: boolean | number;
  is_read?: boolean;
  link_url?: string;
  created_at: string;
}

// -------------------------------------------------------------
// CA Engagement Types
// -------------------------------------------------------------

export type EngagementServiceType =
  | 'STATUTORY_AUDIT'
  | 'TAX_AUDIT'
  | 'GST_COMPLIANCE'
  | 'ITR_FILING';

export type EngagementStatus =
  | 'DRAFT'
  | 'ACCEPTED'
  | 'PLANNING'
  | 'DOCUMENT_COLLECTION'
  | 'IN_REVIEW'
  | 'FIELDWORK'
  | 'MANAGER_REVIEW'
  | 'PARTNER_REVIEW'
  | 'CLIENT_CONFIRMATION'
  | 'READY_TO_CLOSE'
  | 'CLOSED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'IN_REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface EngagementStage {
  id: string;
  engagement_id: string;
  stage_number: number;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  owner_id?: string | null;
  owner_name?: string;
  due_date?: string;
  completed_at?: string | null;
  notes?: string | null;
}

export interface EngagementChecklistItem {
  id: string;
  engagement_id: string;
  title: string;
  category: string;
  is_mandatory: boolean;
  status: 'REQUIRED' | 'REQUESTED' | 'SUBMITTED' | 'APPROVED' | 'WAIVED';
  document_id?: string | null;
  request_message?: string | null;
  requested_at?: string | null;
  due_date?: string | null;
  matched_document?: AuditDocument;
}

export interface EngagementTask {
  id: string;
  engagement_id: string;
  title: string;
  stage_number?: number;
  assigned_to?: string | null;
  assigned_to_name?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  blocker_reason?: string | null;
  blocked_by?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface EngagementApproval {
  id: string;
  engagement_id: string;
  role_gate: 'PERFORMER' | 'REVIEWER' | 'PARTNER';
  approver_id?: string | null;
  approver_name?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string | null;
  approved_at?: string | null;
}

export interface Engagement {
  id: string;
  client_id: string;
  title: string;
  service_type: EngagementServiceType;
  financial_year: string;
  status: EngagementStatus;
  current_stage_index: number;
  total_stages: number;
  progress_percent: number;
  due_date: string;
  assigned_partner_id?: string | null;
  assigned_partner_name?: string;
  assigned_manager_id?: string | null;
  assigned_manager_name?: string;
  assigned_staff_id?: string | null;
  assigned_staff_name?: string;
  billing_amount: number;
  billing_gst: number;
  billing_total: number;
  billing_status: 'PENDING' | 'INVOICED' | 'PAID';
  payment_reference?: string | null;
  paid_at?: string | null;
  closure_id?: string | null;
  closed_at?: string | null;
  closed_by_id?: string | null;
  closed_by_name?: string;
  closure_summary?: string | null;
  created_at: string;
  updated_at: string;

  // Joined fields
  client?: Client;
  stages?: EngagementStage[];
  checklists?: EngagementChecklistItem[];
  tasks?: EngagementTask[];
  approvals?: EngagementApproval[];
  documents?: AuditDocument[];
  audit_logs?: AuditLog[];
  issues?: EngagementIssue[];
  billing_records?: BillingRecord[];
  document_requests?: DocumentRequest[];
}

export interface EngagementIssue {
  id: string;
  engagement_id: string;
  title: string;
  description?: string;
  owner_id?: string | null;
  owner_name?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  blocked_by_client: boolean | number;
  due_date?: string;
  resolved_at?: string | null;
  created_at: string;
}

export interface BillingRecord {
  id: string;
  engagement_id: string;
  invoice_number?: string;
  fee: number;
  gst: number;
  total: number;
  status: 'DRAFT' | 'ISSUED' | 'PAYMENT_PENDING' | 'PAID';
  payment_method?: string;
  payment_reference?: string;
  recorded_by_id?: string | null;
  recorded_by_name?: string;
  recorded_at?: string;
  created_at: string;
}

export interface DocumentRequest {
  id: string;
  engagement_id?: string;
  document_type: string;
  description?: string;
  requested_by_id: string;
  requested_by_name?: string;
  requested_from_id?: string;
  channels: string[];
  status: 'REQUESTED' | 'SUBMITTED' | 'APPROVED' | 'CANCELLED';
  due_date?: string;
  fulfilled_document_id?: string | null;
  created_at: string;
}

