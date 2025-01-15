import { getProductById } from '@/app/actions/products';
import { useTranslation } from '@/app/i18n';
import { fallbackLng } from '@/app/i18n/settings';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import Image from 'next/image';

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ lng?: string; id: string }> | { lng?: string; id: string }
}) {
  const resolvedParams = await params;
  const lng = resolvedParams?.lng || fallbackLng;
  const { t } = await useTranslation(lng, 'common');
  
  const productId = Number(resolvedParams.id);
  if (isNaN(productId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('invalid_product_id')}</h1>
        <Link href={`/${lng}/products`} className="text-blue-500 hover:text-blue-600">
          {t('back_to_products')}
        </Link>
      </div>
    );
  }
  
  const product = await getProductById(productId);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('product_not_found')}</h1>
        <Link href={`/${lng}/products`} className="text-blue-500 hover:text-blue-600">
          {t('back_to_products')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image 
            src={product.imageUrl} 
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div>
          <nav className="flex mb-4 text-sm text-gray-500">
            <Link href={`/${lng}`} className="hover:text-gray-700">
              {t('home')}
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/${lng}/categories/${product.category.slug}`} className="hover:text-gray-700">
              {product.category.name}
            </Link>
          </nav>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="flex items-baseline mb-6">
            <span className="text-3xl font-bold">¥{product.price.toFixed(2)}</span>
          </div>
          <AddToCartButton 
            productId={product.id}
            lng={lng}
            text={t('add_to_cart')}
          />
          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">{t('product_details')}</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="font-medium text-gray-500">{t('category')}</dt>
                <dd>{product.category.name}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}