import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader || "" } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { query, type = "gif", limit = 20 } = await req.json();
    const apiKey = Deno.env.get("TENOR_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Tenor API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endpoint = query
      ? "https://tenor.googleapis.com/v2/search"
      : "https://tenor.googleapis.com/v2/featured";

    const params = new URLSearchParams({
      key: apiKey,
      client_key: "glowup_app",
      limit: String(limit),
      media_filter: "gif,tinygif",
      locale: "pt_BR",
    });

    if (query) params.set("q", query);
    if (type === "sticker") params.set("searchfilter", "sticker");

    const response = await fetch(`${endpoint}?${params}`);
    const data = await response.json();

    const results = (data.results || []).map((item: any) => ({
      id: item.id,
      title: item.title || "",
      url: item.media_formats?.gif?.url || item.media_formats?.tinygif?.url || "",
      preview: item.media_formats?.tinygif?.url || item.media_formats?.gif?.url || "",
      width: item.media_formats?.gif?.dims?.[0] || 200,
      height: item.media_formats?.gif?.dims?.[1] || 200,
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
