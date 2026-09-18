import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.csv', '.xls', '.xlsx'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

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
    throw new Error(`Unsupported file type: '${ext}'. Allowed types: PDF, XLSX, XLS, CSV, PNG, JPG, JPEG`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const storedFileName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${safeBaseName}${ext}`;

  // Local filesystem storage under public/uploads
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const fullDiskPath = path.join(uploadDir, storedFileName);
  await fs.writeFile(fullDiskPath, buffer);

  return {
    fileName: originalName,
    filePath: `/uploads/${storedFileName}`,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
  };
}
