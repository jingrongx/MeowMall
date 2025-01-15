import { PrismaClient } from '@prisma/client';
import { useTranslation } from '@/app/i18n';
import { fallbackLng } from '@/app/i18n/settings';
import Link from 'next/link';
import Image from 'next/image';

const prisma = new PrismaClient();

export default async function ProductsPage({
  params
}: {
  params: { lng?: string }
}) {
  const lng = params?.lng || fallbackLng;
  const { t } = await useTranslation(lng, 'common');
  
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('product_list')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/${lng}/products/${product.id}`}
            className="group border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48">
              <Image 
                src={product.imageUrl} 
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">{product.name}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">¥{product.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500">{product.category.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}