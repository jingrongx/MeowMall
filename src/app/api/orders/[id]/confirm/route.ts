import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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

    // 验证订单状态是否为已发货
    if (order.status !== 'shipped') {
      return NextResponse.json(
        { error: 'Order cannot be confirmed in current status' },
        { status: 400 }
      );
    }

    // 更新订单状态为已完成
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'completed',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to confirm order:', error);
    return NextResponse.json(
      { error: 'Failed to confirm order' },
      { status: 500 }
    );
  }
} 