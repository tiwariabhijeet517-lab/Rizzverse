"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RegistrationRow, Counts } from "@/lib/supabase/admin";
import type { PaymentStatus } from "@/types/registration";

type AdminRowsState =
  | { status: "loading" }
  | {
      status: "ready";
      rows: RegistrationRow[];
      counts: Counts;
      adminEmail: string;
    }
  | { status: "error"; message: string };

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminDashboardView() {
  const [state, setState] = useState<AdminRowsState>({ status: "loading" });
  const [search, setSearch] = useState("");
  const [refreshNonce, setRefreshNonce] = useState(0);

  const loadData = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const url = `/api/admin/registrations${
        params.size ? `?${params.toString()}` : ""
      }`;
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        rows?: RegistrationRow[];
        counts?: Counts;
        adminEmail?: string;
      };
      if (!res.ok || !json.ok || !json.rows || !json.counts) {
        throw new Error(json.error || "Couldn't fetch dashboard data.");
      }
      setState({
        status: "ready",
        rows: json.rows,
        counts: json.counts,
        adminEmail: json.adminEmail ?? "admin",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setState({ status: "error", message: msg });
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshNonce]);

  const counts: Counts = useMemo(() => {
    if (state.status !== "ready")
      return { total: 0, pending: 0, verified: 0, rejected: 0 };
    return state.counts;
  }, [state]);

  const statsCards = [
    {
      label: "Total Registrations",
      value: counts.total,
      gradient: "from-rizz-primary to-rizz-accent",
    },
    {
      label: "Pending Records",
      value: counts.pending,
      gradient: "from-amber-400 to-orange-500",
    },
    {
      label: "Verified Records",
      value: counts.verified,
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      label: "Rejected Records",
      value: counts.rejected,
      gradient: "from-rose-400 to-red-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Registrations Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            View submitted registrations and UTR numbers. For full editing, use
            the Supabase Table Editor.
          </p>
        </div>
        <button
          onClick={() => setRefreshNonce((n) => n + 1)}
          className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-xl bg-slate-800/70 border border-slate-700 text-sm font-medium text-gray-200 hover:bg-slate-700 hover:border-slate-600 transition-all"
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
          Refresh
        </button>
      </div>

      <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/30 p-5 text-sm">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-indigo-300 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-indigo-100 leading-relaxed">
            <p className="font-semibold text-indigo-200">
              Tip: Use Supabase Table Editor for the full management view
            </p>
            <p className="text-indigo-200/75 mt-1">
              Supabase Dashboard &rarr; Project &rarr; Table Editor &rarr;{" "}
              <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">
                registrations
              </code>{" "}
              table. You can add/remove columns, edit UTRs, update status
              values, and export CSV from there directly.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl bg-slate-900/70 border border-slate-700 p-5 shadow-lg backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {c.label}
            </p>
            <p
              className={`mt-2 text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent tabular-nums`}
            >
              {c.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-900/70 border border-slate-700 p-4 md:p-5 shadow-lg backdrop-blur space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, mobile, roll, dept, UTR…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rizz-primary focus:border-transparent"
            />
          </div>
        </div>

        {state.status === "loading" && (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <svg
              className="animate-spin h-6 w-6 text-rizz-secondary"
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
        )}

        {state.status === "error" && (
          <div className="py-12 text-center space-y-3">
            <p className="text-red-300 text-sm">
              {state.message === "Admin login required."
                ? "Your session expired. Please sign in again."
                : state.message}
            </p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-slate-800/70 border border-slate-700 text-sm font-medium text-gray-200 hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        )}

        {state.status === "ready" && state.rows.length === 0 && (
          <div className="py-16 text-center space-y-2 border border-dashed border-slate-700 rounded-2xl">
            <p className="text-lg font-semibold text-white">
              No registrations yet
            </p>
            <p className="text-sm text-gray-400">
              Registrations submitted by students will appear here.
            </p>
          </div>
        )}

        {state.status === "ready" && state.rows.length > 0 && (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full min-w-[900px] text-sm text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-slate-700">
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">
                    Student
                  </th>
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">
                    Roll / Dept / Year
                  </th>
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">
                    Mobile
                  </th>
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">
                    UTR (UPI ID)
                  </th>
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">
                    Registered
                  </th>
                  <th className="px-3 py-3 font-semibold whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-3 py-3.5">
                      <div className="font-semibold text-white whitespace-nowrap">
                        {r.full_name}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[220px]">
                        {r.college_email}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-gray-300 whitespace-nowrap">
                      <div className="font-medium">{r.roll_number}</div>
                      <div className="text-xs text-gray-400">
                        {r.department} · {r.year_of_study}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap">
                      {r.mobile_number}
                    </td>
                    <td className="px-3 py-3.5 text-gray-300 font-mono text-xs whitespace-nowrap max-w-[200px] truncate">
                      {r.upi_transaction_id || (
                        <span className="text-gray-500 italic">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-gray-300 text-xs whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <StatusBadge status={r.payment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  let classes = "";
  switch (status) {
    case "Verified":
      classes =
        "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";
      break;
    case "Rejected":
      classes = "bg-red-500/15 border-red-500/30 text-red-300";
      break;
    case "Pending":
    default:
      classes = "bg-amber-500/15 border-amber-500/30 text-amber-300";
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${classes}`}
    >
      {status}
    </span>
  );
}
