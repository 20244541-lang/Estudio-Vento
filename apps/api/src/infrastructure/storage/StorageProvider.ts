export interface StorageProvider {
  upload(file: Buffer, filename: string): Promise<string>;
  getUrl(fileId: string): Promise<string>;
  delete(fileId: string): Promise<void>;
  getMetadata(fileId: string): Promise<any>;
}
