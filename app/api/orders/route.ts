import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Ambil semua orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    const where: any = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        _count: {
          select: { payments: true },
        },
      },
      orderBy: { orderDate: 'desc' },
    })

    // Calculate paid amount for each order
    const ordersWithPaidAmount = orders.map((order) => {
      const paidAmount = order.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      )
      const remainingAmount = Number(order.totalPrice) - paidAmount

      return {
        ...order,
        totalPrice: Number(order.totalPrice),
        pricePerUnit: Number(order.pricePerUnit),
        paidAmount,
        remainingAmount,
        isFullyPaid: remainingAmount <= 0,
      }
    })

    return NextResponse.json(ordersWithPaidAmount)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST - Tambah order baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerId,
      description,
      quantity,
      unit,
      pricePerUnit,
      specifications,
      dueDate,
      notes,
    } = body

    if (!customerId || !description || !quantity || !pricePerUnit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate order number (ORD-YYYY-XXX)
    const year = new Date().getFullYear()
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: `ORD-${year}-`,
        },
      },
      orderBy: { orderNumber: 'desc' },
    })

    let orderNumber: string
    if (lastOrder) {
      const lastNum = parseInt(lastOrder.orderNumber.split('-')[2])
      const nextNum = (lastNum + 1).toString().padStart(3, '0')
      orderNumber = `ORD-${year}-${nextNum}`
    } else {
      orderNumber = `ORD-${year}-001`
    }

    const totalPrice = parseFloat(pricePerUnit) * parseInt(quantity)

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        description,
        quantity: parseInt(quantity),
        unit: unit || 'pcs',
        pricePerUnit: parseFloat(pricePerUnit),
        totalPrice,
        specifications,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        status: 'PENDING',
      },
      include: {
        customer: true,
      },
    })

    return NextResponse.json(
      {
        ...order,
        totalPrice: Number(order.totalPrice),
        pricePerUnit: Number(order.pricePerUnit),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, completedDate } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    if (status === 'COMPLETED' || status === 'READY') {
      updateData.completedDate = completedDate
        ? new Date(completedDate)
        : new Date()
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        payments: true,
      },
    })

    return NextResponse.json({
      ...order,
      totalPrice: Number(order.totalPrice),
      pricePerUnit: Number(order.pricePerUnit),
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
