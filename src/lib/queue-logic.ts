/**
 * deterministic queue logic for JivniCare (Phase 4 Stabilization)
 * In production, these would be API calls.
 */

export function getDoctorQueueStatus(doctorId: string) {
  // Use doctorId as seed for deterministic values
  const seed = doctorId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const currentToken = Math.max(1, (seed * 3) % 15);
  const totalInQueue = currentToken + Math.max(2, (seed * 2) % 8);
  const avgTime = 12 + (seed % 6);
  const estimatedWait = (totalInQueue - currentToken) * avgTime;
  
  return { 
    currentToken, 
    totalInQueue, 
    avgTime, 
    estimatedWait,
    completedCount: Math.max(5, (seed * 4) % 40)
  };
}

export function generateToken(doctorId: string, patientName: string) {
  const status = getDoctorQueueStatus(doctorId);
  const newTokenNumber = status.totalInQueue + 1;
  
  return {
    id: `TKN-${Date.now().toString(36).toUpperCase()}`,
    tokenNumber: newTokenNumber,
    status: "WAITING",
    source: "ONLINE",
    estimatedWaitMinutes: (newTokenNumber - status.currentToken) * status.avgTime,
    createdAt: new Date().toISOString(),
    patientName,
  };
}
