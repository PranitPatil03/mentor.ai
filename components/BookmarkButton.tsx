"use client";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect, usePathname } from "next/navigation";
import { addBookmark, removeBookmark } from "@/lib/actions/companion.action";
import React from "react";

interface BookMarkButtonProps {
  id: string;
  bookmarked: boolean;
  userSignedIn: boolean;
}

const BookmarkButton = ({
  id,
  bookmarked,
  userSignedIn,
}: BookMarkButtonProps) => {
  const pathname = usePathname();

  const handleBookmark = async () => {
    if (!userSignedIn) redirect("/sign-in");
    else {
      if (bookmarked) await removeBookmark(id, pathname);
      else await addBookmark(id, pathname);
    }
  };
  return (
    <button className="companion-bookmark" onClick={handleBookmark}>
      <Image
        src={bookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"}
        alt="bookmark"
        width={12.5}
        height={15}
      />
    </button>
  );
};

export default BookmarkButton;
