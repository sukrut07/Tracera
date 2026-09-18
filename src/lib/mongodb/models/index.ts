import mongoose, { Schema, Model } from 'mongoose';

// 1. User Schema
export interface IUser {
  firebaseUid?: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'AUDITOR' | 'ADMIN';
  clientId?: mongoose.Types.ObjectId | string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, sparse: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['CLIENT', 'AUDITOR', 'ADMIN'], required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

// 2. Client Schema
export interface IClient {
  companyName: string;
  contactPerson: string;
  email: string;
  financialYear: string;
  assignedAuditorIds: mongoose.Types.ObjectId[] | string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    companyName: { type: String, required: true, index: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    financialYear: { type: String, default: '2024-25' },
    assignedAuditorIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

// 3. Document Schema
export interface IDocument {
  clientId: mongoose.Types.ObjectId | string;
  title: string;
  documentType: 'BANK_STATEMENT' | 'INVOICE' | 'PURCHASE_REGISTER' | 'GST_DOCUMENT' | 'TDS_CERTIFICATE' | 'RECEIPT' | 'OTHER';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CORRECTION_REQUIRED' | 'APPROVED';
  currentVersion: number;
  assignedAuditorId?: mongoose.Types.ObjectId | string;
  createdBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    title: { type: String, required: true },
    documentType: {
      type: String,
      enum: ['BANK_STATEMENT', 'INVOICE', 'PURCHASE_REGISTER', 'GST_DOCUMENT', 'TDS_CERTIFICATE', 'RECEIPT', 'OTHER'],
      required: true,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'CORRECTION_REQUIRED', 'APPROVED'],
      default: 'SUBMITTED',
      index: true,
    },
    currentVersion: { type: Number, default: 1 },
    assignedAuditorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// 4. Document Version Schema
export interface IDocumentVersion {
  documentId: mongoose.Types.ObjectId | string;
  versionNumber: number;
  fileName: string;
  storagePath: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: mongoose.Types.ObjectId | string;
  uploadSource?: string;
  extractedDataId?: mongoose.Types.ObjectId | string;
  notes?: string;
  uploadedAt: Date;
}

const DocumentVersionSchema = new Schema<IDocumentVersion>({
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  versionNumber: { type: Number, required: true },
  fileName: { type: String, required: true },
  storagePath: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, default: 'application/octet-stream' },
  fileSize: { type: Number, default: 0 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadSource: { type: String, default: 'WEB' },
  extractedDataId: { type: Schema.Types.ObjectId, ref: 'ExtractedDocumentData' },
  notes: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});
DocumentVersionSchema.index({ documentId: 1, versionNumber: 1 }, { unique: true });

// 5. Review Schema
export interface IReview {
  documentId: mongoose.Types.ObjectId | string;
  versionId: mongoose.Types.ObjectId | string;
  reviewerId: mongoose.Types.ObjectId | string;
  decision: 'APPROVED' | 'CORRECTION_REQUIRED';
  checklist?: Record<string, 'PASS' | 'FAIL' | 'NOT_APPLICABLE'>;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    versionId: { type: Schema.Types.ObjectId, ref: 'DocumentVersion', required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    decision: { type: String, enum: ['APPROVED', 'CORRECTION_REQUIRED'], required: true },
    checklist: { type: Schema.Types.Mixed },
    comment: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// 6. Correction Request Schema
export interface ICorrectionRequest {
  documentId: mongoose.Types.ObjectId | string;
  versionId: mongoose.Types.ObjectId | string;
  requestedBy: mongoose.Types.ObjectId | string;
  reason: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'RESOLVED';
  resolvedAt?: Date;
  createdAt: Date;
}

const CorrectionRequestSchema = new Schema<ICorrectionRequest>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    versionId: { type: Schema.Types.ObjectId, ref: 'DocumentVersion', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    priority: { type: String, enum: ['NORMAL', 'HIGH', 'URGENT'], default: 'HIGH' },
    status: { type: String, enum: ['OPEN', 'RESOLVED'], default: 'OPEN' },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// 7. Audit Log Schema (Append-Only)
export interface IAuditLog {
  documentId: mongoose.Types.ObjectId | string;
  actorId: mongoose.Types.ObjectId | string;
  actorRole: 'CLIENT' | 'AUDITOR' | 'ADMIN';
  action: 'DOCUMENT_UPLOADED' | 'DOCUMENT_ASSIGNED' | 'REVIEW_STARTED' | 'CORRECTION_REQUESTED' | 'CORRECTION_UPLOADED' | 'DOCUMENT_APPROVED' | 'DOCUMENT_VIEWED';
  versionId?: mongoose.Types.ObjectId | string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String, enum: ['CLIENT', 'AUDITOR', 'ADMIN'], required: true },
  action: {
    type: String,
    enum: [
      'DOCUMENT_UPLOADED',
      'DOCUMENT_ASSIGNED',
      'REVIEW_STARTED',
      'CORRECTION_REQUESTED',
      'CORRECTION_UPLOADED',
      'DOCUMENT_APPROVED',
      'DOCUMENT_VIEWED',
    ],
    required: true,
  },
  versionId: { type: Schema.Types.ObjectId, ref: 'DocumentVersion' },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
  ipAddress: { type: String },
});

// 8. Notification Schema
export interface INotification {
  recipientId: mongoose.Types.ObjectId | string;
  type: 'DOCUMENT_SUBMITTED' | 'CORRECTION_REQUESTED' | 'CORRECTION_UPLOADED' | 'DOCUMENT_APPROVED';
  title: string;
  message: string;
  documentId?: mongoose.Types.ObjectId | string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['DOCUMENT_SUBMITTED', 'CORRECTION_REQUESTED', 'CORRECTION_UPLOADED', 'DOCUMENT_APPROVED'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// 9. Extracted Document Data Schema (OCR)
export interface IExtractedDocumentData {
  documentId: mongoose.Types.ObjectId | string;
  versionId: mongoose.Types.ObjectId | string;
  invoiceNumber?: string;
  invoiceDate?: string;
  vendorName?: string;
  gstin?: string;
  subtotal?: number;
  gst?: number;
  total?: number;
  items?: Array<{ description: string; quantity?: number; rate?: number; amount: number }>;
  confidenceScore: number;
  createdAt: Date;
}

const ExtractedDocumentDataSchema = new Schema<IExtractedDocumentData>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    versionId: { type: Schema.Types.ObjectId, ref: 'DocumentVersion', required: true, index: true },
    invoiceNumber: { type: String },
    invoiceDate: { type: String },
    vendorName: { type: String },
    gstin: { type: String },
    subtotal: { type: Number },
    gst: { type: Number },
    total: { type: Number },
    items: [{ description: String, quantity: Number, rate: Number, amount: Number }],
    confidenceScore: { type: Number, default: 0.95 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Exports
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
export const Document: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
export const DocumentVersion: Model<IDocumentVersion> = mongoose.models.DocumentVersion || mongoose.model<IDocumentVersion>('DocumentVersion', DocumentVersionSchema);
export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export const CorrectionRequest: Model<ICorrectionRequest> = mongoose.models.CorrectionRequest || mongoose.model<ICorrectionRequest>('CorrectionRequest', CorrectionRequestSchema);
export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const ExtractedDocumentData: Model<IExtractedDocumentData> = mongoose.models.ExtractedDocumentData || mongoose.model<IExtractedDocumentData>('ExtractedDocumentData', ExtractedDocumentDataSchema);
