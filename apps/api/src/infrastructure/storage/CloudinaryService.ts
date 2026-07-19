import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  /**
   * Uploads a file to Cloudinary
   * @param filePath Local path of the file to upload
   * @param originalName Original name of the file
   * @returns secure_url from Cloudinary
   */
  static async uploadFile(filePath: string, originalName: string): Promise<string> {
    try {
      // Usamos resource_type 'raw' para que acepte PDFs, DOCX, etc sin intentar procesarlos como imagen
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
        folder: 'erp_legal_documents'
      });
      
      return result.secure_url;
    } catch (error: any) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error(`Error subiendo archivo a Cloudinary: ${error.message || JSON.stringify(error)}`);
    }
  }
}
