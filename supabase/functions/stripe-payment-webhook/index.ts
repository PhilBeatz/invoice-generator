import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

serve(async (req) => {
  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);

    // Handle checkout completion (from connected accounts via Connect)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoice_id;
      const shareToken = session.metadata?.share_token;
      // For Connect events, event.account contains the connected account ID
      const connectedAccountId = (event as any).account || null;

      if (invoiceId) {
        // Update invoice status to paid
        await supabase
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', invoiceId);

        // Record the payment
        await supabase.from('invoice_payments').insert({
          invoice_id: invoiceId,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent,
          stripe_connected_account: connectedAccountId,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || 'USD',
          status: 'completed',
          customer_email: session.customer_email || null,
          share_token: shareToken || null,
        });
      }
    }

    // Handle account updates (onboarding completed, etc.)
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled && account.payouts_enabled) {
        // Mark onboarding as complete for this connected account
        await supabase
          .from('user_profiles')
          .update({ stripe_onboarding_complete: true })
          .eq('stripe_account_id', account.id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
