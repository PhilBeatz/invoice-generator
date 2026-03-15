// supabase/functions/admin-stats/index.ts
// Returns signup and subscription stats for the site owner/admin.
// Only accessible by the hardcoded OWNER_EMAIL.
//
// Queries auth.users (via service role) and the subscriptions table
// to return aggregated signup/plan metrics.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const OWNER_EMAIL = "phildouthard@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller is the owner via their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || user.email !== OWNER_EMAIL) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all users from auth.users
    const allUsers: Array<{
      id: string;
      email?: string;
      created_at: string;
      user_metadata?: Record<string, unknown>;
      last_sign_in_at?: string;
      email_confirmed_at?: string;
    }> = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) throw error;
      allUsers.push(...users);
      if (users.length < perPage) break;
      page++;
    }

    // Fetch all subscriptions
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, plan, status, trial_end, created_at, billing_period");
    if (subError) throw subError;

    const subsByUser = new Map(
      (subscriptions || []).map((s: Record<string, unknown>) => [s.user_id, s])
    );

    // Build daily signup counts for last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySignups: Record<string, number> = {};
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      dailySignups[d.toISOString().slice(0, 10)] = 0;
    }

    // Build monthly signup counts for last 12 months
    const monthlySignups: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlySignups[d.toISOString().slice(0, 7)] = 0;
    }

    // Plan distribution
    const planCounts: Record<string, number> = {
      trial: 0,
      trial_expired: 0,
      solo: 0,
      pro: 0,
      none: 0,
    };

    // Process users
    const recentUsers: Array<{
      email: string;
      name: string;
      signedUp: string;
      plan: string;
      status: string;
    }> = [];

    for (const u of allUsers) {
      const createdDate = u.created_at.slice(0, 10);
      const createdMonth = u.created_at.slice(0, 7);

      if (dailySignups[createdDate] !== undefined) {
        dailySignups[createdDate]++;
      }
      if (monthlySignups[createdMonth] !== undefined) {
        monthlySignups[createdMonth]++;
      }

      const sub = subsByUser.get(u.id) as Record<string, unknown> | undefined;
      let plan = "none";
      let status = "none";
      if (sub) {
        plan = sub.plan as string;
        status = sub.status as string;
        if (plan === "trial" && sub.trial_end) {
          const trialEnd = new Date(sub.trial_end as string);
          if (trialEnd < now) {
            plan = "trial_expired";
          }
        }
      }
      planCounts[plan] = (planCounts[plan] || 0) + 1;

      recentUsers.push({
        email: u.email || "N/A",
        name: (u.user_metadata?.full_name as string) || "",
        signedUp: u.created_at,
        plan,
        status,
      });
    }

    // Sort recent users by signup date descending
    recentUsers.sort(
      (a, b) => new Date(b.signedUp).getTime() - new Date(a.signedUp).getTime()
    );

    return new Response(
      JSON.stringify({
        totalUsers: allUsers.length,
        dailySignups,
        monthlySignups,
        planCounts,
        recentUsers: recentUsers.slice(0, 50), // last 50 signups
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Admin stats error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
