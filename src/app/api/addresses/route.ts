import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.userAddress.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { isDefault, ...addressData } = data;

    // If this is the first address or set as default, update other addresses
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // If this is the first address, set it as default
    const addressCount = await prisma.userAddress.count({
      where: {
        userId: session.user.id,
      },
    });

    const address = await prisma.userAddress.create({
      data: {
        ...addressData,
        userId: session.user.id,
        isDefault: isDefault || addressCount === 0,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Failed to create address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
} 