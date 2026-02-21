import { NextRequest, NextResponse } from "next/server";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

// Template represents a verified/approved shape that can be used for training
interface Template {
  id: string;
  name: string; // e.g., "Glock 19", "30-round AR Magazine"
  category: string; // e.g., "firearm", "magazine"
  points: number[][]; // The refined/approved shape
  width: number; // Bounding box width in pixels
  height: number; // Bounding box height in pixels
  aspectRatio: number; // width/height for matching
  pointCount: number; // Number of points in shape
  trainingNotes: string; // Admin notes about this item
  sourceDesignId: string; // Which design this came from
  createdAt: string;
  usageCount: number; // How many times this template matched
}

// Convert Firestore document to Template
function firestoreToTemplate(doc: any, docId: string): Template {
  const fields = doc.fields || {};
  return {
    id: docId,
    name: fields.name?.stringValue || "",
    category: fields.category?.stringValue || "other",
    points: fields.points?.stringValue ? JSON.parse(fields.points.stringValue) : [],
    width: parseFloat(fields.width?.doubleValue || fields.width?.integerValue || "0"),
    height: parseFloat(fields.height?.doubleValue || fields.height?.integerValue || "0"),
    aspectRatio: parseFloat(fields.aspectRatio?.doubleValue || "1"),
    pointCount: parseInt(fields.pointCount?.integerValue || "0"),
    trainingNotes: fields.trainingNotes?.stringValue || "",
    sourceDesignId: fields.sourceDesignId?.stringValue || "",
    createdAt: fields.createdAt?.stringValue || new Date().toISOString(),
    usageCount: parseInt(fields.usageCount?.integerValue || "0"),
  };
}

// Convert Template to Firestore format
function templateToFirestore(template: Template) {
  return {
    fields: {
      name: { stringValue: template.name },
      category: { stringValue: template.category },
      points: { stringValue: JSON.stringify(template.points) },
      width: { doubleValue: template.width },
      height: { doubleValue: template.height },
      aspectRatio: { doubleValue: template.aspectRatio },
      pointCount: { integerValue: String(template.pointCount) },
      trainingNotes: { stringValue: template.trainingNotes },
      sourceDesignId: { stringValue: template.sourceDesignId },
      createdAt: { stringValue: template.createdAt },
      usageCount: { integerValue: String(template.usageCount) },
    }
  };
}

// GET - List all templates, optionally filtered by category
export async function GET(request: NextRequest) {
  try {
    if (!FIREBASE_PROJECT_ID) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let url = `${FIRESTORE_URL}/templates?orderBy=usageCount desc`;

    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();
    let templates: Template[] = (data.documents || []).map((doc: any) => {
      const docId = doc.name.split("/").pop();
      return firestoreToTemplate(doc, docId);
    });

    // Filter by category if specified
    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error reading templates:", error);
    return NextResponse.json([]);
  }
}

// POST - Save a new template (from admin approval)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Calculate bounding box
    const xs = body.points.map((p: number[]) => p[0]);
    const ys = body.points.map((p: number[]) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;

    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTemplate: Template = {
      id: templateId,
      name: body.name,
      category: body.category,
      points: body.points,
      width,
      height,
      aspectRatio: width / height,
      pointCount: body.points.length,
      trainingNotes: body.trainingNotes || "",
      sourceDesignId: body.sourceDesignId || "",
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    if (!FIREBASE_PROJECT_ID) {
      return NextResponse.json(newTemplate);
    }

    const firestoreDoc = templateToFirestore(newTemplate);

    const response = await fetch(`${FIRESTORE_URL}/templates?documentId=${templateId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreDoc),
    });

    if (!response.ok) {
      console.error("Firestore error:", await response.text());
    }

    return NextResponse.json(newTemplate);
  } catch (error) {
    console.error("Error saving template:", error);
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
}

// DELETE - Remove a template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template ID required" }, { status: 400 });
    }

    if (!FIREBASE_PROJECT_ID) {
      return NextResponse.json({ success: true });
    }

    await fetch(`${FIRESTORE_URL}/templates/${id}`, {
      method: "DELETE",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
