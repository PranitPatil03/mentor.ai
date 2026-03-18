"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="cursor-pointer rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-300"
    >
      Log out
    </button>
  );
};

export default LogoutButton;
