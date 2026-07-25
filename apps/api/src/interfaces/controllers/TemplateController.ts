import { Request, Response } from 'express';
import prisma from '../../infrastructure/database/prismaClient';
import { CloudinaryService } from '../../infrastructure/storage/CloudinaryService';
import fs from 'fs';

export class TemplateController {
  static async getAll(req: Request, res: Response) {
    try {
      const templates = await prisma.template.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(templates);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error al obtener plantillas', error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, category } = req.body;
      const file = req.file;
      const userId = req.user?.userId;

      if (!file) {
        return res.status(400).json({ message: 'Se requiere un archivo' });
      }
      if (!userId) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      // Subir a Cloudinary
      const storageUrl = await CloudinaryService.uploadFile(file.path, file.originalname);
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error eliminando archivo temporal:', err);
      });

      const ext = file.originalname.split('.').pop()?.toUpperCase() || 'FILE';

      const template = await prisma.template.create({
        data: {
          name: name || file.originalname,
          category: category || 'General',
          format: ext,
          storageUrl,
          sizeBytes: file.size,
          uploadedBy: userId,
        },
      });

      return res.status(201).json(template);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error al subir plantilla', error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.template.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: 'Error al eliminar plantilla', error: error.message });
    }
  }
}
