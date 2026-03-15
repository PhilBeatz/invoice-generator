// supabase/functions/stripe-webhook/index.ts
// Handles Stripe webhook events to sync subscription status with Supabase
//
// Required env vars:
//   STRIPE_SECRET_KEY       - Stripe secret key
//   STRIPE_WEBHOOK_SECRET   - Webhook signing secret (whsec_...)
//
// In Stripe Dashboard > Webhooks, create an endpoint pointed at:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
// Subscribe to these events:
//   - checkout.session.completed
//   - customer.subscription.created
//   - customer.subscription.updated
//   - customer.subscription.deleted
//   - invoice.payment_succeeded
//   - invoice.payment_failed

import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Map Stripe status to our internal status
function mapStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
    incomplete: "past_due",
    incomplete_expired: "canceled",
    paused: "canceled",
  };
  return statusMap[stripeStatus] || "canceled";
}

// Extract plan from price ID by checking against env vars
function getPlanFromPriceId(priceId: string): string {
  if (
    priceId === Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY") ||
    priceId === Deno.env.get("STRIPE_PRICE_SOLO_YEARLY")
  ) {
    return "solo";
  }
  if (
    priceId === Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") ||
    priceId === Deno.env.get("STRIPE_PRICE_PRO_YEARLY")
  ) {
    return "pro";
  }
  return "solo"; // default fallback
}

function getBillingFromPriceId(priceId: string): string {
  if (
    priceId === Deno.env.get("STRIPE_PRICE_SOLO_YEARLY") ||
    priceId === Deno.env.get("STRIPE_PRICE_PRO_YEARLY")
  ) {
    return "yearly";
  }
  return "monthly";
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const userId =
    subscription.metadata?.supabase_user_id ||
    (typeof subscription.customer === "string"
      ? await getUserIdFromCustomer(subscription.customer)
      : null);

  if (!userId) {
    console.error("No user ID found for subscription:", subscription.id);
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id || "";
  const plan = subscription.metadata?.plan || getPlanFromPriceId(priceId);
  const billing = subscription.metadata?.billing || getBillingFromPriceId(priceId);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const subData = {
    user_id: userId,
    plan,
    status: mapStatus(subscription.status),
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    billing_period: billing,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  // Upsert: update if exists for this user, insert if not
  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update(subData)
      .eq("user_id", userId);
    if (error) console.error("Error updating subscription:", error);
  } else {
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .insert({ ...subData, created_at: new Date().toISOString() });
    if (error) console.error("Error inserting subscription:", error);
  }

  console.log(
    `Subscription ${subscription.id} synced: plan=${plan}, status=${subscription.status}`
  );
}

async function getUserIdFromCustomer(
  customerId: string
): Promise<string | null> {
  // Check subscriptions table for existing mapping
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (data?.user_id) return data.user_id;

  // Fallback: check Stripe customer metadata
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted && customer.metadata?.supabase_user_id) {
      return customer.metadata.supabase_user_id;
    }
  } catch (e) {
    console.error("Error fetching customer:", e);
  }

  return null;
}

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Received event: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        // Copy metadata from checkout session to subscription if missing
        if (
          !subscription.metadata?.supabase_user_id &&
          session.metadata?.supabase_user_id
        ) {
          await stripe.subscriptions.update(subscription.id, {
            metadata: session.metadata,
          });
          subscription.metadata = {
            ...subscription.metadata,
            ...session.metadata,
          };
        }
        await upsertSubscription(subscription);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscription(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // Mark as canceled in our database
      const userId =
        subscription.metadata?.supabase_user_id ||
        (typeof subscription.customer === "string"
          ? await getUserIdFromCustomer(subscription.customer)
          : null);

      if (userId) {
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        console.log(`Subscription canceled for user: ${userId}`);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        await upsertSubscription(subscription);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        await upsertSubscription(subscription);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
