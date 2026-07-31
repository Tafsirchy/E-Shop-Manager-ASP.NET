"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface SubscriptionPackage {
  id: string;
  type: string;
  name: string;
  price: number;
  billingType: string;
  features: string[];
  offer?: { threshold: number; discount: number };
}

interface CustomPackage extends SubscriptionPackage {
  offer?: { threshold: number; discount: number };
}

export default function SubscriptionsPage() {
  const { token } = useAuth();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customPackage, setCustomPackage] = useState<CustomPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const availableFeatures = [
    "Premium Support",
    "Advanced Analytics",
    "Unlimited Products",
    "Custom Domain",
    "API Access"
  ];

  useEffect(() => {
    apiFetch<SubscriptionPackage[]>("/api/subscriptions/packages", { auth: false })
      .then(data => setPackages(data))
      .catch((e) => setError(errorMessage(e, "Failed to load subscription packages.")))
      .finally(() => setLoading(false));
  }, []);

  const requireAuth = (): boolean => {
    if (!token) {
      setActionMsg({ text: "Please sign in to subscribe.", ok: false });
      return false;
    }
    return true;
  };

  const subscribe = async (pkg: SubscriptionPackage) => {
    setActionMsg(null);
    if (!requireAuth()) return;
    setSubscribingId(pkg.id);
    try {
      await apiFetch(`/api/subscriptions/purchase/${pkg.id}`, { method: "POST" });
      setActionMsg({ text: `Subscribed to "${pkg.name}" successfully!`, ok: true });
    } catch (e) {
      setActionMsg({ text: errorMessage(e, "Subscription failed."), ok: false });
    } finally {
      setSubscribingId(null);
    }
  };

  const buildCustomPackage = async () => {
    setActionMsg(null);
    if (selectedFeatures.length === 0) {
      setActionMsg({ text: "Select at least one feature to build a package.", ok: false });
      return;
    }
    if (!requireAuth()) return;
    setBuilding(true);
    try {
      const data = await apiFetch<CustomPackage>("/api/subscriptions/custom/build", {
        method: "POST",
        body: selectedFeatures,
      });
      setCustomPackage(data);
    } catch (e) {
      setActionMsg({ text: errorMessage(e, "Could not build custom package."), ok: false });
    } finally {
      setBuilding(false);
    }
  };

  const purchaseCustom = async () => {
    setActionMsg(null);
    if (selectedFeatures.length === 0) {
      setActionMsg({ text: "Select at least one feature to purchase a package.", ok: false });
      return;
    }
    if (!requireAuth()) return;
    setPurchasing(true);
    try {
      await apiFetch("/api/subscriptions/custom/purchase", {
        method: "POST",
        body: selectedFeatures,
      });
      setActionMsg({ text: "Custom plan purchased successfully!", ok: true });
      setCustomPackage(null);
    } catch (e) {
      setActionMsg({ text: errorMessage(e, "Purchase failed."), ok: false });
    } finally {
      setPurchasing(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center">Subscription Plans</h1>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}
        {actionMsg && (
          <p className={`text-center mb-6 ${actionMsg.ok ? "text-success-600" : "text-red-500"}`}>{actionMsg.text}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Pre-built Packages */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Pre-built Packages</h2>
            {loading ? (
              <p className="text-neutral-500">Loading packages...</p>
            ) : packages.length === 0 ? (
              <p className="text-neutral-500">No pre-built packages available right now.</p>
            ) : (
              <div className="space-y-6">
                {packages.map(pkg => (
                  <div key={pkg.id} className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                    <p className="text-primary-600 font-semibold mb-4 text-lg">৳{pkg.price} / {pkg.billingType}</p>
                    <ul className="list-disc pl-5 mb-6 text-neutral-600 space-y-2">
                      {pkg.features.map(f => <li key={f}>{f}</li>)}
                    </ul>
                    <button
                      onClick={() => subscribe(pkg)}
                      disabled={subscribingId === pkg.id}
                      className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition disabled:opacity-50"
                    >
                      {subscribingId === pkg.id ? "Subscribing..." : "Subscribe Now"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Package Builder */}
          <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-bold mb-6 text-primary-700">Build Your Custom Package</h2>
            <p className="text-neutral-500 mb-6">Select the features you need. Pay only for what you use.</p>

            <div className="space-y-4 mb-8">
              {availableFeatures.map(feature => (
                <label key={feature} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-primary-600"
                    checked={selectedFeatures.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                  />
                  <span className="text-neutral-700">{feature}</span>
                </label>
              ))}
            </div>

            <button
              onClick={buildCustomPackage}
              disabled={building}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
            >
              {building ? "Calculating..." : "Calculate Price"}
            </button>

            {customPackage && (
              <div className="mt-8 p-6 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="text-lg font-bold text-purple-900 mb-2">Your Custom Plan</h3>
                <div className="text-3xl font-bold text-primary-700 mb-4">
                  ৳{customPackage.price}
                  {customPackage.offer && (
                    <span className="text-sm ml-2 text-green-600 bg-success-600/20 px-2 py-1 rounded-full align-middle">
                      {customPackage.offer.discount}% OFF Applied!
                    </span>
                  )}
                </div>
                <button
                  onClick={purchaseCustom}
                  disabled={purchasing}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50"
                >
                  {purchasing ? "Purchasing..." : "Purchase Custom Plan"}
                </button>
              </div>
            )}

            {!token && (
              <p className="text-sm text-neutral-500 mt-4">
                <Link href="/login" className="text-primary-600 underline">Sign in</Link> to build or purchase a plan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
