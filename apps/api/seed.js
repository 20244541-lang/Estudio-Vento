const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Iniciando seedeo de la base de datos de producción...');

  // 1. Crear Roles
  const roles = ['Admin', 'Abogado', 'Asistente', 'Secretaria', 'Invitado'];
  const roleMap = {};
  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, permissions: [] },
    });
    roleMap[roleName] = role.id;
    console.log(`✅ Rol asegurado: ${roleName}`);
  }

  // 2. Crear Especialidad por defecto
  const specialty = await prisma.specialty.upsert({
    where: { name: 'General' },
    update: {},
    create: { name: 'General', description: 'Casos generales' },
  });
  console.log(`✅ Especialidad asegurada: General`);

  // 3. Crear Entidad por defecto
  const entity = await prisma.entity.upsert({
    where: { name: 'Poder Judicial' },
    update: {},
    create: { name: 'Poder Judicial', description: 'Entidad por defecto' },
  });
  console.log(`✅ Entidad asegurada: Poder Judicial`);

  // 4. Crear Usuarios (Administradores)
  const passwordHash = await bcrypt.hash('123456', 10);
  
  const users = [
    { email: 'admin@erp.com', name: 'Administrador', passwordHash, roleId: roleMap['Admin'] },
    { email: 'jose@estudiovento.com', name: 'Jose', passwordHash, roleId: roleMap['Admin'] },
    { email: 'neil@estudiovento.com', name: 'Neil', passwordHash, roleId: roleMap['Admin'] }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`✅ Usuario asegurado: ${u.name} (${u.email})`);
  }

  console.log('🎉 Seedeo completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
