import { NextResponse } from "next/server";
import {
  createServiceRoleClient,
  getConfigDiagnostics,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error(
        "[Count 503] Missing Supabase env vars. Status:",
        getConfigDiagnostics()
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Live count unavailable — Supabase is not configured on the server.",
        },
        { status: 503 }
      );
    }

    let db;
    try {
      db = createServiceRoleClient();
    } catch (cfgErr) {
      console.error(
        "[Count 503] Supabase server client failed to initialize:",
        cfgErr instanceof Error ? cfgErr.message : cfgErr
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Live count unavailable — Supabase is not configured on the server.",
        },
        { status: 503 }
      );
    }

    const { count, error } = await db
      .from("registrations")
      .select("*", { count: "exact", head: true });

    if (error) {
      const e: any = error;
      const fields = {
        name: e?.name,
        code: e?.code,
        status: e?.status,
        statusCode: e?.statusCode,
        httpCode: e?.httpCode,
        message: e?.message,
        details: e?.details,
        hint: e?.hint,
      };
      let raw: string;
      try {
        raw = JSON.stringify(error);
      } catch {
        raw = String(error);
      }
      console.error(
        "[Count FAIL] fields=%o raw=%s",
        fields,
        raw.length > 500 ? raw.slice(0, 500) + "…" : raw
      );
      return NextResponse.json(
        { ok: false, error: "Couldn't fetch live registration count." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, count: count ?? 0 },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=15, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    const e: any = err;
    const fields = {
      name: e?.name,
      code: e?.code,
      status: e?.status,
      statusCode: e?.statusCode,
      message: e?.message,
    };
    const stack = e?.stack ? String(e.stack).slice(0, 400) : undefined;
    console.error(
      "[Count UNEXPECTED] fields=%o stack=%s",
      fields,
      stack ?? "<no stack>"
    );
    return NextResponse.json(
      { ok: false, error: "Unexpected error fetching live count." },
      { status: 500 }
    );
  }
}
