import { useTranslation } from '@/app/i18n';
import { fallbackLng } from '@/app/settings';
import Link from 'next/link';
import CartList from '@/components/CartList';
import { PrismaClient } from '@prisma/client';
import { auth } from "@/app/api/utils";
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function CartPage({
  params
}: {
  params: { lng?: string }
}) {
  const lng = params?.lng || fallbackLng;
  const { t } = await useTranslation(lng, 'common');

  const user = await auth();
  if (!user) {
    redirect(`/${lng}/login?redirect=/cart`);
  }

  // Get cart data
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

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart')}</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-8">{t('empty_cart')}</p>
          <Link
            href={`/${lng}/products`}
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('continue_shopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartList items={cartItems} lng={lng} />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{t('order_summary')}</h2>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span className="text-xl font-bold">¥{total.toFixed(2)}</span>
                </div>
                <Link
                  href={`/${lng}/checkout`}
                  className="block w-full bg-blue-500 text-white text-center px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t('proceed_to_checkout')}
                </Link>
                <Link
                  href={`/${lng}/products`}
                  className="block w-full text-center text-blue-500 hover:text-blue-600 mt-4"
                >
                  {t('continue_shopping')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}