// supabase/functions/create-checkout-session/index.ts
// Creates a Stripe Checkout Session for subscription purchases
//
// Required env vars (set in Supabase Dashboard > Edge Functions > Secrets):
//   STRIPE_SECRET_KEY  - Your Stripe secret key (sk_live_... or sk_test_...)
//   STRIPE_PRICE_SOLO_MONTHLY  - Stripe Price ID for Solo monthly
//   STRIPE_PRICE_SOLO_YEARLY   - Stripe Price ID for Solo yearly
//   STRIPE_PRICE_PRO_MONTHLY   - Stripe Price ID for Pro monthly
//   STRIPE_PRICE_PRO_YEARLY    - Stripe Price ID for Pro yearly
//   SITE_URL                    - Your site URL (e.g. https://dayonetools.app)

import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map plan + billing to Stripe Price IDs (set these in Supabase secrets)
function getPriceId(plan: string, billing: string): string | null {
  const map: Record<string, string | undefined> = {
    "solo_monthly": Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY"),
    "solo_yearly": Deno.env.get("STRIPE_PRICE_SOLO_YEARLY"),
    "pro_monthly": Deno.env.get("STRIPE_PRICE_PRO_MONTHLY"),
    "pro_yearly": Deno.env.get("STRIPE_PRICE_PRO_YEARLY"),
  };
  return map[`${plan}_${billing}`] || null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan, billing, userId, email } = await req.json();

    if (!plan || !billing || !userId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: plan, billing, userId, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const priceId = getPriceId(plan, billing);
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: `Invalid plan/billing combination: ${plan}/${billing}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this user already has a Stripe customer ID
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      // Search for existing customer by email
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          metadata: { supabase_user_id: userId },
        });
        customerId = customer.id;
      }
    }

    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/#/dashboard/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#/dashboard/pricing?checkout=canceled`,
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
          plan,
          billing,
        },
      },
      metadata: {
        supabase_user_id: userId,
        plan,
        billing,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Checkout session error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
