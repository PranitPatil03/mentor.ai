"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { label: "Companions", href: "/companions" },
  { label: "Pricing", href: "/subscription" },
];

const NavItems = () => {
  const pathname = usePathname();
  return (
    <nav className="flex items-center text-sm font-medium gap-5">
      {navItems.map(({ label, href }) => (
        <Link
          href={href}
          key={label}
          className={cn(
            pathname === href
              ? "font-semibold text-indigo-600"
              : "text-gray-600 hover:text-gray-900 transition-colors"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default NavItems;
