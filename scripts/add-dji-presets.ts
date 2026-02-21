// Script to add DJI drone and battery presets
// Run with: npx ts-node scripts/add-dji-presets.ts

const API_URL = process.env.API_URL || "http://localhost:3000";

// Generate rounded rectangle points
function roundedRect(width: number, height: number, radius: number = 0.2): number[][] {
  const points: number[][] = [];
  const steps = 8; // points per corner
  const r = Math.min(radius, width / 4, height / 4);

  // Top-left corner
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI + (Math.PI / 2) * (i / steps);
    points.push([r + r * Math.cos(angle), r + r * Math.sin(angle)]);
  }
  // Top-right corner
  for (let i = 0; i <= steps; i++) {
    const angle = -Math.PI / 2 + (Math.PI / 2) * (i / steps);
    points.push([width - r + r * Math.cos(angle), r + r * Math.sin(angle)]);
  }
  // Bottom-right corner
  for (let i = 0; i <= steps; i++) {
    const angle = 0 + (Math.PI / 2) * (i / steps);
    points.push([width - r + r * Math.cos(angle), height - r + r * Math.sin(angle)]);
  }
  // Bottom-left corner
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI / 2 + (Math.PI / 2) * (i / steps);
    points.push([r + r * Math.cos(angle), height - r + r * Math.sin(angle)]);
  }

  return points;
}

// Generate drone-like shape (rounded rectangle with slight taper)
function droneShape(width: number, height: number): number[][] {
  // More complex shape for drones - tapered front
  const points: number[][] = [];
  const r = Math.min(0.3, width / 6, height / 6);
  const taper = 0.1; // Front taper amount
  const steps = 6;

  // Front (tapered) - left side
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI + (Math.PI / 2) * (i / steps);
    points.push([r + r * Math.cos(angle) + taper, r + r * Math.sin(angle)]);
  }
  // Front - right side
  for (let i = 0; i <= steps; i++) {
    const angle = -Math.PI / 2 + (Math.PI / 2) * (i / steps);
    points.push([width - r + r * Math.cos(angle) - taper, r + r * Math.sin(angle)]);
  }
  // Back (wider) - right side
  for (let i = 0; i <= steps; i++) {
    const angle = 0 + (Math.PI / 2) * (i / steps);
    points.push([width - r + r * Math.cos(angle), height - r + r * Math.sin(angle)]);
  }
  // Back - left side
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI / 2 + (Math.PI / 2) * (i / steps);
    points.push([r + r * Math.cos(angle), height - r + r * Math.sin(angle)]);
  }

  return points;
}

const presets = [
  // ============ DRONES ============
  {
    name: "DJI Mini 4 Pro",
    brand: "DJI",
    category: "drone",
    subcategory: "Mini Series",
    widthInches: 5.9,
    heightInches: 3.6,
    depthInches: 2.2,
    description: "DJI Mini 4 Pro drone (folded)",
    tags: ["drone", "mini", "portable", "4k", "sub250g"],
    points: droneShape(5.9, 3.6),
  },
  {
    name: "DJI Mini 3 Pro",
    brand: "DJI",
    category: "drone",
    subcategory: "Mini Series",
    widthInches: 5.5,
    heightInches: 3.5,
    depthInches: 2.2,
    description: "DJI Mini 3 Pro drone (folded)",
    tags: ["drone", "mini", "portable", "4k", "sub250g"],
    points: droneShape(5.5, 3.5),
  },
  {
    name: "DJI Mini 3",
    brand: "DJI",
    category: "drone",
    subcategory: "Mini Series",
    widthInches: 5.5,
    heightInches: 3.4,
    depthInches: 2.0,
    description: "DJI Mini 3 drone (folded)",
    tags: ["drone", "mini", "portable", "4k", "sub250g"],
    points: droneShape(5.5, 3.4),
  },
  {
    name: "DJI Mavic 3 Pro",
    brand: "DJI",
    category: "drone",
    subcategory: "Mavic Series",
    widthInches: 8.4,
    heightInches: 3.8,
    depthInches: 3.5,
    description: "DJI Mavic 3 Pro drone (folded)",
    tags: ["drone", "mavic", "professional", "5.1k", "hasselblad"],
    points: droneShape(8.4, 3.8),
  },
  {
    name: "DJI Mavic 3 Classic",
    brand: "DJI",
    category: "drone",
    subcategory: "Mavic Series",
    widthInches: 8.3,
    heightInches: 3.7,
    depthInches: 3.4,
    description: "DJI Mavic 3 Classic drone (folded)",
    tags: ["drone", "mavic", "hasselblad"],
    points: droneShape(8.3, 3.7),
  },
  {
    name: "DJI Air 3",
    brand: "DJI",
    category: "drone",
    subcategory: "Air Series",
    widthInches: 8.0,
    heightInches: 4.2,
    depthInches: 3.4,
    description: "DJI Air 3 drone (folded)",
    tags: ["drone", "air", "dual-camera", "4k"],
    points: droneShape(8.0, 4.2),
  },
  {
    name: "DJI Air 2S",
    brand: "DJI",
    category: "drone",
    subcategory: "Air Series",
    widthInches: 7.2,
    heightInches: 3.8,
    depthInches: 3.0,
    description: "DJI Air 2S drone (folded)",
    tags: ["drone", "air", "1-inch sensor", "5.4k"],
    points: droneShape(7.2, 3.8),
  },
  {
    name: "DJI Avata 2",
    brand: "DJI",
    category: "drone",
    subcategory: "FPV",
    widthInches: 7.4,
    heightInches: 6.5,
    depthInches: 3.2,
    description: "DJI Avata 2 FPV drone",
    tags: ["drone", "fpv", "cinewhoop", "4k"],
    points: roundedRect(7.4, 6.5, 0.5),
  },

  // ============ BATTERIES ============
  {
    name: "DJI Mini 3/4 Battery",
    brand: "DJI",
    category: "battery",
    subcategory: "Mini Series",
    widthInches: 3.0,
    heightInches: 1.5,
    depthInches: 0.9,
    description: "Intelligent Flight Battery for DJI Mini 3/4 series",
    tags: ["battery", "mini", "intelligent flight battery"],
    points: roundedRect(3.0, 1.5, 0.15),
  },
  {
    name: "DJI Mini 3 Plus Battery",
    brand: "DJI",
    category: "battery",
    subcategory: "Mini Series",
    widthInches: 3.4,
    heightInches: 1.8,
    depthInches: 1.0,
    description: "Intelligent Flight Battery Plus for DJI Mini 3/4 (extended)",
    tags: ["battery", "mini", "extended", "plus"],
    points: roundedRect(3.4, 1.8, 0.15),
  },
  {
    name: "DJI Mavic 3 Battery",
    brand: "DJI",
    category: "battery",
    subcategory: "Mavic Series",
    widthInches: 3.5,
    heightInches: 2.5,
    depthInches: 1.6,
    description: "Intelligent Flight Battery for DJI Mavic 3 series",
    tags: ["battery", "mavic", "intelligent flight battery"],
    points: roundedRect(3.5, 2.5, 0.2),
  },
  {
    name: "DJI Air 3 Battery",
    brand: "DJI",
    category: "battery",
    subcategory: "Air Series",
    widthInches: 3.5,
    heightInches: 2.0,
    depthInches: 1.3,
    description: "Intelligent Flight Battery for DJI Air 3",
    tags: ["battery", "air", "intelligent flight battery"],
    points: roundedRect(3.5, 2.0, 0.15),
  },
  {
    name: "DJI Avata 2 Battery",
    brand: "DJI",
    category: "battery",
    subcategory: "FPV",
    widthInches: 3.8,
    heightInches: 2.2,
    depthInches: 1.5,
    description: "Intelligent Flight Battery for DJI Avata 2",
    tags: ["battery", "avata", "fpv"],
    points: roundedRect(3.8, 2.2, 0.2),
  },

  // ============ CONTROLLERS ============
  {
    name: "DJI RC (with screen)",
    brand: "DJI",
    category: "controller",
    subcategory: "Remote Controllers",
    widthInches: 7.5,
    heightInches: 4.0,
    depthInches: 1.8,
    description: "DJI RC with built-in 5.5\" screen",
    tags: ["controller", "remote", "screen", "rc"],
    points: roundedRect(7.5, 4.0, 0.3),
  },
  {
    name: "DJI RC 2",
    brand: "DJI",
    category: "controller",
    subcategory: "Remote Controllers",
    widthInches: 7.6,
    heightInches: 4.2,
    depthInches: 1.9,
    description: "DJI RC 2 with built-in screen",
    tags: ["controller", "remote", "screen", "rc2"],
    points: roundedRect(7.6, 4.2, 0.3),
  },
  {
    name: "DJI RC-N1",
    brand: "DJI",
    category: "controller",
    subcategory: "Remote Controllers",
    widthInches: 6.0,
    heightInches: 3.5,
    depthInches: 1.5,
    description: "DJI RC-N1 controller (phone holder)",
    tags: ["controller", "remote", "phone", "rc-n1"],
    points: roundedRect(6.0, 3.5, 0.25),
  },
  {
    name: "DJI RC-N2",
    brand: "DJI",
    category: "controller",
    subcategory: "Remote Controllers",
    widthInches: 6.2,
    heightInches: 3.6,
    depthInches: 1.6,
    description: "DJI RC-N2 controller (phone holder)",
    tags: ["controller", "remote", "phone", "rc-n2"],
    points: roundedRect(6.2, 3.6, 0.25),
  },

  // ============ ACCESSORIES ============
  {
    name: "DJI ND Filter Set (4-pack)",
    brand: "DJI",
    category: "filter",
    subcategory: "Filters",
    widthInches: 2.5,
    heightInches: 2.5,
    depthInches: 0.8,
    description: "ND filter set case",
    tags: ["filter", "nd", "accessory"],
    points: roundedRect(2.5, 2.5, 0.2),
  },
  {
    name: "DJI Mini Propellers (pair)",
    brand: "DJI",
    category: "propeller",
    subcategory: "Propellers",
    widthInches: 5.0,
    heightInches: 1.2,
    depthInches: 0.3,
    description: "Replacement propellers for Mini series",
    tags: ["propeller", "mini", "spare"],
    points: roundedRect(5.0, 1.2, 0.1),
  },
  {
    name: "DJI Charging Hub (3-battery)",
    brand: "DJI",
    category: "charger",
    subcategory: "Chargers",
    widthInches: 4.5,
    heightInches: 3.0,
    depthInches: 1.5,
    description: "3-battery charging hub",
    tags: ["charger", "hub", "battery"],
    points: roundedRect(4.5, 3.0, 0.2),
  },
  {
    name: "DJI Goggles 2",
    brand: "DJI",
    category: "accessory",
    subcategory: "FPV",
    widthInches: 7.8,
    heightInches: 4.8,
    depthInches: 3.5,
    description: "DJI Goggles 2 FPV headset",
    tags: ["goggles", "fpv", "headset"],
    points: roundedRect(7.8, 4.8, 0.4),
  },
  {
    name: "DJI Motion Controller",
    brand: "DJI",
    category: "controller",
    subcategory: "FPV",
    widthInches: 5.5,
    heightInches: 3.2,
    depthInches: 2.8,
    description: "Motion controller for Avata",
    tags: ["controller", "motion", "fpv", "avata"],
    points: roundedRect(5.5, 3.2, 0.3),
  },
];

async function addPresets() {
  console.log(`Adding ${presets.length} DJI presets...`);

  for (const preset of presets) {
    try {
      const response = await fetch(`${API_URL}/api/presets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });

      if (response.ok) {
        console.log(`✓ Added: ${preset.name}`);
      } else {
        const error = await response.text();
        console.error(`✗ Failed to add ${preset.name}: ${error}`);
      }
    } catch (err) {
      console.error(`✗ Error adding ${preset.name}:`, err);
    }
  }

  console.log("\nDone!");
}

// Run the script
addPresets();
