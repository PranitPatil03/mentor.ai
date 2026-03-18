import CompanionComponent from "@/components/CompanionComponent";
import { getCompanion } from "@/lib/actions/companion.action";
import { getSubjectColor } from "@/lib/utils";
import { getCurrentSupabaseUser } from "@/lib/supabase";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

interface CompanionSessionPageProps {
  params: Promise<{ id: string }>;
}

//params  -----> url/{id} ->
//searchParams ---> /url?key1=value1&key2=value2
const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = await params;
  const companion = await getCompanion(id);
  const user = await getCurrentSupabaseUser();

  if (!user) redirect("/sign-in");
  if (!companion?.name) redirect("/companions");

  const { name, subject, topic, duration } = companion;

  return (
    <>
      <article className="flex rounded-border justify-between items-center p-5 max-md:flex-col max-md:items-start max-md:gap-3">
        <div className="flex items-center gap-3">
          <div
            className="size-[56px] flex items-center justify-center rounded-xl max-md:hidden"
            style={{ backgroundColor: getSubjectColor(subject) }}
          >
            <Image
              src={`/icons/${subject}.svg`}
              alt={subject}
              width={28}
              height={28}
            />
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-lg">{name}</p>
              <div className="subject-badge max-sm:hidden">{subject}</div>
            </div>
            <p className="text-sm text-gray-600">{topic}</p>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500 max-md:hidden">
          {duration} minutes
        </div>
      </article>

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
    </>
  );
};

export default CompanionSession;
