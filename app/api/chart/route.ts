import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Ambil data chart (6 bulan terakhir)
export async function GET() {
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const transactions = await prisma.transaction.findMany({
      where: { date: { gte: start } },
    })

    // Siapkan 6 bucket bulan, kuncinya tahun-bulan
    const buckets = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: d.toLocaleString('id-ID', { month: 'short' }),
        income: 0,
        expense: 0,
      })
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]))

    // Masukkan transaksi ke bucket-nya
    for (const t of transactions) {
      const d = new Date(t.date)
      const bucket = byKey.get(`${d.getFullYear()}-${d.getMonth()}`)
      if (!bucket) continue

      const amount = Number(t.amount)
      if (t.type === 'INCOME') bucket.income += amount
      else bucket.expense += amount
    }

    // Format untuk chart
    return NextResponse.json(
      buckets.map(({ name, income, expense }) => ({ name, income, expense }))
    )
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}