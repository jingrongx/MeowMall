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

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!body || !body.productId || typeof body.quantity !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request body - productId and quantity are required' },
        { status: 400 }
      );
    }

    const { productId, quantity } = body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        productId: productId,
      },
    });

    if (existingCartItem) {
      // Update quantity if item exists
      const updatedCartItem = await prisma.cart.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
      return NextResponse.json(updatedCartItem);
    } else {
      // Create new cart item
      const cartItem = await prisma.cart.create({
        data: {
          userId: user.id,
          productId,
          quantity,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
      return NextResponse.json(cartItem);
    }
  } catch (error) {
    console.error('Error handling cart request:', error);
    return NextResponse.json(
      { error: 'Failed to process cart request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cartItems = await prisma.cart.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Cart item ID is required' },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cart.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    await prisma.cart.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'Failed to delete cart item' },
      { status: 500 }
    );
  }
}