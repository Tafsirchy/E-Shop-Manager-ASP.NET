"use client";
import React, { useEffect, useState } from "react";

function getGuestId() {
  if (typeof window === 'undefined') return 'guest';
  let id = localStorage.getItem('EShopGuest');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem('EShopGuest', id);
  }
  return id;
}

export default function MiniCart() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    const guest = getGuestId();
    try {
      const res = await fetch(`/api/cart/guest/${guest}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);
  useEffect(() => {
    const handler = () => fetchCart();
    window.addEventListener('eshop:cart-updated', handler as EventListener);
    return () => window.removeEventListener('eshop:cart-updated', handler as EventListener);
  }, []);

  const badge = items.reduce((s, it) => s + (it.quantity || it.Quantity || 0), 0);

  const removeItem = async (productId: string) => {
    const guest = getGuestId();
    // optimistic
    const prev = items;
    setItems(items.filter(i => i.productId !== productId && i.ProductId !== productId));
    try {
      await fetch(`/api/cart/guest/${guest}/items/${productId}`, { method: 'DELETE' });
    } catch (e) {
      setItems(prev);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
        {badge > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2">{badge}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 z-50">
          <h4 className="font-bold mb-3">Cart</h4>
          {loading ? <div>Loading...</div> : (
            items.length === 0 ? <div className="text-neutral-500">Cart is empty</div> : (
              <ul className="space-y-3 max-h-60 overflow-auto">
                {items.map((it:any) => (
                  <li key={it.itemId || it.ItemId || it.productId} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.productName || it.name || it.ProductName}</div>
                      <div className="text-sm text-neutral-500">Qty: {it.quantity || it.Quantity || it.Quantity}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-semibold">৳{(it.unitPriceSnapshot || it.UnitPriceSnapshot || it.price || it.Price || 0)}</div>
                      <button className="text-sm text-red-500 mt-2" onClick={() => removeItem(it.productId || it.ProductId)}>Remove</button>
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
