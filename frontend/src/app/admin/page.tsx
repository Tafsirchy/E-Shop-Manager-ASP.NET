"use client";

import { useState, useEffect } from "react";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // In a real app, attach JWT token with Admin role
    fetch("http://localhost:5000/api/admin/dashboard", {
      // headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 text-center text-gray-500">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <button className="bg-slate-800 text-white px-4 py-2 rounded shadow hover:bg-slate-700 transition">
            Generate Report
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Revenue</h3>
            <div className="text-2xl font-bold text-slate-800">৳{stats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-green-500">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Orders</h3>
            <div className="text-2xl font-bold text-slate-800">{stats.totalOrders}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-purple-500">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Users</h3>
            <div className="text-2xl font-bold text-slate-800">{stats.totalUsers}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-orange-500">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Low Stock Alerts</h3>
            <div className="text-2xl font-bold text-slate-800">{stats.lowStockCount}</div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">Recent Orders</h2>
            </div>
            <div className="p-6">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-500 text-sm border-b">
                        <th className="pb-3 font-medium">Order ID</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order: any) => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="py-4 text-sm text-slate-700 font-mono">{order.id?.substring(0,8)}...</td>
                          <td className="py-4 text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 text-sm font-semibold text-slate-800">৳{order.totalAmount}</td>
                          <td className="py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No recent orders found.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">System Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex justify-between items-center">
                <span className="font-medium text-slate-700">Manage Products</span>
                <span className="text-slate-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex justify-between items-center">
                <span className="font-medium text-slate-700">Manage Subscriptions</span>
                <span className="text-slate-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex justify-between items-center">
                <span className="font-medium text-slate-700">View Users</span>
                <span className="text-slate-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex justify-between items-center">
                <span className="font-medium text-slate-700">Generate Coupons</span>
                <span className="text-slate-400">→</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
