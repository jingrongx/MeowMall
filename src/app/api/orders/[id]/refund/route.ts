import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { auth } from "@/app/api/utils";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = parseInt(params.id);
    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: 'Refund reason is required' },
        { status: 400 }
      );
    }
    
    // 验证订单存在且属于当前用户
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: user.id
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 验证订单状态是否允许退款
    if (!['paid', 'shipped'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be refunded in current status' },
        { status: 400 }
      );
    }

    // 检查是否已有正在处理的退款申请
    const existingRefund = await prisma.refund.findFirst({
      where: {
        orderId,
        status: 'pending'
      }
    });

    if (existingRefund) {
      return NextResponse.json(
        { error: 'There is already a pending refund request' },
        { status: 400 }
      );
    }

    // 创建退款申请
    const refund = await prisma.refund.create({
      data: {
        orderId,
        amount: order.total,
        reason,
        status: 'pending'
      }
    });

    // 更新订单状态
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'refund_pending',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(refund);
  } catch (error) {
    console.error('Failed to create refund request:', error);
    return NextResponse.json(
      { error: 'Failed to create refund request' },
      { status: 500 }
    );
  }
} 