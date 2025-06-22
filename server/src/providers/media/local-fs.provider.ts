import fs from 'fs';
import fsPromises from 'fs/promises';
import { MediaProvider } from './media.provider';
import pathM from 'path';
import { randomUUID } from 'crypto';
import env from '../../lib/env';

interface MultipartUpload {
  id: string;
  path: string;
  parts: Map<number, Buffer>;
  tempDir: string;
}

export class LocalFsProvider implements MediaProvider {
  private pathToDir: string;
  private tempDir: string;
  private multipartUploads = new Map<string, MultipartUpload>();

  constructor(baseDir?: string) {
    this.pathToDir = baseDir || pathM.join(process.cwd(), 'uploads');
    this.tempDir = pathM.join(process.cwd(), 'temp', 'multipart');
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.pathToDir)) {
      fs.mkdirSync(this.pathToDir, { recursive: true });
    }

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  private getFullPath(path: string): string {
    return pathM.join(this.pathToDir, path);
  }

  private getTempPath(uploadId: string): string {
    return pathM.join(this.tempDir, uploadId);
  }

  async multipartInit(path: string): Promise<{ id: string }> {
    const uploadId = randomUUID();
    const tempPath = this.getTempPath(uploadId);

    // Create temporary directory for this multipart upload
    await fsPromises.mkdir(tempPath, { recursive: true });

    // Store multipart upload info
    this.multipartUploads.set(uploadId, {
      id: uploadId,
      path: this.getFullPath(path),
      parts: new Map(),
      tempDir: tempPath
    });

    console.log(`Multipart upload initialized: ${uploadId} for path: ${path}`);
    return { id: uploadId };
  }

  async partUpload(path: string, id: string, partNumber: number, content: Buffer): Promise<boolean> {
    const upload = this.multipartUploads.get(id);
    if (!upload) {
      throw new Error(`Multipart upload not found: ${id}`);
    }

    try {
      // Save part to temporary file
      const partFilePath = pathM.join(upload.tempDir, `part-${partNumber}`);
      await fsPromises.writeFile(partFilePath, content);

      // Store part info in memory
      upload.parts.set(partNumber, content);

      console.log(`Part ${partNumber} uploaded for upload ${id} (${content.length} bytes)`);
      return true;
    } catch (error) {
      console.error(`Failed to upload part ${partNumber}:`, error);
      return false;
    }
  }

  async multipartEnd(path: string, id: string): Promise<boolean> {
    const upload = this.multipartUploads.get(id);
    if (!upload) {
      throw new Error(`Multipart upload not found: ${id}`);
    }

    try {
      // Ensure the target directory exists
      const targetDir = pathM.dirname(upload.path);
      await fsPromises.mkdir(targetDir, { recursive: true });

      // Create write stream for final file
      const writeStream = fs.createWriteStream(upload.path);

      // Sort parts by part number and combine them
      const sortedParts = Array.from(upload.parts.entries())
        .sort(([a], [b]) => a - b);

      for (const [partNumber, buffer] of sortedParts) {
        writeStream.write(buffer);
      }

      // Close the stream and wait for completion
      await new Promise<void>((resolve, reject) => {
        writeStream.end((error: string) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Cleanup: remove temporary files and directory
      await this.cleanupMultipartUpload(id);

      console.log(`Multipart upload completed: ${id} -> ${upload.path}`);
      return true;
    } catch (error) {
      console.error(`Failed to complete multipart upload ${id}:`, error);
      // Cleanup on failure
      await this.cleanupMultipartUpload(id);
      return false;
    }
  }

  async upload(path: string, data: Buffer): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(path);
      const directory = pathM.dirname(fullPath);

      // Ensure directory exists
      await fsPromises.mkdir(directory, { recursive: true });

      // Write file
      await fsPromises.writeFile(fullPath, data);

      console.log(`File uploaded: ${fullPath} (${data.length} bytes)`);
      return true;
    } catch (error) {
      console.error(`Failed to upload file ${path}:`, error);
      return false;
    }
  }

  async getUrl(path: string): Promise<string> {
    // const fullPath = this.getFullPath(path);
    const baseUrl = `http://localhost:${env.get('PORT')}`
    return `${baseUrl}/uploads${path}`;
  }

  // Additional utility methods

  async fileExists(path: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(path);
      await fsPromises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(path);
      await fsPromises.unlink(fullPath);
      console.log(`File deleted: ${fullPath}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${path}:`, error);
      return false;
    }
  }

  async getFileStats(path: string): Promise<fs.Stats | null> {
    try {
      const fullPath = this.getFullPath(path);
      return await fsPromises.stat(fullPath);
    } catch {
      return null;
    }
  }

  private async cleanupMultipartUpload(uploadId: string): Promise<void> {
    const upload = this.multipartUploads.get(uploadId);
    if (!upload) return;

    try {
      // Remove temporary directory and all its contents
      await fsPromises.rm(upload.tempDir, { recursive: true, force: true });

      // Remove from memory
      this.multipartUploads.delete(uploadId);

      console.log(`Cleaned up multipart upload: ${uploadId}`);
    } catch (error) {
      console.error(`Failed to cleanup multipart upload ${uploadId}:`, error);
    }
  }

  // Cleanup method to remove orphaned multipart uploads
  async cleanupOrphanedUploads(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    const now = Date.now();

    for (const [uploadId, upload] of this.multipartUploads.entries()) {
      try {
        const stats = await fsPromises.stat(upload.tempDir);
        const age = now - stats.birthtimeMs;

        if (age > maxAge) {
          console.log(`Cleaning up orphaned upload: ${uploadId} (age: ${age}ms)`);
          await this.cleanupMultipartUpload(uploadId);
        }
      } catch (error) {
        // Directory doesn't exist, remove from memory
        this.multipartUploads.delete(uploadId);
      }
    }
  }

  // Get storage info
  getStorageInfo() {
    return {
      baseDirectory: this.pathToDir,
      tempDirectory: this.tempDir,
      activeUploads: this.multipartUploads.size,
      uploads: Array.from(this.multipartUploads.values()).map(upload => ({
        id: upload.id,
        path: upload.path,
        partsCount: upload.parts.size
      }))
    };
  }
}

