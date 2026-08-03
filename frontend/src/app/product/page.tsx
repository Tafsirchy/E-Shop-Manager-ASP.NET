"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import WishlistToggle from "@/components/WishlistToggle";
import { apiFetch, errorMessage } from "@/lib/api";
import { addToCart } from "@/lib/cart";

const CATEGORIES = [
  { value: "tshirts", label: "T-Shirts & Tops" },
  { value: "hoodies", label: "Hoodies & Sweatshirts" },
  { value: "jackets", label: "Jackets & Outerwear" },
  { value: "pants", label: "Pants & Denim" },
  { value: "activewear", label: "Activewear" },
  { value: "dresses", label: "Dresses" },
  { value: "tops", label: "Tops & Blouses" },
  { value: "knitwear", label: "Knitwear" },
  { value: "jeans", label: "Jeans & Skirts" },
  { value: "swimwear", label: "Swimwear" },
  { value: "bags", label: "Bags & Backpacks" },
  { value: "jewelry", label: "Jewelry & Watches" },
  { value: "sunglasses", label: "Sunglasses" },
  { value: "hats", label: "Hats & Beanies" },
  { value: "shoes", label: "Footwear" },
];

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

function applySort(items: Product[], sortKey: string) {
  if (!sortKey) return items;
  const copy = [...items];
  switch (sortKey) {
    case "new":
      return copy.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "stock":
      return copy.sort((a, b) => b.stock - a.stock);
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return items;
  }
}

function ProductList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlCategory = searchParams.get("category") ?? "";
  const urlSort = searchParams.get("sort") ?? "";
  const urlSearch = searchParams.get("search") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(urlSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    let ignore = false;
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (urlCategory) query.append("category", urlCategory);

    apiFetch<Product[]>(`/api/products?${query.toString()}`, { method: "GET", auth: false })
      .then(data => {
        if (!ignore) {
          // Server filters by category/search; apply sort client-side as before.
          setProducts(applySort(data, urlSort));
          setError(null);
        }
      })
      .catch(e => {
        if (!ignore) {
          setError(errorMessage(e, "Failed to load products."));
          setProducts([]);
        }
      })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [search, urlCategory, urlSort]);

  const handleCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("category", value);
    else params.delete("category");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleAddToCart = async (product: Product) => {
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      window.dispatchEvent(new CustomEvent("eshop:cart-updated"));
    } catch (e) {
      alert(errorMessage(e, "Unable to add to cart"));
    } finally {
      setAddingId(null);
    }
  };

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
            value={urlCategory}
            onChange={(e) => handleCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-card text-foreground"
            value={urlSort}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="">Sort: Default</option>
            <option value="new">Sort: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock">Sort: Most Stock</option>
            <option value="name-asc">Name: A → Z</option>
          </select>
        </div>

        {error && <p className="text-red-500 mb-6">{error}</p>}
        {loading ? (
          <div className="text-center py-20 text-neutral-500">Loading products...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group relative cursor-pointer bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border border-border flex flex-col overflow-hidden">
                <a
                  href={`/product/${product.id}`}
                  aria-label={`View details for ${product.name}`}
                  className="absolute inset-0 z-10 rounded-2xl"
                />
                <div className="h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <span className="text-neutral-400">No Image</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
                    <span className="rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700 shadow-sm">
                    View details
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 z-20">
                    <WishlistToggle productId={product.id} />
                  </div>
                </div>

                <div className="relative z-20 flex items-start justify-between gap-3 mb-3">
                  <div>
                    <a href={`/product/${product.id}`} className="text-lg font-semibold text-foreground line-clamp-1 hover:text-primary-600">
                      {product.name}
                    </a>
                    <p className="text-sm text-neutral-500">{product.category}</p>
                  </div>
                  <span className="text-lg font-bold text-foreground whitespace-nowrap">৳{product.price}</span>
                </div>

                <div className="relative z-20 mt-auto flex items-center justify-between gap-3">
                  <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${product.stock > 10 ? "bg-success-600/20 text-success-600" : product.stock > 0 ? "bg-warning-500/20 text-warning-500" : "bg-danger-500/20 text-danger-500"}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                  <button
                    disabled={product.stock <= 0 || addingId === product.id}
                    onClick={() => handleAddToCart(product)}
                    aria-label={product.stock > 0 ? `Add ${product.name} to cart` : "Out of stock"}
                    title={product.stock > 0 ? "Add to cart" : "Out of stock"}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-accent-600 transition-all duration-200 hover:scale-105 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingId === product.id ? (
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        <path className="opacity-75" d="M12 3a9 9 0 0 1 8.485 6.015" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 3h2l2.4 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L16.8 7H7" />
                        <circle cx="10" cy="19" r="1.2" fill="currentColor" stroke="none" />
                        <circle cx="17" cy="19" r="1.2" fill="currentColor" stroke="none" />
                        <path d="M15 7h4" />
                        <path d="M17 5v4" />
                      </svg>
                    )}
                  </button>
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

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 bg-background text-center text-neutral-500">Loading...</div>}>
      <ProductList />
    </Suspense>
  );
}
