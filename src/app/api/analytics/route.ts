import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from "@/app/api/utils";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 获取当前用户
    const user = await auth();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取最近30天的销售数据
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const salesData = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'paid'
      },
      select: {
        totalAmount: true,
        createdAt: true
      }
    });

    // 按天分组统计销售额
    const dailySales: { [key: string]: number } = {};
    salesData.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = 0;
      }
      dailySales[date] += order.totalAmount;
    });

    // 生成图表数据
    const labels = Object.keys(dailySales).sort();
    const values = labels.map(date => dailySales[date]);

    return NextResponse.json({
      labels,
      values
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}