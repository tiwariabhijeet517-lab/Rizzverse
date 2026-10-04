import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminOrNull } from "@/lib/supabase/admin";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminOrNull();
  if (!admin) redirect("/admin");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="text-2xl font-extrabold bg-gradient-to-r from-rizz-primary via-rizz-accent to-rizz-secondary bg-clip-text text-transparent"
            >
              RIZZVERSE&apos;26
            </Link>
            <span className="px-2.5 py-1 rounded-full bg-slate-800/70 border border-slate-700 text-[11px] font-semibold uppercase tracking-wider text-gray-300">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Site Home
            </Link>
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-700 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-rizz-secondary" />
              <span className="max-w-[180px] truncate">{admin.email}</span>
            </span>
            <AdminLogoutButton />
          </div>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}
