import Link from "next/link";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
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
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-heading mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Scanned Designs
              </CardTitle>
              <Package className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading">View All</div>
              <p className="text-xs text-text-muted mt-1">
                See all user-created designs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Orders
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading">Coming Soon</div>
              <p className="text-xs text-text-muted mt-1">
                Shopify integration pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Status
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading text-success">Live</div>
              <p className="text-xs text-text-muted mt-1">
                Design tool is operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
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
      </main>
    </div>
  );
}
