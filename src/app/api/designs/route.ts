import { NextRequest, NextResponse } from "next/server";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

interface DesignItem {
  id: string;
  name: string;
  points: number[][];
  color: string;
  depth?: number;
  width?: number;
  height?: number;
  // AI training feedback
  aiCategory?: string; // e.g., "firearm", "magazine", "tool", "accessory"
  aiPrompt?: string; // Admin feedback to help AI learn
  aiConfidence?: number; // AI's confidence in detection (0-1)
  correctedName?: string; // Admin-corrected name if AI got it wrong
}

interface Design {
  id: string;
  createdAt: string;
  status: "scanned" | "calibrated" | "layout" | "checkout" | "submitted";
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  items: DesignItem[];
  calibration?: {
    pixelsPerInch: number;
    referenceType?: string;
  };
  layout?: {
    caseId: string;
    caseName: string;
    caseWidth: number;
    caseHeight: number;
    items: Array<{
      id: string;
      x: number;
      y: number;
      rotation: number;
    }>;
  };
  customerInfo?: {
    needsCase: boolean;
  };
  // Admin review
  reviewed?: boolean;
  reviewedAt?: string;
  reviewNotes?: string;
}

// Convert Firestore document to our Design format
function firestoreToDesign(doc: any, docId: string): Design {
  const fields = doc.fields || {};
  return {
    id: docId,
    createdAt: fields.createdAt?.stringValue || new Date().toISOString(),
    status: fields.status?.stringValue || "scanned",
    imageUrl: fields.imageUrl?.stringValue || "",
    imageWidth: parseInt(fields.imageWidth?.integerValue || "0"),
    imageHeight: parseInt(fields.imageHeight?.integerValue || "0"),
    items: fields.items?.arrayValue?.values?.map((v: any) => JSON.parse(v.stringValue || "{}")) || [],
    calibration: fields.calibration?.stringValue ? JSON.parse(fields.calibration.stringValue) : undefined,
    layout: fields.layout?.stringValue ? JSON.parse(fields.layout.stringValue) : undefined,
    customerInfo: fields.customerInfo?.stringValue ? JSON.parse(fields.customerInfo.stringValue) : undefined,
  };
}

// Convert Design to Firestore format
function designToFirestore(design: Design) {
  return {
    fields: {
      id: { stringValue: design.id },
      createdAt: { stringValue: design.createdAt },
      status: { stringValue: design.status },
      imageUrl: { stringValue: design.imageUrl },
      imageWidth: { integerValue: String(design.imageWidth) },
      imageHeight: { integerValue: String(design.imageHeight) },
      items: {
        arrayValue: {
          values: design.items.map(item => ({ stringValue: JSON.stringify(item) }))
        }
      },
      calibration: { stringValue: design.calibration ? JSON.stringify(design.calibration) : "" },
      layout: { stringValue: design.layout ? JSON.stringify(design.layout) : "" },
      customerInfo: { stringValue: design.customerInfo ? JSON.stringify(design.customerInfo) : "" },
    }
  };
}

export async function GET() {
  try {
    if (!FIREBASE_PROJECT_ID) {
      return NextResponse.json([]);
    }

    const response = await fetch(`${FIRESTORE_URL}/designs?orderBy=createdAt desc`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      // Collection might not exist yet
      return NextResponse.json([]);
    }

    const data = await response.json();
    const designs: Design[] = (data.documents || []).map((doc: any) => {
      const docId = doc.name.split("/").pop();
      return firestoreToDesign(doc, docId);
    });

    return NextResponse.json(designs);
  } catch (error) {
    console.error("Error reading designs:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const designId = `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDesign: Design = {
      id: designId,
      createdAt: new Date().toISOString(),
      status: body.status || "scanned",
      imageUrl: body.imageUrl || "",
      imageWidth: body.imageWidth || 0,
      imageHeight: body.imageHeight || 0,
      items: body.items || [],
      calibration: body.calibration,
      layout: body.layout,
      customerInfo: body.customerInfo,
    };

    if (!FIREBASE_PROJECT_ID) {
      // Return the design even if Firebase isn't configured
      return NextResponse.json(newDesign);
    }

    const firestoreDoc = designToFirestore(newDesign);

    const response = await fetch(`${FIRESTORE_URL}/designs?documentId=${designId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreDoc),
    });

    if (!response.ok) {
      console.error("Firestore error:", await response.text());
    }

    return NextResponse.json(newDesign);
  } catch (error) {
    console.error("Error saving design:", error);
    return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Design ID required" }, { status: 400 });
    }

    if (!FIREBASE_PROJECT_ID) {
      return NextResponse.json({ id, ...updates });
    }

    // Get existing document
    const getResponse = await fetch(`${FIRESTORE_URL}/designs/${id}`);

    if (!getResponse.ok) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const existingDoc = await getResponse.json();
    const existing = firestoreToDesign(existingDoc, id);
    const updated: Design = { ...existing, ...updates };

    const firestoreDoc = designToFirestore(updated);

    await fetch(`${FIRESTORE_URL}/designs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreDoc),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating design:", error);
    return NextResponse.json({ error: "Failed to update design" }, { status: 500 });
  }
}
