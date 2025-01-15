import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/utils';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await auth();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const refundId = parseInt(params.id);
    if (isNaN(refundId)) {
      return NextResponse.json(
        { error: 'Invalid refund ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, response } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (!response || typeof response !== 'string') {
      return NextResponse.json(
        { error: 'Response is required' },
        { status: 400 }
      );
    }

    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: true }
    });

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    if (refund.status !== 'pending') {
      return NextResponse.json(
        { error: 'Refund has already been processed' },
        { status: 400 }
      );
    }

    // Start a transaction to update both refund and order
    const result = await prisma.$transaction(async (tx) => {
      // Update the refund status and response
      const updatedRefund = await tx.refund.update({
        where: { id: refundId },
        data: {
          status,
          response,
          updatedAt: new Date()
        }
      });

      // Update the order status based on refund decision
      const orderStatus = status === 'approved' ? 'refunded' : 'completed';
      await tx.order.update({
        where: { id: refund.orderId },
        data: { status: orderStatus }
      });

      return updatedRefund;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to process refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
} 