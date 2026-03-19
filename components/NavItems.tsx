"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const loggedOutItems = [
  {
    label: "AI Mentors",
    href: "/mentors",
    activePaths: ["/mentors", "/companions", "/create-mentor"],
  },
  {
    label: "Pricing",
    href: "/subscription",
    activePaths: ["/subscription"],
  },
];

const NavItems = ({ isLoggedIn, isPro }: { isLoggedIn: boolean; isPro?: boolean }) => {
  const pathname = usePathname();

  const loggedInItems = [
    {
      label: "AI Mentors",
      href: "/mentors",
      activePaths: ["/mentors", "/companions", "/create-mentor"],
    },
    ...(!isPro
      ? [
        {
          label: "Upgrade to Pro",
          href: "/subscription",
          activePaths: ["/subscription"],
        },
      ]
      : []),
  ];

  const items = isLoggedIn ? loggedInItems : loggedOutItems;

  return (
    <nav className="flex items-center text-sm font-medium gap-5">
      {items.map(({ label, href, activePaths }) => (
        <Link
          href={href}
          key={label}
          className={cn(
            activePaths.some((path) => pathname.startsWith(path))
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
