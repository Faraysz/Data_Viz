import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Ambil summary (total balance, income, expense)
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany()

    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expense

    // Get current month's income and expense
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthlyTransactions = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth
    )

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyExpense = monthlyTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    return NextResponse.json({
      balance,
      income: monthlyIncome,
      expense: monthlyExpense,
      totalIncome: income,
      totalExpense: expense,
    })
  } catch (error) {
    console.error('Error fetching summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}
