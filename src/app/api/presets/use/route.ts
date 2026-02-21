import { NextRequest, NextResponse } from "next/server";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_URL = FIREBASE_PROJECT_ID
  ? `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`
  : null;

// POST - Increment usage count for a preset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { presetId } = body;

    if (!presetId) {
      return NextResponse.json({ error: "Preset ID required" }, { status: 400 });
    }

    if (!FIRESTORE_URL) {
      return NextResponse.json({ success: true });
    }

    // Get current preset
    const getResponse = await fetch(`${FIRESTORE_URL}/presets/${presetId}`);
    if (!getResponse.ok) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    const doc = await getResponse.json();
    const currentCount = parseInt(doc.fields?.usageCount?.integerValue || "0");

    // Update count
    const response = await fetch(
      `${FIRESTORE_URL}/presets/${presetId}?updateMask.fieldPaths=usageCount&updateMask.fieldPaths=updatedAt`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            usageCount: { integerValue: String(currentCount + 1) },
            updatedAt: { stringValue: new Date().toISOString() },
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to increment usage count:", await response.text());
    }

    return NextResponse.json({ success: true, newCount: currentCount + 1 });
  } catch (error) {
    console.error("Error incrementing usage count:", error);
    return NextResponse.json({ error: "Failed to update usage" }, { status: 500 });
  }
}
