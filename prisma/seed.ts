import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const pelicanCases = [
  {
    slug: "pelican-1200",
    name: "1200 Case",
    brand: "Pelican",
    description:
      "Compact and lightweight, the Pelican 1200 is perfect for protecting small electronics, cameras, or pistols.",
    image: "/images/cases/pelican-1200.jpg",
    interiorLength: 9.25,
    interiorWidth: 7.12,
    interiorDepth: 4.12,
    exteriorLength: 10.62,
    exteriorWidth: 9.68,
    exteriorDepth: 4.87,
    weight: 2.55,
    basePrice: 5995,
    features: [
      "Watertight (IP67)",
      "Crushproof",
      "Dustproof",
      "Automatic pressure equalization valve",
      "Stainless steel hardware",
      "Lifetime guarantee",
    ],
    category: "pelican",
  },
  {
    slug: "pelican-1450",
    name: "1450 Case",
    brand: "Pelican",
    description:
      "Medium-sized case ideal for cameras, drones, or multiple handguns with accessories.",
    image: "/images/cases/pelican-1450.jpg",
    interiorLength: 14.62,
    interiorWidth: 10.18,
    interiorDepth: 6.0,
    exteriorLength: 16.0,
    exteriorWidth: 13.0,
    exteriorDepth: 6.87,
    weight: 5.33,
    basePrice: 14995,
    features: [
      "Watertight (IP67)",
      "Crushproof",
      "Dustproof",
      "Double-throw latches",
      "O-ring seal",
      "Lifetime guarantee",
    ],
    category: "pelican",
  },
  {
    slug: "pelican-1510",
    name: "1510 Carry-On Case",
    brand: "Pelican",
    description:
      "Carry-on sized case with wheels, perfect for travel with cameras, laptops, or firearms.",
    image: "/images/cases/pelican-1510.jpg",
    interiorLength: 19.75,
    interiorWidth: 11.0,
    interiorDepth: 7.6,
    exteriorLength: 22.0,
    exteriorWidth: 13.81,
    exteriorDepth: 9.0,
    weight: 11.29,
    basePrice: 24995,
    features: [
      "Carry-on compliant",
      "Retractable extension handle",
      "Built-in wheels",
      "Watertight (IP67)",
      "Stainless steel bearings",
      "Lifetime guarantee",
    ],
    category: "pelican",
  },
  {
    slug: "pelican-1600",
    name: "1600 Case",
    brand: "Pelican",
    description:
      "Large protective case for professional camera kits, rifles, or industrial equipment.",
    image: "/images/cases/pelican-1600.jpg",
    interiorLength: 21.43,
    interiorWidth: 16.5,
    interiorDepth: 7.87,
    exteriorLength: 24.39,
    exteriorWidth: 19.36,
    exteriorDepth: 8.79,
    weight: 13.73,
    basePrice: 29995,
    features: [
      "Watertight (IP67)",
      "Crushproof to 1000 lbs",
      "Dustproof",
      "Four double-throw latches",
      "Two padlock hasps",
      "Lifetime guarantee",
    ],
    category: "pelican",
  },
  {
    slug: "pelican-1720",
    name: "1720 Long Case",
    brand: "Pelican",
    description:
      "Long rifle case designed for firearms up to 42 inches. Perfect for AR-15s and scoped rifles.",
    image: "/images/cases/pelican-1720.jpg",
    interiorLength: 42.0,
    interiorWidth: 13.5,
    interiorDepth: 5.25,
    exteriorLength: 44.37,
    exteriorWidth: 16.0,
    exteriorDepth: 6.12,
    weight: 17.2,
    basePrice: 34995,
    features: [
      "Fits rifles up to 42 inches",
      "Watertight (IP67)",
      "Crushproof",
      "Four double-throw latches",
      "TSA approved locks compatible",
      "Lifetime guarantee",
    ],
    category: "pelican",
  },
];

const foamOptions = [
  {
    name: "No Foam",
    description: "Case only, no foam insert",
    price: 0,
    isDefault: false,
  },
  {
    name: "Pick N Pluck",
    description: "Pre-scored foam you customize by hand",
    price: 1999,
    isDefault: true,
  },
  {
    name: "Custom Cut",
    description: "AI-designed precision CNC cut foam",
    price: 4999,
    isDefault: false,
  },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.foamOption.deleteMany();
  await prisma.product.deleteMany();

  // Create products with foam options
  for (const caseData of pelicanCases) {
    const product = await prisma.product.create({
      data: {
        ...caseData,
        images: [],
        foamOptions: {
          create: foamOptions,
        },
      },
    });
    console.log(`Created: ${product.brand} ${product.name}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
