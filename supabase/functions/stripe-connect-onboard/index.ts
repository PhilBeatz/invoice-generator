import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const appUrl = Deno.env.get('APP_URL') || 'https://yourdomain.com';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    // Authenticate the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action } = await req.json();

    // ---- GET STATUS ----
    if (action === 'status') {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('stripe_account_id, stripe_onboarding_complete')
        .eq('user_id', user.id)
        .single();

      if (!profile?.stripe_account_id) {
        return new Response(JSON.stringify({ connected: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify account status with Stripe
      const account = await stripe.accounts.retrieve(profile.stripe_account_id);
      const isComplete = account.charges_enabled && account.payouts_enabled;

      // Update our record if onboarding just completed
      if (isComplete && !profile.stripe_onboarding_complete) {
        await supabase
          .from('user_profiles')
          .update({ stripe_onboarding_complete: true })
          .eq('user_id', user.id);
      }

      return new Response(JSON.stringify({
        connected: true,
        onboardingComplete: isComplete,
        accountId: profile.stripe_account_id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- DISCONNECT ----
    if (action === 'disconnect') {
      await supabase
        .from('user_profiles')
        .update({ stripe_account_id: null, stripe_onboarding_complete: false })
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ disconnected: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- ONBOARD (create or resume) ----
    // Check if user already has a Stripe account
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single();

    let stripeAccountId = profile?.stripe_account_id;

    if (!stripeAccountId) {
      // Create a new Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: { user_id: user.id },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;

      // Store the account ID (upsert into user_profiles)
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          stripe_account_id: stripeAccountId,
          stripe_onboarding_complete: false,
        }, { onConflict: 'user_id' });
    }

    // Create an Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/dashboard/settings?stripe=refresh`,
      return_url: `${appUrl}/dashboard/settings?stripe=complete`,
      type: 'account_onboarding',
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Stripe Connect error:', err);
    return new Response(JSON.stringify({ error: 'Failed to process Stripe Connect request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
