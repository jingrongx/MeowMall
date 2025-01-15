'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import AddressForm from '@/components/AddressForm';
import { Address } from '@/types';

export default function UserPage({ params: { lng } }: { params: { lng: string } }) {
  const { t } = useTranslation(lng, 'user');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      const data = await response.json();
      setAddresses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete address');
      }
      await fetchAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}/default`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to set default address');
      }
      await fetchAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('userInfo')}</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{t('addresses')}</h2>
        <AddressForm lng={lng} onSuccess={fetchAddresses} />
        
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{address.name} - {address.phone}</p>
                  <p className="text-gray-600">
                    {address.province} {address.city} {address.district}
                  </p>
                  <p className="text-gray-600">{address.detail}</p>
                  {address.isDefault && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                      {t('defaultAddress')}
                    </span>
                  )}
                </div>
                <div className="space-x-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {t('setAsDefault')}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 