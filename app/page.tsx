import PricingCards from "@/app/subscription/PricingCards";
import { PLANS } from "@/lib/stripe";
import { getCurrentSupabaseUser } from "@/lib/supabase";
import { subjectsColors } from "@/constants";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";

const DEFAULT_COMPANIONS = [
  {
    id: "default-science",
    name: "Neura the Brainy Explorer",
    topic: "Dive deep into the wonders of the nervous system — learn how neurons fire, how signals travel through the brain, and the science behind how we think, feel, and react.",
    subject: "science",
    duration: 45,
    color: subjectsColors.science,
    bookmarked: false,
  },
  {
    id: "default-maths",
    name: "Countsy the Number Wizard",
    topic: "Master the fundamentals of calculus — from understanding limits and derivatives to solving integrals. Perfect for exam prep and building a rock-solid math foundation.",
    subject: "maths",
    duration: 30,
    color: subjectsColors.maths,
    bookmarked: false,
  },
  {
    id: "default-language",
    name: "Verba the Vocabulary Builder",
    topic: "Explore classic and modern English literature — analyse themes, characters, and writing styles from Shakespeare to contemporary authors, boosting both comprehension and vocabulary.",
    subject: "language",
    duration: 30,
    color: subjectsColors.language,
    bookmarked: false,
  },
  {
    id: "default-coding",
    name: "Codey the Logic Hacker",
    topic: "Learn the building blocks of programming — understand if-else logic, loops, and control flow with hands-on examples in Python and JavaScript that make coding click.",
    subject: "coding",
    duration: 45,
    color: subjectsColors.coding,
    bookmarked: false,
  },
  {
    id: "default-history",
    name: "Memo the Memory Keeper",
    topic: "Uncover the causes, key events, and lasting consequences of World War I and II — from alliances and treaties to the social changes that reshaped the modern world.",
    subject: "history",
    duration: 15,
    color: subjectsColors.history,
    bookmarked: false,
  },
  {
    id: "default-economics",
    name: "The Market Maestro",
    topic: "Understand how markets work — explore supply and demand curves, equilibrium pricing, and real-world examples of how economies respond to change.",
    subject: "economics",
    duration: 10,
    color: subjectsColors.economics,
    bookmarked: false,
  },
  {
    id: "default-physics",
    name: "Newton the Force Guide",
    topic: "Break down Newton's three laws of motion with real-world scenarios — from car crashes to roller coasters. Build intuition for forces, momentum, and the physics of everyday life.",
    subject: "science",
    duration: 30,
    color: subjectsColors.science,
    bookmarked: false,
  },
  {
    id: "default-algebra",
    name: "Algy the Equation Solver",
    topic: "Conquer algebra from linear equations to quadratics — learn step-by-step problem solving, factoring techniques, and graphing methods that make algebra intuitive and fun.",
    subject: "maths",
    duration: 25,
    color: subjectsColors.maths,
    bookmarked: false,
  },
  {
    id: "default-webdev",
    name: "Pixel the Web Builder",
    topic: "Build your first website from scratch — learn HTML structure, CSS styling, and responsive design principles. Go from blank page to a polished, mobile-friendly site.",
    subject: "coding",
    duration: 40,
    color: subjectsColors.coding,
    bookmarked: false,
  },
  {
    id: "default-finance",
    name: "Penny the Finance Coach",
    topic: "Learn personal finance essentials — budgeting, saving strategies, compound interest, and smart investing basics that set you up for long-term financial success.",
    subject: "economics",
    duration: 20,
    color: subjectsColors.economics,
    bookmarked: false,
  },
];

// Row 1: 40% wide | 30% | 30%
// Row 2: 30% | 30% | 40% wide
const FEATURES = [
  {
    icon: "🎙️",
    title: "Voice-Powered Learning",
    desc: "Have full two-way voice conversations with your AI tutor—ask follow-up questions, dig deeper, and learn just like with a real teacher.",
    slot: "row1-wide",
  },
  {
    icon: "🤖",
    title: "Build Your Own Companion",
    desc: "Customise each tutor's name, personality, voice, and subject so every session feels tailored to you.",
    slot: "row1-narrow",
  },
  {
    icon: "📊",
    title: "Track Your Journey",
    desc: "Review session history and see exactly how your understanding grows over time.",
    slot: "row1-narrow",
  },
  {
    icon: "📚",
    title: "Every Subject Covered",
    desc: "Math, science, history, coding, languages, economics—switch subjects in seconds.",
    slot: "row2-narrow",
  },
  {
    icon: "⚡",
    title: "Instant Clarity",
    desc: "No more waiting for office hours. Get crystal-clear explanations at exactly the right level, right now.",
    slot: "row2-narrow",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    desc: "Your sessions and progress are private. Authenticated with Supabase—your data stays yours.",
    slot: "row2-wide",
  },
];

const Page = async () => {
  const user = await getCurrentSupabaseUser();

  // Logged-in users should go straight to their dashboard
  if (user) redirect("/mentors");

  return (
    <div className="landing-page-shell">

      {/* ── Hero ── */}
      <section className="hero-section">
        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-6 px-4 max-w-4xl mx-auto w-full">
          <h1 className="hero-headline">
            Your Personal AI Tutor,
            <br />
            <span className="hero-gradient-text">Available 24/7</span>
          </h1>

          <p className="hero-subtext">
            AI voice tutors that adapt to your pace, break down any topic,
            <br className="hidden sm:block" />
            and keep you learning every single day with confidence and clarity.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/sign-in" className="hero-cta-primary">
              Start for Free
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-2 text-sm text-gray-400">
            <span>✓ No credit card required</span>
            <span>✓ 3 companions free</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ── Bento Features ── */}
      <section className="features-section">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl tracking-tight">Learn smarter, not harder</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            mentor.ai combines AI voice technology with personalised learning to
            create an experience that feels like talking to a brilliant tutor.
          </p>
        </div>

        <div className="bento-grid">
          {FEATURES.map(({ icon, title, desc, slot }) => (
            <div
              key={title}
              className={`bento-card bento-card--${slot}`}
            >
              <div className="bento-icon">{icon}</div>
              <h3 className="text-lg font-bold mt-3">{title}</h3>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Default Companions ── */}
      <section className="py-16 px-2">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl tracking-tight">Meet your AI tutors</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Ten ready-made companions across every core subject. Click one and start
            learning right now—no setup needed.
          </p>
        </div>

        <div className="companions-grid">
          {DEFAULT_COMPANIONS.map((c) => (
            <article key={c.id} className="companion-card">
              <div className="subject-badge w-fit">{c.subject}</div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-950">{c.name}</h2>
                <p className="text-sm text-gray-700">{c.topic}</p>
              </div>

              <p className="text-xs text-gray-600 font-medium">{c.duration} min session</p>

              <Link href="/sign-in" className="hero-cta-primary w-full text-center">
                Start Session
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── Pricing Plans ── */}
      <section className="pricing-section-landing">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl tracking-tight mb-4">
            Simple, transparent <span className="hero-gradient-text">pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Start free and upgrade anytime for unlimited companions and sessions.
          </p>
        </div>

        <PricingCards plans={PLANS} isLoggedIn={false} />
      </section>

      {/* ── Pricing CTA ── */}
      <section className="py-16 px-2">
        <div className="pricing-cta-banner">
          <h2 className="text-4xl md:text-5xl tracking-tight text-gray-900 mb-4">
            Ready to transform how you learn?
          </h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Thousands of learners have already built their personal AI tutors.
            Start free — upgrade when you&apos;re ready.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sign-in" className="hero-cta-primary">
              Start for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;

