import { apiFetch, getGuestId, getToken } from "./api";

export interface CartItem {
  itemId?: string;
  ItemId?: string;
  productId: string;
  variantId?: string;
  productName?: string;
  ProductName?: string;
  name?: string;
  quantity: number;
  Quantity?: number;
  price: number;
  unitPriceSnapshot?: number;
  UnitPriceSnapshot?: number;
  Price?: number;
}

export interface Cart {
  userId?: string;
  guestSessionId?: string;
  items: CartItem[];
  updatedAt?: string;
}

// Routes cart calls to the authenticated endpoint when a JWT exists,
// otherwise to the guest cart endpoint.
function cartPath(suffix = ""): string {
  const token = getToken();
  if (token) return `/api/cart${suffix}`;
  const guest = getGuestId();
  return `/api/cartpublic/guest/${guest}${suffix}`;
}

// Normalize legacy field casing into the canonical camelCase shape.
function normalizeItem(i: CartItem): CartItem {
  return {
    itemId: i.itemId ?? i.ItemId ?? i.productId,
    productId: i.productId,
    variantId: i.variantId,
    productName: i.productName ?? i.name ?? i.ProductName,
    quantity: i.quantity ?? i.Quantity ?? 0,
    price: i.price ?? i.unitPriceSnapshot ?? i.Price ?? i.UnitPriceSnapshot ?? 0,
  };
}

export async function fetchCart(): Promise<Cart> {
  const cart = await apiFetch<Cart>(cartPath());
  return { ...cart, items: (cart.items ?? []).map(normalizeItem) };
}

export async function addToCart(
  productId: string,
  quantity: number,
  variantId?: string
): Promise<Cart> {
  const cart = await apiFetch<Cart>(cartPath("/items"), {
    method: "POST",
    body: { productId, quantity, variantId },
  });
  return { ...cart, items: (cart.items ?? []).map(normalizeItem) };
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const cart = await apiFetch<Cart>(cartPath(`/items/${itemId}`), {
    method: "PUT",
    body: { quantity },
  });
  return { ...cart, items: (cart.items ?? []).map(normalizeItem) };
}

export async function removeCartItem(itemId: string): Promise<void> {
  await apiFetch<void>(cartPath(`/items/${itemId}`), { method: "DELETE" });
}
