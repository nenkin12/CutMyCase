import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import type { Order, User } from "@prisma/client";

export const dynamic = "force-dynamic";
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
import { Badge } from "@/components/ui/badge";

async function getStats() {
  const [
    totalOrders,
    pendingOrders,
    paidOrders,
    totalRevenue,
    recentOrders,
    queuedJobs,
    inProgressJobs,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PAID" } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    db.shopJob.count({ where: { status: "QUEUED" } }),
    db.shopJob.count({ where: { status: "IN_PROGRESS" } }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    paidOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    recentOrders: recentOrders as (Order & { user: User | null })[],
    queuedJobs,
    inProgressJobs,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="bg-dark border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-[2px] flex items-center justify-center">
                  <span className="text-white font-heading text-lg">C</span>
                </div>
              </Link>
              <span className="font-heading text-xl">ADMIN</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-accent">
                Dashboard
              </Link>
              <Link href="/admin/orders" className="text-text-secondary hover:text-white">
                Orders
              </Link>
              <Link href="/admin/queue" className="text-text-secondary hover:text-white">
                Queue
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading">
                {formatPrice(stats.totalRevenue)}
              </div>
              <p className="text-xs text-text-muted mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1 text-success" />
                From {stats.paidOrders} paid orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Total Orders
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading">{stats.totalOrders}</div>
              <p className="text-xs text-text-muted mt-1">
                {stats.pendingOrders} pending payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Queue Status
              </CardTitle>
              <Clock className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading">{stats.queuedJobs}</div>
              <p className="text-xs text-text-muted mt-1">
                {stats.inProgressJobs} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                Needs Attention
              </CardTitle>
              <AlertCircle className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading">
                {stats.paidOrders - stats.inProgressJobs - stats.queuedJobs}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Orders waiting to ship
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders & Queue */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/admin/orders" className="text-accent text-sm hover:underline">
                View all
                <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-text-muted">
                        {order.user?.name || order.user?.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-heading">{formatPrice(order.total)}</div>
                      <Badge
                        variant={
                          order.status === "PAID"
                            ? "success"
                            : order.status === "PENDING"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}

                {stats.recentOrders.length === 0 && (
                  <p className="text-text-muted text-center py-4">
                    No orders yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Link
                  href="/admin/queue"
                  className="flex items-center gap-4 p-4 bg-carbon rounded-[4px] hover:bg-accent/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-accent/20 rounded-[4px] flex items-center justify-center">
                    <Package className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Production Queue</h4>
                    <p className="text-sm text-text-muted">
                      {stats.queuedJobs + stats.inProgressJobs} jobs pending
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-muted" />
                </Link>

                <Link
                  href="/admin/orders"
                  className="flex items-center gap-4 p-4 bg-carbon rounded-[4px] hover:bg-accent/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-accent/20 rounded-[4px] flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Manage Orders</h4>
                    <p className="text-sm text-text-muted">
                      View and update order status
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-muted" />
                </Link>

                <Link
                  href="/admin/orders?status=PAID"
                  className="flex items-center gap-4 p-4 bg-carbon rounded-[4px] hover:bg-accent/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-success/20 rounded-[4px] flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Ready to Ship</h4>
                    <p className="text-sm text-text-muted">
                      Orders ready for fulfillment
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-muted" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
