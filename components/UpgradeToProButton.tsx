"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const UpgradeToProButton = ({ className = "" }: { className?: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await response.json();

      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Unable to start Stripe checkout.");
      }

      window.location.href = data.url as string;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start Stripe checkout."
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className={`hero-cta-primary w-full text-center text-sm h-10 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? "Redirecting to Stripe..." : "Upgrade to Pro"}
      </button>
      {error ? <p className="text-sm text-red-600 text-center">{error}</p> : null}
    </div>
  );
};

export default UpgradeToProButton;