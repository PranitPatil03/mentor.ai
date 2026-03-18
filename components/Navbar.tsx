import Link from "next/link";
import React from "react";
import NavItems from "./NavItems";
import { createSupabaseServerClient } from "@/lib/supabase";
import Image from "next/image";

const Navbar = async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Profile";

  const profileImage =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=F4F4F5&color=18181B&bold=true`;

  return (
    <nav className="navbar">
      <Link href="/" className="flex items-center gap-1.5 select-none">
        <Image
          src="/images/logo.png"
          alt="mentor.ai logo"
          width={30}
          height={30}
          className="rounded-lg"
        />
        <span className="text-lg font-bold tracking-tight text-gray-900">mentor.ai</span>
      </Link>

      <div className="flex items-center gap-8">
        <NavItems isLoggedIn={!!user} />

        {user ? (
          <Link href="/my-journey" className="profile-chip">
            <img
              src={profileImage}
              alt={displayName}
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full object-cover"
            />
            <span>Profile</span>
          </Link>
        ) : (
          <Link href="/sign-in" className="btn-signin">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
