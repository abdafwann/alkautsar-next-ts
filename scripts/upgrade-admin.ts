import { prisma } from '../lib/prisma';

async function main() {
  const result = await prisma.admin.updateMany({
    data: { role: 'SUPERADMIN' }
  });
  console.log(`Berhasil mengubah ${result.count} admin lama menjadi SUPERADMIN.`);
}

main().catch(console.error).finally(() => process.exit(0));
