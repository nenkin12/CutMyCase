// Analytics tracking for user journey through the design process
// Stores data in Firestore

const ANALYTICS_API = "/api/analytics";

export type DesignStep = "upload" | "segment" | "calibrate" | "layout" | "checkout" | "completed";

export interface AnalyticsEvent {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  step: DesignStep;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface DesignSession {
  id: string;
  userId?: string;
  userEmail?: string;
  startedAt: number;
  lastStep: DesignStep;
  lastUpdated: number;
  completed: boolean;
  steps: {
    step: DesignStep;
    enteredAt: number;
    completedAt?: number;
  }[];
  imageUrl?: string;
  itemCount?: number;
}

// Generate a unique session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Get or create session ID from localStorage
export function getSessionId(): string {
  if (typeof window === "undefined") return generateSessionId();

  let sessionId = sessionStorage.getItem("designSessionId");
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("designSessionId", sessionId);
  }
  return sessionId;
}

// Clear session (for starting fresh)
export function clearSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("designSessionId");
  }
}

// Track step entry
export async function trackStepEnter(
  step: DesignStep,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const sessionId = getSessionId();
    await fetch(ANALYTICS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "stepEnter",
        sessionId,
        step,
        metadata,
      }),
    });
  } catch (error) {
    console.error("Failed to track step:", error);
  }
}

// Track step completion
export async function trackStepComplete(
  step: DesignStep,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const sessionId = getSessionId();
    await fetch(ANALYTICS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "stepComplete",
        sessionId,
        step,
        metadata,
      }),
    });
  } catch (error) {
    console.error("Failed to track step completion:", error);
  }
}

// Track session with user info (called after sign-in)
export async function linkSessionToUser(
  userId: string,
  userEmail: string
): Promise<void> {
  try {
    const sessionId = getSessionId();
    await fetch(ANALYTICS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "linkUser",
        sessionId,
        userId,
        userEmail,
      }),
    });
  } catch (error) {
    console.error("Failed to link session to user:", error);
  }
}
