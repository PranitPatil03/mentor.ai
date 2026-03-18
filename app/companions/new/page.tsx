import CompanionForm from "@/components/CompanionForm";
import UpgradeToProButton from "@/components/UpgradeToProButton";
import { newCompanionPermissions } from "@/lib/actions/companion.action";
import { getCurrentSupabaseUser } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const NewCompanion = async () => {
  const user = await getCurrentSupabaseUser();
  if (!user) redirect("/sign-in");

  const canCreateCompanion = await newCompanionPermissions();

  return (
    <main className="w-full max-w-3xl items-center justify-center py-8">
      {canCreateCompanion ? (
        <article className="w-full gap-5 flex flex-col">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Create Mentor
            </p>
            <h1>AI Mentor Builder</h1>
            <p className="text-sm text-gray-600">
              Build your personalized AI mentor with custom subject, voice, and teaching style.
            </p>
          </div>
          <CompanionForm />
        </article>
      ) : (
        <article className="companion-limit rounded-2xl border border-white/80 bg-white/90 px-6 py-10 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <Image
            src="/images/limit.svg"
            alt="Companion limit reached"
            width={360}
            height={230}
          />
          <div className="cta-badge">Upgrade to Pro</div>
          <h1>You have reached your free mentor limit</h1>
          <p>
            Your current account is on the free plan. Upgrade to Pro to create more AI mentors.
          </p>
          <UpgradeToProButton />
          <Link href="/subscription" className="text-sm text-indigo-700 hover:text-indigo-900">
            View pricing details
          </Link>
        </article>
      )}
    </main>
  );
};

export default NewCompanion;
