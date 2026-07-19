import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default Roles...');
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', permissions: ['*'] },
  });

  const abogadoRole = await prisma.role.upsert({
    where: { name: 'Abogado' },
    update: {},
    create: { name: 'Abogado', permissions: ['read', 'write'] },
  });

  const asistenteRole = await prisma.role.upsert({
    where: { name: 'Asistente' },
    update: {},
    create: { name: 'Asistente', permissions: ['read'] },
  });

  console.log('Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  
  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@erplegal.com' },
    update: {},
    create: {
      email: 'admin@erplegal.com',
      passwordHash: await bcrypt.hash('admin123', salt),
      name: 'Admin Principal',
      roleId: adminRole.id,
    },
  });

  // Abogado
  await prisma.user.upsert({
    where: { email: 'abogado@erplegal.com' },
    update: {},
    create: {
      email: 'abogado@erplegal.com',
      passwordHash: await bcrypt.hash('abogado123', salt),
      name: 'Juan Abogado',
      roleId: abogadoRole.id,
    },
  });

  // Asistente
  await prisma.user.upsert({
    where: { email: 'asistente@erplegal.com' },
    update: {},
    create: {
      email: 'asistente@erplegal.com',
      passwordHash: await bcrypt.hash('asistente123', salt),
      name: 'María Asistente',
      roleId: asistenteRole.id,
    },
  });

  console.log('Seeding default Specialty and Entity...');
  
  // Upsert Specialty
  const specialty = await prisma.specialty.upsert({
    where: { name: 'General' },
    update: {},
    create: {
      name: 'General',
      description: 'Casos generales',
    },
  });

  // Upsert Entity
  const entity = await prisma.entity.upsert({
    where: { name: 'Poder Judicial' },
    update: {},
    create: {
      name: 'Poder Judicial',
      description: 'Sede central',
    },
  });

  console.log('Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
