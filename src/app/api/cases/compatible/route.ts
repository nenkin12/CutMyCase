import { NextResponse } from "next/server";

export async function POST() {
  // Case compatibility check disabled - using static case list
  return NextResponse.json({ cases: [] });
}
