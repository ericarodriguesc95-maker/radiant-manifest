import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Today in Sao Paulo timezone
    const nowSP = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    );
    const year = nowSP.getFullYear();
    const month = nowSP.getMonth() + 1;
    const day = nowSP.getDate();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("user_id, display_name, birth_date")
      .not("birth_date", "is", null);

    if (error) throw error;

    const birthdayGirls = (profiles ?? []).filter((p: any) => {
      const [, m, d] = String(p.birth_date).split("-").map(Number);
      return m === month && d === day;
    });

    if (birthdayGirls.length === 0) {
      return new Response(JSON.stringify({ created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All members (to notify)
    const { data: allProfiles } = await supabase.from("profiles").select("user_id");
    const allUserIds: string[] = (allProfiles ?? []).map((p: any) => p.user_id);

    let created = 0;

    for (const girl of birthdayGirls) {
      // Skip if already posted this year
      const { data: existing } = await supabase
        .from("birthday_posts")
        .select("id")
        .eq("user_id", girl.user_id)
        .eq("year", year)
        .maybeSingle();
      if (existing) continue;

      const name = girl.display_name || "Uma extraordinária";
      const text =
        `🎂✨ Hoje é aniversário da ${name}! 👑\n\n` +
        `Que este novo ciclo venha com muita luz, saúde, prosperidade e conquistas. ` +
        `Comenta aqui e deixa seu parabéns para ela! 🥳💛`;

      const { data: post, error: postError } = await supabase
        .from("community_posts")
        .insert({ user_id: girl.user_id, text, kind: "aniversario" })
        .select("id")
        .single();

      if (postError || !post) continue;

      await supabase
        .from("birthday_posts")
        .insert({ user_id: girl.user_id, year, post_id: post.id });

      // Notify everyone (including the birthday girl)
      const notifications = allUserIds.map((uid) => ({
        user_id: uid,
        from_user_id: girl.user_id,
        type: uid === girl.user_id ? "birthday_self" : "birthday",
        post_id: post.id,
        comment_text:
          uid === girl.user_id
            ? `🎉 Feliz aniversário, ${name}! O clube preparou um post para você.`
            : `🎂 Hoje é aniversário da ${name}. Deixe seu parabéns!`,
        read: false,
      }));

      for (let i = 0; i < notifications.length; i += 200) {
        await supabase.from("notifications").insert(notifications.slice(i, i + 200));
      }

      created++;
    }

    return new Response(JSON.stringify({ created }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("birthday-check error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
