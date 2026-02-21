"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, ADMIN_EMAIL } from "@/components/providers/auth-provider";

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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<{ sessions: Session[]; stats: Stats } | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, isAdmin, router]);

  // Fetch analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnalytics();
    }
  }, [user, isAdmin]);

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="bg-dark border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="CutMyCase" className="w-8 h-8 rounded" />
              </Link>
              <span className="font-heading text-xl">ADMIN</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-accent">
                Dashboard
              </Link>
              <Link href="/admin/designs" className="text-text-secondary hover:text-white">
                Designs
              </Link>
              <Link href="/" className="text-text-secondary hover:text-white">
                View Site
              </Link>
              <span className="text-xs text-text-muted">{user?.email}</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading">Dashboard</h1>
          <Button variant="secondary" size="sm" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Total Sessions
              </CardTitle>
              <Users className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading">{analytics?.stats.total || 0}</div>
              <p className="text-xs text-text-muted mt-1">
                Users who started designing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Completed
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading text-success">
                {analytics?.stats.byStep.completed || 0}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Finished checkout
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Completion Rate
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading">{analytics?.stats.completionRate || 0}%</div>
              <p className="text-xs text-text-muted mt-1">
                Of sessions completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Biggest Drop-off
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading">
                {analytics?.stats.dropOffByStep
                  ? STEP_LABELS[Object.entries(analytics.stats.dropOffByStep).sort(([, a], [, b]) => b - a)[0]?.[0]] || "N/A"
                  : "N/A"}
              </div>
              <p className="text-xs text-text-muted mt-1">
                {analytics?.stats.dropOffByStep
                  ? `${Object.entries(analytics.stats.dropOffByStep).sort(([, a], [, b]) => b - a)[0]?.[1] || 0} users left`
                  : "No data"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        {analytics && analytics.stats.total > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(["upload", "segment", "calibrate", "layout", "checkout", "completed"] as const).map((step) => {
                  const count = analytics.stats.byStep[step];
                  const total = analytics.stats.total || 1;
                  const percentage = Math.round((count / total) * 100);
                  const dropOff = step !== "completed" ? analytics.stats.dropOffByStep[step as keyof typeof analytics.stats.dropOffByStep] : 0;

                  return (
                    <div key={step} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-text-muted">{STEP_LABELS[step]}</div>
                      <div className="flex-1 h-8 bg-carbon rounded-[4px] overflow-hidden relative">
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
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Link
                href="/admin/designs"
                className="flex items-center gap-4 p-4 bg-carbon rounded-[4px] hover:bg-accent/10 transition-colors"
              >
                <div className="w-10 h-10 bg-accent/20 rounded-[4px] flex items-center justify-center">
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">View Designs</h4>
                  <p className="text-sm text-text-muted">
                    See all scanned and submitted designs
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted" />
              </Link>

              <Link
                href="/upload"
                className="flex items-center gap-4 p-4 bg-carbon rounded-[4px] hover:bg-accent/10 transition-colors"
              >
                <div className="w-10 h-10 bg-accent/20 rounded-[4px] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Test Design Tool</h4>
                  <p className="text-sm text-text-muted">
                    Try the upload and scanning flow
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        {analytics && analytics.sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Last Step</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Items</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.sessions.slice(0, 10).map((session) => (
                      <tr key={session.id} className="border-b border-border/50 hover:bg-dark/50">
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
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
