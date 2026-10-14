import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

// Production (Workers): client baru per request.
// Development: singleton biasa supaya hot reload tidak membuka banyak koneksi.
export function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === 'production') return createClient()
  return (globalForPrisma.prisma ??= createClient())
}