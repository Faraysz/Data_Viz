import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { COMPANY_INFO } from '@/lib/company-config'
import { numberToWords } from '@/lib/number-to-words'

// GET - Generate receipt data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Format data untuk kwitansi
    const receiptData = {
      company: COMPANY_INFO,
      receiptNumber: payment.receiptNumber,
      date: payment.paymentDate,
      customer: {
        name: payment.order.customer.name,
      },
      amount: Number(payment.amount),
      amountInWords: numberToWords(Number(payment.amount)),
      paymentFor: payment.order.description,
      quantity: payment.order.quantity,
      unit: payment.order.unit,
      paymentMethod: payment.paymentMethod,
      accountNumber: payment.accountNumber,
      accountName: payment.accountName,
      bankName: payment.bankName,
      receivedBy: payment.receivedBy || COMPANY_INFO.defaultReceiverName,
    }

    return NextResponse.json(receiptData)
  } catch (error) {
    console.error('Error fetching receipt:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipt' },
      { status: 500 }
    )
  }
}
