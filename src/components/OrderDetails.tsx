'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  address: string;
  phone: string;
  trackingNumber?: string;
  items: {
    product: {
      name: string;
      imageUrl: string;
    };
    quantity: number;
    price: number;
  }[];
}

export default function OrderDetails({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!order) {
    return <div>订单不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold">订单号: {order.id}</h2>
            <p className="text-sm text-gray-500">
              下单时间: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-sm ${
            order.status === 'paid' ? 'bg-green-100 text-green-600' :
            order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {order.status === 'paid' ? '已支付' :
             order.status === 'shipped' ? '已发货' :
             order.status === 'pending' ? '待支付' : order.status}
          </span>
        </div>

        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.product.name} className="flex items-center">
              <img 
                src={item.product.imageUrl} 
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded-lg mr-4"
              />
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} × ¥{item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <p className="font-semibold">
            总金额: ¥{order.total.toFixed(2)}
          </p>
          <p>收货地址: {order.address}</p>
          <p>联系电话: {order.phone}</p>
          {order.trackingNumber && (
            <p>物流单号: {order.trackingNumber}</p>
          )}
        </div>
      </div>

      <Link 
        href="/orders"
        className="inline-block text-sm text-blue-600 hover:underline"
      >
        &larr; 返回订单列表
      </Link>
    </div>
  );
}