"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const fetchProducts = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (category) query.append("category", category);
      
      const res = await fetch(`http://localhost:5000/api/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">E-Shop Products</h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-card text-foreground"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
          </select>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-border flex flex-col">
                <div className="h-48 bg-neutral-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-neutral-400">No Image</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground line-clamp-1">{product.name}</h3>
                <p className="text-sm text-neutral-500 mb-2">{product.category}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold text-foreground">৳{product.price}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-success-600/20 text-success-600' : product.stock > 0 ? 'bg-warning-500/20 text-warning-500' : 'bg-danger-500/20 text-danger-500'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <p className="text-neutral-500 text-lg">No products found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
