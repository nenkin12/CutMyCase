export const GEAR_ANALYSIS_PROMPT = `You are an expert at analyzing images of gear and equipment for the purpose of creating precision foam case inserts.

Analyze this image and identify all distinct items/objects that should have their own foam cutout.

For each item found, provide:
1. A descriptive name
2. Category (firearm, optic, accessory, magazine, camera, lens, drone, tool, electronics, other)
3. Approximate bounding box coordinates as percentages of image dimensions (x, y, width, height)
4. Estimated real-world dimensions if recognizable (length, width, depth in inches)
5. Whether this item typically requires snug or loose fit foam

Respond in this exact JSON format:
{
  "items": [
    {
      "id": "item_1",
      "name": "AR-15 Rifle",
      "category": "firearm",
      "boundingBox": { "x": 10, "y": 20, "width": 60, "height": 25 },
      "estimatedDimensions": { "length": 32, "width": 8, "depth": 2.5 },
      "fitPreference": "snug",
      "confidence": 0.95
    }
  ],
  "totalItems": 1,
  "suggestedLayout": "horizontal",
  "overallCategory": "firearms"
}

Be precise with bounding boxes - they will be used to trace outlines for CNC cutting.`;

export const OUTLINE_TRACING_PROMPT = `You are a precision outline tracer for CNC foam cutting.

Given this image of gear/equipment, trace the outline of each object as a series of points.

For each object:
1. Trace the outer boundary with enough points to capture the shape accurately
2. Include any significant internal cutouts (like trigger guards, handles, etc.)
3. Points should be in clockwise order
4. Coordinates are percentages of image dimensions (0-100)

Important:
- Add slight padding around sharp edges for foam fit
- Simplify very complex details that won't translate to foam cutting
- Mark areas that need deeper cuts (like grips, scopes)

Respond in this exact JSON format:
{
  "outlines": [
    {
      "id": "outline_1",
      "itemName": "AR-15 Rifle",
      "outerPath": [
        { "x": 10.5, "y": 22.3 },
        { "x": 12.1, "y": 21.8 },
        ...
      ],
      "innerPaths": [
        {
          "id": "trigger_guard",
          "points": [...]
        }
      ],
      "depth": 2.5
    }
  ]
}`;

export const CALIBRATION_PROMPT = `Analyze this image to detect a reference object for scale calibration.

Common reference objects and their sizes:
- US Quarter (24.26mm / 0.955 inches diameter)
- US Dollar bill (6.14 x 2.61 inches)
- Credit card (3.375 x 2.125 inches)
- Standard ruler (visible markings)
- AR-15 magazine (standard 30rd is approximately 7.5 inches)

Identify:
1. The reference object type
2. Its location in the image (bounding box as percentages)
3. The known dimension to use for calibration
4. Which dimension is most reliably measurable (width or height in pixels)

Respond in JSON:
{
  "referenceObject": "US Quarter",
  "boundingBox": { "x": 80, "y": 10, "width": 5, "height": 8 },
  "knownDimension": 0.955,
  "dimensionType": "diameter",
  "measureAxis": "width",
  "confidence": 0.92
}`;
