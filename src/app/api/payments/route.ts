import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { auth } from "@/app/api/utils";
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// 最小支付金额（单位：分）
const MIN_AMOUNT = {
  cny: 14, // 支付宝和微信支付的最小金额是0.14元
  usd: 50, // Stripe卡支付的最小金额是0.50美元
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.orderId || !body.paymentMethod) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    const { orderId, paymentMethod } = body;
    
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

    // 只有pending状态的订单可以继续支付
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order cannot be paid in current status' },
        { status: 400 }
      );
    }

    // 计算订单金额（转换为分）
    const amount = Math.round(order.totalAmount * 100);
    
    // 根据支付方式选择货币和验证最小金额
    const currency = paymentMethod === 'card' ? 'usd' : 'cny';
    if (amount < MIN_AMOUNT[currency]) {
      return NextResponse.json(
        { 
          error: `Minimum amount for ${currency.toUpperCase()} payment is ${(MIN_AMOUNT[currency] / 100).toFixed(2)}` 
        },
        { status: 400 }
      );
    }

    // 创建支付意图
    const paymentIntentOptions: any = {
      amount,
      currency,
      payment_method_types: [paymentMethod],
      metadata: {
        orderId: order.id.toString(),
        userId: user.id.toString()
      },
      description: `Order #${order.id}`,
      capture_method: 'automatic',
    };

    // 只有信用卡支付才添加这些选项
    if (paymentMethod === 'card') {
      paymentIntentOptions.payment_method_options = {
        card: {
          setup_future_usage: 'off_session',
        },
      };
      paymentIntentOptions.setup_future_usage = 'off_session';
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);

    // 更新订单状态和支付意图ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'payment_pending',
        updatedAt: new Date()
      }
    });

    // 返回客户端密钥
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      currency,
      amount
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { paymentIntentId } = await request.json();
    
    // 获取当前用户
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取支付意图详情
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 验证订单
    const orderId = parseInt(paymentIntent.metadata.orderId);
    
    // 使用事务处理订单状态更新和购物车清空
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
          userId: user.id
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // 根据支付状态更新订单
      let orderStatus = 'pending';
      switch (paymentIntent.status) {
        case 'succeeded':
          orderStatus = 'paid';
          // 支付成功时清空购物车
          await tx.cart.deleteMany({
            where: {
              userId: user.id
            }
          });
          break;
        case 'requires_payment_method':
        case 'canceled':
          orderStatus = 'payment_failed';
          break;
        case 'processing':
          orderStatus = 'processing';
          break;
        case 'requires_action':
          orderStatus = 'pending';
          break;
        default:
          orderStatus = 'pending';
      }

      const updatedOrder = await tx.order.update({
        where: {
          id: orderId
        },
        data: {
          status: orderStatus,
          updatedAt: new Date()
        }
      });

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}