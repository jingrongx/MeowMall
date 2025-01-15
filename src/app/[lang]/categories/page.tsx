import { PrismaClient } from '@prisma/client';
import { useTranslation } from '@/app/i18n';
import { fallbackLng } from '@/app/settings';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function CategoriesPage({
  params
}: {
  params: { lng?: string }
}) {
  const lng = params?.lng || fallbackLng;
  const { t } = await useTranslation(lng, 'common');
  
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('categories')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/${lng}/categories/${category.slug}`}
            className="block group"
          >
            <div className="border rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                <p className="text-gray-600">
                  {t('products_count', { count: category._count.products })}
                </p>
                <div className="mt-4 text-blue-500 group-hover:text-blue-600">
                  {t('view_category')} →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}