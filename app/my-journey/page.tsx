import CompanionsList from "@/components/CompanionsList";
import LogoutButton from "@/components/LogoutButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getUserCompanions,
  getUserSessions,
} from "@/lib/actions/companion.action";
import { getCurrentSupabaseUser, isUserPro } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const Profile = async () => {
  const user = await getCurrentSupabaseUser();
  if (!user) redirect("/sign-in");

  const companions = await getUserCompanions(user.id);
  const sessionHistory = await getUserSessions(user.id);
  const isPro = await isUserPro(user.id);
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Learner";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <>
      <section className="flex justify-between gap-4 max-sm:flex-col items-center py-5">
        <div className="flex gap-4 items-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              width={110}
              height={110}
              className="rounded-lg"
            />
          ) : (
            <div className="size-[110px] rounded-lg bg-neutral-100 flex items-center justify-center text-4xl font-semibold">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-2xl">{displayName}</h1>
              {isPro && (
                <span className="bg-gradient-to-b from-violet-500 to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Pro
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit max-md:hidden">
            <div className="flex gap-2 items-center">
              <Image
                src="/icons/check.svg"
                alt="check-mark"
                width={22}
                height={22}
              />
              <p className="text-2xl font-bold">{sessionHistory.length}</p>
            </div>
            <div>Lessons Completed</div>
          </div>

          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit max-md:hidden">
            <div className="flex gap-2 items-center">
              <Image src="/icons/cap.svg" alt="cap" width={22} height={22} />
              <p className="text-2xl font-bold">{companions.length}</p>
            </div>
            <div>Companions Created</div>
          </div>
        </div>
      </section>

      {/* Subscription status */}
      <section className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        {isPro ? (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-b from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                ★
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pro Plan</p>
                <p className="text-sm text-gray-500">
                  Unlimited mentors &amp; sessions
                </p>
              </div>
            </div>
            <Link
              href="/subscription"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Manage subscription →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-semibold text-gray-900">Free Plan</p>
              <p className="text-sm text-gray-500">
                3 mentors · 10 sessions / month
              </p>
            </div>
            <Link
              href="/subscription"
              className="bg-gradient-to-b from-violet-500 to-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-[0_2px_10px_rgba(109,40,217,0.35)] hover:scale-[1.02] transition-all"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </section>

      <div className="my-5">
        <Accordion type="multiple">
          {/* RECENTLY WATCHED LESSONS BY USER */}
          <AccordionItem value="recent">
            <AccordionTrigger className="text-2xl font-bold">
              Recent Sessions
            </AccordionTrigger>
            <AccordionContent>
              <CompanionsList
                title="Recent Sessions"
                companions={sessionHistory}
              />
            </AccordionContent>
          </AccordionItem>

          {/* USER-CREATED COMPANIONS */}
          <AccordionItem value="companions">
            <AccordionTrigger className="text-2xl font-bold">
              My Companions {`(${companions.length})`}
            </AccordionTrigger>
            <AccordionContent>
              <CompanionsList title="My Companions" companions={companions} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-6 mb-8">
        <LogoutButton />
      </div>
    </>
  );
};

export default Profile;
