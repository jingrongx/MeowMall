import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the address belongs to the user
    const address = await prisma.userAddress.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update all addresses to be non-default
    await prisma.userAddress.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set the selected address as default
    await prisma.userAddress.update({
      where: {
        id: params.id,
      },
      data: {
        isDefault: true,
      },
    });

    return NextResponse.json({ message: 'Default address updated successfully' });
  } catch (error) {
    console.error('Failed to update default address:', error);
    return NextResponse.json(
      { error: 'Failed to update default address' },
      { status: 500 }
    );
  }
} 