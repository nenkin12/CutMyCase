import { NextRequest, NextResponse } from "next/server";

interface Point {
  x: number;
  y: number;
}

// Shape refinement based on category and prompt
// This applies intelligent smoothing and shape correction

// Douglas-Peucker simplification algorithm
function simplifyPath(points: number[][], epsilon: number): number[][] {
  if (points.length < 3) return points;

  let maxDist = 0;
  let maxIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), epsilon);
    const right = simplifyPath(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  const lineLengthSq = dx * dx + dy * dy;

  if (lineLengthSq === 0) {
    return Math.sqrt(Math.pow(point[0] - lineStart[0], 2) + Math.pow(point[1] - lineStart[1], 2));
  }

  const t = Math.max(0, Math.min(1, ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / lineLengthSq));
  const projX = lineStart[0] + t * dx;
  const projY = lineStart[1] + t * dy;

  return Math.sqrt(Math.pow(point[0] - projX, 2) + Math.pow(point[1] - projY, 2));
}

// Chaikin's corner cutting algorithm for smoothing
function smoothChaikin(points: number[][], iterations: number): number[][] {
  if (iterations <= 0 || points.length < 3) return points;

  let result = [...points];

  for (let iter = 0; iter < iterations; iter++) {
    const newPoints: number[][] = [];

    for (let i = 0; i < result.length; i++) {
      const p0 = result[i];
      const p1 = result[(i + 1) % result.length];

      newPoints.push([
        0.75 * p0[0] + 0.25 * p1[0],
        0.75 * p0[1] + 0.25 * p1[1]
      ]);
      newPoints.push([
        0.25 * p0[0] + 0.75 * p1[0],
        0.25 * p0[1] + 0.75 * p1[1]
      ]);
    }

    result = newPoints;
  }

  return result;
}

// Convert irregular shape to rectangle (for magazines, etc.)
function rectangularize(points: number[][], roundCorners: number = 0): number[][] {
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX;
  const height = maxY - minY;

  if (roundCorners > 0) {
    const r = Math.min(roundCorners, width / 4, height / 4);
    const result: number[][] = [];
    const steps = 8;

    // Top-left corner
    for (let i = 0; i <= steps; i++) {
      const angle = Math.PI + (Math.PI / 2) * (i / steps);
      result.push([minX + r + r * Math.cos(angle), minY + r + r * Math.sin(angle)]);
    }
    // Top-right corner
    for (let i = 0; i <= steps; i++) {
      const angle = -Math.PI / 2 + (Math.PI / 2) * (i / steps);
      result.push([maxX - r + r * Math.cos(angle), minY + r + r * Math.sin(angle)]);
    }
    // Bottom-right corner
    for (let i = 0; i <= steps; i++) {
      const angle = 0 + (Math.PI / 2) * (i / steps);
      result.push([maxX - r + r * Math.cos(angle), maxY - r + r * Math.sin(angle)]);
    }
    // Bottom-left corner
    for (let i = 0; i <= steps; i++) {
      const angle = Math.PI / 2 + (Math.PI / 2) * (i / steps);
      result.push([minX + r + r * Math.cos(angle), maxY - r + r * Math.sin(angle)]);
    }

    return result;
  }

  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
}

// Convert to ellipse/oval shape (for ear protection, etc.)
function ellipticize(points: number[][]): number[][] {
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const radiusX = (maxX - minX) / 2;
  const radiusY = (maxY - minY) / 2;

  const result: number[][] = [];
  const steps = 32;

  for (let i = 0; i < steps; i++) {
    const angle = (2 * Math.PI * i) / steps;
    result.push([
      centerX + radiusX * Math.cos(angle),
      centerY + radiusY * Math.sin(angle)
    ]);
  }

  return result;
}

// Convex hull for cleaner outlines
function convexHull(points: number[][]): number[][] {
  if (points.length < 3) return points;

  // Find the leftmost point
  let start = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] < points[start][0]) {
      start = i;
    }
  }

  const hull: number[][] = [];
  let current = start;

  do {
    hull.push(points[current]);
    let next = 0;

    for (let i = 1; i < points.length; i++) {
      if (next === current) {
        next = i;
        continue;
      }

      const cross =
        (points[i][0] - points[current][0]) * (points[next][1] - points[current][1]) -
        (points[i][1] - points[current][1]) * (points[next][0] - points[current][0]);

      if (cross < 0) {
        next = i;
      }
    }

    current = next;
  } while (current !== start && hull.length < points.length);

  return hull;
}

// Category-specific shape refinement
function refineByCategory(points: number[][], category: string, prompt: string): number[][] {
  const promptLower = prompt.toLowerCase();

  switch (category) {
    case "magazine":
      // Magazines are rectangular with slightly rounded corners
      return rectangularize(points, 5);

    case "suppressor":
      // Suppressors are cylindrical/pill shaped
      const xs = points.map(p => p[0]);
      const ys = points.map(p => p[1]);
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);
      // If taller than wide, it's vertical
      if (height > width * 2) {
        return rectangularize(points, Math.min(width / 2, 20));
      }
      return rectangularize(points, Math.min(height / 2, 20));

    case "ear_protection":
    case "eye_protection":
      // Ear/eye protection tend to be oval/rounded
      return ellipticize(points);

    case "optic":
      // Optics are usually rectangular with rounded corners
      return rectangularize(points, 8);

    case "flashlight":
      // Flashlights are cylindrical
      return rectangularize(points, 10);

    case "knife":
      // Knives should use convex hull then smooth
      const hull = convexHull(points);
      return smoothChaikin(hull, 1);

    case "firearm":
      // Firearms need careful treatment - simplify but preserve shape
      let refined = simplifyPath(points, 3);
      refined = smoothChaikin(refined, 1);
      return refined;

    case "tool":
    case "accessory":
    case "medical":
    case "electronics":
    default:
      // Default: simplify and smooth
      if (promptLower.includes("rectangle") || promptLower.includes("box") || promptLower.includes("square")) {
        return rectangularize(points, promptLower.includes("round") ? 5 : 0);
      }
      if (promptLower.includes("oval") || promptLower.includes("round") || promptLower.includes("circle")) {
        return ellipticize(points);
      }
      if (promptLower.includes("smooth")) {
        return smoothChaikin(simplifyPath(points, 2), 2);
      }
      if (promptLower.includes("simplify") || promptLower.includes("clean")) {
        return simplifyPath(points, 5);
      }
      // Default smoothing
      return smoothChaikin(simplifyPath(points, 2), 1);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { points, category, prompt, refinementType } = body;

    if (!points || !Array.isArray(points) || points.length < 3) {
      return NextResponse.json({ error: "Invalid points array" }, { status: 400 });
    }

    let refinedPoints: number[][];

    switch (refinementType) {
      case "smooth":
        refinedPoints = smoothChaikin(simplifyPath(points, 2), 2);
        break;

      case "simplify":
        refinedPoints = simplifyPath(points, 5);
        break;

      case "rectangle":
        refinedPoints = rectangularize(points, 0);
        break;

      case "rounded_rectangle":
        refinedPoints = rectangularize(points, 8);
        break;

      case "oval":
        refinedPoints = ellipticize(points);
        break;

      case "convex_hull":
        refinedPoints = convexHull(points);
        break;

      case "category":
      default:
        // Use category and prompt for intelligent refinement
        refinedPoints = refineByCategory(points, category || "other", prompt || "");
        break;
    }

    return NextResponse.json({
      originalPoints: points,
      refinedPoints,
      pointsReduced: points.length - refinedPoints.length,
    });
  } catch (error) {
    console.error("Shape refinement error:", error);
    return NextResponse.json({ error: "Failed to refine shape" }, { status: 500 });
  }
}
