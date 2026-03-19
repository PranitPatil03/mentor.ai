import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

async function sendProWelcomeEmail(email: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !email) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "mentor.ai <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to mentor.ai Pro! 🎉",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">
              Welcome to Pro!
            </h1>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 16px;">
              Your mentor.ai Pro subscription is now active. Here's what you've unlocked:
            </p>
            <ul style="font-size: 14px; color: #4b5563; line-height: 2; padding-left: 20px; margin-bottom: 24px;">
              <li>Unlimited AI companions</li>
              <li>Unlimited voice sessions</li>
              <li>All subjects + custom topics</li>
              <li>Priority support</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://youraimentor.vercel.app"}/mentors"
               style="display: inline-block; background: linear-gradient(to bottom, #8b5cf6, #4f46e5); color: #fff; padding: 10px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Start Learning →
            </a>
            <p style="font-size: 13px; color: #9ca3af; margin-top: 32px;">
              If you have questions, reply to this email or reach out to our support team.
            </p>
          </div>
        `,
      }),
    });
  } catch {
    // Email is non-critical — don't fail the webhook
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook config" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            stripe_price_id: sub.items.data[0]?.price?.id ?? null,
            status: sub.status,
            current_period_end: new Date(
              (sub.current_period_end ?? Math.floor(Date.now() / 1000)) * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        // Send welcome email (non-blocking)
        if (session.customer_email) {
          sendProWelcomeEmail(session.customer_email);
        }
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({
          status: sub.status,
          stripe_price_id: sub.items.data[0]?.price?.id ?? null,
          current_period_end: new Date(
            (sub.current_period_end ?? Math.floor(Date.now() / 1000)) * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
