import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Ambil data summary untuk dashboard (dengan dukungan filter tanggal)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    // Kondisi filter tanggal untuk Orders
    const orderDateFilter: any = {}
    if (startDateParam || endDateParam) {
      if (startDateParam) orderDateFilter.gte = new Date(startDateParam)
      if (endDateParam) orderDateFilter.lte = new Date(endDateParam)
    }

    const orderWhere = (startDateParam || endDateParam) ? { orderDate: orderDateFilter } : {}

    // Count orders by status
    const [
      totalOrders,
      pendingOrders,
      productionOrders,
      readyOrders,
      completedOrders,
    ] = await Promise.all([
      prisma.order.count({ where: orderWhere }),
      prisma.order.count({ where: { ...orderWhere, status: 'PENDING' } }),
      prisma.order.count({ where: { ...orderWhere, status: 'PRODUCTION' } }),
      prisma.order.count({ where: { ...orderWhere, status: 'READY' } }),
      prisma.order.count({ where: { ...orderWhere, status: 'COMPLETED' } }),
    ])

    // Get orders with payments dalam periode (atau semua jika tanpa filter)
    const orders = await prisma.order.findMany({
      where: orderWhere,
      include: {
        payments: true,
      },
    })

    // Calculate financial data untuk pesanan dalam periode
    let totalRevenue = 0
    let totalPaidFromOrders = 0
    let totalPending = 0

    orders.forEach((order) => {
      const orderTotal = Number(order.totalPrice)
      const paidAmount = order.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      )
      const remaining = orderTotal - paidAmount

      totalRevenue += orderTotal
      totalPaidFromOrders += paidAmount
      totalPending += Math.max(0, remaining)
    })

    // Hitung UANG MASUK (Payments) yang terjadi dalam rentang tanggal tersebut
    const paymentDateFilter: any = {}
    if (startDateParam || endDateParam) {
      if (startDateParam) paymentDateFilter.gte = new Date(startDateParam)
      if (endDateParam) paymentDateFilter.lte = new Date(endDateParam)
    }

    const paymentWhere = (startDateParam || endDateParam) ? { paymentDate: paymentDateFilter } : {}

    const periodPayments = await prisma.payment.findMany({
      where: paymentWhere,
    })

    const periodRevenue = periodPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )

    // Hitung juga uang masuk hari ini (sebagai pembanding)
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
        totalPaid: totalPaidFromOrders,
        totalPending,
        periodRevenue, // Uang masuk aktual pada periode tanggal yang dipilih
        todayRevenue,  // Uang masuk hari ini
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
