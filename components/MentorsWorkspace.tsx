"use client";

import { useMemo, useState } from "react";
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
            className="btn-signin"
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
        <article className="rounded-3xl border-2 border-dashed border-black/15 bg-transparent p-8 md:p-12 text-center flex flex-col items-center gap-4">
          <p className="max-w-xl text-sm md:text-base text-gray-600">
            Create your first AI mentor to start personalized sessions
          </p>

          {canCreateMentor ? (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="btn-signin"
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
              className="flex flex-col rounded-2xl border border-black/8 bg-white p-5 gap-4 w-full justify-between shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full capitalize tracking-wide"
                  style={{
                    backgroundColor: getSubjectColor(mentor.subject),
                    color: '#1a1a2e',
                  }}
                >
                  {mentor.subject}
                </span>
                <p className="text-xs text-gray-400 font-medium">{mentor.duration} min</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">{mentor.name}</h2>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{mentor.topic}</p>
              </div>

              <Link
                href={`/mentors/${mentor.id}`}
                className="hero-cta-primary w-1/2 text-center text-sm h-10"
              >
                Open Mentor
              </Link>
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

          <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-black/10 bg-white p-5 md:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Add New Mentor
                </p>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">
                  Configure your mentor
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 w-9 rounded-full border border-black/10 bg-white text-gray-700 hover:bg-gray-50"
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
