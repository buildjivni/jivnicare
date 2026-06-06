"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => r.json());

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  COMPLETED:       { label: "Completed",       color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  CANCELLED:       { label: "Cancelled",       color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
  NO_SHOW:         { label: "No Show",         color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  EXPIRED:         { label: "Expired",         color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  WAITING:         { label: "Waiting",         color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
  IN_CONSULTATION: { label: "In Consultation", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" },
  READY:           { label: "Ready",           color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  CALLED:          { label: "Called",          color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useSWR(
    `/api/patient/history?page=${page}&limit=10`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center text-zinc-500">
        Loading...
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center text-red-500">
        Kuch galat ho gaya. Dobara try karein.
      </div>
    );
  }

  const { tokens = [], total = 0, totalPages = 1 } = data ?? {};

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        Booking History
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Aapki pichhli {total} bookings
      </p>

      {tokens.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">Abhi tak koi booking nahi ki</p>
          <Link
            href="/search"
            className="mt-4 inline-block text-sm text-zinc-900 dark:text-zinc-100 underline"
          >
            Doctor dhundein →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {tokens.map((token: any) => {
              const statusConfig =
                STATUS_LABELS[token.status] ?? STATUS_LABELS["WAITING"];
              return (
                <div
                  key={token.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {token.queue?.doctor?.name ?? "Doctor"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {token.queue?.doctor?.clinicName ??
                          token.queue?.doctor?.district ??
                          ""}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                    <span>Token #{token.tokenNumber}</span>
                    <span>•</span>
                    <span>
                      {token.queue?.date
                        ? formatDate(token.queue.date)
                        : "—"}
                    </span>
                    <span>•</span>
                    <span>
                      {token.source === "WALK_IN" ? "Walk-in" : "Online"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40"
              >
                ← Pehle
              </button>
              <span className="text-sm text-zinc-500">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40"
              >
                Aage →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
