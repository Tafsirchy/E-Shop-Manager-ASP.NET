"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface UserMembership {
  totalSpent: number;
  currentRole: string;
  rewardPoints: number;
}

export default function MembershipPage() {
  const { token, loading: authLoading } = useAuth();
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (authLoading || !token) return;
    apiFetch<UserMembership>("/api/membership")
      .then(setMembership)
      .catch((e) => setError(errorMessage(e, "Failed to load membership data.")));
  }, [authLoading, token]);

  const claimCoupon = async () => {
    if (!couponCode) return;
    setClaiming(true);
    setMessage(null);
    try {
      const res = await apiFetch<{ message: string }>(`/api/membership/claim-coupon/${couponCode}`, {
        method: "POST",
      });
      setMessage({ text: res.message ?? "Coupon claimed successfully!", ok: true });
      const updated = await apiFetch<UserMembership>("/api/membership");
      setMembership(updated);
    } catch (e) {
      setMessage({ text: errorMessage(e, "Failed to claim coupon. Insufficient points or invalid code."), ok: false });
    } finally {
      setClaiming(false);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center text-neutral-500">Loading your membership data...</div>;
  }

  if (!token) {
    return (
      <div className="min-h-screen p-8 bg-background text-foreground">
        <div className="max-w-4xl mx-auto bg-card p-8 rounded-xl shadow-sm border border-border text-center">
          <h1 className="text-3xl font-bold mb-4">Membership & Rewards</h1>
          <p className="text-neutral-600 mb-6">Sign in to view your membership tier, rewards, and available coupons.</p>
          <Link href="/login" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error || !membership) {
    return (
      <div className="min-h-screen p-8 bg-background text-foreground">
        <div className="max-w-4xl mx-auto bg-card p-8 rounded-xl shadow-sm border border-border">
          <h1 className="text-3xl font-bold mb-4">Membership & Rewards</h1>
          <p className="text-red-500">{error ?? "Membership data unavailable."}</p>
        </div>
      </div>
    );
  }

  const nextTierThreshold = 50000;
  const progressPercentage = Math.min((membership.totalSpent / nextTierThreshold) * 100, 100);

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-4xl font-bold mb-8">Membership & Rewards</h1>

        <div className="bg-card p-8 rounded-xl shadow-sm border border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg text-neutral-500 mb-1">Current Tier</h2>
            <div className={`text-3xl font-extrabold ${membership.currentRole === "Premium" ? "text-amber-500" : "text-slate-700"}`}>
              {membership.currentRole} Member
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg text-neutral-500 mb-1">Total Lifetime Spent</h2>
            <div className="text-3xl font-bold text-foreground">৳{membership.totalSpent.toLocaleString()}</div>
          </div>
        </div>

        {membership.currentRole === "Regular" && (
          <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-neutral-500">Progress to Premium Tier</span>
              <span className="text-primary-600">৳{membership.totalSpent} / ৳{nextTierThreshold}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-sm text-neutral-500 mt-3">
              Spend ৳{(nextTierThreshold - membership.totalSpent).toLocaleString()} more to unlock Premium benefits (10% off all orders)!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-xl shadow-md text-white">
            <h2 className="text-xl font-semibold mb-2 text-indigo-100">Reward Points Balance</h2>
            <div className="text-5xl font-black mb-4">{membership.rewardPoints} <span className="text-2xl font-medium">pts</span></div>
            <p className="text-sm text-indigo-100">You earn 1 point for every ৳100 spent on orders.</p>
          </div>

          <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-xl font-bold mb-4">Redeem Points</h2>
            <p className="text-neutral-500 text-sm mb-4">Enter a coupon code to redeem your points for discounts on your next order.</p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="E.g. SAVE500"
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-foreground uppercase"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <button
                onClick={claimCoupon}
                disabled={claiming || !couponCode}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
              >
                {claiming ? "Claiming..." : "Claim"}
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.ok ? "bg-success-600/20 text-success-600" : "bg-danger-500/20 text-danger-500"}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
