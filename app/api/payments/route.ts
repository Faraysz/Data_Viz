import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Tambah pembayaran baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      amount,
      paymentType,
      paymentMethod,
      accountNumber,
      accountName,
      bankName,
      paymentDate,
      notes,
      receivedBy,
    } = body

    if (!orderId || !amount || !paymentType || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate receipt number (auto increment)
    const lastPayment = await prisma.payment.findFirst({
      orderBy: { receiptNumber: 'desc' },
    })

    let receiptNumber: string
    if (lastPayment) {
      const lastNum = parseInt(lastPayment.receiptNumber)
      receiptNumber = (lastNum + 1).toString()
    } else {
      receiptNumber = '1'
    }

    const payment = await prisma.payment.create({
      data: {
        receiptNumber,
        orderId,
        amount: parseFloat(amount),
        paymentType,
        paymentMethod,
        accountNumber,
        accountName,
        bankName,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes,
        receivedBy,
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    })

    // Check if order is fully paid, update status
    const allPayments = await prisma.payment.findMany({
      where: { orderId },
    })

    const totalPaid = allPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )
    const orderTotal = Number(payment.order.totalPrice)

    if (totalPaid >= orderTotal && payment.order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PRODUCTION' },
      })
    }

    return NextResponse.json(
      {
        ...payment,
        amount: Number(payment.amount),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

// GET - Ambil semua payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    const where: any = {}
    if (orderId) where.orderId = orderId

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    })

    return NextResponse.json(
      payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      }))
    )
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
