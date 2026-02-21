import { NextRequest, NextResponse } from "next/server";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_URL = FIREBASE_PROJECT_ID
  ? `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`
  : null;

interface SessionData {
  id: string;
  userId?: string;
  userEmail?: string;
  startedAt: number;
  lastStep: string;
  lastUpdated: number;
  completed: boolean;
  steps: Array<{
    step: string;
    enteredAt: number;
    completedAt?: number;
  }>;
  imageUrl?: string;
  itemCount?: number;
}

// Save session to Firestore (creates or updates)
async function saveToFirestore(sessionId: string, data: SessionData): Promise<boolean> {
  if (!FIRESTORE_URL) {
    console.log("Firestore not configured");
    return false;
  }

  try {
    // Use PATCH with updateMask to create or update
    const url = `${FIRESTORE_URL}/analytics/${sessionId}`;

    const firestoreData = {
      fields: {
        id: { stringValue: data.id },
        userId: { stringValue: data.userId || "" },
        userEmail: { stringValue: data.userEmail || "" },
        startedAt: { integerValue: String(data.startedAt) },
        lastStep: { stringValue: data.lastStep },
        lastUpdated: { integerValue: String(data.lastUpdated) },
        completed: { booleanValue: data.completed },
        steps: { stringValue: JSON.stringify(data.steps) },
        imageUrl: { stringValue: data.imageUrl || "" },
        itemCount: { integerValue: String(data.itemCount || 0) },
      },
    };

    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreData),
    });

    if (!response.ok) {
      // If PATCH fails (document doesn't exist), try creating with POST
      const createUrl = `${FIRESTORE_URL}/analytics?documentId=${sessionId}`;
      const createResponse = await fetch(createUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firestoreData),
      });

      if (!createResponse.ok) {
        console.error("Failed to create analytics document:", await createResponse.text());
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to save to Firestore:", error);
    return false;
  }
}

async function getFromFirestore(sessionId: string): Promise<SessionData | null> {
  if (!FIRESTORE_URL) return null;

  try {
    const url = `${FIRESTORE_URL}/analytics/${sessionId}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const doc = await response.json();
    return firestoreToSession(doc);
  } catch (error) {
    console.error("Failed to get from Firestore:", error);
    return null;
  }
}

// Convert Firestore document to SessionData
function firestoreToSession(doc: { fields?: Record<string, { stringValue?: string; integerValue?: string; booleanValue?: boolean }> }): SessionData | null {
  if (!doc.fields) return null;

  const fields = doc.fields;
  return {
    id: fields.id?.stringValue || "",
    userId: fields.userId?.stringValue || undefined,
    userEmail: fields.userEmail?.stringValue || undefined,
    startedAt: parseInt(fields.startedAt?.integerValue || "0"),
    lastStep: fields.lastStep?.stringValue || "upload",
    lastUpdated: parseInt(fields.lastUpdated?.integerValue || "0"),
    completed: fields.completed?.booleanValue || false,
    steps: fields.steps?.stringValue ? JSON.parse(fields.steps.stringValue) : [],
    imageUrl: fields.imageUrl?.stringValue || undefined,
    itemCount: parseInt(fields.itemCount?.integerValue || "0") || undefined,
  };
}

async function getAllSessions(): Promise<SessionData[]> {
  if (!FIRESTORE_URL) {
    console.log("Firestore not configured, no sessions available");
    return [];
  }

  try {
    const url = `${FIRESTORE_URL}/analytics?pageSize=100`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch analytics:", response.status, await response.text());
      return [];
    }

    const result = await response.json();
    const sessions: SessionData[] = [];

    if (result.documents) {
      for (const doc of result.documents) {
        const session = firestoreToSession(doc);
        if (session && session.id) {
          sessions.push(session);
        }
      }
    }

    return sessions;
  } catch (error) {
    console.error("Failed to get all sessions:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, step, metadata, userId, userEmail } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Get or create session from Firestore
    let session = await getFromFirestore(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        startedAt: Date.now(),
        lastStep: "upload",
        lastUpdated: Date.now(),
        completed: false,
        steps: [],
      };
    }

    const now = Date.now();

    switch (action) {
      case "stepEnter":
        // Add step entry if not already there
        const existingStep = session.steps.find((s) => s.step === step && !s.completedAt);
        if (!existingStep) {
          session.steps.push({
            step,
            enteredAt: now,
          });
        }
        session.lastStep = step;
        session.lastUpdated = now;

        // Store metadata
        if (metadata?.imageUrl) session.imageUrl = metadata.imageUrl;
        if (metadata?.itemCount) session.itemCount = metadata.itemCount;
        break;

      case "stepComplete":
        // Mark step as completed
        const stepToComplete = session.steps.find((s) => s.step === step && !s.completedAt);
        if (stepToComplete) {
          stepToComplete.completedAt = now;
        }
        session.lastUpdated = now;

        if (step === "completed") {
          session.completed = true;
        }
        break;

      case "linkUser":
        session.userId = userId;
        session.userEmail = userEmail;
        session.lastUpdated = now;
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Save session to Firestore
    const saved = await saveToFirestore(sessionId, session);
    if (!saved) {
      console.warn("Failed to save session to Firestore, but continuing");
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get all sessions for admin dashboard
    const allSessions = await getAllSessions();

    // Sort by lastUpdated descending
    const sorted = allSessions.sort((a, b) => b.lastUpdated - a.lastUpdated);

    // Calculate funnel stats
    const stats = {
      total: sorted.length,
      byStep: {
        upload: 0,
        segment: 0,
        calibrate: 0,
        layout: 0,
        checkout: 0,
        completed: 0,
      },
      completionRate: 0,
      dropOffByStep: {
        upload: 0,
        segment: 0,
        calibrate: 0,
        layout: 0,
        checkout: 0,
      },
    };

    for (const session of sorted) {
      const step = session.lastStep as keyof typeof stats.byStep;
      if (stats.byStep[step] !== undefined) {
        stats.byStep[step]++;
      }

      // Track drop-offs (sessions that stopped at each step without completing)
      if (!session.completed && step !== "completed") {
        const dropStep = step as keyof typeof stats.dropOffByStep;
        if (stats.dropOffByStep[dropStep] !== undefined) {
          stats.dropOffByStep[dropStep]++;
        }
      }
    }

    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.byStep.completed / stats.total) * 100);
    }

    return NextResponse.json({
      sessions: sorted.slice(0, 100), // Return last 100 sessions
      stats,
    });
  } catch (error) {
    console.error("Failed to get analytics:", error);
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 });
  }
}
