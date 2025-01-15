'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { fallbackLng } from '@/app/i18n/settings';

interface Refund {
  id: number;
  orderId: number;
  amount: number;
  reason: string;
  response?: string;
  status: string;
  createdAt: string;
  order: {
    id: number;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function RefundManagement() {
  const { t } = useTranslation(fallbackLng, 'common');
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const response = await fetch('/api/admin/refunds');
      const data = await response.json();
      setRefunds(data);
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (refundId: number, approved: boolean) => {
    const response = prompt(t(approved ? 'enter_approval_response' : 'enter_rejection_reason'));
    if (response === null) return;

    setProcessingId(refundId);
    try {
      const apiResponse = await fetch(`/api/admin/refunds/${refundId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approved ? 'approved' : 'rejected',
          response
        }),
      });

      if (apiResponse.ok) {
        await fetchRefunds();
      } else {
        const data = await apiResponse.json();
        alert(data.error || t('operation_failed'));
      }
    } catch (error) {
      console.error('Failed to process refund:', error);
      alert(t('operation_failed'));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('refund_management')}</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('order_number')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('customer')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('amount')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('reason')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {refunds.map((refund) => (
              <tr key={refund.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {refund.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {refund.order.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {refund.order.user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ¥{refund.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{refund.reason}</div>
                  {refund.response && (
                    <div className="text-sm text-gray-500 mt-1">
                      {t('response')}: {refund.response}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(`refund_status_${refund.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(refund.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {refund.status === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleProcessRefund(refund.id, true)}
                        disabled={processingId === refund.id}
                        className="text-green-600 hover:text-green-900"
                      >
                        {processingId === refund.id ? t('processing') : t('approve')}
                      </button>
                      <button
                        onClick={() => handleProcessRefund(refund.id, false)}
                        disabled={processingId === refund.id}
                        className="text-red-600 hover:text-red-900"
                      >
                        {processingId === refund.id ? t('processing') : t('reject')}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 