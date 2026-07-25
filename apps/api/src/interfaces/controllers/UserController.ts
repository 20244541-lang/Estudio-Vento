import { Request, Response } from 'express';
import prisma from '../../infrastructure/database/prismaClient';

export class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'asc' }
      });
      // Filtrar passwordHash por seguridad
      const safeUsers = users.map(u => {
        const { passwordHash, ...rest } = u;
        return rest;
      });
      return res.status(200).json(safeUsers);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
  }
}
