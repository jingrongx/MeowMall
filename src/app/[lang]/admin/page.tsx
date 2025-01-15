'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import RefundManagement from '@/components/RefundManagement';

export default function AdminPage({ params: { lng } }: { params: { lng: string } }) {
  const router = useRouter();
  const { t } = useTranslation(lng, 'common');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (!data.user || data.user.role !== 'admin') {
        router.push(`/${lng}`);
        return;
      }
      
      setIsAdmin(true);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      router.push(`/${lng}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t('admin_dashboard')}</h1>
      
      <div className="space-y-8">
        <section>
          <RefundManagement />
        </section>
        
        {/* Add more admin sections here */}
      </div>
    </div>
  );
}