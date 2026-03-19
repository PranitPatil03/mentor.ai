import CompanionCard from "@/components/CompanionCard";
import MentorTabs from "@/components/MentorTabs";
import MentorsWorkspace from "@/components/MentorsWorkspace";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import {
  getAllCompanions,
  getUserCompanions,
  newCompanionPermissions,
} from "@/lib/actions/companion.action";
import { getCurrentSupabaseUser, isUserPro } from "@/lib/supabase";
import { getSubjectColor } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; subject?: string; topic?: string }>;
}) {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const activeTab = params.tab ?? "mine";

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Learner";

  if (activeTab === "public") {
    const subject = params.subject ?? "";
    const topic = params.topic ?? "";
    const companions = await getAllCompanions({ subject, topic });

    return (
      <>
        <div className="flex items-center justify-between gap-4 flex-wrap py-6">
          <MentorTabs />
          <div className="flex gap-4">
            <SearchInput />
            <SubjectFilter />
          </div>
        </div>

        <section className="companions-grid">
          {companions.map((companion) => (
            <CompanionCard
              key={companion.id}
              {...companion}
              color={getSubjectColor(companion.subject)}
            />
          ))}
        </section>
      </>
    );
  }

  // Default: "mine" tab
  const [mentors, canCreateMentor, isPro] = await Promise.all([
    getUserCompanions(user.id),
    newCompanionPermissions(),
    isUserPro(user.id),
  ]);

  return (
    <>
      <div className="py-6">
        <MentorTabs />
      </div>
      <MentorsWorkspace
        mentors={mentors}
        canCreateMentor={canCreateMentor}
        userName={userName}
        isPro={isPro}
      />
    </>
  );
}
