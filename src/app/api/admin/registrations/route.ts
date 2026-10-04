import { NextResponse } from "next/server";
import { getAdminOrNull, fetchCounts } from "@/lib/supabase/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { RegistrationRow } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function normalizeString(s: string) {
  return s.toLowerCase().trim();
}

export async function GET(req: Request) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Admin login required." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") ?? "";
    const status = searchParams.get("status") ?? "All";

    const counts = await fetchCounts();

    const db = createServiceRoleClient();
    let query = db
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (status !== "All" && status !== "") {
      query = query.eq("payment_status", status);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Registrations fetch error:", error);
      return NextResponse.json(
        { ok: false, error: error.message || "Couldn't fetch registrations." },
        { status: 500 }
      );
    }

    let rows = (data as RegistrationRow[]) || [];

    if (search) {
      const s = normalizeString(search);
      rows = rows.filter(
        (r) =>
          normalizeString(r.full_name).includes(s) ||
          normalizeString(r.college_email).includes(s) ||
          normalizeString(r.mobile_number).includes(s) ||
          normalizeString(r.roll_number).includes(s) ||
          normalizeString(r.department).includes(s) ||
          normalizeString(r.year_of_study).includes(s) ||
          normalizeString(r.upi_transaction_id).includes(s)
      );
    }

    return NextResponse.json(
      {
        ok: true,
        counts,
        rows,
        filters: { search, status },
        adminEmail: admin.email,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected admin list error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
