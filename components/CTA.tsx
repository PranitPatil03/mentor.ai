import Image from "next/image";
import Link from "next/link";
import React from "react";

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="cta-badge">Start Learning your way.</div>
      <h2 className="text-3xl font-bold">
        Build and Personalise Learning Companion
      </h2>
      <p>
        Pick a name, subject, voice, & personality — and start learning through
        voice conversations that feel natural and fun.
      </p>
      <Image src="images/cta.svg" alt="cta" width={362} height={232} />
      <button className="btn-primary hover:bg-yellow-500 transition duration-200 flex items-center gap-2 group">
        <Image src="/icons/plus.svg" alt="plus" width={12} height={12} />
        <Link href="/companions/new">
          <p className="transition duration-200 group-hover:text-lg">
            Build New Companion
          </p>
        </Link>
      </button>
    </section>
  );
};

export default CTA;
