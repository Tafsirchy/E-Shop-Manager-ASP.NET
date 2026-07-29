"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const router = useRouter();

  useEffect(() => {
    // In a real app, you would attach the JWT token
    fetch("http://localhost:5000/api/cart", {
      headers: {
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(console.error);
  }, []);

  const removeItem = async (productId: string) => {
    await fetch(`http://localhost:5000/api/cart/items/${productId}`, {
      method: "DELETE"
    });
    setCart(prev => prev ? { ...prev, items: prev.items.filter(i => i.productId !== productId) } : null);
  };

  const checkout = async () => {
    const res = await fetch("http://localhost:5000/api/orders/checkout", {
      method: "POST"
    });
    if (res.ok) {
      alert("Order placed successfully!");
      setCart({ userId: "", items: [], updatedAt: new Date().toISOString() });
      router.push("/");
    }
  };

  if (!cart) return <div className="p-8 text-center">Loading cart...</div>;

  const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto bg-card p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        {cart.items.length === 0 ? (
          <p className="text-neutral-500">Your cart is empty.</p>
        ) : (
          <div>
            {cart.items.map(item => (
              <div key={item.productId} className="flex justify-between items-center py-4 border-b">
                <div>
                  <h3 className="text-xl font-semibold">{item.productName}</h3>
                  <p className="text-neutral-500">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">৳{item.price * item.quantity}</span>
                  <button 
                    onClick={() => removeItem(item.productId)}
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
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={checkout}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold shadow-md transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
