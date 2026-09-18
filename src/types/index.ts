export type Role = 'CLIENT' | 'AUDITOR' | 'ADMIN';

export type DocumentType =
  | 'BANK_STATEMENT'
  | 'INVOICE'
  | 'PURCHASE_REGISTER'
  | 'GST_DOCUMENT'
  | 'TDS_CERTIFICATE'
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
  | 'DOCUMENT_APPROVED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  client_id: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company_name: string;
  financial_year: string;
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
  document_id: string;
  actor_id: string;
  actor_name?: string;
  actor_role?: Role;
  performed_by_name?: string;
  performed_by_role?: Role;
  action: AuditAction;
  metadata: {
    version?: number;
    reason?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    comment?: string;
    file_name?: string;
    assigned_to_name?: string;
    previous_status?: DocumentStatus;
    new_status?: DocumentStatus;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface AuditDocument {
  id: string;
  client_id: string;
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
