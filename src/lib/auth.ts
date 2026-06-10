import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

export async function verifyAuth(request: NextRequest, requiredRole?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('jivnicare_token')?.value

  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    if (requiredRole && payload.role !== requiredRole) return null

    // For doctor role, check for doctorId in payload
    if (payload.role === 'DOCTOR') {
      return (payload.doctorId || payload.id) as string
    }

    return payload.id as string
  } catch {
    return null
  }
}
