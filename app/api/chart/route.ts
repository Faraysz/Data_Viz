import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Ambil data chart (6 bulan terakhir)
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany()

    // Group by month
    const monthlyData: Record<string, { income: number; expense: number }> = {}

    // Get last 6 months
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleString('id-ID', { month: 'short' })
      months.push(monthKey)
      monthlyData[monthKey] = { income: 0, expense: 0 }
    }

    // Aggregate transactions
    transactions.forEach((t) => {
      const transactionDate = new Date(t.date)
      const monthKey = transactionDate.toLocaleString('id-ID', { month: 'short' })
      
      if (monthlyData[monthKey]) {
        if (t.type === 'INCOME') {
          monthlyData[monthKey].income += t.amount
        } else {
          monthlyData[monthKey].expense += t.amount
        }
      }
    })

    // Format for chart
    const chartData = months.map((month) => ({
      name: month,
      income: monthlyData[month].income,
      expense: monthlyData[month].expense,
    }))

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
