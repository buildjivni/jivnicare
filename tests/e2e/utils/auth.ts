export async function getAuthToken(role: 'patient' | 'doctor' | 'admin'): Promise<string> {
  // Mock login endpoint returns a JWT for the given role.
  // This endpoint exists only in test environments and does not send real SMS or passwords.
const res = await fetch(`http://localhost:3000/api/auth/mock-login?role=${role}`);
  if (!res.ok) {
    throw new Error(`Failed to obtain mock token for ${role}`);
  }
  const data = await res.json();
  return data.token;
}
