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
    const { shareToken } = await req.json();
    if (!shareToken) {
      return new Response(JSON.stringify({ error: 'Missing shareToken' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const appUrl = Deno.env.get('APP_URL') || 'https://yourdomain.com';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    // Look up the share and associated invoice
    const { data: share, error: shareError } = await supabase
      .from('invoice_shares')
      .select('*, invoices(*)')
      .eq('token', shareToken)
      .eq('status', 'active')
      .eq('payment_link_enabled', true)
      .single();

    if (shareError || !share) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive share link' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const invoice = share.invoices;
    if (!invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map invoice currency to Stripe-compatible lowercase
    const currency = (invoice.currency || 'USD').toLowerCase();

    // Build line items from invoice items
    const items = invoice.items || [];
    const isHours = invoice.invoice_mode === 'hours';
    const lineItems = items.map((item: any) => {
      const qty = isHours ? (item.hours || 1) : (item.quantity || 1);
      const unitPrice = isHours ? (item.rate || 0) : (item.price || 0);
      return {
        price_data: {
          currency,
          product_data: {
            name: item.description || 'Invoice Item',
            ...(item.sku ? { metadata: { sku: item.sku } } : {}),
          },
          unit_amount: Math.round(unitPrice * 100), // Stripe uses cents
        },
        quantity: qty,
      };
    });

    // Add shipping as a line item if applicable
    if (invoice.shipping_amount > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(invoice.shipping_amount * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item if applicable and not included in prices
    if (invoice.tax_amount > 0 && !invoice.tax_included) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: 'Tax' },
          unit_amount: Math.round(invoice.tax_amount * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      ...(invoice.discount_amount > 0
        ? {
            discounts: [
              {
                coupon: (
                  await stripe.coupons.create({
                    amount_off: Math.round(invoice.discount_amount * 100),
                    currency,
                    duration: 'once',
                    name: `Discount - Invoice ${invoice.invoice_number}`,
                  })
                ).id,
              },
            ],
          }
        : {}),
      metadata: {
        invoice_id: invoice.id,
        share_token: shareToken,
        invoice_number: invoice.invoice_number,
      },
      customer_email: invoice.customer_email || undefined,
      success_url: `${appUrl}/share/invoice/${shareToken}?payment=success`,
      cancel_url: `${appUrl}/share/invoice/${shareToken}?payment=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Payment session error:', err);
    return new Response(JSON.stringify({ error: 'Failed to create payment session' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
