import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  createServiceRoleClient,
  PAYMENT_BUCKET,
  getConfigDiagnostics,
} from "@/lib/supabase/server";

export interface AdminUser {
  email: string;
}

function normalizeProjectUrl(url: string | undefined): string {
  if (!url) return "";
  let u = url.trim();
  u = u.replace(/\/+$/, "");
  u = u.replace(/\/(rest|auth|storage|functions)\/v\d+\/?$/, "");
  return u;
}

export async function createServerSupabase() {
  const cookieStore = cookies();

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const url = normalizeProjectUrl(rawUrl);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  return createServerClient(url, anonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from Server Component — can be ignored
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Called from Server Component — can be ignored
        }
      },
    },
  });
}

export async function getAdminOrNull(): Promise<AdminUser | null> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) return null;

    const db = createServiceRoleClient();
    const { data, error } = await db
      .from("admin_users")
      .select("email")
      .eq("email", user.email.toLowerCase())
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export interface RegistrationRow {
  id: string;
  full_name: string;
  college_email: string;
  mobile_number: string;
  roll_number: string;
  department: string;
  year_of_study: string;
  upi_transaction_id: string;
  payment_status: "Pending" | "Verified" | "Rejected";
  payment_proof_path: string;
  verification_note?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Counts {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export async function fetchCounts(): Promise<Counts> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("registrations").select(
    "payment_status",
    { count: "exact", head: false }
  );
  if (error) throw new Error(error.message);

  const counts: Counts = { total: 0, pending: 0, verified: 0, rejected: 0 };
  for (const row of data as {
    payment_status: "Pending" | "Verified" | "Rejected";
  }[]) {
    counts.total++;
    if (row.payment_status === "Pending") counts.pending++;
    if (row.payment_status === "Verified") counts.verified++;
    if (row.payment_status === "Rejected") counts.rejected++;
  }
  return counts;
}

export async function createSignedProofUrl(
  storagePath: string,
  expiresIn = 60 * 10
): Promise<{ url: string; filename: string }> {
  const db = createServiceRoleClient();
  const filename = storagePath.split("/").pop() || "payment-proof";
  const { data, error } = await db.storage
    .from(PAYMENT_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error || !data) throw new Error(error?.message || "Cannot sign proof URL");
  return { url: data.signedUrl, filename };
}
