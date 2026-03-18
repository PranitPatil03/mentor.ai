import MentorsWorkspace from "@/components/MentorsWorkspace";
import {
  getUserCompanions,
  newCompanionPermissions,
} from "@/lib/actions/companion.action";
import { getCurrentSupabaseUser } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function MentorsPage() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [mentors, canCreateMentor] = await Promise.all([
    getUserCompanions(user.id),
    newCompanionPermissions(),
  ]);

  return (
    <MentorsWorkspace
      mentors={mentors}
      canCreateMentor={canCreateMentor}
      userName={
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Learner"
      }
    />
  );
}
