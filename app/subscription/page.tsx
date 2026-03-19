import { PLANS } from "@/lib/stripe";
import { getCurrentSupabaseUser, isUserPro } from "@/lib/supabase";
import PricingCards from "./PricingCards";
import { redirect } from "next/navigation";
import React from "react";

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const user = await getCurrentSupabaseUser();
  const params = await searchParams;

  // Pro users don't need the pricing page — send them to profile
  if (user) {
    const isPro = await isUserPro(user.id);
    if (isPro) redirect("/my-journey");
  }

  return (
    <main className="py-16 flex flex-col items-center">
      {params.success && (
        <div className="mb-8 px-6 py-3 bg-green-100 border border-green-300 text-green-800 rounded-xl text-sm font-medium">
          🎉 Subscription activated — welcome to Converso Pro!
        </div>
      )}
      {params.canceled && (
        <div className="mb-8 px-6 py-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-xl text-sm font-medium">
          Checkout canceled. You can upgrade anytime.
        </div>
      )}

      <div className="text-center mb-12">
        <div className="hero-badge inline-block mb-4">Pricing</div>
        <h1 className="text-5xl font-bold mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Start free and upgrade when you need more. No hidden fees,
          cancel anytime.
        </p>
      </div>

      <PricingCards plans={PLANS} isLoggedIn={!!user} />

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-8">Compare plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl mx-auto text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 pr-8 font-semibold">Feature</th>
                <th className="text-center py-3 px-8 font-semibold">Free</th>
                <th className="text-center py-3 px-8 font-semibold text-purple-700">Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["AI Companions", "3", "Unlimited"],
                ["Voice Sessions / month", "10", "Unlimited"],
                ["Subjects", "Core 6", "All + Custom"],
                ["Session History", "Last 10", "Full history"],
                ["Personality Customization", "Basic", "Advanced"],
                ["Priority Support", "—", "✓"],
                ["Early Access", "—", "✓"],
              ].map(([feature, free, pro]) => (
                <tr key={feature} className="border-b border-gray-100">
                  <td className="text-left py-3 pr-8 font-medium">{feature}</td>
                  <td className="text-center py-3 px-8 text-muted-foreground">{free}</td>
                  <td className="text-center py-3 px-8 text-purple-700 font-medium">{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

