'use client';

import { PrismaClient } from '@prisma/client';
import { useTranslation } from '@/app/i18n';
import { fallbackLng } from '@/app/i18n/settings';
import { auth } from "@/app/api/utils";
import { redirect } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';

const prisma = new PrismaClient();

export default async function CheckoutPage({
  params: { lng }
}: {
  params: { lng: string }
}) {
  const { t } = await useTranslation(lng || fallbackLng, 'common');
  const user = await auth();

  if (!user) {
    redirect(`/${lng}/login`);
  }

  // 获取购物车商品
  const cartItems = await prisma.cart.findMany({
    where: {
      userId: user.id
    },
    include: {
      product: true
    }
  });

  // 获取用户地址
  const addresses = await prisma.userAddress.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      isDefault: 'desc'
    }
  });

  if (cartItems.length === 0) {
    redirect(`/${lng}/cart`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">{t('checkout')}</h1>
        <CheckoutForm 
          cartItems={cartItems} 
          addresses={addresses}
          lng={lng}
        />
      </div>
    </div>
  );
}