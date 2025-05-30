"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const tabs = [
  { key: "mine", label: "My Tutors" },
  { key: "public", label: "All AI Tutors" },
] as const;

export default function MentorTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "mine";

  const switchTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "mine") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    // Remove search/filter params when switching tabs
    params.delete("subject");
    params.delete("topic");
    router.push(`/mentors?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => switchTab(key)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === key
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
