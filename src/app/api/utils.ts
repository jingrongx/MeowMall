import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export async function auth() {
  const tokenCookie = (await cookies()).get('auth-token')?.value;

  if (!tokenCookie) {
    return null;
  }

  try {
    const decoded = verify(tokenCookie, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}