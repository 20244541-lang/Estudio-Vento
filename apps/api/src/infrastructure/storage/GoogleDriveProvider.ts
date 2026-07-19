import { StorageProvider } from './StorageProvider';

export class GoogleDriveProvider implements StorageProvider {
  async upload(file: Buffer, filename: string): Promise<string> {
    console.log(`[GoogleDriveProvider] Mock uploading file: ${filename}`);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return `mock-gdrive-id-${Date.now()}`;
  }

  async getUrl(fileId: string): Promise<string> {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  async delete(fileId: string): Promise<void> {
    console.log(`[GoogleDriveProvider] Mock deleting file: ${fileId}`);
  }

  async getMetadata(fileId: string): Promise<any> {
    return {
      id: fileId,
      mimeType: 'application/pdf',
      name: 'Mock Document',
      size: 1024,
    };
  }
}
