import { Request, Response } from 'express';
import prisma from '../../infrastructure/database/prismaClient';
import { JwtService } from '../../infrastructure/auth/JwtService';
import bcrypt from 'bcryptjs';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true },
      });

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const payload = { userId: user.id, role: user.role.name };
      const accessToken = JwtService.generateAccessToken(payload);
      const refreshToken = JwtService.generateRefreshToken(payload);

      return res.status(200).json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name
        }
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
}
