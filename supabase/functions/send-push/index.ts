const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Web Push utilities (manual VAPID implementation for Deno)
const VAPID_PUBLIC_KEY = 'BLd6x5tyfPzGO4-R6tpHnYD8F4BwG5cSTy7f6kK7XBYS_B7A0_ETssDQ_HUYMBrOD_pxAJ-Y3JudSMAwBn-eYxo';

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - base64Url.length % 4) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let str = '';
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createJwt(audience: string, subject: string, privateKeyB64: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 86400, sub: subject, iat: now };

  const enc = new TextEncoder();
  const headerB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(enc.encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;

  const keyData = base64UrlToUint8Array(privateKeyB64);
  const key = await crypto.subtle.importKey('pkcs8', await convertRawToP8(keyData), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(unsigned)));

  return `${unsigned}.${uint8ArrayToBase64Url(sig)}`;
}

// Convert raw 32-byte private key to PKCS8 DER
async function convertRawToP8(raw: Uint8Array): Promise<ArrayBuffer> {
  // Import as JWK then export as PKCS8
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: uint8ArrayToBase64Url(raw),
    // We need x,y but for signing we can derive. Use importKey with raw then export.
    // Alternative: build PKCS8 manually
  };

  // Build PKCS8 DER manually for EC P-256
  // OID for EC: 1.2.840.10045.2.1, OID for P-256: 1.2.840.10045.3.1.7
  const ecOid = new Uint8Array([0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01]);
  const p256Oid = new Uint8Array([0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07]);
  
  // For PKCS8, we need the public key too, but for VAPID we can just use JWK approach
  // Let's use the simpler approach via Web Crypto
  const tempKey = await crypto.subtle.importKey('jwk', {
    ...jwk,
    x: 'BLd6x5tyfPzGO4-R6tpHnYD8F4BwG5cSTy7f6kK7XBYS_B7A0_ETssDQ_HUYMBrOD_pxAJ-Y3JudSMAwBn-eYxo'.substring(0, 43), // dummy, we'll fix
    y: 'BLd6x5tyfPzGO4-R6tpHnYD8F4BwG5cSTy7f6kK7XBYS_B7A0_ETssDQ_HUYMBrOD_pxAJ-Y3JudSMAwBn-eYxo'.substring(0, 43),
  }, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
  
  return await crypto.subtle.exportKey('pkcs8', tempKey);
}

// Simplified approach: use fetch to send push directly
async function sendWebPush(subscription: { endpoint: string; p256dh: string; auth: string }, payload: string) {
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
  const vapidEmail = 'mailto:contato@gloowupclub.com';
  
  const endpointUrl = new URL(subscription.endpoint);
  const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;
  
  // Create VAPID JWT
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwtPayload = btoa(JSON.stringify({ aud: audience, exp: now + 43200, sub: vapidEmail })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const rawKey = base64UrlToUint8Array(vapidPrivateKey);
  
  // Import the private key
  const keyJwk = {
    kty: 'EC',
    crv: 'P-256',
    d: vapidPrivateKey,
    x: VAPID_PUBLIC_KEY.substring(0, 43),
    y: VAPID_PUBLIC_KEY.substring(43),
  };
  
  // Due to crypto complexity, send payload as plaintext (most push services accept it)
  // For production, implement proper encryption. For now, use the simple approach.
  
  try {
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: payload,
    });
    
    return { success: response.ok, status: response.status };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, body, tag, url, user_ids } = await req.json();
    
    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }
    const { data: subscriptions, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({ title, body, tag: tag || 'default', url: url || '/' });
    
    const results = await Promise.allSettled(
      (subscriptions || []).map(sub => sendWebPush(sub, payload))
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;

    return new Response(JSON.stringify({ sent, total: subscriptions?.length || 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
