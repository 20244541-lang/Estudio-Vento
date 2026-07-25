import { Request, Response } from 'express';
import prisma from '../../infrastructure/database/prismaClient';

export class CatalogController {
  static async getSpecialties(req: Request, res: Response) {
    try {
      const specialties = await prisma.specialty.findMany({
        orderBy: { name: 'asc' },
      });
      return res.status(200).json(specialties);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener especialidades', error: error.message });
    }
  }

  static async getEntities(req: Request, res: Response) {
    try {
      const entities = await prisma.entity.findMany({
        orderBy: { name: 'asc' },
      });
      return res.status(200).json(entities);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener entidades', error: error.message });
    }
  }
}
