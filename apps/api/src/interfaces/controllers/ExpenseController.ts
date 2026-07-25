import { Request, Response } from 'express';
import prisma from '../../infrastructure/database/prismaClient';

export class ExpenseController {
  static async create(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const { description, amount, date, status } = req.body;
      
      const newExpense = await prisma.expense.create({
        data: { 
          caseId,
          description, 
          amount: parseFloat(amount), 
          date: date ? new Date(date) : new Date(), 
          status
        },
      });
      return res.status(201).json(newExpense);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al crear gasto', error: error.message });
    }
  }

  static async getByCaseId(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const expenses = await prisma.expense.findMany({
        where: { caseId },
        orderBy: { date: 'desc' },
      });
      return res.status(200).json(expenses);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al obtener gastos', error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedExpense = await prisma.expense.update({
        where: { id },
        data: { status },
      });
      return res.status(200).json(updatedExpense);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error al actualizar gasto', error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.expense.delete({ where: { id } });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: 'Error interno al eliminar gasto', error: error.message });
    }
  }
}
