import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from "@/app/api/utils";

const prisma = new PrismaClient();

// 发货管理
export async function POST(request: Request) {
  try {
    const { orderId, trackingNumber } = await request.json();
    
    // 获取当前用户
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 验证订单
    const order = await prisma.order.findUnique({
      where: {
        id: orderId
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Order not ready for shipping' },
        { status: 400 }
      );
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        status: 'shipped',
        trackingNumber
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error processing shipment:', error);
    return NextResponse.json(
      { error: 'Failed to process shipment' },
      { status: 500 }
    );
  }
}

// 售后管理
export async function PUT(request: Request) {
  try {
    const { orderId, status, reason } = await request.json();
    
    // 获取当前用户
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 验证订单
    const order = await prisma.order.findUnique({
      where: {
        id: orderId
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 更新售后状态
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        status,
        refundReason: reason
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}