"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch queue");
    return r.json();
  });

export function useQueue(queueId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    queueId ? `/api/doctor/queue?queueId=${queueId}` : null,
    fetcher,
    { refreshInterval: 15000 } // 15s polling — interim until SSE
  );

  return {
    queue: data?.queue ?? null,
    tokens: data?.tokens ?? [],
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
