"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ADMIN_EMAIL } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RefreshCw, Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface Session {
  id: string;
  userId?: string;
  userEmail?: string;
  startedAt: number;
  lastStep: string;
  lastUpdated: number;
  completed: boolean;
  imageUrl?: string;
  itemCount?: number;
  steps: Array<{
    step: string;
    enteredAt: number;
    completedAt?: number;
  }>;
}

interface Stats {
  total: number;
  byStep: {
    upload: number;
    segment: number;
    calibrate: number;
    layout: number;
    checkout: number;
    completed: number;
  };
  completionRate: number;
  dropOffByStep: {
    upload: number;
    segment: number;
    calibrate: number;
    layout: number;
    checkout: number;
  };
}

const STEP_LABELS: Record<string, string> = {
  upload: "Upload",
  segment: "Select Items",
  calibrate: "Calibrate",
  layout: "Layout",
  checkout: "Checkout",
  completed: "Completed",
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<{ sessions: Session[]; stats: Stats } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, isAdmin, router]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analytics");
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError("Failed to load analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnalytics();
    }
  }, [user, isAdmin]);

  if (authLoading || (!isAdmin && !authLoading)) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-heading text-accent">
              CUTMYCASE
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-white font-medium">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">{user?.email}</span>
            <Button variant="secondary" size="sm" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-[4px] text-error">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-[4px] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-accent" />
                  <span className="text-text-muted text-sm">Total Sessions</span>
                </div>
                <div className="text-3xl font-heading">{analytics.stats.total}</div>
              </div>

              <div className="bg-card border border-border rounded-[4px] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-text-muted text-sm">Completed</span>
                </div>
                <div className="text-3xl font-heading text-success">
                  {analytics.stats.byStep.completed}
                </div>
              </div>

              <div className="bg-card border border-border rounded-[4px] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="text-text-muted text-sm">Completion Rate</span>
                </div>
                <div className="text-3xl font-heading">{analytics.stats.completionRate}%</div>
              </div>

              <div className="bg-card border border-border rounded-[4px] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="text-text-muted text-sm">Biggest Drop-off</span>
                </div>
                <div className="text-xl font-heading">
                  {Object.entries(analytics.stats.dropOffByStep)
                    .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
                </div>
                <div className="text-sm text-text-muted">
                  {Object.entries(analytics.stats.dropOffByStep)
                    .sort(([, a], [, b]) => b - a)[0]?.[1] || 0} users
                </div>
              </div>
            </div>

            {/* Funnel Visualization */}
            <div className="bg-card border border-border rounded-[4px] p-6 mb-8">
              <h2 className="text-xl font-heading mb-4">Conversion Funnel</h2>
              <div className="space-y-3">
                {(["upload", "segment", "calibrate", "layout", "checkout", "completed"] as const).map((step) => {
                  const count = analytics.stats.byStep[step];
                  const total = analytics.stats.total || 1;
                  const percentage = Math.round((count / total) * 100);
                  const dropOff = step !== "completed" ? analytics.stats.dropOffByStep[step as keyof typeof analytics.stats.dropOffByStep] : 0;

                  return (
                    <div key={step} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-text-muted">{STEP_LABELS[step]}</div>
                      <div className="flex-1 h-8 bg-dark rounded-[4px] overflow-hidden relative">
                        <div
                          className={`h-full transition-all ${step === "completed" ? "bg-success" : "bg-accent"}`}
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <span className="text-sm font-medium">{count} users</span>
                          <span className="text-sm text-text-muted">{percentage}%</span>
                        </div>
                      </div>
                      {dropOff > 0 && (
                        <div className="w-20 text-sm text-error">-{dropOff} left</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-card border border-border rounded-[4px] p-6">
              <h2 className="text-xl font-heading mb-4">Recent Sessions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Session</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Last Step</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Items</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.sessions.map((session) => (
                      <tr key={session.id} className="border-b border-border/50 hover:bg-dark/50">
                        <td className="py-3 px-4">
                          <code className="text-xs text-text-muted">{session.id.slice(0, 20)}...</code>
                        </td>
                        <td className="py-3 px-4">
                          {session.userEmail ? (
                            <span className="text-sm">{session.userEmail}</span>
                          ) : (
                            <span className="text-sm text-text-muted">Anonymous</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{STEP_LABELS[session.lastStep] || session.lastStep}</span>
                        </td>
                        <td className="py-3 px-4">
                          {session.completed ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-success/20 text-success rounded">
                              <CheckCircle className="w-3 h-3" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-warning/20 text-warning rounded">
                              <AlertTriangle className="w-3 h-3" /> In Progress
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-text-muted">{session.itemCount || "-"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-text-muted">{formatTimeAgo(session.lastUpdated)}</span>
                        </td>
                      </tr>
                    ))}
                    {analytics.sessions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-text-muted">
                          No sessions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
