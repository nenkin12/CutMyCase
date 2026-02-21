import { NextRequest, NextResponse } from "next/server";

// In-memory store for development (will use Firestore in production)
// For production, this should be replaced with Firestore calls
const sessions = new Map<string, {
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
}>();

// Firestore-based storage
async function saveToFirestore(sessionId: string, data: unknown) {
  try {
    // Use Firestore REST API
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      console.log("Firestore not configured, using in-memory storage");
      return;
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/analytics/${sessionId}`;

    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          data: { stringValue: JSON.stringify(data) },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });
  } catch (error) {
    console.error("Failed to save to Firestore:", error);
  }
}

async function getFromFirestore(sessionId: string) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) return null;

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/analytics/${sessionId}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const doc = await response.json();
    if (doc.fields?.data?.stringValue) {
      return JSON.parse(doc.fields.data.stringValue);
    }
    return null;
  } catch (error) {
    console.error("Failed to get from Firestore:", error);
    return null;
  }
}

async function getAllSessions() {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      // Return in-memory sessions
      return Array.from(sessions.values());
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/analytics?pageSize=100`;
    const response = await fetch(url);

    if (!response.ok) {
      return Array.from(sessions.values());
    }

    const result = await response.json();
    const firestoreSessions: unknown[] = [];

    if (result.documents) {
      for (const doc of result.documents) {
        if (doc.fields?.data?.stringValue) {
          firestoreSessions.push(JSON.parse(doc.fields.data.stringValue));
        }
      }
    }

    return firestoreSessions;
  } catch (error) {
    console.error("Failed to get all sessions:", error);
    return Array.from(sessions.values());
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, step, metadata, userId, userEmail } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Get or create session
    let session = sessions.get(sessionId) || await getFromFirestore(sessionId);

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
        const existingStep = session.steps.find((s: { step: string }) => s.step === step && !s.completedAt);
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
        const stepToComplete = session.steps.find((s: { step: string; completedAt?: number }) => s.step === step && !s.completedAt);
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

    // Save session
    sessions.set(sessionId, session);
    await saveToFirestore(sessionId, session);

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all sessions for admin dashboard
    const allSessions = await getAllSessions();

    // Sort by lastUpdated descending
    const sorted = (allSessions as Array<{ lastUpdated: number }>).sort((a, b) => b.lastUpdated - a.lastUpdated);

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

    for (const session of sorted as Array<{ lastStep: string; completed: boolean }>) {
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
