import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import { recentSessions } from "@/constants";
import {
  getAllCompanions,
  getRecentSessions,
} from "@/lib/actions/companion.action";
import { getSubjectColor } from "@/lib/utils";
import React from "react";

const Page = async () => {
  const companions = await getAllCompanions({ limit: 3 });
  const recentSessionsCompanions = await getRecentSessions(10);

  return (
    <div className="px-2 pb-10">
      <h1>Popular Companions</h1>

      <section className="flex gap-4 py-5 justify-between items-start w-full max-lg:flex-col max-lg:items-center">
        {companions.map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>

      <section className="flex gap-4 justify-between py-5 items-start w-full max-lg:flex-col max-lg:items-center">
        <CompanionsList
          title="Recently completed sessions"
          companions={recentSessionsCompanions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </div>
  );
};

export default Page;
