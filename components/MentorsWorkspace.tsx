"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CompanionForm from "@/components/CompanionForm";
import UpgradeToProButton from "@/components/UpgradeToProButton";
import { getSubjectColor } from "@/lib/utils";

interface MentorSummary {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  created_at?: string;
}

interface MentorsWorkspaceProps {
  mentors: MentorSummary[];
  canCreateMentor: boolean;
  userName: string;
}

const MentorsWorkspace = ({
  mentors,
  canCreateMentor,
  userName,
}: MentorsWorkspaceProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const orderedMentors = useMemo(() => {
    return [...mentors].sort((a, b) => {
      const left = a.created_at ? new Date(a.created_at).getTime() : 0;
      const right = b.created_at ? new Date(b.created_at).getTime() : 0;
      return right - left;
    });
  }, [mentors]);

  return (
    <section className="w-full py-6 md:py-8">
      <header className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Welcome back
          </p>
          <h1 className="mt-2">Your AI Mentors</h1>
          <p className="mt-2 text-sm text-gray-600">
            {userName}, manage your mentors and launch new lessons from one place.
          </p>
        </div>

        {canCreateMentor ? (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary"
          >
            + Create Mentor
          </button>
        ) : (
          <div className="w-full sm:w-[220px]">
            <UpgradeToProButton />
          </div>
        )}
      </header>

      {orderedMentors.length === 0 ? (
        <article className="rounded-2xl border border-white/80 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-6 md:p-10 text-center flex flex-col items-center gap-4">
          <div className="size-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Image src="/icons/cap.svg" alt="Mentors" width={28} height={28} />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900">No mentors yet</h2>
          <p className="max-w-xl text-sm md:text-base text-gray-600">
            Create your first AI mentor to start personalized sessions and build your learning track.
          </p>

          {canCreateMentor ? (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary"
            >
              Create Mentor
            </button>
          ) : (
            <div className="w-full max-w-[280px] space-y-3">
              <p className="text-sm text-gray-600">
                You reached the free mentor limit. Upgrade to Pro to create more mentors.
              </p>
              <UpgradeToProButton />
            </div>
          )}
        </article>
      ) : (
        <section className="companions-grid">
          {orderedMentors.map((mentor) => (
            <article
              key={mentor.id}
              className="companion-card"
              style={{ backgroundColor: getSubjectColor(mentor.subject) }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="subject-badge">{mentor.subject}</span>
                <p className="text-xs text-gray-700">{mentor.duration} min</p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
              <p className="text-sm text-gray-700 line-clamp-3">{mentor.topic}</p>

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/mentors/${mentor.id}`}
                  className="btn-primary w-full justify-center"
                >
                  Open Mentor
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 md:px-6">
          <button
            type="button"
            aria-label="Close create mentor modal"
            onClick={() => setIsCreateOpen(false)}
            className="absolute inset-0 bg-black/35 backdrop-blur-[1.5px]"
          />

          <div className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/80 bg-[#fbfbff] p-4 md:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                  Add New Mentor
                </p>
                <h2 className="text-2xl font-semibold text-gray-900 mt-1">
                  Configure your mentor profile
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                x
              </button>
            </div>

            <CompanionForm />
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default MentorsWorkspace;
