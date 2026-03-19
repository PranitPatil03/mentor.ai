import MentorsDashboard from "@/components/MentorsDashboard";
import {
  getAllCompanions,
  getUserCompanions,
  newCompanionPermissions,
} from "@/lib/actions/companion.action";
import { getCurrentSupabaseUser, isUserPro } from "@/lib/supabase";
import { getSubjectColor } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function MentorsPage() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Learner";

  // Fetch everything in parallel — one server call, instant tab switching
  const [myMentors, canCreateMentor, isPro, allCompanions] = await Promise.all([
    getUserCompanions(user.id),
    newCompanionPermissions(),
    isUserPro(user.id),
    getAllCompanions({ subject: "", topic: "" }),
  ]);

  const allWithColor = allCompanions.map((c) => ({
    ...c,
    color: getSubjectColor(c.subject),
  }));

  return (
    <MentorsDashboard
      myMentors={myMentors}
      allCompanions={allWithColor}
      canCreateMentor={canCreateMentor}
      userName={userName}
      isPro={isPro}
    />
  );
}
