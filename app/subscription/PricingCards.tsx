"use client";

import Link from "next/link";
import { useState } from "react";

interface Plan {
  name: string;
  price: number;
  features: string[];
}

interface Plans {
  FREE: Plan;
  PRO: Plan;
}

interface PricingCardsProps {
  plans: Plans;
  isLoggedIn: boolean;
}

export default function PricingCards({ plans, isLoggedIn }: PricingCardsProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!isLoggedIn) {
      window.location.href = "/sign-in";
      return;
    }
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center w-full">
      {/* Free Plan */}
      <div className="pricing-card pricing-card-free md:scale-95 md:origin-right">
        <div className="pricing-card-header">
          <h2 className="text-2xl font-bold">{plans.FREE.name}</h2>
          <div className="mt-4">
            <span className="text-6xl font-light tracking-tight text-gray-900">$0</span>
            <span className="text-base text-gray-400 font-medium ml-1">/ forever</span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Perfect for getting started with AI learning.
          </p>
        </div>
        <ul className="pricing-features">
          {plans.FREE.features.map((f) => (
            <li key={f} className="pricing-feature-item">
              <span className="pricing-check pricing-check-free">✓</span>
              {f}
            </li>
          ))}
        </ul>
        {isLoggedIn ? (
          <Link href="/companions/new" className="pricing-cta-outline w-full text-center">
            Start Building
          </Link>
        ) : (
          <Link href="/sign-in" className="pricing-cta-outline w-full text-center">
            Get Started Free
          </Link>
        )}
      </div>

      {/* Pro Plan */}
      <div className="pricing-card pricing-card-pro md:origin-left">
        <div className="pricing-card-header relative z-10">
          <h2 className="text-2xl font-bold text-gray-900">{plans.PRO.name}</h2>
          <div className="mt-4">
            <span className="text-6xl font-light tracking-tight text-gray-900">${plans.PRO.price}</span>
            <span className="text-base text-gray-400 font-medium ml-1">/ month</span>
          </div>
          <p className="text-gray-500 mt-2 text-sm">
            Unlimited learning, no restrictions.
          </p>
        </div>
        <ul className="pricing-features relative z-10">
          {plans.PRO.features.map((f) => (
            <li key={f} className="pricing-feature-item text-gray-900">
              <span className="pricing-check pricing-check-pro">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="pricing-cta-pro w-full disabled:opacity-60"
        >
          {loading ? "Redirecting..." : isLoggedIn ? "Upgrade to Pro" : "Start Pro Trial"}
        </button>
      </div>
    </div>
  );
}
