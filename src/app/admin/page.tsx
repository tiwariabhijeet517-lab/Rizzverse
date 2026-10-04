import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { getAdminOrNull } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin Login | RIZZVERSE'26",
  description: "Organizer-only login for the RIZZVERSE'26 admin dashboard.",
};

export default async function AdminLoginPage() {
  const alreadyAdmin = await getAdminOrNull();
  if (alreadyAdmin) redirect("/admin/dashboard");

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-32 w-[420px] h-[420px] bg-rizz-primary/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] bg-rizz-secondary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[420px] h-[420px] bg-rizz-accent/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center space-y-1">
          <Link
            href="/"
            className="inline-block text-2xl font-extrabold bg-gradient-to-r from-rizz-primary via-rizz-accent to-rizz-secondary bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            RIZZVERSE&apos;26
          </Link>
          <p className="text-sm text-gray-400">
            Organizer portal · Restricted access
          </p>
        </div>
        <AdminLoginForm />
        <p className="mt-6 text-center text-xs text-gray-500">
          Your email must be listed in <code className="text-gray-400">admin_users</code> by another organizer.
        </p>
      </div>
    </main>
  );
}
