"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  ArrowLeft,
  Download,
  Eye,
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerNotes: string | null;
  caseName: string | null;
  caseWidth: number | null;
  caseHeight: number | null;
  needsCase: boolean;
  fingerPulls: boolean;
  designData: unknown;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: { label: "Pending Review", icon: Clock, color: "text-yellow-500" },
  PAID: { label: "Paid", icon: CheckCircle, color: "text-green-500" },
  PROCESSING: { label: "Processing", icon: Package, color: "text-blue-500" },
  SHIPPED: { label: "Shipped", icon: Truck, color: "text-purple-500" },
  DELIVERED: { label: "Delivered", icon: CheckCircle, color: "text-green-600" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-red-500" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const downloadSvg = (orderId: string) => {
    window.open(`/api/orders/${orderId}/svg`, "_blank");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="bg-dark border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="CutMyCase" className="w-8 h-8 rounded" />
              </Link>
              <span className="font-heading text-xl">ADMIN</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-text-secondary hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/designs" className="text-text-secondary hover:text-white">
                Designs
              </Link>
              <Link href="/admin/orders" className="text-white font-medium">
                Orders
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-heading">Orders</h1>
          </div>
          <Button variant="secondary" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
              <p className="text-text-secondary">Loading orders...</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ShoppingCart className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h2 className="text-xl font-heading mb-2">No Orders Yet</h2>
              <p className="text-text-secondary max-w-md mx-auto">
                When customers submit designs, they'll appear here for review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;
              const layoutItems = Array.isArray(order.designData) ? order.designData : [];

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Order Info */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-heading text-lg">{order.orderNumber}</h3>
                            <p className="text-sm text-text-muted">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className={cn("flex items-center gap-2", status.color)}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{status.label}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-text-muted">Customer</p>
                            <p className="font-medium">{order.customerName || "—"}</p>
                            <p className="text-text-secondary">{order.customerEmail || "—"}</p>
                            {order.customerPhone && (
                              <p className="text-text-secondary">{order.customerPhone}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-text-muted">Case</p>
                            <p className="font-medium">{order.caseName || "Custom"}</p>
                            <p className="text-text-secondary">
                              {order.caseWidth}" × {order.caseHeight}"
                            </p>
                            <p className="text-text-secondary">
                              {order.needsCase ? "Needs case" : "Has case"} •{" "}
                              {order.fingerPulls ? "With finger pulls" : "No finger pulls"}
                            </p>
                          </div>
                        </div>

                        {order.customerNotes && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-text-muted text-sm mb-1">Customer Notes</p>
                            <p className="text-sm">{order.customerNotes}</p>
                          </div>
                        )}

                        {/* Cutouts */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-text-muted text-sm mb-2">
                            Cutouts ({layoutItems.length} items)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {layoutItems.slice(0, 5).map((item: { id: string; name: string; width: number; height: number; depth: number }) => (
                              <span
                                key={item.id}
                                className="px-2 py-1 bg-dark rounded text-xs"
                              >
                                {item.name} ({item.width?.toFixed(1)}" × {item.height?.toFixed(1)}")
                              </span>
                            ))}
                            {layoutItems.length > 5 && (
                              <span className="px-2 py-1 bg-dark rounded text-xs text-text-muted">
                                +{layoutItems.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 p-6 bg-dark/50 md:border-l border-t md:border-t-0 border-border">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => downloadSvg(order.id)}
                          className="flex-1 md:flex-none"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download SVG
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          className="flex-1 md:flex-none"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {selectedOrder?.id === order.id ? "Hide Details" : "View Details"}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedOrder?.id === order.id && (
                      <div className="p-6 bg-dark/30 border-t border-border">
                        <h4 className="font-heading text-sm mb-4">Full Design Data</h4>
                        <pre className="bg-dark p-4 rounded text-xs overflow-auto max-h-64">
                          {JSON.stringify(order.designData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
