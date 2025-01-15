import { PrismaClient } from '@prisma/client';
import { useTranslation } from '@/app/i18n';
import { fallbackLng } from '@/app/i18n/settings';
import { auth } from "@/app/api/utils";
import { redirect } from 'next/navigation';
import AddressForm from '@/components/AddressForm';
import AddressList from '@/components/AddressList';

const prisma = new PrismaClient();

export default async function ProfilePage({
  params: { lng }
}: {
  params: { lng: string }
}) {
  const { t } = await useTranslation(lng || fallbackLng, 'common');
  const user = await auth();

  if (!user) {
    redirect(`/${lng}/login`);
  }

  const addresses = await prisma.userAddress.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      isDefault: 'desc'
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">{t('my_profile')}</h1>
        
        {/* 基本信息 */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('basic_info')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
              <p className="mt-1 text-gray-900">{user.name}</p>
            </div>
          </div>
        </div>

        {/* 收货地址 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('shipping_addresses')}</h2>
          </div>
          <AddressList addresses={addresses} lng={lng} />
          <div className="mt-4">
            <AddressForm lng={lng} />
          </div>
        </div>
      </div>
    </div>
  );
} 