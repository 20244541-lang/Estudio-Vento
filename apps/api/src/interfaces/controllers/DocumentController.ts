import { Request, Response } from 'express';
import prisma from '../../infrastructure/database/prismaClient';
import { CloudinaryService } from '../../infrastructure/storage/CloudinaryService';
import fs from 'fs';

export class DocumentController {
  static async getAll(req: Request, res: Response) {
    try {
      const documents = await prisma.document.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          action: {
            include: {
              case: {
                select: {
                  internalNumber: true,
                  docketNumber: true
                }
              }
            }
          },
          author: {
            select: {
              name: true
            }
          }
        }
      });
      return res.status(200).json(documents);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({ message: 'Error interno al obtener documentos', error: error.message });
    }
  }
  static async getByCaseId(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const documents = await prisma.document.findMany({
        where: { caseId },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { name: true }
          }
        }
      });
      return res.status(200).json(documents);
    } catch (error: any) {
      console.error('Error fetching case documents:', error);
      return res.status(500).json({ message: 'Error interno al obtener documentos del caso', error: error.message });
    }
  }

  static async createForCase(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const file = req.file;
      const activeUserId = req.user?.userId;

      if (!activeUserId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      if (!file) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
      }

      let documentData: any = undefined;

      try {
        const cloudUrl = await CloudinaryService.uploadFile(
          file.path,
          file.originalname
        );

        documentData = {
          name: file.originalname,
          type: file.mimetype,
          sizeBytes: file.size,
          storageUrl: cloudUrl,
          caseId,
          authorId: activeUserId
        };

        fs.unlink(file.path, (err) => {
          if (err) console.error('Error al eliminar el archivo temporal local:', err);
        });
      } catch (uploadError) {
        console.error('Fallo subiendo a Cloudinary:', uploadError);
        documentData = {
          name: file.originalname,
          type: file.mimetype,
          sizeBytes: file.size,
          storageUrl: `/uploads/${file.filename}`,
          caseId,
          authorId: activeUserId
        };
      }

      const newDocument = await prisma.document.create({
        data: documentData
      });

      return res.status(201).json(newDocument);
    } catch (error: any) {
      console.error('Error creando documento suelto:', error);
      return res.status(500).json({ message: 'Error interno al crear documento', error: error.message });
    }
  }
}
