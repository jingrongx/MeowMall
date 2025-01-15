'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProductById(id: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}