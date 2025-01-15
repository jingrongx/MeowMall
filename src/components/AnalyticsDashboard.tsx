'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
  const [salesData, setSalesData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  }>({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        
        setSalesData({
          labels: data.labels,
          datasets: [{
            label: '销售额',
            data: data.values,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          }]
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">数据统计</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-medium mb-4">最近30天销售额</h3>
          <Bar
            data={salesData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: '每日销售额',
                },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-medium mb-4">关键指标</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>总销售额</span>
              <span className="font-medium">¥{salesData.datasets[0].data.reduce((a, b) => a + b, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>总订单数</span>
              <span className="font-medium">{salesData.labels.length}</span>
            </div>
            <div className="flex justify-between">
              <span>平均每日销售额</span>
              <span className="font-medium">
                ¥{(salesData.datasets[0].data.reduce((a, b) => a + b, 0) / salesData.labels.length).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}