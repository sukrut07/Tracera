import fs from 'fs/promises';
import path from 'path';
import { isFirebaseAdminConfigured, getStorage } from '@/lib/firebase/admin';

export interface StorageUploadResult {
  fileName: string;
  storagePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Upload audit document to Firebase Cloud Storage (or local storage fallback)
 * Organizes by: clients/{clientId}/documents/{documentId}/v{versionNumber}/{fileName}
 */
export async function uploadDocumentBinary(params: {
  file: File;
  clientId: string;
  documentId: string;
  versionNumber: number;
}): Promise<StorageUploadResult> {
  const { file, clientId, documentId, versionNumber } = params;
  const fileName = file.name;
  const ext = path.extname(fileName).toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || 'application/octet-stream';

  const structuredStoragePath = `clients/${clientId}/documents/${documentId}/v${versionNumber}/${fileName}`;

  // If Firebase Admin Storage is configured
  if (isFirebaseAdminConfigured) {
    try {
      const bucket = getStorage().bucket();
      const fileRef = bucket.file(structuredStoragePath);

      await fileRef.save(buffer, {
        metadata: { contentType: mimeType },
        resumable: false,
      });

      // Make public or get signed URL
      const [signedUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2030',
      });

      return {
        fileName,
        storagePath: structuredStoragePath,
        fileUrl: signedUrl,
        fileSize: file.size,
        mimeType,
      };
    } catch (err) {
      console.warn('Firebase Cloud Storage upload failed, falling back to local storage:', err);
    }
  }

  // Local storage fallback: public/uploads/clients/{clientId}/documents/{documentId}/v{versionNumber}/
  const localTargetDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'clients',
    clientId,
    'documents',
    documentId,
    `v${versionNumber}`
  );
  await fs.mkdir(localTargetDir, { recursive: true });

  const diskPath = path.join(localTargetDir, fileName);
  await fs.writeFile(diskPath, buffer);

  const localPublicUrl = `/uploads/clients/${clientId}/documents/${documentId}/v${versionNumber}/${encodeURIComponent(fileName)}`;

  return {
    fileName,
    storagePath: structuredStoragePath,
    fileUrl: localPublicUrl,
    fileSize: file.size,
    mimeType,
  };
}
