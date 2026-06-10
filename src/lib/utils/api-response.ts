import { NextResponse } from 'next/server';

/**
 * Standard API Response Wrapper
 */
export function apiResponse<T>(data: T, status: number = 200, message?: string) {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      data,
      message,
    },
    { status }
  );
}

/**
 * Standard API Error Wrapper
 */
export function apiError(message: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}
