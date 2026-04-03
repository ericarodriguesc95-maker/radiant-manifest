import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    console.log("[kiwify-webhook] Received:", JSON.stringify(body));

    // Kiwify sends: order_status, Customer.email, Subscription.status, etc.
    const email = body?.Customer?.email || body?.customer_email || body?.email;
    if (!email) {
      return new Response(JSON.stringify({ error: "Email not found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderStatus = body?.order_status || body?.Subscription?.status;
    const planType = body?.Subscription?.plan?.frequency === "once" ? "lifetime" : "monthly";

    // Map Kiwify status to our status
    let status: string;
    if (orderStatus === "paid" || orderStatus === "approved" || orderStatus === "active") {
      status = "active";
    } else if (orderStatus === "refunded" || orderStatus === "canceled" || orderStatus === "cancelled") {
      status = "canceled";
    } else if (orderStatus === "waiting_payment" || orderStatus === "trialing") {
      status = "trialing";
    } else {
      status = "inactive";
    }

    // Calculate expiry (30 days for monthly, null for lifetime)
    let expiryDate: string | null = null;
    if (planType === "monthly" && status === "active") {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      expiryDate = expiry.toISOString();
    }

    // Find user by email in auth
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const matchedUser = authUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!matchedUser) {
      console.log("[kiwify-webhook] No user found for email:", email);
      // Still store subscription data for when user signs up
      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: "00000000-0000-0000-0000-000000000000", // placeholder
          email: email.toLowerCase(),
          status,
          plan_type: planType,
          expiry_date: expiryDate,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) console.error("[kiwify-webhook] Upsert error:", error);
      return new Response(JSON.stringify({ ok: true, note: "User not found, stored for later" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert subscription
    const { error: upsertError } = await supabase.from("subscriptions").upsert(
      {
        user_id: matchedUser.id,
        email: email.toLowerCase(),
        status,
        plan_type: planType,
        expiry_date: expiryDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      console.error("[kiwify-webhook] Upsert error:", upsertError);
      throw upsertError;
    }

    console.log("[kiwify-webhook] Subscription updated for", email, "status:", status);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[kiwify-webhook] Error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
