import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CaseController {
  static async create(req: Request, res: Response) {
    try {
      const { docketNumber, clientId, specialtyId, entityId, responsibleId, description, startDate, priority, observations, tags } = req.body;
      
      const lastCase = await prisma.case.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      
      let nextNum = 1;
      if (lastCase && lastCase.internalNumber && lastCase.internalNumber.startsWith('EXP-')) {
        const parts = lastCase.internalNumber.split('-');
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) nextNum = lastNum + 1;
      }
      const currentYear = new Date().getFullYear();
      const internalNumber = `EXP-${currentYear}-${nextNum.toString().padStart(4, '0')}`;

      const newCase = await prisma.case.create({
        data: { 
          internalNumber, 
          docketNumber, 
          clientId, 
          specialtyId, 
          entityId, 
          responsibleId, 
          description,
          startDate: startDate ? new Date(startDate) : new Date(),
          priority: priority || 'MEDIUM',
          observations,
          tags: tags || []
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
          actions: { orderBy: { date: 'desc' }, include: { documents: true } },
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
      const { docketNumber, status, priority, description, observations, startDate, closeDate, responsibleId, specialtyId, entityId, tags } = req.body;
      
      const updateData: any = { 
        docketNumber, 
        status, 
        priority, 
        description, 
        observations,
        responsibleId,
        startDate: startDate ? new Date(startDate) : undefined,
        closeDate: closeDate ? new Date(closeDate) : undefined
      };
      
      if (specialtyId) updateData.specialtyId = specialtyId;
      if (entityId) updateData.entityId = entityId;
      if (tags) updateData.tags = tags;

      const updatedCase = await prisma.case.update({
        where: { id },
        data: updateData,
      });
      return res.status(200).json(updatedCase);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al actualizar caso', error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.$transaction([
        prisma.action.deleteMany({ where: { caseId: id } }),
        prisma.deadline.deleteMany({ where: { caseId: id } }),
        prisma.task.deleteMany({ where: { caseId: id } }),
        prisma.note.deleteMany({ where: { caseId: id } }),
        prisma.case.delete({ where: { id } })
      ]);
      
      return res.status(204).send();
    } catch (error: any) {
      console.error('Error al eliminar caso:', error);
      return res.status(500).json({ message: 'Error interno al eliminar caso', error: error.message });
    }
  }
}
