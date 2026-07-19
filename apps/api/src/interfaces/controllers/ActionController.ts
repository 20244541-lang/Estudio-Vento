import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CloudinaryService } from '../../infrastructure/storage/CloudinaryService';
import fs from 'fs';

const prisma = new PrismaClient();

export class ActionController {
  static async create(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const { type, description, date, status, userId, generateDeadline, daysCount, daysType, dueDate } = req.body;
      
      const file = req.file; // From multer

      // Transaction to ensure all or nothing
      const result = await prisma.$transaction(async (tx) => {
        const activeUserId = req.user?.userId;
        if (!activeUserId) throw new Error('Usuario no autenticado');

        // 1. Crear Actuación
        const newAction = await tx.action.create({
          data: { 
            caseId,
            type, 
            description, 
            date: date ? new Date(date) : new Date(), 
            status: status || 'COMPLETED',
            userId: activeUserId
          },
        });

        // 2. Si hay archivo, crear Documento
        if (file) {
          let documentData = undefined;
          try {
            // Sube el archivo a Cloudinary
            const cloudUrl = await CloudinaryService.uploadFile(
              file.path,
              file.originalname
            );

            documentData = {
              name: file.originalname,
              type: file.mimetype,
              sizeBytes: file.size,
              storageUrl: cloudUrl,
              actionId: newAction.id,
              authorId: activeUserId
            };

            // Elimina el archivo local temporal después de subirlo exitosamente a Cloudinary
            fs.unlink(file.path, (err) => {
              if (err) console.error('Error al eliminar el archivo temporal local:', err);
            });
          } catch (uploadError) {
            console.error('Fallo subiendo a Cloudinary:', uploadError);
            // Fallback a almacenamiento local en caso de fallo
            documentData = {
              name: file.originalname,
              type: file.mimetype,
              sizeBytes: file.size,
              storageUrl: `/uploads/${file.filename}`,
              actionId: newAction.id,
              authorId: activeUserId
            };
          }

          if (documentData) {
            await tx.document.create({
              data: documentData as any 
            }).catch(e => console.log('Error creando documento, saltando...', e));
          }
        }

        // 3. Si pidió generar plazo, crearlo
        if (generateDeadline === 'true' || generateDeadline === true) {
          await tx.deadline.create({
            data: {
              caseId,
              daysCount: parseInt(daysCount || '0', 10),
              daysType: daysType || 'HABILE',
              dueDate: new Date(dueDate)
            }
          });
        }

        return newAction;
      });

      return res.status(201).json(result);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno al crear actuación', error: error.message });
    }
  }

  static async getByCaseId(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const actions = await prisma.action.findMany({
        where: { caseId },
        orderBy: { date: 'desc' },
        include: { documents: true } // Añadido para que el front vea el PDF
      });
      return res.status(200).json(actions);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener actuaciones', error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.action.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al eliminar actuación', error: error.message });
    }
  }
}
