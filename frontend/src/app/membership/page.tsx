"use client";

import { useState, useEffect } from "react";

interface UserMembership {
  totalSpent: number;
  currentRole: string;
  rewardPoints: number;
}

export default function MembershipPage() {
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // In real app, attach JWT token
    fetch("http://localhost:5000/api/membership", {
      // headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setMembership(data))
      .catch(console.error);
  }, []);

  const claimCoupon = async () => {
    const res = await fetch(`http://localhost:5000/api/membership/claim-coupon/${couponCode}`, {
      method: "POST"
    });
    
    if (res.ok) {
      setMessage("Coupon claimed successfully! Your points have been deducted.");
      // Refresh points
      const updated = await fetch("http://localhost:5000/api/membership").then(r => r.json());
      setMembership(updated);
    } else {
      setMessage("Failed to claim coupon. Insufficient points or invalid code.");
    }
  };

  if (!membership) return <div className="p-8 text-center text-gray-500">Loading your membership data...</div>;

  const nextTierThreshold = 50000;
  const progressPercentage = Math.min((membership.totalSpent / nextTierThreshold) * 100, 100);

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <h1 className="text-4xl font-bold mb-8">Membership & Rewards</h1>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg text-gray-500 mb-1">Current Tier</h2>
            <div className={`text-3xl font-extrabold ${membership.currentRole === 'Premium' ? 'text-amber-500' : 'text-slate-700'}`}>
              {membership.currentRole} Member
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg text-gray-500 mb-1">Total Lifetime Spent</h2>
            <div className="text-3xl font-bold text-gray-900">৳{membership.totalSpent.toLocaleString()}</div>
          </div>
        </div>

        {membership.currentRole === "Regular" && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-gray-500">Progress to Premium Tier</span>
              <span className="text-blue-600">৳{membership.totalSpent} / ৳{nextTierThreshold}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Spend ৳{nextTierThreshold - membership.totalSpent} more to unlock Premium benefits (10% off all orders)!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-xl shadow-md text-white">
            <h2 className="text-xl font-semibold mb-2 text-indigo-100">Reward Points Balance</h2>
            <div className="text-5xl font-black mb-4">{membership.rewardPoints} <span className="text-2xl font-medium">pts</span></div>
            <p className="text-sm text-indigo-100">You earn 1 point for every ৳100 spent on orders.</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Redeem Points</h2>
            <p className="text-gray-500 text-sm mb-4">Enter a coupon code to redeem your points for discounts on your next order.</p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="E.g. SAVE500"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 uppercase"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <button
                onClick={claimCoupon}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Claim
              </button>
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
