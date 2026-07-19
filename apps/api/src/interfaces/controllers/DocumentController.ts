import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
}
