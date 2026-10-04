import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } catch {
    // Ignore sign-out errors; cookie clear below is best-effort.
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
