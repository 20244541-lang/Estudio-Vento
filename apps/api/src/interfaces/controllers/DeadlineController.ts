import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DeadlineController {
  static async create(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const { daysCount, daysType, dueDate } = req.body;
      
      const newDeadline = await prisma.deadline.create({
        data: { 
          caseId,
          daysCount: parseInt(daysCount, 10), 
          daysType, 
          dueDate: new Date(dueDate)
        },
      });
      return res.status(201).json(newDeadline);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al crear plazo', error: error.message });
    }
  }

  static async getByCaseId(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const deadlines = await prisma.deadline.findMany({
        where: { caseId },
        orderBy: { dueDate: 'asc' },
      });
      return res.status(200).json(deadlines);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener plazos', error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.deadline.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al eliminar plazo', error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const deadlines = await prisma.deadline.findMany({
        orderBy: { dueDate: 'asc' },
        include: {
          case: {
            include: {
              client: true
            }
          }
        }
      });
      return res.status(200).json(deadlines);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener plazos', error: error.message });
    }
  }
}
