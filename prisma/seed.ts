import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const adminEmail = 'admin@alkautsar.com';
  const plainPassword = 'admin';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log(`Admin dengan email ${adminEmail} sudah ada.`);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log(`Berhasil membuat Admin!`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${plainPassword}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
