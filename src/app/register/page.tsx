import type { Metadata } from "next";
import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register | RIZZVERSE'26",
  description: "Register for RIZZVERSE'26 IT Freshers' Party. Step In, Stand Out.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-32 w-[420px] h-[420px] bg-rizz-primary/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] bg-rizz-secondary/25 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[420px] h-[420px] bg-rizz-accent/25 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-8 md:py-12">
        <header className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:text-rizz-secondary font-bold text-xl transition-colors"
          >
            <span className="bg-gradient-to-r from-rizz-primary via-rizz-accent to-rizz-secondary bg-clip-text text-transparent">
              RIZZVERSE&apos;26
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-rizz-primary font-medium transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
        </header>

        <RegistrationForm />

        <footer className="text-center mt-10 text-sm text-gray-500">
          &copy; RIZZVERSE&apos;26 · IT Freshers&apos; Party · Step In, Stand Out.
        </footer>
      </div>
    </main>
  );
}
