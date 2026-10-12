import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Ambil detail order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const paidAmount = order.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    )
    const remainingAmount = Number(order.totalPrice) - paidAmount

    return NextResponse.json({
      ...order,
      totalPrice: Number(order.totalPrice),
      pricePerUnit: Number(order.pricePerUnit),
      paidAmount,
      remainingAmount,
      isFullyPaid: remainingAmount <= 0,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
