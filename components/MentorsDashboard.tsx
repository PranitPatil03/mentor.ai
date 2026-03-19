"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, getSubjectColor } from "@/lib/utils";
import { subjects } from "@/constants";
import CompanionForm from "@/components/CompanionForm";
import UpgradeToProButton from "@/components/UpgradeToProButton";

interface CompanionItem {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color?: string;
  created_at?: string;
  bookmarked?: boolean;
}

interface MentorsDashboardProps {
  myMentors: CompanionItem[];
  allCompanions: CompanionItem[];
  canCreateMentor: boolean;
  userName: string;
  isPro: boolean;
}

const tabs = [
  { key: "mine", label: "My Tutors" },
  { key: "public", label: "All AI Tutors" },
] as const;

export default function MentorsDashboard({
  myMentors,
  allCompanions,
  canCreateMentor,
  userName,
  isPro,
}: MentorsDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("mine");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // ── My Tutors: sorted by newest ──
  const orderedMentors = useMemo(() => {
    return [...myMentors].sort((a, b) => {
      const left = a.created_at ? new Date(a.created_at).getTime() : 0;
      const right = b.created_at ? new Date(b.created_at).getTime() : 0;
      return right - left;
    });
  }, [myMentors]);

  // ── All AI Tutors: filtered by search + subject ──
  const filteredCompanions = useMemo(() => {
    let result = allCompanions;

    if (subjectFilter && subjectFilter !== "all") {
      const s = subjectFilter.toLowerCase();
      result = result.filter((c) => c.subject.toLowerCase().includes(s));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.topic.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allCompanions, subjectFilter, searchQuery]);

  /* ─── Tab switcher ─── */
  const TabBar = () => (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setActiveTab(key)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
            activeTab === key
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );

  /* ═══════════════════════════════════════
     "All AI Tutors" tab
     ═══════════════════════════════════════ */
  if (activeTab === "public") {
    return (
      <>
        <div className="flex items-center justify-between gap-4 flex-wrap py-6">
          <TabBar />
          <div className="flex gap-4">
            {/* Search */}
            <div className="relative border border-black rounded-lg items-center flex gap-2 px-2 py-1 h-fit">
              <Image src="/icons/search.svg" alt="search" width={15} height={15} />
              <input
                placeholder="Search tutors..."
                className="outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Subject filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="input capitalize border border-black rounded-lg px-3 py-1 text-sm cursor-pointer"
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="companions-grid">
          {filteredCompanions.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-full text-center py-12">
              No tutors found matching your search.
            </p>
          ) : (
            filteredCompanions.map((c) => (
              <article
                key={c.id}
                className="companion-card"
                style={{ backgroundColor: c.color || getSubjectColor(c.subject) }}
              >
                <div className="subject-badge w-fit">{c.subject}</div>
                <h2 className="text-2xl font-bold">{c.name}</h2>
                <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{c.topic}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <Image src="/icons/clock.svg" alt="duration" width={13.5} height={13.5} />
                  <p className="text-sm">{c.duration} minutes</p>
                </div>
                <Link href={`/companions/${c.id}`} className="w-full">
                  <button className="btn-primary w-full justify-center cursor-pointer">
                    Start Session
                  </button>
                </Link>
              </article>
            ))
          )}
        </section>
      </>
    );
  }

  /* ═══════════════════════════════════════
     "My Tutors" tab
     ═══════════════════════════════════════ */
  return (
    <>
      <div className="py-6">
        <TabBar />
      </div>
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
                      color: "#1a1a2e",
                    }}
                  >
                    {mentor.subject}
                  </span>
                  <p className="text-xs text-gray-400 font-medium">{mentor.duration} min</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{mentor.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-3 leading-relaxed">
                    {mentor.topic}
                  </p>
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
                  className="h-9 w-9 rounded-full border border-black/10 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  x
                </button>
              </div>

              <CompanionForm isPro={isPro} />
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
