import { NextResponse } from "next/server";
import { getConfigDiagnostics } from "@/lib/supabase/server";
import { getEnvDiagnostics as getBrowserEnvDiagnostics } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export function GET() {
  const server = getConfigDiagnostics();
  const browser = getBrowserEnvDiagnostics();
  return NextResponse.json(
    {
      ok: true,
      server,
      browser,
      note:
        "No secrets are shown here. browser.* reflects what Next.js INLINED into the client bundle at BUILD time. If server.* is SET but browser.* is <missing>, then NEXT_PUBLIC_* were not present when 'npm run dev' started — STOP and RESTART the dev server after updating .env.local in the PROJECT ROOT.",
    },
    { status: 200 }
  );
}
