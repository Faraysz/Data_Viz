import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Ambil data summary untuk dashboard
export async function GET() {
  try {
    // Count orders by status
    const [
      totalOrders,
      pendingOrders,
      productionOrders,
      readyOrders,
      completedOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PRODUCTION' } }),
      prisma.order.count({ where: { status: 'READY' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
    ])

    // Get all orders with payments
    const orders = await prisma.order.findMany({
      include: {
        payments: true,
      },
    })

    // Calculate financial data
    let totalRevenue = 0
    let totalPaid = 0
    let totalPending = 0

    orders.forEach((order) => {
      const orderTotal = Number(order.totalPrice)
      const paidAmount = order.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      )
      const remaining = orderTotal - paidAmount

      totalRevenue += orderTotal
      totalPaid += paidAmount
      totalPending += remaining
    })

    // Get today's payments
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayPayments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    const todayRevenue = todayPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )

    return NextResponse.json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        production: productionOrders,
        ready: readyOrders,
        completed: completedOrders,
      },
      finance: {
        totalRevenue,
        totalPaid,
        totalPending,
        todayRevenue,
      },
    })
  } catch (error) {
    console.error('Error fetching summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}
