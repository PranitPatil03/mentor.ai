import CompanionComponent from "@/components/CompanionComponent";
import { getCompanion } from "@/lib/actions/companion.action";
import { getCurrentSupabaseUser } from "@/lib/supabase";
import { redirect } from "next/navigation";
import React from "react";

interface CompanionSessionPageProps {
  params: Promise<{ id: string }>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = await params;
  const companion = await getCompanion(id);
  const user = await getCurrentSupabaseUser();

  if (!user) redirect("/sign-in");
  if (!companion?.name) redirect("/companions");

  return (
    <CompanionComponent
      {...companion}
      companionId={id}
      userName={
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Learner"
      }
      userImage={(user.user_metadata?.avatar_url as string) || "/icons/cap.svg"}
    />
  );
};

export default CompanionSession;
