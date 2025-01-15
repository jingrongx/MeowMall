'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: {
    product: {
      name: string;
      imageUrl: string;
    };
    quantity: number;
    price: number;
  }[];
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (orders.length === 0) {
    return <div>暂无订单</div>;
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4">
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

          <div className="flex justify-between items-center mt-4">
            <p className="font-semibold">
              总金额: ¥{order.totalAmount.toFixed(2)}
            </p>
            <Link 
              href={`/en/orders/${order.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              查看详情
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}