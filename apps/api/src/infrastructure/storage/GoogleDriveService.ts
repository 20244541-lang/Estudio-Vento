import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Path to the service account credentials
const KEYFILEPATH = path.join(process.cwd(), 'google-credentials.json');

// Scopes required for Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

export class GoogleDriveService {
  /**
   * Uploads a file to Google Drive
   * @param filePath Local path of the file to upload
   * @param fileName Name of the file in Google Drive
   * @param mimeType MimeType of the file
   * @returns webContentLink and webViewLink
   */
  static async uploadFile(filePath: string, fileName: string, mimeType: string) {
    try {
      const drive = google.drive({ version: 'v3', auth });
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      if (!folderId) {
        throw new Error('GOOGLE_DRIVE_FOLDER_ID no está configurado en .env');
      }

      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webContentLink, webViewLink',
      });

      // The service account has permission to upload, but we need to ensure anyone with link can read
      // This step might be necessary depending on folder permissions, but usually it inherits from the folder.
      // If the folder is shared, it inherits. If not, we can make the file accessible:
      /*
      await drive.permissions.create({
        fileId: response.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      */

      return {
        id: response.data.id,
        webContentLink: response.data.webContentLink,
        webViewLink: response.data.webViewLink,
      };
    } catch (error: any) {
      console.error('Error uploading to Google Drive:', error);
      fs.writeFileSync(path.join(process.cwd(), 'drive_error.log'), `[${new Date().toISOString()}] ${error.message}\n${error.stack}\n\n`, { flag: 'a' });
      throw new Error(`Error subiendo archivo a Google Drive: ${error.message}`);
    }
  }
}
