'use client';

import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useTranslation } from "@/app/i18n/client";
import { useRouter } from 'next/navigation';

type PaymentMethod = 'card' | 'alipay' | 'wechat_pay';

export default function CheckoutForm({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, "common");
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!address.trim() || !phone.trim()) {
      setError(t('address_phone_required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 如果已有订单ID，直接使用该订单
      let order;
      if (!orderId) {
        // 获取购物车内容
        const cartResponse = await fetch('/api/cart');
        const cartItems = await cartResponse.json();

        if (!cartItems || cartItems.length === 0) {
          setError(t('cart_empty'));
          setLoading(false);
          return;
        }

        // 验证购物车数据
        const isValidCart = cartItems.every((item: any) => 
          item && 
          item.product && 
          typeof item.product.price === 'number' && 
          typeof item.quantity === 'number' && 
          item.productId
        );

        if (!isValidCart) {
          setError(t('invalid_cart_data'));
          setLoading(false);
          return;
        }

        // 创建订单
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItems,
            address,
            phone
          }),
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.error || 'Failed to create order');
        }

        order = await orderResponse.json();
        setOrderId(order.id);
      }

      // 创建支付意图
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId || order.id,
          paymentMethod
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const { clientSecret, currency, amount } = await paymentResponse.json();

      let paymentResult;

      // 根据不同的支付方式处理支付
      switch (paymentMethod) {
        case 'card':
          paymentResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement)!,
            }
          });
          break;
        case 'alipay':
          paymentResult = await stripe.confirmAlipayPayment(clientSecret, {
            return_url: `${window.location.origin}/${lng}/orders/${orderId || order.id}`,
          });
          break;
        case 'wechat_pay':
          paymentResult = await stripe.confirmWechatPayPayment(clientSecret, {
            payment_method_options: {
              wechat_pay: {
                client: 'web'
              }
            }
          });
          break;
      }

      if (paymentResult?.error) {
        // 支付失败，但订单依然有效，可以重试
        setError(paymentResult.error.message || t('payment_error'));
        return;
      }

      if (paymentResult?.paymentIntent?.status === 'succeeded') {
        // 更新支付状态
        await fetch('/api/payments', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentResult.paymentIntent.id,
          }),
        });

        router.push(`/${lng}/orders/${orderId || order.id}`);
      } else if (paymentResult?.paymentIntent?.status === 'requires_action') {
        // 对于需要额外操作的支付方式（如支付宝、微信），会自动重定向
        console.log('Redirecting to payment page...');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : t('payment_error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setError(null); // 切换支付方式时清除错误信息
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 收货信息 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('shipping_info')}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              {t('address')}
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              {t('phone')}
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* 支付方式选择 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('select_payment_method')}</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('card')}
            className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'hover:border-gray-300'
            }`}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{t('credit_card')}</span>
          </button>
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('alipay')}
            className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
              paymentMethod === 'alipay'
                ? 'border-blue-500 bg-blue-50'
                : 'hover:border-gray-300'
            }`}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 14l2-2m2-2l4-4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{t('alipay')}</span>
          </button>
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('wechat_pay')}
            className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
              paymentMethod === 'wechat_pay'
                ? 'border-blue-500 bg-blue-50'
                : 'hover:border-gray-300'
            }`}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 8h8v8H8z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{t('wechat_pay')}</span>
          </button>
        </div>
      </div>

      {paymentMethod === 'card' && (
        <div className="border p-4 rounded-lg">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || (paymentMethod === 'card' && !elements)}
        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? t('processing') : t('pay_now')}
      </button>

      {paymentMethod === 'card' && (
        <p className="text-sm text-gray-500 text-center">
          {t('minimum_amount_notice', { amount: '$0.50' })}
        </p>
      )}
      {(paymentMethod === 'alipay' || paymentMethod === 'wechat_pay') && (
        <p className="text-sm text-gray-500 text-center">
          {t('minimum_amount_notice', { amount: '¥0.14' })}
        </p>
      )}
    </form>
  );
}