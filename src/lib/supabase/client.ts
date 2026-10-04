import { createBrowserClient } from "@supabase/ssr";

function normalizeProjectUrl(url: string | undefined): string {
  if (!url) return "";
  let u = url.trim();
  u = u.replace(/\/+$/, "");
  u = u.replace(/\/(rest|auth|storage|functions)\/v\d+\/?$/, "");
  return u;
}

export function getEnvDiagnostics(): Record<string, "SET" | "<missing>"> {
  return {
    NEXT_PUBLIC_SUPABASE_URL:
      !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ? "SET" : "<missing>",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ? "SET" : "<missing>",
  };
}

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[Supabase] Browser env state:",
      getEnvDiagnostics()
    );
  }

  const url = normalizeProjectUrl(rawUrl);
  const trimmedKey = anonKey?.trim();

  if (!url || !trimmedKey) {
    const missing: string[] = [];
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!trimmedKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const msg = `[Supabase] Browser env var missing or empty: ${missing.join(
      ", "
    )}. Create .env.local in the PROJECT ROOT (/Rizzverse/.env.local — NOT inside supabase/ subfolder), set these two NEXT_PUBLIC_* vars, then STOP and RESTART the dev server. State: ${JSON.stringify(
      getEnvDiagnostics()
    )}`;
    if (typeof window !== "undefined") {
      console.error(msg);
    }
    throw new Error(msg);
  }

  if (process.env.NODE_ENV !== "production") {
    const anonPrefix = trimmedKey.slice(0, Math.min(16, trimmedKey.length));
    const prefixHint = trimmedKey.startsWith("eyJ")
      ? "SHAPE=legacy-JWT (eyJ…)"
      : trimmedKey.startsWith("sb_publishable_")
        ? "SHAPE=new-opaque (sb_publishable_…)"
        : trimmedKey.startsWith("sb_secret_")
          ? "SHAPE=sb_secret_ ⚠️ INVALID FOR BROWSER (service role / server-only)"
          : `SHAPE=unknown prefix ${anonPrefix}`;
    console.log(
      `[Supabase] Browser client OK. URL=${url} ANON_PREFIX=${anonPrefix} LEN=${trimmedKey.length} ${prefixHint}`
    );
    // Shape-compatibility hint — non-secret prefix check only, no values printed.
    if (trimmedKey.startsWith("sb_secret_")) {
      console.error(
        "[Supabase] CONFIG ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY has sb_secret_ prefix in the browser. sb_secret_ keys are SERVER-ONLY service role keys. Copy the 'anon' public Project API key from Supabase Dashboard → Project Settings → API instead. It will start with eyJ (legacy) or sb_publishable_ (new system)."
      );
    }
  }

  // NOTE: Only set global `apikey`. The Supabase SDK manages `Authorization: Bearer`
  // PER-REQUEST internally: it uses the anon key BEFORE sign-in, then the USER's JWT
  // after a successful signInWithPassword. Forcing a global Authorization header
  // here would clobber the per-request user session header and break post-login
  // requests such as getting the user's admin session or fetching signed URLs.
  return createBrowserClient(url, trimmedKey, {
    global: {
      headers: {
        apikey: trimmedKey,
      },
    },
  });
}
