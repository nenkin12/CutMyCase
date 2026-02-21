import { NextRequest, NextResponse } from "next/server";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_URL = FIREBASE_PROJECT_ID
  ? `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`
  : null;

// Preset item represents a pre-made cutout that users can add to their case
export interface PresetItem {
  id: string;
  name: string;
  brand: string;
  category: string; // drone, battery, camera, accessory, etc.
  subcategory?: string; // DJI Mini 3, Mavic 3, etc.
  points: number[][]; // The shape outline
  widthInches: number;
  heightInches: number;
  depthInches: number;
  imageUrl?: string; // Reference image
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Convert Firestore document to PresetItem
function firestoreToPreset(doc: { name: string; fields?: Record<string, any> }): PresetItem | null {
  if (!doc.fields) return null;

  const fields = doc.fields;
  const docId = doc.name.split("/").pop() || "";

  return {
    id: docId,
    name: fields.name?.stringValue || "",
    brand: fields.brand?.stringValue || "",
    category: fields.category?.stringValue || "other",
    subcategory: fields.subcategory?.stringValue || undefined,
    points: fields.points?.stringValue ? JSON.parse(fields.points.stringValue) : [],
    widthInches: parseFloat(fields.widthInches?.doubleValue || fields.widthInches?.integerValue || "0"),
    heightInches: parseFloat(fields.heightInches?.doubleValue || fields.heightInches?.integerValue || "0"),
    depthInches: parseFloat(fields.depthInches?.doubleValue || fields.depthInches?.integerValue || "1.5"),
    imageUrl: fields.imageUrl?.stringValue || undefined,
    thumbnailUrl: fields.thumbnailUrl?.stringValue || undefined,
    description: fields.description?.stringValue || undefined,
    tags: fields.tags?.stringValue ? JSON.parse(fields.tags.stringValue) : [],
    usageCount: parseInt(fields.usageCount?.integerValue || "0"),
    createdAt: fields.createdAt?.stringValue || new Date().toISOString(),
    updatedAt: fields.updatedAt?.stringValue || new Date().toISOString(),
    isActive: fields.isActive?.booleanValue ?? true,
  };
}

// Convert PresetItem to Firestore format
function presetToFirestore(preset: PresetItem) {
  return {
    fields: {
      name: { stringValue: preset.name },
      brand: { stringValue: preset.brand },
      category: { stringValue: preset.category },
      subcategory: { stringValue: preset.subcategory || "" },
      points: { stringValue: JSON.stringify(preset.points) },
      widthInches: { doubleValue: preset.widthInches },
      heightInches: { doubleValue: preset.heightInches },
      depthInches: { doubleValue: preset.depthInches },
      imageUrl: { stringValue: preset.imageUrl || "" },
      thumbnailUrl: { stringValue: preset.thumbnailUrl || "" },
      description: { stringValue: preset.description || "" },
      tags: { stringValue: JSON.stringify(preset.tags) },
      usageCount: { integerValue: String(preset.usageCount) },
      createdAt: { stringValue: preset.createdAt },
      updatedAt: { stringValue: preset.updatedAt },
      isActive: { booleanValue: preset.isActive },
    },
  };
}

// GET - List all presets, optionally filtered
export async function GET(request: NextRequest) {
  try {
    if (!FIRESTORE_URL) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const activeOnly = searchParams.get("active") !== "false";
    const search = searchParams.get("search")?.toLowerCase();

    const response = await fetch(`${FIRESTORE_URL}/presets?pageSize=200`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to fetch presets:", await response.text());
      return NextResponse.json([]);
    }

    const data = await response.json();
    let presets: PresetItem[] = [];

    if (data.documents) {
      for (const doc of data.documents) {
        const preset = firestoreToPreset(doc);
        if (preset) {
          presets.push(preset);
        }
      }
    }

    // Apply filters
    if (activeOnly) {
      presets = presets.filter((p) => p.isActive);
    }
    if (category) {
      presets = presets.filter((p) => p.category === category);
    }
    if (brand) {
      presets = presets.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    }
    if (search) {
      presets = presets.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.brand.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    // Sort by usage count (most popular first), then by name
    presets.sort((a, b) => {
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(presets);
  } catch (error) {
    console.error("Error fetching presets:", error);
    return NextResponse.json([]);
  }
}

// POST - Create a new preset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const presetId = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newPreset: PresetItem = {
      id: presetId,
      name: body.name,
      brand: body.brand || "",
      category: body.category || "other",
      subcategory: body.subcategory,
      points: body.points || [],
      widthInches: body.widthInches || 0,
      heightInches: body.heightInches || 0,
      depthInches: body.depthInches || 1.5,
      imageUrl: body.imageUrl,
      thumbnailUrl: body.thumbnailUrl,
      description: body.description,
      tags: body.tags || [],
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
      isActive: body.isActive ?? true,
    };

    if (!FIRESTORE_URL) {
      return NextResponse.json(newPreset);
    }

    const firestoreDoc = presetToFirestore(newPreset);

    const response = await fetch(`${FIRESTORE_URL}/presets?documentId=${presetId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreDoc),
    });

    if (!response.ok) {
      console.error("Firestore error:", await response.text());
      return NextResponse.json({ error: "Failed to save preset" }, { status: 500 });
    }

    return NextResponse.json(newPreset);
  } catch (error) {
    console.error("Error creating preset:", error);
    return NextResponse.json({ error: "Failed to create preset" }, { status: 500 });
  }
}

// PATCH - Update a preset
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Preset ID required" }, { status: 400 });
    }

    if (!FIRESTORE_URL) {
      return NextResponse.json({ success: true });
    }

    // Get existing preset
    const getResponse = await fetch(`${FIRESTORE_URL}/presets/${id}`);
    if (!getResponse.ok) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    const existingDoc = await getResponse.json();
    const existing = firestoreToPreset({ ...existingDoc, name: existingDoc.name });

    if (!existing) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Merge updates
    const updated: PresetItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Handle special fields
    if (updates.points && typeof updates.points === "object") {
      updated.points = updates.points;
    }
    if (updates.tags && Array.isArray(updates.tags)) {
      updated.tags = updates.tags;
    }

    const firestoreDoc = presetToFirestore(updated);

    const response = await fetch(`${FIRESTORE_URL}/presets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreDoc),
    });

    if (!response.ok) {
      console.error("Firestore error:", await response.text());
      return NextResponse.json({ error: "Failed to update preset" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating preset:", error);
    return NextResponse.json({ error: "Failed to update preset" }, { status: 500 });
  }
}

// DELETE - Remove a preset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Preset ID required" }, { status: 400 });
    }

    if (!FIRESTORE_URL) {
      return NextResponse.json({ success: true });
    }

    await fetch(`${FIRESTORE_URL}/presets/${id}`, {
      method: "DELETE",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting preset:", error);
    return NextResponse.json({ error: "Failed to delete preset" }, { status: 500 });
  }
}
