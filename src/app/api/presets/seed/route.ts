import { NextRequest, NextResponse } from "next/server";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_URL = FIREBASE_PROJECT_ID
  ? `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`
  : null;

// Generate rounded rectangle points
function roundedRect(width: number, height: number, radius: number = 0.2): number[][] {
  const points: number[][] = [];
  const steps = 8;
  const r = Math.min(radius, width / 4, height / 4);

  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI + (Math.PI / 2) * (i / steps);
    points.push([r + r * Math.cos(angle), r + r * Math.sin(angle)]);
  }
  for (let i = 0; i <= steps; i++) {
    const angle = -Math.PI / 2 + (Math.PI / 2) * (i / steps);
    points.push([width - r + r * Math.cos(angle), r + r * Math.sin(angle)]);
  }
  for (let i = 0; i <= steps; i++) {
    const angle = 0 + (Math.PI / 2) * (i / steps);
    points.push([width - r + r * Math.cos(angle), height - r + r * Math.sin(angle)]);
  }
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI / 2 + (Math.PI / 2) * (i / steps);
    points.push([r + r * Math.cos(angle), height - r + r * Math.sin(angle)]);
  }
  return points;
}

function droneShape(width: number, height: number): number[][] {
  const points: number[][] = [];
  const r = Math.min(0.3, width / 6, height / 6);
  const taper = 0.1;
  const steps = 6;

  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI + (Math.PI / 2) * (i / steps);
    points.push([r + r * Math.cos(angle) + taper, r + r * Math.sin(angle)]);
  }
  for (let i = 0; i <= steps; i++) {
    const angle = -Math.PI / 2 + (Math.PI / 2) * (i / steps);
    points.push([width - r + r * Math.cos(angle) - taper, r + r * Math.sin(angle)]);
  }
  for (let i = 0; i <= steps; i++) {
    const angle = 0 + (Math.PI / 2) * (i / steps);
    points.push([width - r + r * Math.cos(angle), height - r + r * Math.sin(angle)]);
  }
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI / 2 + (Math.PI / 2) * (i / steps);
    points.push([r + r * Math.cos(angle), height - r + r * Math.sin(angle)]);
  }
  return points;
}

const DJI_PRESETS = [
  // Drones
  { name: "DJI Mini 4 Pro", brand: "DJI", category: "drone", subcategory: "Mini Series", widthInches: 5.9, heightInches: 3.6, depthInches: 2.2, tags: ["drone", "mini", "portable", "4k"], points: droneShape(5.9, 3.6) },
  { name: "DJI Mini 3 Pro", brand: "DJI", category: "drone", subcategory: "Mini Series", widthInches: 5.5, heightInches: 3.5, depthInches: 2.2, tags: ["drone", "mini", "portable"], points: droneShape(5.5, 3.5) },
  { name: "DJI Mini 3", brand: "DJI", category: "drone", subcategory: "Mini Series", widthInches: 5.5, heightInches: 3.4, depthInches: 2.0, tags: ["drone", "mini"], points: droneShape(5.5, 3.4) },
  { name: "DJI Mavic 3 Pro", brand: "DJI", category: "drone", subcategory: "Mavic Series", widthInches: 8.4, heightInches: 3.8, depthInches: 3.5, tags: ["drone", "mavic", "professional"], points: droneShape(8.4, 3.8) },
  { name: "DJI Mavic 3 Classic", brand: "DJI", category: "drone", subcategory: "Mavic Series", widthInches: 8.3, heightInches: 3.7, depthInches: 3.4, tags: ["drone", "mavic"], points: droneShape(8.3, 3.7) },
  { name: "DJI Air 3", brand: "DJI", category: "drone", subcategory: "Air Series", widthInches: 8.0, heightInches: 4.2, depthInches: 3.4, tags: ["drone", "air", "dual-camera"], points: droneShape(8.0, 4.2) },
  { name: "DJI Air 2S", brand: "DJI", category: "drone", subcategory: "Air Series", widthInches: 7.2, heightInches: 3.8, depthInches: 3.0, tags: ["drone", "air"], points: droneShape(7.2, 3.8) },
  { name: "DJI Avata 2", brand: "DJI", category: "drone", subcategory: "FPV", widthInches: 7.4, heightInches: 6.5, depthInches: 3.2, tags: ["drone", "fpv", "cinewhoop"], points: roundedRect(7.4, 6.5, 0.5) },

  // Batteries
  { name: "DJI Mini 3/4 Battery", brand: "DJI", category: "battery", subcategory: "Mini Series", widthInches: 3.0, heightInches: 1.5, depthInches: 0.9, tags: ["battery", "mini"], points: roundedRect(3.0, 1.5, 0.15) },
  { name: "DJI Mini 3 Plus Battery", brand: "DJI", category: "battery", subcategory: "Mini Series", widthInches: 3.4, heightInches: 1.8, depthInches: 1.0, tags: ["battery", "mini", "extended"], points: roundedRect(3.4, 1.8, 0.15) },
  { name: "DJI Mavic 3 Battery", brand: "DJI", category: "battery", subcategory: "Mavic Series", widthInches: 3.5, heightInches: 2.5, depthInches: 1.6, tags: ["battery", "mavic"], points: roundedRect(3.5, 2.5, 0.2) },
  { name: "DJI Air 3 Battery", brand: "DJI", category: "battery", subcategory: "Air Series", widthInches: 3.5, heightInches: 2.0, depthInches: 1.3, tags: ["battery", "air"], points: roundedRect(3.5, 2.0, 0.15) },
  { name: "DJI Avata 2 Battery", brand: "DJI", category: "battery", subcategory: "FPV", widthInches: 3.8, heightInches: 2.2, depthInches: 1.5, tags: ["battery", "avata", "fpv"], points: roundedRect(3.8, 2.2, 0.2) },

  // Controllers
  { name: "DJI RC (with screen)", brand: "DJI", category: "controller", subcategory: "Remote Controllers", widthInches: 7.5, heightInches: 4.0, depthInches: 1.8, tags: ["controller", "remote", "screen"], points: roundedRect(7.5, 4.0, 0.3) },
  { name: "DJI RC 2", brand: "DJI", category: "controller", subcategory: "Remote Controllers", widthInches: 7.6, heightInches: 4.2, depthInches: 1.9, tags: ["controller", "remote", "screen"], points: roundedRect(7.6, 4.2, 0.3) },
  { name: "DJI RC-N1", brand: "DJI", category: "controller", subcategory: "Remote Controllers", widthInches: 6.0, heightInches: 3.5, depthInches: 1.5, tags: ["controller", "remote", "phone"], points: roundedRect(6.0, 3.5, 0.25) },
  { name: "DJI RC-N2", brand: "DJI", category: "controller", subcategory: "Remote Controllers", widthInches: 6.2, heightInches: 3.6, depthInches: 1.6, tags: ["controller", "remote", "phone"], points: roundedRect(6.2, 3.6, 0.25) },

  // Accessories
  { name: "DJI ND Filter Set", brand: "DJI", category: "filter", subcategory: "Filters", widthInches: 2.5, heightInches: 2.5, depthInches: 0.8, tags: ["filter", "nd"], points: roundedRect(2.5, 2.5, 0.2) },
  { name: "DJI Mini Propellers", brand: "DJI", category: "propeller", subcategory: "Propellers", widthInches: 5.0, heightInches: 1.2, depthInches: 0.3, tags: ["propeller", "mini"], points: roundedRect(5.0, 1.2, 0.1) },
  { name: "DJI Charging Hub", brand: "DJI", category: "charger", subcategory: "Chargers", widthInches: 4.5, heightInches: 3.0, depthInches: 1.5, tags: ["charger", "hub"], points: roundedRect(4.5, 3.0, 0.2) },
  { name: "DJI Goggles 2", brand: "DJI", category: "accessory", subcategory: "FPV", widthInches: 7.8, heightInches: 4.8, depthInches: 3.5, tags: ["goggles", "fpv"], points: roundedRect(7.8, 4.8, 0.4) },
  { name: "DJI Motion Controller", brand: "DJI", category: "controller", subcategory: "FPV", widthInches: 5.5, heightInches: 3.2, depthInches: 2.8, tags: ["controller", "motion", "fpv"], points: roundedRect(5.5, 3.2, 0.3) },
];

function presetToFirestore(preset: any, id: string) {
  const now = new Date().toISOString();
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
      imageUrl: { stringValue: "" },
      thumbnailUrl: { stringValue: "" },
      description: { stringValue: preset.description || "" },
      tags: { stringValue: JSON.stringify(preset.tags || []) },
      usageCount: { integerValue: "0" },
      createdAt: { stringValue: now },
      updatedAt: { stringValue: now },
      isActive: { booleanValue: true },
    },
  };
}

// POST - Seed DJI presets (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!FIRESTORE_URL) {
      return NextResponse.json({ error: "Firestore not configured" }, { status: 500 });
    }

    const results: { name: string; success: boolean; error?: string }[] = [];

    for (const preset of DJI_PRESETS) {
      const presetId = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      try {
        const firestoreDoc = presetToFirestore(preset, presetId);

        const response = await fetch(`${FIRESTORE_URL}/presets?documentId=${presetId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(firestoreDoc),
        });

        if (response.ok) {
          results.push({ name: preset.name, success: true });
        } else {
          const errorText = await response.text();
          results.push({ name: preset.name, success: false, error: errorText });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        results.push({ name: preset.name, success: false, error: String(err) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Added ${successCount} presets, ${failCount} failed`,
      results,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed presets" }, { status: 500 });
  }
}

// GET - Check current preset count
export async function GET() {
  try {
    if (!FIRESTORE_URL) {
      return NextResponse.json({ count: 0, configured: false });
    }

    const response = await fetch(`${FIRESTORE_URL}/presets?pageSize=1`);
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        count: data.documents?.length || 0,
        configured: true,
        presetNames: DJI_PRESETS.map(p => p.name),
      });
    }

    return NextResponse.json({ count: 0, configured: true, error: "Failed to fetch" });
  } catch (error) {
    return NextResponse.json({ count: 0, configured: false, error: String(error) });
  }
}
