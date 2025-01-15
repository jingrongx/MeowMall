import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from "@/app/api/utils";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cartItems, address, phone } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!address || !phone) {
      return NextResponse.json(
        { error: 'Address and phone are required' },
        { status: 400 }
      );
    }

    // 验证购物车项目数据
    for (const item of cartItems) {
      if (!item.product || !item.product.price || !item.quantity || !item.productId) {
        return NextResponse.json(
          { error: 'Invalid cart item data' },
          { status: 400 }
        );
      }
    }

    // 开始事务处理
    const result = await prisma.$transaction(async (tx) => {
      // 计算总金额
      const total = cartItems.reduce(
        (sum: number, item: any) => sum + (item.product.price * item.quantity),
        0
      );

      // 1. 创建订单
      const order = await tx.order.create({
        data: {
          userId: user.id,
          status: 'pending',
          totalAmount: total,
          address,
          phone,
          items: {
            create: cartItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return order;
    });

    if (!result) {
      throw new Error('Failed to create order');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating order:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// 获取订单
export async function GET(request: Request) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}