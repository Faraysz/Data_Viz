import 'dotenv/config'
import { PrismaClient } from '@prisma/client' // sesuaikan dengan generator di schema.prisma
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('🌱 Menyebabkan database...')

  // Clear existing data
  await prisma.transaction.deleteMany()
  console.log('🗑️  Transaksi yang sudah ada telah dihapus')

  // Seed transactions
  const transactions = [
    {
      description: 'Gaji Bulanan',
      amount: 8500000,
      type: 'INCOME',
      category: 'Gaji',
      date: new Date('2024-06-01'),
    },
    {
      description: 'Freelance Desain Logo',
      amount: 1500000,
      type: 'INCOME',
      category: 'Freelance',
      date: new Date('2024-06-05'),
    },
    {
      description: 'Belanja Bulanan Hypermart',
      amount: 1200000,
      type: 'EXPENSE',
      category: 'Belanja',
      date: new Date('2024-06-10'),
    },
    {
      description: 'GoFood Makan Siang',
      amount: 45000,
      type: 'EXPENSE',
      category: 'Makanan',
      date: new Date('2024-06-15'),
    },
    {
      description: 'Bayar Listrik & Internet',
      amount: 350000,
      type: 'EXPENSE',
      category: 'Tagihan',
      date: new Date('2024-06-12'),
    },
    {
      description: 'Netflix Subscription',
      amount: 186000,
      type: 'EXPENSE',
      category: 'Hiburan',
      date: new Date('2024-06-01'),
    },
    {
      description: 'Grab ke Kantor',
      amount: 28000,
      type: 'EXPENSE',
      category: 'Transport',
      date: new Date('2024-06-18'),
    },
    {
      description: 'Bonus Performance',
      amount: 2000000,
      type: 'INCOME',
      category: 'Bonus',
      date: new Date('2024-06-01'),
    },
  ]

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    })
  }

  console.log(`✅ Berhasil menambahkan ${transactions.length} transaksi`)
  console.log('🎉 Seeding selesai!')
}
  // Supaya data muncul, buat tanggalnya relatif terhadap hari ini. Tambahkan helper ini di atas main()
   const daysAgo = (n: number) => {
     const d = new Date()
     d.setDate(d.getDate() - n)
     return d
   }

main()
  .catch((e) => {
    console.error('❌ Seeding gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
