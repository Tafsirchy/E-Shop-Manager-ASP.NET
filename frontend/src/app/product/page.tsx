"use client";

import { useState, useEffect } from "react";
import WishlistToggle from "@/components/WishlistToggle";

function getGuestId() {
  if (typeof window === 'undefined') return 'guest';
  let id = localStorage.getItem('EShopGuest');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem('EShopGuest', id);
  }
  return id;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  createdAt?: string;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const fetchProducts = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);

      const res = await fetch(`http://localhost:5000/api/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // Apply client-side sorting if requested
        const sorted = applySort(data, sort);
        setProducts(sorted);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, sort]);

  function applySort(items: Product[], sortKey: string) {
    if (!sortKey) return items;

    const copy = [...items];
    switch (sortKey) {
      case 'new':
        return copy.sort((a, b) => {
          const da = new Date((a as any).createdAt || a.createdAt || 0).getTime();
          const db = new Date((b as any).createdAt || b.createdAt || 0).getTime();
          return db - da;
        });
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'stock':
        return copy.sort((a, b) => b.stock - a.stock);
      case 'name-asc':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return items;
    }
  }

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
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Sort: Default</option>
            <option value="new">Sort: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Sort: Most Stock</option>
            <option value="name-asc">Name: A → Z</option>
          </select>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-border flex flex-col">
                <div className="h-48 bg-neutral-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-neutral-400">No Image</span>
                  )}
                  <div className="absolute top-2 right-2">
                    <WishlistToggle productId={product.id} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground line-clamp-1">{product.name}</h3>
                <p className="text-sm text-neutral-500 mb-2">{product.category}</p>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className="text-xl font-bold text-foreground">৳{product.price}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-success-600/20 text-success-600' : product.stock > 0 ? 'bg-warning-500/20 text-warning-500' : 'bg-danger-500/20 text-danger-500'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                  <button
                    disabled={product.stock <= 0}
                    onClick={async () => {
                      const guest = getGuestId();
                      const body = { productId: product.id, quantity: 1 };
                      // optimistic UI: show a quick toast or update not implemented here
                      const res = await fetch(`/api/cart/guest/${guest}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                      if (!res.ok) {
                        const err = await res.json().catch(() => null);
                        alert(err?.message || 'Unable to add to cart');
                      } else {
                        // Optionally refresh mini-cart via custom event
                        window.dispatchEvent(new CustomEvent('eshop:cart-updated'));
                      }
                    }}
                    className="ml-2 px-4 py-2 bg-accent-500 text-white rounded-lg"
                  >Add to cart</button>
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
