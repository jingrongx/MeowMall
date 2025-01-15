import { PrismaClient } from '@prisma/client';
import { useTranslation } from '@/app/i18n';
import { fallbackLng } from '@/app/i18n/settings';
import { auth } from "@/app/api/utils";
import { redirect } from 'next/navigation';
import Image from 'next/image';
import OrderActions from '@/components/OrderActions';

const prisma = new PrismaClient();

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string;
    category: {
      name: string;
    };
  };
}

interface Refund {
  id: number;
  amount: number;
  reason: string;
  status: string;
  response?: string;
  createdAt: Date;
}

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  shippingFee: number;
  address: string;
  phone: string;
  createdAt: Date;
  items: OrderItem[];
  refunds: Refund[];
}

export default async function OrderDetailPage({
  params
}: {
  params: { lng?: string; id: string }
}) {
  const lng = params?.lng || fallbackLng;
  const { t } = await useTranslation(lng, 'common');
  const user = await auth();

  if (!user) {
    redirect(`/${lng}/login`);
  }

  const order = await prisma.order.findUnique({
    where: {
      id: parseInt(params.id),
      userId: user.id
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    }
  }) as unknown as Order | null;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('order_not_found')}</h1>
          <p className="text-gray-600 mb-8">{t('order_not_found_desc')}</p>
        </div>
      </div>
    );
  }

  const totalAmount = order.totalAmount;
  const shippingFee = order.shippingFee || 0;
  const finalAmount = totalAmount + shippingFee;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* 订单头部信息 */}
          <div className="border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">
                {t('order_number')}: {order.id}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm ${
                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                order.status === 'refunded' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {t(`order_status_${order.status}`)}
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              {t('order_date')}: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* 订单商品列表 */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold mb-4">{t('order_items')}</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="relative w-20 h-20">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">{item.product.category.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm">
                        {t('quantity')}: {item.quantity}
                      </span>
                      <span className="font-medium">
                        ¥{item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 订单金额信息 */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center text-sm">
              <span>{t('subtotal')}</span>
              <span>¥{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span>{t('shipping_fee')}</span>
              <span>{shippingFee > 0 ? `¥${shippingFee.toFixed(2)}` : t('free')}</span>
            </div>
            <div className="border-t mt-2 pt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>{t('total')}</span>
                <span>¥{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 收货信息 */}
          <div className="px-6 py-4 border-t">
            <h2 className="text-lg font-semibold mb-2">{t('shipping_info')}</h2>
            <p className="text-gray-600">{order.address}</p>
            <p className="text-gray-600">{order.phone}</p>
          </div>

          {/* 订单操作 */}
          <div className="px-6 py-4 border-t">
            <OrderActions order={order} lng={lng} />
          </div>

          {/* 退款信息 */}
          {order.refunds && order.refunds.length > 0 && (
            <div className="px-6 py-4 border-t">
              <h2 className="text-lg font-semibold mb-2">{t('refund_info')}</h2>
              {order.refunds.map((refund) => (
                <div key={refund.id} className="bg-red-50 rounded p-4 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{t('refund_amount')}: ¥{refund.amount.toFixed(2)}</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                      refund.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t(`refund_status_${refund.status}`)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{refund.reason}</p>
                  {refund.response && (
                    <p className="text-sm text-gray-600 mt-1">{t('refund_response')}: {refund.response}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(refund.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}