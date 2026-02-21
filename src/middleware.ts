import { NextResponse } from "next/server";

// Simplified middleware - auth disabled for MVP
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
