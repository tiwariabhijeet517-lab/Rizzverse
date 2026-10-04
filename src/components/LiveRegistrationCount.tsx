"use client";

import { useEffect, useState, useCallback } from "react";

type CountState =
  | { status: "loading" }
  | { status: "ready"; count: number }
  | { status: "error"; message: string };

interface LiveRegistrationCountProps {
  refreshKey?: number;
}

export default function LiveRegistrationCount({
  refreshKey,
}: LiveRegistrationCountProps) {
  const [state, setState] = useState<CountState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/registrations/count", {
        method: "GET",
        cache: "no-store",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        count?: number;
        error?: string;
      };
      if (!res.ok || !json.ok || typeof json.count !== "number") {
        throw new Error(json.error || "Unknown error");
      }
      setState({ status: "ready", count: json.count });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not load count.";
      setState({ status: "error", message: msg });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (state.status === "loading") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700 text-sm text-gray-300">
        <svg
          className="animate-spin h-4 w-4 text-rizz-secondary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Loading registrations…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <button
        onClick={load}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-sm text-red-300 hover:bg-red-500/20 transition-colors"
        title={state.message}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Couldn&apos;t load live count — Retry
      </button>
    );
  }

  const { count } = state;
  return (
    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-800/60 border border-slate-700 backdrop-blur-sm shadow">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rizz-secondary opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rizz-secondary" />
      </span>
      <span className="text-sm text-gray-300">
        Students registered:&nbsp;
        <span className="font-extrabold text-lg bg-gradient-to-r from-rizz-primary via-rizz-accent to-rizz-secondary bg-clip-text text-transparent tabular-nums">
          {count.toLocaleString("en-IN")}
        </span>
      </span>
    </div>
  );
}
