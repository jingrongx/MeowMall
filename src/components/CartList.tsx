'use client';

import { useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import Image from 'next/image';
import { Product, Category } from '@prisma/client';

interface CartItem {
  id: number;
  quantity: number;
  product: Product & {
    category: Category;
  };
}

interface CartListProps {
  items: CartItem[];
  lng: string;
}

export default function CartList({ items: initialItems, lng }: CartListProps) {
  const { t } = useTranslation(lng, 'common');
  const [cartItems, setCartItems] = useState<CartItem[]>(initialItems);
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});

  const updateQuantity = async (id: number, quantity: number) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      const updatedItem = await response.json();
      setCartItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    } catch (error) {
      console.error('Error updating cart:', error);
      // You could add a toast notification here
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const removeItem = async (id: number) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
      // You could add a toast notification here
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow p-4 flex items-center gap-4"
        >
          <div className="relative w-24 h-24">
            <Image
              src={item.product.imageUrl}
              alt={item.product.name}
              fill
              className="object-cover rounded"
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold">{item.product.name}</h3>
            <p className="text-gray-600 text-sm">
              {item.product.category.name}
            </p>
            <p className="text-blue-500 font-semibold">
              ¥{item.product.price.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.product.id, -1)}
              disabled={loading[item.id] || item.quantity <= 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, 1)}
              disabled={loading[item.id]}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            disabled={loading[item.id]}
            className="text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            {t('remove') as string}
          </button>
        </div>
      ))}
    </div>
  );
}