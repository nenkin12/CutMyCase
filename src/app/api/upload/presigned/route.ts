import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl, generateUploadKey } from "@/lib/s3";
import { db } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Missing filename or contentType" },
        { status: 400 }
      );
    }

    // Validate content type
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Generate upload key
    const key = generateUploadKey(
      "uploads",
      filename,
      session?.user?.id
    );

    // Get presigned URL
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);

    // Create upload record
    const upload = await db.upload.create({
      data: {
        id: uuid(),
        userId: session?.user?.id,
        sessionId: session?.user?.id ? undefined : uuid(),
        status: "PENDING",
        originalUrl: publicUrl,
        originalKey: key,
      },
    });

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
