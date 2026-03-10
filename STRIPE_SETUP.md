# Stripe Subscription Setup Guide

Follow these steps to enable subscription payments on your site.

---

## Step 1: Create a Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Complete the registration and verify your email
3. For testing, use **Test Mode** (toggle in top-right of Stripe Dashboard)

---

## Step 2: Create Products and Prices in Stripe

In the Stripe Dashboard, go to **Products** > **Add Product**:

### Product 1: Solo Plan
- **Name:** Solo
- **Description:** Perfect for solo entrepreneurs and freelancers
- Add **2 prices:**
  - Monthly: **$8.99/month** (recurring)
  - Yearly: **$89.99/year** (recurring)

### Product 2: Pro Plan
- **Name:** Pro
- **Description:** Everything you need to scale your business
- Add **2 prices:**
  - Monthly: **$14.99/month** (recurring)
  - Yearly: **$149.99/year** (recurring)

After creating, note down the **Price IDs** for each (they look like `price_1ABC...`).

---

## Step 3: Run the Database Migration

In your **Supabase Dashboard** > **SQL Editor**, run:

```sql
ALTER TABLE IF EXISTS subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'monthly';

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
```

---

## Step 4: Set Edge Function Secrets

In **Supabase Dashboard** > **Edge Functions** > **Secrets**, add these:

| Secret Name | Value | Where to Find It |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Stripe Dashboard > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Created in Step 6 below |
| `STRIPE_PRICE_SOLO_MONTHLY` | `price_...` | From Step 2 |
| `STRIPE_PRICE_SOLO_YEARLY` | `price_...` | From Step 2 |
| `STRIPE_PRICE_PRO_MONTHLY` | `price_...` | From Step 2 |
| `STRIPE_PRICE_PRO_YEARLY` | `price_...` | From Step 2 |
| `SITE_URL` | `https://yourdomain.com` | Your deployed site URL |

---

## Step 5: Deploy Edge Functions

Using the Supabase CLI:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref yeligmxxckhcfubrmuzx

# Deploy the three functions
supabase functions deploy create-checkout-session --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy customer-portal --no-verify-jwt
```

**Note:** `--no-verify-jwt` is needed for:
- `create-checkout-session`: Uses Authorization header directly
- `stripe-webhook`: Called by Stripe (no JWT)
- `customer-portal`: Uses Authorization header directly

---

## Step 6: Set Up Stripe Webhook

1. Go to **Stripe Dashboard** > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to:
   ```
   https://yeligmxxckhcfubrmuzx.supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (`whsec_...`) and add it as `STRIPE_WEBHOOK_SECRET` in Supabase secrets (Step 4)

---

## Step 7: Configure Stripe Customer Portal

1. Go to **Stripe Dashboard** > **Settings** > **Billing** > **Customer portal**
2. Enable the portal and configure:
   - Allow customers to update payment methods
   - Allow customers to cancel subscriptions
   - Allow customers to switch plans (optional)
3. Save changes

---

## Step 8: Test the Flow

1. With Stripe in **Test Mode**, go to your pricing page
2. Click "Subscribe to Solo" or "Subscribe to Pro"
3. Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)
4. After payment, you should be redirected back with a success message
5. Your subscription status should update within a few seconds

### Test Cards
| Card Number | Scenario |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | 3D Secure authentication required |
| `4000 0000 0000 9995` | Payment declined |

---

## Going Live

1. Toggle Stripe to **Live Mode**
2. Create the same products/prices in Live Mode
3. Update the secrets in Supabase with live keys and price IDs
4. Create a new webhook endpoint for live mode
5. Update `STRIPE_WEBHOOK_SECRET` with the live signing secret

---

## Troubleshooting

**Checkout redirects but subscription doesn't update:**
- Check Stripe webhook logs: Dashboard > Developers > Webhooks > Select endpoint > Recent events
- Verify the webhook secret is correct
- Check Supabase Edge Function logs: Dashboard > Edge Functions > stripe-webhook > Logs

**"No active subscription found" when opening billing portal:**
- The webhook may not have processed yet. Wait a few seconds and try again.
- Check that the subscription row has `stripe_customer_id` set.

**CORS errors:**
- The Edge Functions include CORS headers. If issues persist, check that the function is deployed with `--no-verify-jwt`.
