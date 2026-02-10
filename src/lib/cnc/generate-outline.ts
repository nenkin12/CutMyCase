import * as makerjs from "makerjs";
import type { OutlinePoint, ItemOutline } from "../ai/process-image";

export interface GenerateOutlineOptions {
  tolerance: number; // Added padding in inches
  cornerRadius: number; // Radius for rounding corners
  simplifyThreshold: number; // Distance threshold for point simplification
}

const DEFAULT_OPTIONS: GenerateOutlineOptions = {
  tolerance: 0.1, // 0.1 inch default tolerance
  cornerRadius: 0.05, // Small corner radius
  simplifyThreshold: 0.02, // Simplify points within 0.02 inches
};

function simplifyPath(
  points: OutlinePoint[],
  threshold: number
): OutlinePoint[] {
  if (points.length <= 2) return points;

  const simplified: OutlinePoint[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const current = points[i];
    const distance = Math.sqrt(
      Math.pow(current.x - prev.x, 2) + Math.pow(current.y - prev.y, 2)
    );

    if (distance >= threshold) {
      simplified.push(current);
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
}

function offsetPath(points: OutlinePoint[], offset: number): OutlinePoint[] {
  // Simple offset - expand outward by offset amount
  const centroid = points.reduce(
    (acc, p) => ({ x: acc.x + p.x / points.length, y: acc.y + p.y / points.length }),
    { x: 0, y: 0 }
  );

  return points.map((point) => {
    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return point;

    const scale = (distance + offset) / distance;
    return {
      x: centroid.x + dx * scale,
      y: centroid.y + dy * scale,
    };
  });
}

function createMakerPath(points: OutlinePoint[]): makerjs.IModel {
  if (points.length < 3) {
    throw new Error("Need at least 3 points to create a path");
  }

  const pathPoints: [number, number][] = points.map((p) => [p.x, p.y]);

  // Close the path by connecting back to start
  const chain = new makerjs.models.ConnectTheDots(true, pathPoints);

  return chain;
}

export function generateOutlineModel(
  outline: ItemOutline,
  options: Partial<GenerateOutlineOptions> = {}
): makerjs.IModel {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Simplify and offset outer path
  const simplifiedOuter = simplifyPath(outline.outerPath, opts.simplifyThreshold);
  const offsetOuter = offsetPath(simplifiedOuter, opts.tolerance);

  const model: makerjs.IModel = {
    models: {
      outer: createMakerPath(offsetOuter),
    },
  };

  // Add inner paths (cutouts like trigger guards)
  outline.innerPaths.forEach((innerPath, index) => {
    const simplifiedInner = simplifyPath(innerPath.points, opts.simplifyThreshold);
    // Inner paths get negative offset (shrink)
    const offsetInner = offsetPath(simplifiedInner, -opts.tolerance / 2);
    model.models![`inner_${index}_${innerPath.id}`] = createMakerPath(offsetInner);
  });

  return model;
}

export function generateCombinedModel(
  outlines: ItemOutline[],
  options: Partial<GenerateOutlineOptions> = {}
): makerjs.IModel {
  const combinedModel: makerjs.IModel = {
    models: {},
  };

  outlines.forEach((outline, index) => {
    combinedModel.models![`item_${index}_${outline.id}`] = generateOutlineModel(
      outline,
      options
    );
  });

  return combinedModel;
}

export function modelToSvg(model: makerjs.IModel): string {
  const svg = makerjs.exporter.toSVG(model, {
    units: makerjs.unitType.Inch,
    stroke: "#FF4D00",
    strokeWidth: "0.01in",
    fill: "none",
  });

  return svg;
}

export function modelToDxf(model: makerjs.IModel): string {
  const dxf = makerjs.exporter.toDXF(model, {
    units: makerjs.unitType.Inch,
  });

  return dxf;
}

export function getModelBounds(model: makerjs.IModel): {
  width: number;
  height: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const measure = makerjs.measure.modelExtents(model);

  if (!measure) {
    return { width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  return {
    width: measure.high[0] - measure.low[0],
    height: measure.high[1] - measure.low[1],
    minX: measure.low[0],
    minY: measure.low[1],
    maxX: measure.high[0],
    maxY: measure.high[1],
  };
}

export function centerModel(model: makerjs.IModel): makerjs.IModel {
  const bounds = getModelBounds(model);
  const centerX = bounds.minX + bounds.width / 2;
  const centerY = bounds.minY + bounds.height / 2;

  return makerjs.model.move(model, [-centerX, -centerY]);
}

export function fitModelToCase(
  model: makerjs.IModel,
  caseWidth: number,
  caseHeight: number,
  padding: number = 0.5
): { model: makerjs.IModel; fits: boolean; scale: number } {
  const bounds = getModelBounds(model);
  const availableWidth = caseWidth - padding * 2;
  const availableHeight = caseHeight - padding * 2;

  const scaleX = availableWidth / bounds.width;
  const scaleY = availableHeight / bounds.height;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

  const fits = scale >= 1;

  if (scale < 1) {
    const scaledModel = makerjs.model.scale(model, scale);
    return { model: centerModel(scaledModel), fits, scale };
  }

  return { model: centerModel(model), fits, scale: 1 };
}
