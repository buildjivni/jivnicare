/**
 * Centralised fetch wrappers for all queue state transitions.
 * Every function returns { success: boolean, error?: string, token?: unknown }
 */

async function queuePatch(url: string, body: object) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error ?? "Request failed" };
  return { success: true, token: data.token };
}

async function queuePut(url: string, body: object) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error ?? "Request failed" };
  return { success: true, token: data.token };
}

async function queuePost(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error ?? "Request failed" };
  return { success: true, ...data };
}

// WAITING → AWAITING_ARRIVAL
export const markArrived = (tokenId: string) =>
  queuePatch("/api/doctor/queue/arrive", { tokenId });

// AWAITING_ARRIVAL → PAYMENT_PENDING (or READY if no payment)
export const requestPayment = (tokenId: string) =>
  queuePatch("/api/doctor/queue/payment", { tokenId, action: "request" });

// PAYMENT_PENDING → READY
export const approvePayment = (tokenId: string) =>
  queuePatch("/api/doctor/queue/payment", { tokenId, action: "approve" });

// READY → CALLED
export const callPatient = (tokenId: string) =>
  queuePatch("/api/doctor/queue/call", { tokenId });

// CALLED → IN_CONSULTATION
export const startConsultation = (tokenId: string) =>
  queuePut("/api/doctor/queue/update-status", {
    tokenId,
    status: "IN_CONSULTATION",
  });

// IN_CONSULTATION → COMPLETED
export const completeConsultation = (tokenId: string) =>
  queuePut("/api/doctor/queue/update-status", {
    tokenId,
    status: "COMPLETED",
  });

// IN_CONSULTATION → NO_SHOW
export const markNoShow = (tokenId: string) =>
  queuePut("/api/doctor/queue/update-status", {
    tokenId,
    status: "NO_SHOW",
  });

// Bulk expire all WAITING tokens
export const expireQueue = (queueId: string) =>
  queuePost("/api/doctor/queue/expire", { queueId });
