import SupabaseAuthForm from "@/components/SupabaseAuthForm";
import { getCurrentSupabaseUser } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentSupabaseUser();
  if (user) redirect("/mentors");

  return (
    <section className="flex w-full min-h-[80vh] items-center justify-center py-10">
      <SupabaseAuthForm />
    </section>
  );
}
