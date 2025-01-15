'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';

interface OrderActionsProps {
  order: {
    id: number;
    status: string;
    refunds?: {
      id: number;
      status: string;
    }[];
  };
  lng: string;
}

export default function OrderActions({ order, lng }: OrderActionsProps) {
  const router = useRouter();
  const { t } = useTranslation(lng, 'common');
  const [loading, setLoading] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const handleConfirmReceipt = async () => {
    if (!confirm(t('confirm_receipt_message'))) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/confirm`, {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || t('operation_failed'));
      }
    } catch (error) {
      console.error('Failed to confirm receipt:', error);
      alert(t('operation_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!refundReason.trim()) {
      alert(t('please_enter_refund_reason'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: refundReason }),
      });

      if (response.ok) {
        setShowRefundForm(false);
        setRefundReason('');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || t('operation_failed'));
      }
    } catch (error) {
      console.error('Failed to request refund:', error);
      alert(t('operation_failed'));
    } finally {
      setLoading(false);
    }
  };

  // 检查是否有正在处理的退款申请
  const hasActiveRefund = order.refunds?.some(
    refund => refund.status === 'pending'
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* 确认收货按钮 */}
        {order.status === 'shipped' && (
          <button
            onClick={handleConfirmReceipt}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? t('processing') : t('confirm_receipt')}
          </button>
        )}

        {/* 申请退款按钮 */}
        {['paid', 'shipped'].includes(order.status) && !hasActiveRefund && (
          <button
            onClick={() => setShowRefundForm(true)}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {t('request_refund')}
          </button>
        )}
      </div>

      {/* 退款申请表单 */}
      {showRefundForm && (
        <div className="mt-4 space-y-4">
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder={t('refund_reason_placeholder')}
            className="w-full h-32 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-4">
            <button
              onClick={handleRequestRefund}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? t('processing') : t('submit_refund_request')}
            </button>
            <button
              onClick={() => {
                setShowRefundForm(false);
                setRefundReason('');
              }}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 