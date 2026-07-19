import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CaseController {
  static async create(req: Request, res: Response) {
    try {
      const { internalNumber, docketNumber, clientId, specialtyId, entityId, responsibleId, description } = req.body;
      
      const newCase = await prisma.case.create({
        data: { 
          internalNumber, 
          docketNumber, 
          clientId, 
          specialtyId, 
          entityId, 
          responsibleId, 
          description 
        },
      });
      return res.status(201).json(newCase);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al crear caso', error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const cases = await prisma.case.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          specialty: true,
        }
      });
      return res.status(200).json(cases);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener casos', error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const caseData = await prisma.case.findUnique({
        where: { id },
        include: { 
          client: true,
          specialty: true,
          entity: true,
          actions: { orderBy: { date: 'desc' } },
          deadlines: true,
          expenses: true,
          notes: true
        }
      });
      if (!caseData) {
        return res.status(404).json({ message: 'Caso no encontrado' });
      }
      return res.status(200).json(caseData);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno', error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { docketNumber, status, priority, description, observations } = req.body;
      
      const updatedCase = await prisma.case.update({
        where: { id },
        data: { docketNumber, status, priority, description, observations },
      });
      return res.status(200).json(updatedCase);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al actualizar caso', error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.case.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al eliminar caso', error: error.message });
    }
  }
}
