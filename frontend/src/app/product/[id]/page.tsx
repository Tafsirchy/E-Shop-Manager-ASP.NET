"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { addToCart } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  brand: string;
  sku: string;
  category: string;
  subcategory?: string;
  shortDescription?: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  stockStatus?: string;
  imageUrl?: string;
  galleryImages?: string[];
  videoUrl?: string;
  badge?: string;
  priceUnit?: string;
  warranty?: string;
  deliveryEstimate?: string;
  returnPolicy?: string;
  seoTitle?: string;
  seoDescription?: string;
  averageRating: number;
  reviewCount: number;
  specs?: { name: string; value: string }[];
  variants?: { id: string; name: string; type: string; value: string; imageUrl?: string; price: number; stock: number }[];
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase?: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  sellerReply?: { text: string; repliedAt: string };
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<Product>(`/api/products/${params.id}`, { method: "GET", auth: false });
        setProduct(data);
        setSelectedImage(data.imageUrl ?? data.galleryImages?.[0] ?? null);
        const reviewData = await apiFetch<Review[]>(`/api/reviews/product/${params.id}?limit=6`, { method: "GET", auth: false });
        setReviews(reviewData);
      } catch (e) {
        setError(errorMessage(e, "Failed to load product details."));
      } finally {
        setLoading(false);
      }
    };

    if (params.id) void load();
  }, [params.id]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const images = [product.imageUrl, ...(product.galleryImages ?? [])].filter(Boolean) as string[];
    return Array.from(new Set(images));
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity);
    window.dispatchEvent(new CustomEvent("eshop:cart-updated"));
  };

  const submitReview = async () => {
    if (!product || !user) return;
    setSubmittingReview(true);
    try {
      await apiFetch<Review>("/api/reviews", {
        method: "POST",
        auth: true,
        body: {
          productId: product.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        },
      });
      setReviewForm({ rating: 5, title: "", comment: "" });
      const reviewData = await apiFetch<Review[]>(`/api/reviews/product/${product.id}?limit=6`, { method: "GET", auth: false });
      setReviews(reviewData);
    } catch (e) {
      setError(errorMessage(e, "Unable to submit review."));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-background p-8 text-center text-neutral-500">Loading product...</main>;
  if (error || !product) return <main className="min-h-screen bg-background p-8 text-center text-red-500">{error ?? "Product not found."}</main>;

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <nav className="text-sm text-neutral-500">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <span>{product.category}</span>
          {product.subcategory ? <><span className="mx-2">/</span><span>{product.subcategory}</span></> : null}
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-3xl border border-border bg-white p-4 shadow-sm">
            <div className="overflow-hidden rounded-2xl bg-neutral-100">
              {selectedImage ? <img src={selectedImage} alt={product.name} className="h-[480px] w-full object-cover" /> : <div className="flex h-[480px] items-center justify-center text-neutral-500">No image</div>}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((image) => (
                <button key={image} type="button" onClick={() => setSelectedImage(image)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border ${selectedImage === image ? "border-primary-600" : "border-neutral-200"}`}>
                  <img src={image} alt={product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {product.badge ? <span className="rounded-full bg-primary-600/10 px-3 py-1 text-sm font-semibold text-primary-700">{product.badge}</span> : null}
                <span className="text-sm text-neutral-500">{product.brand}</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              <p className="text-lg text-neutral-600">{product.shortDescription || product.description}</p>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <span className="font-semibold text-amber-600">★ {product.averageRating.toFixed(1)}</span>
                <span>{product.reviewCount} reviews</span>
                <span className="text-primary-600">SKU: {product.sku}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-foreground">৳{product.price}</span>
                {product.originalPrice ? <span className="text-lg text-neutral-400 line-through">৳{product.originalPrice}</span> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {product.originalPrice ? <span className="rounded-full bg-danger-500/10 px-3 py-1 font-semibold text-danger-600">Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span> : null}
                {product.priceUnit ? <span className="rounded-full bg-neutral-100 px-3 py-1">{product.priceUnit}</span> : null}
                {product.badge ? <span className="rounded-full bg-success-600/10 px-3 py-1 text-success-600">{product.badge}</span> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Availability</span>
                <span className={`font-medium ${product.stock > 0 ? "text-success-600" : "text-danger-600"}`}>{product.stockStatus || (product.stock > 0 ? "In Stock" : "Out of Stock")}</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button type="button" onClick={() => setQuantity((v) => Math.max(1, v - 1))} className="h-10 w-10 rounded-full border border-border text-lg">−</button>
                <span className="min-w-10 text-center text-lg font-semibold">{quantity}</span>
                <button type="button" onClick={() => setQuantity((v) => Math.min(product.stock, v + 1))} className="h-10 w-10 rounded-full border border-border text-lg">+</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={handleAddToCart} className="rounded-full bg-primary-600 px-5 py-3 font-semibold text-white">Add to Cart</button>
                <button className="rounded-full border border-border px-5 py-3 font-semibold text-foreground">Buy Now</button>
              </div>
              <div className="mt-4 text-sm text-neutral-600">
                <p>Delivery: {product.deliveryEstimate || "Estimated in 2-4 business days"}</p>
                <p>Returns: {product.returnPolicy || "Easy 7-day return policy"}</p>
                <p>Warranty: {product.warranty || "12-month seller warranty"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">Product Description</h2>
            <div className="mt-4 space-y-4 text-neutral-600">
              <p>{product.description}</p>
              {product.specs && product.specs.length > 0 ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                  <div className="bg-neutral-50 px-4 py-3 font-semibold text-foreground">Specifications</div>
                  <div className="divide-y divide-border">
                    {product.specs.map((spec) => (
                      <div key={spec.name} className="grid grid-cols-[140px_1fr] px-4 py-3 text-sm">
                        <span className="font-medium text-neutral-500">{spec.name}</span>
                        <span>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground">Write a Review</h3>
              {!user ? <p className="mt-3 text-sm text-neutral-500">Please sign in to leave a review.</p> : (
                <div className="mt-4 space-y-3">
                  <select value={reviewForm.rating} onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} className="w-full rounded-xl border border-border px-3 py-2">
                    {[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} star{rating > 1 ? "s" : ""}</option>)}
                  </select>
                  <input value={reviewForm.title} onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Review title" className="w-full rounded-xl border border-border px-3 py-2" />
                  <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))} placeholder="Share your thoughts" rows={4} className="w-full rounded-xl border border-border px-3 py-2" />
                  <button onClick={submitReview} disabled={submittingReview} className="rounded-full bg-primary-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{submittingReview ? "Submitting..." : "Submit Review"}</button>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground">Customer Reviews</h3>
              <div className="mt-4 space-y-4">
                {reviews.length === 0 ? <p className="text-sm text-neutral-500">No reviews yet.</p> : reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-foreground">{review.title || "Review"}</div>
                      <div className="text-amber-600">{'★'.repeat(review.rating)}</div>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>
                    {review.sellerReply ? <div className="mt-3 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">Seller reply: {review.sellerReply.text}</div> : null}
                    <p className="mt-2 text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
