import { stripe } from "@/lib/stripe";
import { getCurrentSupabaseUser, isUserPro } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent double-purchasing
  const isPro = await isUserPro(user.id);
  if (isPro) {
    return NextResponse.json({ error: "Already subscribed to Pro" }, { status: 400 });
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/my-journey?upgraded=true`,
    cancel_url: `${appUrl}/subscription?canceled=true`,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
