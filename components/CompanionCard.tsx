import Image from "next/image";
import Link from "next/link";

import React from "react";
import BookmarkButton from "./BookmarkButton";
import { currentUser } from "@clerk/nextjs/server";

interface CompanionTypeProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked: boolean;
}

const CompanionCard = async ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
}: CompanionTypeProps) => {
  const user = await currentUser();
  return (
    <article className="companion-card" style={{ backgroundColor: color }}>
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>
        <BookmarkButton id={id} bookmarked={bookmarked} userSignedIn={!!user} />
      </div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>
      <div className="flex items-center gap-2">
        <Image
          src="/icons/clock.svg"
          alt="duration"
          width={13.5}
          height={13.5}
        />
        <p className="text-sm">{duration} minutes</p>
      </div>

      <Link href={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center hover:bg-neutral-800 hover:scale-104 hover:shadow-md transition duration-200">
          Watch Lesson
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;
