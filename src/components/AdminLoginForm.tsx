"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";
import SubmitButton from "@/components/SubmitButton";
import { createClient, getEnvDiagnostics } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    try {
      console.log(
        "[AdminLoginForm] Render-time browser env diagnostics:",
        getEnvDiagnostics()
      );
    } catch {}
  }, []);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = "Enter a valid email.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    setFieldError(errors.email || errors.password || null);
    return errors;
  };

  const isSetupError = (msg: unknown): boolean => {
    if (typeof msg !== "string") return false;
    return /env var|env\.local|missing or empty|api key|not finished configuring|invalid api key/i.test(
      msg
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTopError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        const err: any = error;
        const fields = {
          name: err?.name,
          status: err?.status,
          code: err?.code,
          message: err?.message,
        };
        console.error(
          "Admin login (auth returned error) fields=%o raw=%s",
          fields,
          String(error)
        );
        const msg = err?.message;
        if (isSetupError(msg)) {
          setTopError(
            "The organizer has not finished configuring the Supabase public credentials yet. Please try again in a few minutes."
          );
        } else {
          setTopError(
            msg ||
              "Couldn't sign in. Check your credentials, or contact an organizer if your email has not been promoted to admin."
          );
        }
        setLoading(false);
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(
        "Admin login (thrown). name=%s code=%s status=%s message=%s env=%o",
        err?.name,
        err?.code,
        err?.status,
        err?.message,
        (() => {
          try {
            return getEnvDiagnostics();
          } catch {
            return { unavailable: true };
          }
        })()
      );
      const msg = err?.message;
      if (isSetupError(msg)) {
        setTopError(
          "The organizer has not finished configuring the Supabase public credentials yet. Please try again in a few minutes."
        );
      } else {
        setTopError("Unexpected network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Admin Login</h1>
        <p className="text-sm text-gray-400 mt-1">
          Sign in to verify payments and manage registrations.
        </p>
      </div>

      {topError && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-300 leading-relaxed">{topError}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="you@college.edu.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />
        <FormInput
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />
        {fieldError && (
          <p className="text-sm text-red-400 flex items-center gap-1 -mt-2">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {fieldError}
          </p>
        )}
        <SubmitButton type="submit" isLoading={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </SubmitButton>
      </form>
    </div>
  );
}
