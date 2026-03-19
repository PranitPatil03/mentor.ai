"use client";

import { useState } from "react";

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/billing", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
    >
      {loading ? "Loading…" : "Manage billing →"}
    </button>
  );
}
