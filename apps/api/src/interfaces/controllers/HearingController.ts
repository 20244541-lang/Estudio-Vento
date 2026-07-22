import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HearingController {
  static async create(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const { type, concept, scheduledAt, location, notes } = req.body;

      const newHearing = await prisma.hearing.create({
        data: {
          caseId,
          type: type || 'Audiencia',
          concept,
          scheduledAt: new Date(scheduledAt),
          location: location || null,
          notes: notes || null,
          status: 'PENDING',
        },
        include: { case: { include: { client: true } } },
      });
      return res.status(201).json(newHearing);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al crear audiencia', error: error.message });
    }
  }

  static async getByCaseId(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const hearings = await prisma.hearing.findMany({
        where: { caseId },
        orderBy: { scheduledAt: 'asc' },
      });
      return res.status(200).json(hearings);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener audiencias', error: error.message });
    }
  }

  static async getUpcoming(req: Request, res: Response) {
    try {
      const now = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

      const hearings = await prisma.hearing.findMany({
        where: {
          scheduledAt: { gte: now, lte: thirtyDaysLater },
          status: 'PENDING',
        },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
        include: {
          case: { include: { client: true } },
        },
      });
      return res.status(200).json(hearings);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener audiencias próximas', error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await prisma.hearing.update({
        where: { id },
        data: { status },
      });
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al actualizar audiencia', error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.hearing.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al eliminar audiencia', error: error.message });
    }
  }
}
