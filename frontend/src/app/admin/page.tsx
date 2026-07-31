"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface RecentOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  recentOrders: RecentOrder[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface SubscriptionPackage {
  id: string;
  type: string;
  name: string;
  price: number;
  billingType: string;
  features: string[];
}

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Panels
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", stock: "", category: "" });

  // Subscriptions
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [newPkg, setNewPkg] = useState({ name: "", price: "", billingType: "Monthly", features: "" });

  // Users
  const [users, setUsers] = useState<User[]>([]);

  // Coupons
  const [coupon, setCoupon] = useState({ code: "", discountValue: "", requiredPoints: "" });

  // Report
  const [report, setReport] = useState<Product[] | null>(null);

  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const notify = (text: string, ok = true) => setMessage({ text, ok });

  const loadDashboard = useCallback(() => {
    apiFetch<DashboardStats>("/api/admin/dashboard")
      .then(setStats)
      .catch((e) => setError(errorMessage(e, "Failed to load dashboard.")));
  }, []);

  useEffect(() => {
    if (authLoading || !token) return;
    loadDashboard();
  }, [authLoading, token, loadDashboard]);

  if (authLoading) {
    return <div className="min-h-screen p-8 bg-slate-50 text-center text-slate-500">Loading Admin Dashboard...</div>;
  }

  if (!token || user?.role !== "Admin") {
    return (
      <div className="min-h-screen p-8 bg-slate-50 text-slate-900">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-slate-600 mb-6">Sign in with an admin account to view the dashboard.</p>
          <Link href="/login" className="inline-block bg-slate-800 text-white px-8 py-3 rounded-lg hover:bg-slate-700 font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 text-slate-900">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-red-500">{error ?? "Dashboard unavailable."}</p>
        </div>
      </div>
    );
  }

  const togglePanel = (key: string) => setOpenPanel(openPanel === key ? null : key);

  const generateReport = async () => {
    try {
      const data = await apiFetch<Product[]>("/api/products/low-stock");
      setReport(data);
    } catch (e) {
      notify(errorMessage(e, "Could not generate report."), false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify(status),
      });
      setStats(prev => prev ? {
        ...prev,
        recentOrders: prev.recentOrders.map(o => o.id === orderId ? { ...o, status } : o),
      } : prev);
    } catch (e) {
      notify(errorMessage(e, "Could not update status."), false);
    }
  };

  const loadProducts = async () => {
    const data = await apiFetch<Product[]>("/api/products", { auth: false });
    setProducts(data);
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.category) { notify("Name and category are required.", false); return; }
    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: {
          name: newProduct.name,
          description: newProduct.description,
          price: Number(newProduct.price) || 0,
          stock: Number(newProduct.stock) || 0,
          category: newProduct.category,
        },
      });
      notify("Product added.");
      setNewProduct({ name: "", description: "", price: "", stock: "", category: "" });
      loadProducts();
      loadDashboard();
    } catch (e) {
      notify(errorMessage(e, "Could not add product."), false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE" });
      notify("Product deleted.");
      setProducts(prev => prev.filter(p => p.id !== id));
      loadDashboard();
    } catch (e) {
      notify(errorMessage(e, "Could not delete product."), false);
    }
  };

  const loadPackages = async () => {
    const data = await apiFetch<SubscriptionPackage[]>("/api/subscriptions/packages", { auth: false });
    setPackages(data);
  };

  const addPackage = async () => {
    if (!newPkg.name) { notify("Package name is required.", false); return; }
    try {
      await apiFetch("/api/subscriptions/packages", {
        method: "POST",
        body: {
          type: "Prebuilt",
          name: newPkg.name,
          price: Number(newPkg.price) || 0,
          billingType: newPkg.billingType,
          features: newPkg.features.split(",").map(f => f.trim()).filter(Boolean),
        },
      });
      notify("Package created.");
      setNewPkg({ name: "", price: "", billingType: "Monthly", features: "" });
      loadPackages();
    } catch (e) {
      notify(errorMessage(e, "Could not create package."), false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiFetch<User[]>("/api/admin/users");
      setUsers(data);
    } catch (e) {
      notify(errorMessage(e, "Could not load users."), false);
    }
  };

  const createCoupon = async () => {
    if (!coupon.code || !coupon.discountValue) { notify("Code and discount value are required.", false); return; }
    try {
      await apiFetch("/api/membership/coupons", {
        method: "POST",
        body: {
          code: coupon.code.toUpperCase(),
          discountValue: Number(coupon.discountValue) || 0,
          requiredPoints: Number(coupon.requiredPoints) || 0,
        },
      });
      notify("Coupon created.");
      setCoupon({ code: "", discountValue: "", requiredPoints: "" });
    } catch (e) {
      notify(errorMessage(e, "Could not create coupon."), false);
    }
  };

  const panelButton = (key: string, label: string, loadFn?: () => Promise<void>) => (
    <button
      onClick={() => { togglePanel(key); if (loadFn && openPanel !== key) loadFn(); }}
      className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex justify-between items-center"
    >
      <span className="font-medium text-slate-700">{label}</span>
      <span className="text-slate-400">{openPanel === key ? "↑" : "→"}</span>
    </button>
  );

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <button onClick={generateReport} className="bg-slate-800 text-white px-4 py-2 rounded shadow hover:bg-slate-700 transition">
            Generate Report
          </button>
        </div>

        {message && (
          <p className={`px-4 py-3 rounded-lg ${message.ok ? "bg-success-600/20 text-success-700" : "bg-red-50 text-red-600"}`}>
            {message.text}
          </p>
        )}

        {report && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Low Stock Report ({report.length})</h2>
              <button onClick={() => setReport(null)} className="text-sm text-slate-500 hover:text-slate-800">Close</button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 text-sm border-b">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 text-sm text-slate-700">{p.name}</td>
                      <td className="py-3 text-sm text-slate-600">{p.category}</td>
                      <td className="py-3 text-sm text-slate-700">৳{p.price}</td>
                      <td className="py-3 text-sm text-red-600 font-semibold">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Revenue</h3>
            <div className="text-2xl font-bold text-slate-800">৳{stats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-green-500">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Orders</h3>
            <div className="text-2xl font-bold text-slate-800">{stats.totalOrders}</div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-purple-500">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Users</h3>
            <div className="text-2xl font-bold text-slate-800">{stats.totalUsers}</div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-orange-500">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Low Stock Alerts</h3>
            <div className="text-2xl font-bold text-slate-800">{stats.lowStockCount}</div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
                      {stats.recentOrders.map((order: RecentOrder) => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="py-4 text-sm text-slate-700 font-mono">{order.id?.substring(0, 8)}...</td>
                          <td className="py-4 text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 text-sm font-semibold text-slate-800">৳{order.totalAmount}</td>
                          <td className="py-4">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              className={`text-xs px-2 py-1.5 rounded-full font-medium border-0 focus:ring-2 focus:ring-slate-300 ${order.status === "Pending" ? "bg-warning-500/20 text-warning-600" : "bg-success-600/20 text-success-700"}`}
                            >
                              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
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

          <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">System Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              {panelButton("products", "Manage Products", loadProducts)}
              {openPanel === "products" && (
                <div className="px-1 py-2 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Name *" className="px-3 py-2 border rounded" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                    <input placeholder="Category *" className="px-3 py-2 border rounded" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                    <input placeholder="Price" type="number" className="px-3 py-2 border rounded" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                    <input placeholder="Stock" type="number" className="px-3 py-2 border rounded" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                  </div>
                  <input placeholder="Description" className="w-full px-3 py-2 border rounded" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                  <button onClick={addProduct} className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700">Add Product</button>
                  <ul className="space-y-2 max-h-56 overflow-auto">
                    {products.map(p => (
                      <li key={p.id} className="flex items-center justify-between text-sm border border-slate-100 rounded px-3 py-2">
                        <span className="truncate">{p.name} <span className="text-slate-400">({p.category})</span></span>
                        <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700 ml-2">Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {panelButton("subscriptions", "Manage Subscriptions", loadPackages)}
              {openPanel === "subscriptions" && (
                <div className="px-1 py-2 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <input placeholder="Name *" className="px-3 py-2 border rounded" value={newPkg.name} onChange={e => setNewPkg({ ...newPkg, name: e.target.value })} />
                    <input placeholder="Price" type="number" className="px-3 py-2 border rounded" value={newPkg.price} onChange={e => setNewPkg({ ...newPkg, price: e.target.value })} />
                    <select className="px-3 py-2 border rounded" value={newPkg.billingType} onChange={e => setNewPkg({ ...newPkg, billingType: e.target.value })}>
                      <option value="Monthly">Monthly</option>
                      <option value="One-time">One-time</option>
                    </select>
                  </div>
                  <input placeholder="Features (comma separated)" className="w-full px-3 py-2 border rounded" value={newPkg.features} onChange={e => setNewPkg({ ...newPkg, features: e.target.value })} />
                  <button onClick={addPackage} className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700">Create Package</button>
                  <ul className="space-y-2 max-h-56 overflow-auto">
                    {packages.map(p => (
                      <li key={p.id} className="text-sm border border-slate-100 rounded px-3 py-2 flex justify-between">
                        <span>{p.name} — ৳{p.price}/{p.billingType}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {panelButton("users", "View Users", loadUsers)}
              {openPanel === "users" && (
                <div className="px-1 py-2">
                  <ul className="space-y-2 max-h-56 overflow-auto">
                    {users.map(u => (
                      <li key={u.id} className="text-sm border border-slate-100 rounded px-3 py-2 flex justify-between">
                        <span>{u.name} <span className="text-slate-400">({u.email})</span></span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>{u.role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {panelButton("coupons", "Generate Coupons")}
              {openPanel === "coupons" && (
                <div className="px-1 py-2 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <input placeholder="Code *" className="px-3 py-2 border rounded uppercase" value={coupon.code} onChange={e => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })} />
                    <input placeholder="Discount ৳" type="number" className="px-3 py-2 border rounded" value={coupon.discountValue} onChange={e => setCoupon({ ...coupon, discountValue: e.target.value })} />
                    <input placeholder="Required pts" type="number" className="px-3 py-2 border rounded" value={coupon.requiredPoints} onChange={e => setCoupon({ ...coupon, requiredPoints: e.target.value })} />
                  </div>
                  <button onClick={createCoupon} className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700">Create Coupon</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
