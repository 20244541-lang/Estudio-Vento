import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CloudinaryService } from '../../infrastructure/storage/CloudinaryService';
import fs from 'fs';

const prisma = new PrismaClient();

export class ClientController {
  static async create(req: Request, res: Response) {
    try {
      const { name, documentId, email, phone, address, observations } = req.body;
      const file = req.file;
      
      const existingClient = await prisma.client.findUnique({ where: { documentId } });
      if (existingClient) {
        return res.status(400).json({ message: 'Ya existe un cliente con este documento (DNI/RUC)' });
      }

      let dniPhotoUrl = undefined;

      if (file) {
        try {
          dniPhotoUrl = await CloudinaryService.uploadFile(file.path, file.originalname);
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error al eliminar archivo temporal:', err);
          });
        } catch (uploadError) {
          console.error('Fallo subiendo a Cloudinary:', uploadError);
          dniPhotoUrl = `/uploads/${file.filename}`;
        }
      }

      const client = await prisma.client.create({
        data: { name, documentId, email, phone, address, observations, dniPhotoUrl },
      });
      return res.status(201).json(client);
    } catch (error: any) {
      console.error('Error creando cliente:', error);
      return res.status(500).json({ message: 'Error interno al crear cliente', error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const clients = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(clients);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener clientes', error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const client = await prisma.client.findUnique({
        where: { id },
        include: { cases: {
          include: {
            specialty: true,
            actions: {
              orderBy: { date: 'desc' },
              take: 1
            }
          }
        } }
      });
      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      return res.status(200).json(client);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno', error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, documentId, email, phone, address, observations, status } = req.body;
      const file = req.file;
      
      let dniPhotoUrl = undefined;

      if (file) {
        try {
          dniPhotoUrl = await CloudinaryService.uploadFile(file.path, file.originalname);
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error al eliminar archivo temporal:', err);
          });
        } catch (uploadError) {
          console.error('Fallo subiendo a Cloudinary:', uploadError);
          dniPhotoUrl = `/uploads/${file.filename}`;
        }
      }
      
      const updateData: any = { name, documentId, email, phone, address, observations, status };
      if (dniPhotoUrl) {
        updateData.dniPhotoUrl = dniPhotoUrl;
      }

      const client = await prisma.client.update({
        where: { id },
        data: updateData,
      });
      return res.status(200).json(client);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al actualizar cliente', error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.client.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al eliminar cliente', error: error.message });
    }
  }
}
