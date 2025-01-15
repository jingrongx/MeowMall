'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  address: string;
  phone: string;
  trackingNumber?: string;
  refundReason?: string;
  items: {
    product: {
      name: string;
      imageUrl: string;
    };
    quantity: number;
    price: number;
  }[];
}

export default function OrderManagement() {
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

  const handleShipOrder = async (orderId: number, trackingNumber: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          trackingNumber
        }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'shipped', trackingNumber }
            : order
        ));
      }
    } catch (error) {
      console.error('Failed to ship order:', error);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-4">
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

          <div className="mt-4 space-y-2">
            <p className="font-semibold">
              总金额: ¥{order.total.toFixed(2)}
            </p>
            <p>收货地址: {order.address}</p>
            <p>联系电话: {order.phone}</p>
            {order.status === 'paid' && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="输入物流单号"
                  className="border rounded px-2 py-1"
                  onBlur={(e) => handleShipOrder(order.id, e.target.value)}
                />
                <button 
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                  onClick={() => {
                    const trackingNumber = (document.querySelector(`input[data-order-id="${order.id}"]`) as HTMLInputElement)?.value;
                    if (trackingNumber) {
                      handleShipOrder(order.id, trackingNumber);
                    }
                  }}
                >
                  发货
                </button>
              </div>
            )}
            {order.trackingNumber && (
              <p>物流单号: {order.trackingNumber}</p>
            )}
            {order.status === 'shipped' && (
              <div className="flex items-center space-x-2">
                <button
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                  onClick={() => {
                    const reason = prompt('请输入退款原因');
                    if (reason) {
                      fetch('/api/admin', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          orderId: order.id,
                          status: 'cancelled',
                          reason
                        }),
                      }).then(() => {
                        setOrders(orders.map(o =>
                          o.id === order.id
                            ? { ...o, status: 'cancelled', refundReason: reason }
                            : o
                        ));
                      });
                    }
                  }}
                >
                  处理退款
                </button>
              </div>
            )}
            {order.refundReason && (
              <p className="text-red-500">退款原因: {order.refundReason}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}