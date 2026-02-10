import * as makerjs from "makerjs";
import type { ItemOutline } from "../ai/process-image";
import {
  generateCombinedModel,
  modelToDxf,
  modelToSvg,
  getModelBounds,
  centerModel,
  type GenerateOutlineOptions,
} from "./generate-outline";
import { uploadBuffer } from "../s3";

export interface ExportResult {
  dxfUrl: string;
  dxfKey: string;
  svgUrl: string;
  svgKey: string;
  bounds: {
    width: number;
    height: number;
  };
}

export async function exportOutlinesToFiles(
  outlines: ItemOutline[],
  uploadId: string,
  options: Partial<GenerateOutlineOptions> = {}
): Promise<ExportResult> {
  // Generate the combined model
  const model = generateCombinedModel(outlines, options);
  const centeredModel = centerModel(model);

  // Get bounds
  const bounds = getModelBounds(centeredModel);

  // Generate file contents
  const dxfContent = modelToDxf(centeredModel);
  const svgContent = modelToSvg(centeredModel);

  // Upload to S3
  const timestamp = Date.now();
  const dxfKey = `cuts/${uploadId}/${timestamp}-outline.dxf`;
  const svgKey = `cuts/${uploadId}/${timestamp}-outline.svg`;

  const [dxfUrl, svgUrl] = await Promise.all([
    uploadBuffer(dxfKey, Buffer.from(dxfContent, "utf-8"), "application/dxf"),
    uploadBuffer(svgKey, Buffer.from(svgContent, "utf-8"), "image/svg+xml"),
  ]);

  return {
    dxfUrl,
    dxfKey,
    svgUrl,
    svgKey,
    bounds: {
      width: bounds.width,
      height: bounds.height,
    },
  };
}

export function generatePreviewSvg(
  outlines: ItemOutline[],
  options: Partial<GenerateOutlineOptions> = {},
  caseWidth?: number,
  caseHeight?: number
): string {
  const model = generateCombinedModel(outlines, options);
  const centeredModel = centerModel(model);
  const bounds = getModelBounds(centeredModel);

  // Calculate viewBox with padding
  const padding = 0.5;
  const viewBoxX = bounds.minX - padding;
  const viewBoxY = bounds.minY - padding;
  const viewBoxWidth = bounds.width + padding * 2;
  const viewBoxHeight = bounds.height + padding * 2;

  // Generate SVG with custom styling
  let svg = makerjs.exporter.toSVG(centeredModel, {
    units: makerjs.unitType.Inch,
    viewBox: false,
  });

  // Wrap with proper viewBox and styling
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="${viewBoxX} ${-viewBoxY - viewBoxHeight} ${viewBoxWidth} ${viewBoxHeight}"
    style="background: #1a1a1a;">
    <style>
      path { stroke: #FF4D00; stroke-width: 0.02; fill: rgba(255, 77, 0, 0.1); }
    </style>
    ${caseWidth && caseHeight ? `
      <rect
        x="${-caseWidth / 2}"
        y="${-caseHeight / 2}"
        width="${caseWidth}"
        height="${caseHeight}"
        fill="none"
        stroke="#333"
        stroke-width="0.02"
        stroke-dasharray="0.1 0.1"
      />
    ` : ""}
    <g transform="scale(1, -1)">
      ${svg}
    </g>
  </svg>`;

  return fullSvg;
}

export function validateOutlinesForCase(
  outlines: ItemOutline[],
  caseWidth: number,
  caseHeight: number,
  tolerance: number = 0.1
): {
  fits: boolean;
  itemsFit: { id: string; fits: boolean; overflow: { x: number; y: number } }[];
  totalBounds: { width: number; height: number };
} {
  const model = generateCombinedModel(outlines, { tolerance });
  const bounds = getModelBounds(model);

  const fits = bounds.width <= caseWidth && bounds.height <= caseHeight;

  const itemsFit = outlines.map((outline) => {
    const itemModel = generateCombinedModel([outline], { tolerance });
    const itemBounds = getModelBounds(itemModel);

    return {
      id: outline.id,
      fits: itemBounds.width <= caseWidth && itemBounds.height <= caseHeight,
      overflow: {
        x: Math.max(0, itemBounds.width - caseWidth),
        y: Math.max(0, itemBounds.height - caseHeight),
      },
    };
  });

  return {
    fits,
    itemsFit,
    totalBounds: {
      width: bounds.width,
      height: bounds.height,
    },
  };
}
