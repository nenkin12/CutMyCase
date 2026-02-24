import { NextRequest, NextResponse } from "next/server";

// Carrier detection patterns
const CARRIER_PATTERNS: { carrier: string; patterns: RegExp[]; trackingUrl: (num: string) => string }[] = [
  {
    carrier: "USPS",
    patterns: [
      /^(94|93|92|94|95)\d{20}$/,
      /^(94|93|92|94|95)\d{22}$/,
      /^\d{20}$/,
      /^[A-Z]{2}\d{9}US$/,
    ],
    trackingUrl: (num) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`,
  },
  {
    carrier: "UPS",
    patterns: [
      /^1Z[A-Z0-9]{16}$/i,
      /^T\d{10}$/,
      /^\d{9}$/,
      /^\d{26}$/,
    ],
    trackingUrl: (num) => `https://www.ups.com/track?tracknum=${num}`,
  },
  {
    carrier: "FedEx",
    patterns: [
      /^\d{12}$/,
      /^\d{15}$/,
      /^\d{20}$/,
      /^\d{22}$/,
    ],
    trackingUrl: (num) => `https://www.fedex.com/fedextrack/?trknbr=${num}`,
  },
  {
    carrier: "DHL",
    patterns: [
      /^\d{10}$/,
      /^\d{11}$/,
      /^[A-Z]{3}\d{7}$/,
    ],
    trackingUrl: (num) => `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${num}`,
  },
];

function detectCarrier(trackingNumber: string): { carrier: string; trackingUrl: string } | null {
  const cleaned = trackingNumber.replace(/\s/g, "").toUpperCase();

  for (const { carrier, patterns, trackingUrl } of CARRIER_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(cleaned)) {
        return { carrier, trackingUrl: trackingUrl(cleaned) };
      }
    }
  }

  return null;
}

// For real tracking status, you'd integrate with a service like:
// - AfterShip API (https://www.aftership.com/)
// - EasyPost API (https://www.easypost.com/)
// - Ship24 API (https://www.ship24.com/)
// These require API keys and subscriptions

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackingNumber = searchParams.get("number");

  if (!trackingNumber) {
    return NextResponse.json({ error: "Missing tracking number" }, { status: 400 });
  }

  const carrierInfo = detectCarrier(trackingNumber);

  if (!carrierInfo) {
    return NextResponse.json({
      trackingNumber,
      carrier: "Unknown",
      status: "unknown",
      statusText: "Unable to detect carrier",
      trackingUrl: null,
    });
  }

  // In production, you would call the carrier's API here
  // For now, return carrier info with a link to track
  return NextResponse.json({
    trackingNumber,
    carrier: carrierInfo.carrier,
    status: "in_transit", // Would come from API
    statusText: "In Transit", // Would come from API
    trackingUrl: carrierInfo.trackingUrl,
    // delivered: false, // Would come from API
  });
}

// POST endpoint to check tracking and auto-update order status
export async function POST(request: NextRequest) {
  try {
    const { trackingNumber, orderId } = await request.json();

    if (!trackingNumber) {
      return NextResponse.json({ error: "Missing tracking number" }, { status: 400 });
    }

    const carrierInfo = detectCarrier(trackingNumber);

    // For now, return basic info
    // In production, you'd call the carrier API and check if delivered
    return NextResponse.json({
      trackingNumber,
      carrier: carrierInfo?.carrier || "Unknown",
      status: "in_transit",
      statusText: "In Transit",
      trackingUrl: carrierInfo?.trackingUrl || null,
      delivered: false,
    });
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ error: "Failed to check tracking" }, { status: 500 });
  }
}
