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
      <article className="flex items-center justify-between rounded-2xl border border-black/8 bg-transparent p-4">
        <div className="flex items-center gap-3">
          <div
            className="size-[44px] flex items-center justify-center rounded-xl max-md:hidden"
            style={{ backgroundColor: getSubjectColor(subject) }}
          >
            <Image
              src={`/icons/${subject}.svg`}
              alt={subject}
              width={22}
              height={22}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-base">{name}</p>
              <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-gray-100 text-gray-600">{subject}</span>
            </div>
            <p className="text-sm text-gray-500">
              {topic}
              <span className="ml-2 font-medium text-gray-400 md:hidden">{duration} min</span>
            </p>
          </div>
        </div>

        <p className="hidden text-sm font-medium tracking-tight text-gray-500 md:block">
          {duration} min
        </p>
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
