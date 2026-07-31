"use client";
import React, { useEffect, useState } from "react";
import { apiFetch, getGuestId, getToken } from "@/lib/api";

interface Props {
  productId: string;
  variantId?: string | null;
}

interface Wishlist {
  items?: WishlistItem[];
}

interface WishlistItem {
  itemId?: string;
  productId: string;
  variantId?: string | null;
}

function wishlistPath(suffix = ""): string {
  const token = getToken();
  if (token) return `/api/wishlist${suffix}`;
  const guest = getGuestId();
  return `/api/wishlist/guest/${guest}${suffix}`;
}

export default function WishlistToggle({ productId, variantId }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemId, setItemId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await apiFetch<Wishlist>(wishlistPath());
        const found = (data.items || []).find(
          (i) => i.productId === productId && (i.variantId || null) === (variantId || null)
        );
        if (found) { setSaved(true); setItemId(found.itemId ?? null); }
      } catch {
        // ignore
      }
      setLoading(false);
    };
    fetchWishlist();
  }, [productId, variantId]);

  const toggle = async () => {
    if (saved) {
      if (!itemId) return;
      const prevId = itemId;
      setSaved(false);
      try {
        await apiFetch<void>(wishlistPath(`/items/${prevId}`), { method: "DELETE" });
      } catch {
        setSaved(true);
      }
    } else {
      setSaved(true);
      try {
        const data = await apiFetch<Wishlist>(wishlistPath("/items"), {
          method: "POST",
          body: { productId, variantId },
        });
        const found = (data.items || []).find(
          (i) => i.productId === productId && (i.variantId || null) === (variantId || null)
        );
        if (found) setItemId(found.itemId ?? null);
      } catch {
        setSaved(false);
      }
    }
  };

  return (
    <button aria-pressed={saved} onClick={toggle} disabled={loading} className="p-2 rounded-full hover:bg-neutral-100" aria-label="Toggle wishlist">
      {saved ? (
        <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      ) : (
        <svg className="w-6 h-6 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
      )}
    </button>
  );
}
