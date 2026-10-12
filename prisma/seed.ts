import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

// Helper function untuk generate tanggal relatif
const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function main() {
  console.log('🌱 Seeding database POS Konveksi...')

  // Clear existing data
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  console.log('🗑️  Data lama telah dihapus')

  // Seed Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'EMINA',
        phone: '081234567890',
        address: 'Jl. Sudirman No. 123, Jakarta',
        notes: 'Pelanggan setia, sering order lanyard',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'PT. MAJU JAYA',
        phone: '082345678901',
        email: 'pembelian@majujaya.com',
        address: 'Jl. Gatot Subroto No. 45, Surabaya',
        notes: 'Perusahaan, biasanya order dalam jumlah besar',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'SEKOLAH HARAPAN BANGSA',
        phone: '083456789012',
        address: 'Jl. Pendidikan No. 88, Malang',
        notes: 'Order seragam sekolah',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Budi Santoso',
        phone: '084567890123',
        address: 'Jl. Mawar No. 12, Jember',
      },
    }),
  ])

  console.log(`✅ Berhasil menambahkan ${customers.length} customers`)

  // Seed Orders with Payments

  // Order 1: Sudah Lunas (COMPLETED)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-001',
      customerId: customers[0].id,
      description: 'LANYARD',
      quantity: 153,
      unit: 'pcs',
      pricePerUnit: 11500,
      totalPrice: 1759500,
      status: 'COMPLETED',
      specifications: 'Ukuran 2cm x 90cm, warna biru, logo print 2 sisi',
      orderDate: daysAgo(15),
      dueDate: daysAgo(5),
      completedDate: daysAgo(3),
      notes: 'Desain sudah disetujui',
    },
  })

  // Payment untuk Order 1 (Lunas)
  await prisma.payment.create({
    data: {
      receiptNumber: '113',
      orderId: order1.id,
      amount: 1759500,
      paymentType: 'PELUNASAN',
      paymentMethod: 'Transfer BCA',
      accountNumber: '333771177',
      accountName: 'A.N Firzy Afriyan',
      bankName: 'BCA',
      paymentDate: daysAgo(3),
      receivedBy: 'Firzy Afriyan',
    },
  })

  // Order 2: Sedang Produksi, Sudah DP
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-002',
      customerId: customers[1].id,
      description: 'KAOS POLO SERAGAM KANTOR',
      quantity: 50,
      unit: 'pcs',
      pricePerUnit: 85000,
      totalPrice: 4250000,
      status: 'PRODUCTION',
      specifications: 'Size: S(10), M(20), L(15), XL(5). Warna navy, logo bordir dada kiri',
      orderDate: daysAgo(7),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari dari sekarang
      notes: 'Rush order, prioritas tinggi',
    },
  })

  // DP untuk Order 2
  await prisma.payment.create({
    data: {
      receiptNumber: '114',
      orderId: order2.id,
      amount: 2000000,
      paymentType: 'DP',
      paymentMethod: 'Transfer BCA',
      accountNumber: '333771177',
      accountName: 'A.N Firzy Afriyan',
      bankName: 'BCA',
      paymentDate: daysAgo(7),
      receivedBy: 'Firzy Afriyan',
      notes: 'DP 50%',
    },
  })

  // Order 3: Baru Masuk (PENDING)
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-003',
      customerId: customers[2].id,
      description: 'SERAGAM OLAHRAGA SISWA',
      quantity: 200,
      unit: 'pcs',
      pricePerUnit: 65000,
      totalPrice: 13000000,
      status: 'PENDING',
      specifications: 'Kaos: 100 pcs (berbagai size), Celana: 100 pcs (berbagai size), warna merah putih',
      orderDate: daysAgo(2),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 hari dari sekarang
      notes: 'Menunggu konfirmasi desain',
    },
  })

  // Order 4: Siap Diambil (READY)
  const order4 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-004',
      customerId: customers[3].id,
      description: 'TAS GOODIE BAG',
      quantity: 100,
      unit: 'pcs',
      pricePerUnit: 12000,
      totalPrice: 1200000,
      status: 'READY',
      specifications: 'Ukuran 30x40cm, bahan spunbond, logo sablon 1 warna',
      orderDate: daysAgo(10),
      dueDate: daysAgo(1),
      completedDate: daysAgo(1),
      notes: 'Untuk acara ulang tahun',
    },
  })

  // Cicilan pertama untuk Order 4
  await prisma.payment.create({
    data: {
      receiptNumber: '115',
      orderId: order4.id,
      amount: 600000,
      paymentType: 'DP',
      paymentMethod: 'Transfer BCA',
      accountNumber: '333771177',
      accountName: 'A.N Firzy Afriyan',
      bankName: 'BCA',
      paymentDate: daysAgo(10),
      receivedBy: 'Firzy Afriyan',
      notes: 'DP 50%',
    },
  })

  console.log('✅ Berhasil menambahkan 4 orders dengan payments')
  console.log('🎉 Seeding selesai!')
  console.log('\nRingkasan Data:')
  console.log('- 4 Customers')
  console.log('- 4 Orders (1 COMPLETED, 1 PRODUCTION, 1 PENDING, 1 READY)')
  console.log('- 3 Payments')
}

main()
  .catch((e) => {
    console.error('❌ Seeding gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
