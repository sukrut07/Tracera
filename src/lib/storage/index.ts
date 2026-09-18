import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.csv', '.xls', '.xlsx', '.doc', '.docx'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const PRIVATE_STORAGE_DIR = isVercel
  ? path.join('/tmp', '.data', 'storage', 'documents')
  : path.join(process.cwd(), '.data', 'storage', 'documents');

export async function saveUploadedFile(file: File): Promise<{
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
}> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum allowed size of 25MB (File size: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
  }

  const originalName = file.name;
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file type: '${ext}'. Allowed types: PDF, PNG, JPG, JPEG, CSV, XLS, XLSX, DOC, DOCX`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storedFileName = `${crypto.randomUUID()}${ext}`;

  // Private storage directory outside public/
  await fs.mkdir(PRIVATE_STORAGE_DIR, { recursive: true });

  const fullDiskPath = path.join(PRIVATE_STORAGE_DIR, storedFileName);
  await fs.writeFile(fullDiskPath, buffer);

  return {
    fileName: originalName,
    filePath: storedFileName,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
  };
}

export async function getPrivateFilePath(storedFileName: string): Promise<string> {
  return path.join(PRIVATE_STORAGE_DIR, storedFileName);
}

export async function getPrivateFileBuffer(storedFileName: string): Promise<Buffer | null> {
  try {
    const fullPath = path.join(PRIVATE_STORAGE_DIR, path.basename(storedFileName));
    return await fs.readFile(fullPath);
  } catch {
    // If legacy file in public/uploads exists, check that as a fallback
    try {
      const legacyPath = path.join(process.cwd(), 'public', storedFileName.replace(/^\//, ''));
      return await fs.readFile(legacyPath);
    } catch {
      return null;
    }
  }
}
