import { NextResponse } from "next/server";
import { getAdminOrNull, createSignedProofUrl } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { path: string } }
) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Admin login required." },
      { status: 401 }
    );
  }

  try {
    if (!params.path || typeof params.path !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing payment proof path." },
        { status: 400 }
      );
    }

    const decoded = decodeURIComponent(params.path);
    const { url, filename } = await createSignedProofUrl(decoded, 60 * 10);

    return NextResponse.json(
      { ok: true, signedUrl: url, filename },
      { status: 200 }
    );
  } catch (err) {
    console.error("Signed proof URL error:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Couldn't generate a secure link for this payment proof right now.",
      },
      { status: 500 }
    );
  }
}
