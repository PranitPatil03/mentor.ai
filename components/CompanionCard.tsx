import Image from "next/image";
import Link from "next/link";

import React from "react";

interface CompanionTypeProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked?: boolean;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
}: CompanionTypeProps) => {
  return (
    <article className="companion-card" style={{ backgroundColor: color }}>
      <div className="subject-badge w-fit">{subject}</div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{topic}</p>
      <div className="flex items-center gap-2 mt-auto">
        <Image
          src="/icons/clock.svg"
          alt="duration"
          width={13.5}
          height={13.5}
        />
        <p className="text-sm">{duration} minutes</p>
      </div>

      <Link href={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center cursor-pointer">
          Start Session
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;
