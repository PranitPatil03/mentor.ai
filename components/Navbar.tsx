import Link from "next/link";
import React from "react";
import NavItems from "./NavItems";
import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";

const Navbar = async () => {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/auth")) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const serverSupabase = await createSupabaseServerClient();
    await serverSupabase.auth.signOut();
    redirect("/");
  };

  return (
    <nav className="navbar">
      <Link href="/" className="flex items-center gap-2.5 select-none">
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
        <NavItems />

        {user ? (
          <form action={signOut}>
            <button type="submit" className="btn-signin">
              Sign Out
            </button>
          </form>
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
