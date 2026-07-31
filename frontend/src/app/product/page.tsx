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

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

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
              <div key={product.id} className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-border flex flex-col">
                <div className="h-48 bg-neutral-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${product.stock > 10 ? "bg-success-600/20 text-success-600" : product.stock > 0 ? "bg-warning-500/20 text-warning-500" : "bg-danger-500/20 text-danger-500"}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                  <button
                    disabled={product.stock <= 0 || addingId === product.id}
                    onClick={() => handleAddToCart(product)}
                    className="ml-2 px-4 py-2 bg-accent-500 text-white rounded-lg disabled:opacity-50"
                  >
                    {addingId === product.id ? "Adding..." : "Add to cart"}
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
