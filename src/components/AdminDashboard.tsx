'use client';

import { useState } from 'react';
import OrderManagement from "@/components/OrderManagement";
import ProductManagement from "@/components/ProductManagement";
import UserManagement from "@/components/UserManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === 'orders'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          订单管理
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'products'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('products')}
        >
          商品管理
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('users')}
        >
          用户管理
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'analytics'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          数据统计
        </button>
      </div>

      <div>
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </div>
    </div>
  );
}