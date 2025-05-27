import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import { recentSessions } from "@/constants";
import React from "react";

const Page = () => {
  return (
    <main>
      <h1>Popular Companions</h1>

      <section className="home-section">
        <CompanionCard
          id="123"
          name="XYZ"
          topic="xyz-topic"
          subject="science"
          duration={45}
          color="#ffa"
        />
        <CompanionCard
          id="124"
          name="XYZ"
          topic="xyz-topic"
          subject="science"
          duration={45}
          color="#ffa"
        />
        <CompanionCard
          id="125"
          name="XYZ"
          topic="xyz-topic"
          subject="science"
          duration={45}
          color="#ffa"
        />
      </section>

      <section className="home-section">
        <CompanionsList
          title="Recently completed sessions"
          companions={recentSessions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

export default Page;
