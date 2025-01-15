import { useTranslation } from '@/app/i18n';
import { fallbackLng } from '@/app/i18n/settings';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

// 预取数据
async function getHomePageData() {
  const [featuredProducts, categories, newArrivals] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      take: 4,
      include: { category: true },
    }),
    prisma.category.findMany({
      take: 6,
    }),
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { category: true },
    }),
  ]);

  return {
    featuredProducts,
    categories,
    newArrivals,
  };
}

export default async function HomePage({
  params
}: {
  params: { lng?: string }
}) {
  const lng = params?.lng || fallbackLng;
  const { t } = await useTranslation(lng, 'common');
  const { featuredProducts, categories, newArrivals } = await getHomePageData();

  const banners = [
    {
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=80',
      title: t('banner_cat_food'),
      description: t('banner_cat_food_desc'),
      link: `/${lng}/categories/cat-food`,
    },
    {
      image: 'https://images.unsplash.com/photo-1615369794017-f65e6f0c0393?auto=format&fit=crop&w=1920&q=80',
      title: t('banner_cat_toys'),
      description: t('banner_cat_toys_desc'),
      link: `/${lng}/categories/cat-toys`,
    },
    // 可以添加更多轮播图
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Banner */}
      <div className="relative h-[500px] bg-gray-100">
        <Image
          src={banners[0].image}
          alt={banners[0].title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {banners[0].title}
              </h1>
              <p className="text-xl mb-8">{banners[0].description}</p>
              <Link
                href={banners[0].link}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('shop_now')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">{t('shop_by_category')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${lng}/categories/${category.slug}`}
              className="group"
            >
              <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-center font-medium group-hover:text-blue-600">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">{t('featured_products')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/${lng}/products/${product.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">¥{product.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">{product.category.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">{t('new_arrivals')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <Link
              key={product.id}
              href={`/${lng}/products/${product.id}`}
              className="group"
            >
              <div className="relative h-48 rounded-lg overflow-hidden mb-2">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold group-hover:text-blue-600">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{product.category.name}</p>
              <p className="text-lg font-bold">¥{product.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-semibold mb-2">{t('free_shipping')}</h3>
              <p className="text-gray-600">{t('free_shipping_desc')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="font-semibold mb-2">{t('quality_guarantee')}</h3>
              <p className="text-gray-600">{t('quality_guarantee_desc')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💝</div>
              <h3 className="font-semibold mb-2">{t('member_benefits')}</h3>
              <p className="text-gray-600">{t('member_benefits_desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
