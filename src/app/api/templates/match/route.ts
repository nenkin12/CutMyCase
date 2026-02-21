import { NextRequest, NextResponse } from "next/server";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

interface Template {
  id: string;
  name: string;
  category: string;
  points: number[][];
  width: number;
  height: number;
  aspectRatio: number;
  pointCount: number;
  trainingNotes: string;
  usageCount: number;
}

interface MatchResult {
  template: Template;
  confidence: number;
  matchType: string;
}

// Calculate aspect ratio from points
function calculateAspectRatio(points: number[][]): number {
  if (!points || points.length < 3) return 1;
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return height > 0 ? width / height : 1;
}

// Calculate shape complexity (perimeter / sqrt(area))
function calculateComplexity(points: number[][]): number {
  if (!points || points.length < 3) return 0;

  // Calculate perimeter
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    perimeter += Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
  }

  // Calculate area using shoelace formula
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += p1[0] * p2[1] - p2[0] * p1[1];
  }
  area = Math.abs(area) / 2;

  return area > 0 ? perimeter / Math.sqrt(area) : 0;
}

// Calculate bounding box fill ratio (how much of the bounding box the shape fills)
function calculateFillRatio(points: number[][]): number {
  if (!points || points.length < 3) return 0;

  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const bboxArea = width * height;

  // Calculate actual area
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += p1[0] * p2[1] - p2[0] * p1[1];
  }
  area = Math.abs(area) / 2;

  return bboxArea > 0 ? area / bboxArea : 0;
}

// Match a shape against templates
function matchShape(
  inputPoints: number[][],
  templates: Template[]
): MatchResult[] {
  const inputAspectRatio = calculateAspectRatio(inputPoints);
  const inputComplexity = calculateComplexity(inputPoints);
  const inputFillRatio = calculateFillRatio(inputPoints);

  const results: MatchResult[] = [];

  for (const template of templates) {
    let confidence = 0;
    const matchReasons: string[] = [];

    // Aspect ratio matching (most important for shape recognition)
    const aspectDiff = Math.abs(inputAspectRatio - template.aspectRatio);
    const aspectScore = Math.max(0, 1 - aspectDiff / 2); // Score decreases as difference increases
    if (aspectScore > 0.7) {
      confidence += aspectScore * 40; // Up to 40 points
      matchReasons.push("aspect_ratio");
    }

    // Complexity matching
    const templateComplexity = calculateComplexity(template.points);
    const complexityDiff = Math.abs(inputComplexity - templateComplexity);
    const complexityScore = Math.max(0, 1 - complexityDiff / 10);
    if (complexityScore > 0.5) {
      confidence += complexityScore * 30; // Up to 30 points
      matchReasons.push("complexity");
    }

    // Fill ratio matching
    const templateFillRatio = calculateFillRatio(template.points);
    const fillDiff = Math.abs(inputFillRatio - templateFillRatio);
    const fillScore = Math.max(0, 1 - fillDiff / 0.5);
    if (fillScore > 0.5) {
      confidence += fillScore * 20; // Up to 20 points
      matchReasons.push("fill_ratio");
    }

    // Point count similarity (rough indicator)
    const pointRatio = Math.min(inputPoints.length, template.pointCount) /
                       Math.max(inputPoints.length, template.pointCount);
    if (pointRatio > 0.5) {
      confidence += pointRatio * 10; // Up to 10 points
      matchReasons.push("point_count");
    }

    // Only include if confidence is meaningful
    if (confidence > 30) {
      results.push({
        template,
        confidence: Math.round(confidence),
        matchType: matchReasons.join(", "),
      });
    }
  }

  // Sort by confidence
  results.sort((a, b) => b.confidence - a.confidence);

  // Return top 3 matches
  return results.slice(0, 3);
}

// Increment usage count for a template
async function incrementUsageCount(templateId: string) {
  if (!FIREBASE_PROJECT_ID) return;

  try {
    // Get current template
    const getRes = await fetch(`${FIRESTORE_URL}/templates/${templateId}`);
    if (!getRes.ok) return;

    const doc = await getRes.json();
    const currentCount = parseInt(doc.fields?.usageCount?.integerValue || "0");

    // Update count
    await fetch(`${FIRESTORE_URL}/templates/${templateId}?updateMask.fieldPaths=usageCount`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          usageCount: { integerValue: String(currentCount + 1) }
        }
      }),
    });
  } catch (error) {
    console.error("Failed to increment usage count:", error);
  }
}

// POST - Match shapes against templates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, incrementUsage } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Items array required" }, { status: 400 });
    }

    // Fetch all templates
    let templates: Template[] = [];

    if (FIREBASE_PROJECT_ID) {
      const response = await fetch(`${FIRESTORE_URL}/templates`, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        templates = (data.documents || []).map((doc: any) => {
          const fields = doc.fields || {};
          const docId = doc.name.split("/").pop();
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
            usageCount: parseInt(fields.usageCount?.integerValue || "0"),
          };
        });
      }
    }

    // Match each item
    const results = items.map((item: { id: string; points: number[][] }) => {
      const matches = matchShape(item.points, templates);

      // If incrementUsage is true and we have a high-confidence match, increment the counter
      if (incrementUsage && matches.length > 0 && matches[0].confidence > 70) {
        incrementUsageCount(matches[0].template.id);
      }

      return {
        itemId: item.id,
        matches,
        bestMatch: matches.length > 0 ? matches[0] : null,
      };
    });

    return NextResponse.json({
      results,
      templatesChecked: templates.length,
    });
  } catch (error) {
    console.error("Template matching error:", error);
    return NextResponse.json({ error: "Failed to match templates" }, { status: 500 });
  }
}
