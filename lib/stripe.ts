import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    companions: 3,
    sessionsPerMonth: 10,
    features: [
      "3 AI companions",
      "10 voice sessions / month",
      "Core subjects (Math, Science, English)",
      "Session history",
      "Community support",
    ],
  },
  PRO: {
    name: "Pro",
    price: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    companions: Infinity,
    sessionsPerMonth: Infinity,
    features: [
      "Unlimited AI companions",
      "Unlimited voice sessions",
      "All subjects + custom topics",
      "Full session history & analytics",
      "Advanced AI personality tuning",
      "Priority support",
      "Early access to new features",
    ],
  },
};
