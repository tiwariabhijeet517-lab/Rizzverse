import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/supabase/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/types/registration";

export const dynamic = "force-dynamic";

const STATUSES: ReadonlyArray<PaymentStatus> = [
  "Pending",
  "Verified",
  "Rejected",
];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Admin login required." },
      { status: 401 }
    );
  }

  try {
    const { status } = (await req.json()) as { status?: unknown };
    if (typeof status !== "string" || !STATUSES.includes(status as PaymentStatus)) {
      return NextResponse.json(
        { ok: false, error: "Invalid payment status." },
        { status: 400 }
      );
    }
    const targetStatus = status as PaymentStatus;

    const db = createServiceRoleClient();
    const update: Record<string, unknown> = { payment_status: targetStatus };

    if (targetStatus === "Verified" || targetStatus === "Rejected") {
      update.verified_at = new Date().toISOString();
      update.verified_by = admin.email;
    } else {
      update.verified_at = null;
      update.verified_by = null;
    }

    const { error, count } = await db
      .from("registrations")
      .update(update)
      .eq("id", params.id);

    if (error) {
      console.error("Status update error:", error);
      return NextResponse.json(
        { ok: false, error: error.message || "Update failed." },
        { status: 500 }
      );
    }

    if (!count || count === 0) {
      return NextResponse.json(
        { ok: false, error: "Registration not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        updatedId: params.id,
        newStatus: targetStatus,
        updatedBy: admin.email,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected admin status error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
