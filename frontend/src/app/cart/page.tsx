"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchCart, updateCartItem, removeCartItem, CartItem } from "@/lib/cart";
import { apiFetch, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Cart {
  userId?: string;
  items: CartItem[];
}

export default function CartPage() {
  const { loading: authLoading, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const loadCart = useCallback(async () => {
    if (authLoading) return;
    try {
      const data = await fetchCart();
      setCart(data);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, "Failed to load cart."));
    }
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
    let ignore = false;
    fetchCart()
      .then(data => { if (!ignore) { setCart(data); setError(null); } })
      .catch(e => { if (!ignore) setError(errorMessage(e, "Failed to load cart.")); });
    return () => { ignore = true; };
  }, [authLoading]);

  const changeQuantity = async (item: CartItem, delta: number) => {
    const next = Math.max(1, item.quantity + delta);
    if (next === item.quantity) return;
    setCart(prev => prev ? {
      ...prev,
      items: prev.items.map(i => i.itemId === item.itemId ? { ...i, quantity: next } : i),
    } : prev);
    try {
      const updated = await updateCartItem(item.itemId!, next);
      setCart(updated);
      window.dispatchEvent(new Event("eshop:cart-updated"));
    } catch (e) {
      setError(errorMessage(e, "Could not update quantity."));
      loadCart();
    }
  };

  const removeItem = async (item: CartItem) => {
    setCart(prev => prev ? { ...prev, items: prev.items.filter(i => i.itemId !== item.itemId) } : prev);
    try {
      await removeCartItem(item.itemId!);
      window.dispatchEvent(new Event("eshop:cart-updated"));
    } catch (e) {
      setError(errorMessage(e, "Could not remove item."));
      loadCart();
    }
  };

  const checkout = async () => {
    setCheckoutError(null);
    setPlacing(true);
    try {
      await apiFetch<void>("/api/orders/checkout", { method: "POST" });
      setCart({ items: [] });
      setPlaced(true);
      window.dispatchEvent(new Event("eshop:cart-updated"));
    } catch (e) {
      setCheckoutError(errorMessage(e, "Checkout failed. Please try again."));
      loadCart();
    } finally {
      setPlacing(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen p-8 bg-background text-foreground text-center">Loading...</div>;
  }

  if (placed) {
    return (
      <div className="min-h-screen p-8 bg-background text-foreground">
        <div className="max-w-4xl mx-auto bg-card p-8 rounded-xl shadow-sm text-center">
          <h1 className="text-3xl font-bold mb-4">Order placed!</h1>
          <p className="text-neutral-600 mb-6">Thank you for your purchase. We&apos;re preparing your items.</p>
          <Link href="/" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen p-8 bg-background text-foreground">
        <div className="max-w-4xl mx-auto bg-card p-8 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto bg-card p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {items.length === 0 ? (
          <div>
            <p className="text-neutral-500 mb-4">Your cart is empty.</p>
            <Link href="/" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold">
              Browse Products
            </Link>
          </div>
        ) : (
          <div>
            {items.map(item => (
              <div key={item.itemId} className="flex justify-between items-center py-4 border-b">
                <div>
                  <h3 className="text-xl font-semibold">{item.productName || "Product"}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-neutral-500">Qty:</span>
                    <button
                      onClick={() => changeQuantity(item, -1)}
                      className="w-7 h-7 rounded border border-neutral-300 hover:bg-neutral-100"
                      aria-label="Decrease quantity"
                    >-</button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => changeQuantity(item, 1)}
                      className="w-7 h-7 rounded border border-neutral-300 hover:bg-neutral-100"
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">৳{(item.price || 0) * item.quantity}</span>
                  <button
                    onClick={() => removeItem(item)}
                    className="text-red-500 hover:text-danger-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-8 flex justify-between items-center text-2xl font-bold">
              <span>Total:</span>
              <span>৳{total}</span>
            </div>

            {checkoutError && <p className="text-red-500 mt-4">{checkoutError}</p>}

            <div className="mt-8 flex justify-end gap-4">
              {token ? (
                <button
                  onClick={checkout}
                  disabled={placing}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold shadow-md transition-colors disabled:opacity-50"
                >
                  {placing ? "Placing order..." : "Proceed to Checkout"}
                </button>
              ) : (
                <div className="text-right">
                  <p className="text-neutral-600 mb-3">Sign in to place your order.</p>
                  <div className="flex gap-3">
                    <Link href="/login" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold">
                      Sign In
                    </Link>
                    <Link href="/register" className="bg-neutral-200 text-foreground px-6 py-3 rounded-lg hover:bg-neutral-300 font-semibold">
                      Create Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
