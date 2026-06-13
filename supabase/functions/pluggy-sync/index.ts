// Sync de um item Pluggy: salva o item em pluggy_items e importa transações
// do mês atual em finance_entries (idempotente via pluggy_transaction_id).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const PLUGGY_CLIENT_ID = Deno.env.get("PLUGGY_CLIENT_ID")!;
const PLUGGY_CLIENT_SECRET = Deno.env.get("PLUGGY_CLIENT_SECRET")!;

async function getApiKey(): Promise<string> {
  const res = await fetch("https://api.pluggy.ai/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: PLUGGY_CLIENT_ID, clientSecret: PLUGGY_CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Pluggy auth failed: ${res.status}`);
  const { apiKey } = await res.json();
  return apiKey;
}

// Mapa categorias Pluggy → PT-BR + bucket interno
const CATEGORY_MAP: Record<string, { ptbr: string; bucket: "renda" | "fixa" | "variavel" | "cartao" | "poupanca" }> = {
  "Salary": { ptbr: "Salário", bucket: "renda" },
  "Income": { ptbr: "Renda", bucket: "renda" },
  "Rent": { ptbr: "Aluguel", bucket: "fixa" },
  "Utilities": { ptbr: "Contas (luz/água/gás)", bucket: "fixa" },
  "Telecommunications": { ptbr: "Telecomunicações", bucket: "fixa" },
  "Insurance": { ptbr: "Seguros", bucket: "fixa" },
  "Subscriptions": { ptbr: "Assinaturas", bucket: "fixa" },
  "Health": { ptbr: "Saúde", bucket: "fixa" },
  "Pharmacy": { ptbr: "Farmácia", bucket: "variavel" },
  "Education": { ptbr: "Educação", bucket: "fixa" },
  "Groceries": { ptbr: "Supermercado", bucket: "variavel" },
  "Food delivery": { ptbr: "Delivery", bucket: "variavel" },
  "Restaurants": { ptbr: "Restaurantes", bucket: "variavel" },
  "Fuel": { ptbr: "Combustível", bucket: "variavel" },
  "Public transport": { ptbr: "Transporte público", bucket: "variavel" },
  "Taxi and ride-hailing": { ptbr: "Táxi / 99 / Uber", bucket: "variavel" },
  "Travel": { ptbr: "Viagem", bucket: "variavel" },
  "Clothing": { ptbr: "Vestuário", bucket: "variavel" },
  "Beauty": { ptbr: "Beleza", bucket: "variavel" },
  "Entertainment": { ptbr: "Lazer", bucket: "variavel" },
  "Shopping": { ptbr: "Compras", bucket: "variavel" },
  "Electronics": { ptbr: "Eletrônicos", bucket: "variavel" },
  "Bookstore": { ptbr: "Livraria", bucket: "variavel" },
  "Pet supplies and vet": { ptbr: "Pets", bucket: "variavel" },
  "Digital services": { ptbr: "Serviços digitais", bucket: "variavel" },
  "Services": { ptbr: "Serviços", bucket: "variavel" },
  "Taxes": { ptbr: "Impostos", bucket: "fixa" },
  "Bank fees": { ptbr: "Tarifas bancárias", bucket: "fixa" },
  "Tax on financial operations": { ptbr: "IOF", bucket: "fixa" },
  "Credit card payment": { ptbr: "Pagamento de cartão", bucket: "cartao" },
  "Loans and financial charges": { ptbr: "Empréstimos", bucket: "fixa" },
  "Investments": { ptbr: "Investimentos", bucket: "poupanca" },
  "Mutual funds": { ptbr: "Fundos de investimento", bucket: "poupanca" },
  "Transfers": { ptbr: "Transferências", bucket: "variavel" },
  "Pix transfer": { ptbr: "Transferência Pix", bucket: "variavel" },
  "Own transfer": { ptbr: "Transferência própria", bucket: "variavel" },
  "Same person transfer": { ptbr: "Transferência própria", bucket: "variavel" },
};

function mapCategory(raw?: string | null): { ptbr: string; bucket: "renda" | "fixa" | "variavel" | "cartao" | "poupanca" } {
  if (!raw) return { ptbr: "Outros", bucket: "variavel" };
  return CATEGORY_MAP[raw] || { ptbr: raw, bucket: "variavel" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    const body = await req.json().catch(() => ({}));
    const itemId: string | undefined = body?.itemId;
    const mode: "pf" | "cnpj" = body?.mode === "cnpj" ? "cnpj" : "pf";
    if (!itemId) {
      return new Response(JSON.stringify({ error: "itemId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = await getApiKey();

    // Carrega o item
    const itemRes = await fetch(`https://api.pluggy.ai/items/${itemId}`, { headers: { "X-API-KEY": apiKey } });
    if (!itemRes.ok) {
      return new Response(JSON.stringify({ error: "item_fetch_failed", detail: await itemRes.text() }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const item = await itemRes.json();

    await supabase.from("pluggy_items").upsert({
      user_id: userId,
      pluggy_item_id: item.id,
      connector_name: item?.connector?.name || null,
      connector_image_url: item?.connector?.imageUrl || null,
      status: item.status || "UPDATING",
      last_synced_at: new Date().toISOString(),
    }, { onConflict: "pluggy_item_id" });

    // Lista as contas
    const accRes = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, { headers: { "X-API-KEY": apiKey } });
    if (!accRes.ok) {
      return new Response(JSON.stringify({ error: "accounts_failed", detail: await accRes.text() }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { results: accounts = [] } = await accRes.json();

    // Janela: últimos 60 dias
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 60);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const rowsToInsert: any[] = [];
    for (const acc of accounts) {
      const txRes = await fetch(`https://api.pluggy.ai/transactions?accountId=${acc.id}&from=${fmt(from)}&to=${fmt(to)}&pageSize=500`, { headers: { "X-API-KEY": apiKey } });
      if (!txRes.ok) continue;
      const { results: txs = [] } = await txRes.json();
      for (const tx of txs) {
        const dateObj = new Date(tx.date);
        const mapped = mapCategory(tx.category);
        // Income vs expense: amount > 0 entrada
        const isIncome = Number(tx.amount) > 0;
        const bucket = isIncome ? "renda" : (acc.type === "CREDIT" ? "cartao" : mapped.bucket);
        rowsToInsert.push({
          user_id: userId,
          mode,
          description: `${tx.description || mapped.ptbr}`.slice(0, 200),
          amount: Math.abs(Number(tx.amount)),
          type: bucket,
          month: dateObj.getMonth(),
          year: dateObj.getFullYear(),
          source: "pluggy",
          pluggy_transaction_id: tx.id,
          pluggy_item_id: itemId,
          category: mapped.ptbr,
          occurred_at: fmt(dateObj),
        });
      }
    }

    let inserted = 0;
    if (rowsToInsert.length > 0) {
      // upsert por (user_id, pluggy_transaction_id) — índice único parcial criado na migração
      const { error, count } = await supabase
        .from("finance_entries")
        .upsert(rowsToInsert, { onConflict: "user_id,pluggy_transaction_id", ignoreDuplicates: true, count: "exact" });
      if (error) {
        return new Response(JSON.stringify({ error: "insert_failed", detail: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      inserted = count || 0;
    }

    return new Response(JSON.stringify({ ok: true, accounts: accounts.length, transactions: rowsToInsert.length, inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
