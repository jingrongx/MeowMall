import { PrismaClient, Category, Product } from '@prisma/client';
import { useTranslation } from '@/app/i18n';
import { fallbackLng } from '@/app/settings';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

interface CategoryWithProducts extends Category {
  products: Product[];
}

export default async function CategoryPage({
  params: { lng, slug }
}: {
  params: { lng?: string; slug: string }
}) {
  lng = lng || fallbackLng;
  const { t } = await useTranslation(lng, 'common');
  
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: true
    }
  }) as CategoryWithProducts | null;

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('category_not_found')}</h1>
        <Link href={`/${lng}/categories`} className="text-blue-500 hover:text-blue-600">
          {t('back_to_categories')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex mb-4 text-sm text-gray-500">
        <Link href={`/${lng}`} className="hover:text-gray-700">
          {t('home')}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${lng}/categories`} className="hover:text-gray-700">
          {t('categories')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{category.name}</span>
      </nav>

      <div className="relative h-[300px] mb-8 rounded-lg overflow-hidden">
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4">{category.name}</h1>
            <p className="text-xl text-white">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.products.map((product) => (
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
              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                {product.name}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">¥{product.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500">{category.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 