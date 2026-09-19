
import { PrismaClient } from '@prisma/client'
import { hashPassword } from './src/lib/auth/jwt'

const prisma = new PrismaClient()

async function main() {
  const hash = await hashPassword('endypluggbeats')
  const user = await prisma.user.upsert({
    where: { email: 'endypluggbeats@mail.ru' },
    update: {
      name: 'endyaudio',
      passwordHash: hash,
      role: 'ADMIN',
      avatar: '/images/avatars/admin.jpg',
    },
    create: {
      name: 'endyaudio',
      email: 'endypluggbeats@mail.ru',
      passwordHash: hash,
      role: 'ADMIN',
      avatar: '/images/avatars/admin.jpg',
    },
  })
  console.log('Admin account created/updated:', user)
}
main().catch(console.error).finally(async () => await prisma.$disconnect())
