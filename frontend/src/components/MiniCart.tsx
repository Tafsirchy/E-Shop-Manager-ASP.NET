"use client";
import React, { useCallback, useEffect, useState } from "react";
import { CartItem, fetchCart, removeCartItem } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export default function MiniCart() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { loading: authLoading } = useAuth();

  const fetchItems = useCallback(async () => {
    try {
      const cart = await fetchCart();
      setItems(cart.items || []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let ignore = false;
    fetchCart()
      .then(cart => { if (!ignore) setItems(cart.items || []); })
      .catch(() => { if (!ignore) setItems([]); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [authLoading]);

  useEffect(() => {
    const handler = () => {
      setLoading(true);
      fetchItems();
    };
    window.addEventListener("eshop:cart-updated", handler as EventListener);
    return () => window.removeEventListener("eshop:cart-updated", handler as EventListener);
  }, [fetchItems]);

  const badge = items.reduce((s, it) => s + (it.quantity || 0), 0);

  const removeItem = async (itemId: string) => {
    const prev = items;
    setItems(items.filter(i => i.itemId !== itemId));
    try {
      await removeCartItem(itemId);
    } catch {
      setItems(prev);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative" aria-label="Open cart">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
        {badge > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2">{badge}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 z-50">
          <h4 className="font-bold mb-3">Cart</h4>
          {loading ? <div>Loading...</div> : (
            items.length === 0 ? <div className="text-neutral-500">Cart is empty</div> : (
              <ul className="space-y-3 max-h-60 overflow-auto">
                {items.map(it => (
                  <li key={it.itemId} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.productName || "Product"}</div>
                      <div className="text-sm text-neutral-500">Qty: {it.quantity}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-semibold">৳{it.price}</div>
                      <button className="text-sm text-red-500 mt-2" onClick={() => it.itemId && removeItem(it.itemId)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
          <div className="mt-4">
            <a href="/cart" className="inline-block w-full text-center bg-foreground text-white py-2 rounded-lg">View Cart</a>
          </div>
        </div>
      )}
    </div>
  );
}
