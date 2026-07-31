"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError, getGuestId } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      const guestId = getGuestId();
      const result = await login(email.trim(), password, guestId);
      if (result.merge && result.merge.mergedCartCount > 0) {
        setNotice(
          `Signed in. ${result.merge.mergedCartCount} item(s) from your guest session were merged into your cart.`
        );
      }
      window.dispatchEvent(new CustomEvent("eshop:cart-updated"));
      router.push(result.role === "Admin" ? "/admin" : "/");
    } catch (err) {
      setError(
        err instanceof ApiError ? (err.message ?? "Unable to sign in.") : "Unable to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">Welcome back.</h1>
        <p className="text-neutral-500 mb-8">Sign in to access your cart, orders and membership.</p>

        {notice && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-success-600/20 text-success-600">{notice}</div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-danger-500/20 text-danger-500">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-foreground"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
