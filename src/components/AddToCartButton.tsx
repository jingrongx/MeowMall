'use client';

import { useState } from 'react';

interface AddToCartButtonProps {
  productId: number;
  lng: string;
  text: string;
}

export default function AddToCartButton({ productId, lng, text }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const addToCart = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)auth-token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      // 显示成功提示
      setShowSuccess(true);
      // 3秒后隐藏提示
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={addToCart}
        disabled={loading}
        className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? '...' : text}
      </button>
      {showSuccess && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300">
          已添加到购物车
        </div>
      )}
    </div>
  );
}