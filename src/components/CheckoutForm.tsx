'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import { CartItem, Address } from '@/types';
import { useTranslation } from '@/app/i18n/client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  lng: string;
  cartItems: CartItem[];
  addresses: Address[];
}

export default function CheckoutForm({ lng, cartItems, addresses }: CheckoutFormProps) {
  const { t } = useTranslation(lng, 'checkout');
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find(addr => addr.isDefault)?.id || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );
  const shippingFee = totalAmount > 100 ? 0 : 10;
  const finalAmount = totalAmount + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setError(t('selectAddress'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          addressId: selectedAddressId,
          shippingFee,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderResponse.json();

      // Create payment intent
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: finalAmount,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await paymentResponse.json();

      // Store the client secret in session storage
      sessionStorage.setItem('paymentClientSecret', clientSecret);
      sessionStorage.setItem('orderId', order.id);

      // Clear cart
      await fetch('/api/cart', {
        method: 'DELETE',
      });

      router.push(`/${lng}/payment`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="text-red-500">{error}</div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">{t('selectAddress')}</h2>
        <div className="space-y-4">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`block border p-4 rounded-lg cursor-pointer ${
                selectedAddressId === address.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <input
                type="radio"
                name="address"
                value={address.id}
                checked={selectedAddressId === address.id}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="sr-only"
              />
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
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">{t('orderSummary')}</h2>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-gray-600">
                    {t('quantity')}: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-medium">
                ${(item.quantity * item.product.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between">
            <p>{t('subtotal')}</p>
            <p>${totalAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p>{t('shippingFee')}</p>
            <p>${shippingFee.toFixed(2)}</p>
          </div>
          <div className="flex justify-between mt-2 font-semibold">
            <p>{t('total')}</p>
            <p>${finalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !selectedAddressId}
        className="w-full py-3 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? t('processing') : t('proceedToPayment')}
      </button>
    </form>
  );
} 