import { NextResponse } from "next/server";

export async function POST() {
  // S3 presigned URLs disabled - using Firebase Storage direct upload instead
  return NextResponse.json(
    { error: "Using Firebase Storage for uploads" },
    { status: 410 }
  );
}
