import { PrismaClient } from '@prisma/client';

// Singleton: una sola instancia de PrismaClient para toda la aplicación.
// Evita crear múltiples conexiones a la base de datos.
const prisma = new PrismaClient();

export default prisma;
