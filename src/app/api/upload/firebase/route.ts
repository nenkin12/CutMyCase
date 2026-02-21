import { NextRequest, NextResponse } from "next/server";

const FIREBASE_STORAGE_URL = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate unique filename
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `uploads/${uploadId}.${fileExt}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Firebase Storage via REST API
    const uploadUrl = `${FIREBASE_STORAGE_URL}/${encodeURIComponent(fileName)}?uploadType=media`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error("Firebase upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const uploadResult = await uploadResponse.json();

    // Construct the public URL
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(fileName)}?alt=media`;

    return NextResponse.json({
      uploadId,
      imageUrl: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
