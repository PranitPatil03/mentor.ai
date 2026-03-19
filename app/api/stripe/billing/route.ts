import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient, getCurrentSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Look up the customer ID from subscriptions table
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${appUrl}/my-journey`,
  });

  return NextResponse.json({ url: session.url });
}
