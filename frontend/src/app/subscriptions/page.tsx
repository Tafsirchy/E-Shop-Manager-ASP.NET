"use client";

import { useState, useEffect } from "react";

interface SubscriptionPackage {
  id: string;
  type: string;
  name: string;
  price: number;
  billingType: string;
  features: string[];
}

export default function SubscriptionsPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customPackage, setCustomPackage] = useState<SubscriptionPackage | null>(null);

  const availableFeatures = [
    "Premium Support",
    "Advanced Analytics",
    "Unlimited Products",
    "Custom Domain",
    "API Access"
  ];

  useEffect(() => {
    fetch("http://localhost:5000/api/subscriptions/packages")
      .then(res => res.json())
      .then(data => setPackages(data))
      .catch(console.error);
  }, []);

  const buildCustomPackage = async () => {
    if (selectedFeatures.length === 0) return;
    
    // Simulate user spent total to see dynamic discount in action
    const userSpent = 2500; // > 2000 triggers 10% discount

    const res = await fetch(`http://localhost:5000/api/subscriptions/custom/build?userSpentTotal=${userSpent}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(selectedFeatures)
    });
    
    if (res.ok) {
      const data = await res.json();
      setCustomPackage(data);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Pre-built Packages */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Pre-built Packages</h2>
            {packages.length === 0 ? (
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
                    <button className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition">
                      Subscribe Now
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
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Calculate Price
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
                <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold">
                  Purchase Custom Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
