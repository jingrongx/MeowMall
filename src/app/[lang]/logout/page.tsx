'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import { fallbackLng } from '@/app/i18n/settings';

export default function LogoutPage({
  params
}: {
  params: { lng?: string }
}) {
  const lng = params?.lng || fallbackLng;
  const router = useRouter();
  const { t } = useTranslation(lng, 'common');

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // 登出成功后重定向到首页
          window.location.href = `/${lng}`;
        } else {
          console.error('Logout failed');
          window.location.href = `/${lng}`;
        }
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = `/${lng}`;
      }
    };

    logout();
  }, [lng]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">{t('logging_out')}</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
} 