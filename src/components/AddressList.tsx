'use client';

import { useState } from 'react';

interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

interface AddressListProps {
  addresses: Address[];
  lng: string;
}

export default function AddressList({ addresses, lng }: AddressListProps) {
  const [loading, setLoading] = useState(false);

  const handleSetDefault = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/addresses/${id}/default`, {
        method: 'PUT'
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to set default address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个地址吗？')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
    } finally {
      setLoading(false);
    }
  };

  if (addresses.length === 0) {
    return <div className="text-gray-500">暂无收货地址</div>;
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div key={address.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{address.name}</span>
                <span className="text-gray-600">{address.phone}</span>
                {address.isDefault && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">默认</span>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                {address.province} {address.city} {address.district} {address.detail}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  设为默认
                </button>
              )}
              <button
                onClick={() => handleDelete(address.id)}
                disabled={loading}
                className="text-sm text-red-600 hover:text-red-800"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 