import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function redact(s: string | undefined): string {
  if (!s) return "<missing>";
  if (s.length <= 8) return "***";
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
}

function normalizeProjectUrl(url: string | undefined): string {
  if (!url) return "";
  let u = url.trim();
  // Strip trailing slashes and common SDK-appended sub-paths the user accidentally included.
  // The Supabase JS SDK expects the project root (https://<ref>.supabase.co).
  u = u.replace(/\/+$/, "");
  u = u.replace(/\/(rest|auth|storage|functions)\/v\d+\/?$/, "");
  return u;
}

export function createServiceRoleClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const url = normalizeProjectUrl(rawUrl);

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    const present = REQUIRED_VARS.map((v) => {
      const val =
        v === "NEXT_PUBLIC_SUPABASE_URL" ? url : process.env[v]?.trim();
      return `${v}=${val ? "SET" : "<missing>"}`;
    }).join(", ");
    const msg = `[Supabase] Server config missing: ${missing.join(
      ", "
    )}. Create .env.local in the project root with these vars. (Env status: ${present})`;
    throw new Error(msg);
  }

  const key = serviceKey!;
  const keyPrefix = key.slice(0, Math.min(10, key.length));
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[Supabase] Server client OK. URL=${url} SERVICE_KEY=${redact(
        key
      )} KEY_PREFIX=${keyPrefix} LEN=${key.length}`
    );
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  });
}

export const PAYMENT_BUCKET =
  process.env.SUPABASE_PAYMENT_BUCKET || "payment-proofs";

export async function verifyServerConfig(): Promise<{
  ok: boolean;
  note?: string;
}> {
  try {
    const db = createServiceRoleClient();
    const { error } = await db
      .from("registrations")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    if (error) {
      const e: any = error;
      return {
        ok: false,
        note: `DB probe failed — code=${e?.code ?? "?"} status=${e?.status ?? "?"} msg=${e?.message ?? String(error)}`,
      };
    }
    return { ok: true };
  } catch (err) {
    const e: any = err;
    return {
      ok: false,
      note: `DB probe threw — name=${e?.name ?? "?"} msg=${e?.message ?? String(err)}`,
    };
  }
}

export async function verifyStorageBucket(): Promise<{
  ok: boolean;
  bucketExists?: boolean;
  bucketPublic?: boolean;
  note?: string;
}> {
  try {
    const db = createServiceRoleClient();
    const { data, error } = await db.storage.getBucket(PAYMENT_BUCKET);
    if (error) {
      const e: any = error;
      return {
        ok: false,
        bucketExists: false,
        note: `Storage getBucket(${PAYMENT_BUCKET}) failed — name=${e?.name ?? "?"} code=${e?.code ?? "?"} status=${e?.status ?? "?"} statusCode=${e?.statusCode ?? "?"} msg=${e?.message ?? String(error)}`,
      };
    }
    if (!data) {
      return {
        ok: false,
        bucketExists: false,
        note: `Storage bucket "${PAYMENT_BUCKET}" does not exist. Create it PRIVATE in Supabase Dashboard → Storage.`,
      };
    }
    if (data.public) {
      return {
        ok: false,
        bucketExists: true,
        bucketPublic: true,
        note: `Storage bucket "${PAYMENT_BUCKET}" is PUBLIC — toggle OFF "Public bucket" in the dashboard (payment PII requires private).`,
      };
    }
    return { ok: true, bucketExists: true, bucketPublic: false };
  } catch (err) {
    const e: any = err;
    return {
      ok: false,
      note: `Storage probe threw — name=${e?.name ?? "?"} msg=${e?.message ?? String(err)}`,
    };
  }
}

export function getConfigDiagnostics(): Record<string, string> {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "SET"
      : "<missing>",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "SET"
      : "<missing>",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "SET"
      : "<missing>",
    SUPABASE_PAYMENT_BUCKET: PAYMENT_BUCKET,
  };
}

