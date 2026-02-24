"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Download,
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Loader2,
  RefreshCw,
  DollarSign,
  Mail,
  Phone,
  User,
  FileText,
  Layers,
  Save,
  X,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface LayoutItem {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  caseName: string | null;
  caseWidth: number | null;
  caseHeight: number | null;
  needsCase: boolean;
  fingerPulls: boolean;
  designData: LayoutItem[];
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

const pipelineStages = [
  { id: "PENDING", label: "Pending", icon: Clock, color: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-500" },
  { id: "PAID", label: "Paid", icon: DollarSign, color: "border-green-500", bg: "bg-green-500/10", text: "text-green-500" },
  { id: "PROCESSING", label: "Processing", icon: Package, color: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-500" },
  { id: "SHIPPED", label: "Shipped", icon: Truck, color: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-500" },
  { id: "DELIVERED", label: "Delivered", icon: CheckCircle, color: "border-green-600", bg: "bg-green-600/10", text: "text-green-600" },
  { id: "CANCELLED", label: "Cancelled", icon: XCircle, color: "border-red-500", bg: "bg-red-500/10", text: "text-red-500" },
];

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading, canAccessAdmin, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields for selected order
  const [editStatus, setEditStatus] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !canAccessAdmin)) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, canAccessAdmin, router]);

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
    if (user && canAccessAdmin) {
      fetchOrders();
    }
  }, [user, canAccessAdmin]);

  // Show loading while checking auth
  if (authLoading || !canAccessAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status || "PENDING");
    setEditAdminNotes(order.adminNotes || "");
    setEditTrackingNumber(order.trackingNumber || "");
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          adminNotes: editAdminNotes,
          trackingNumber: editTrackingNumber,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Update local state
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? data.order : o));
      setSelectedOrder(data.order);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const downloadSvg = (orderId: string) => {
    window.open(`/api/orders/${orderId}/svg`, "_blank");
  };

  const getOrdersByStage = (stageId: string) => {
    return orders.filter(order => order.status === stageId);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatFullDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="bg-dark border-b border-border">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="CutMyCase" className="w-8 h-8 rounded" />
              </Link>
              <span className="font-heading text-xl">ADMIN</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-text-secondary hover:text-white">Dashboard</Link>
              <Link href="/admin/orders" className="text-white font-medium">Orders</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-64px)]">
        {/* Main Content - Pipeline */}
        <div className={cn("flex-1 overflow-auto p-6", selectedOrder && "hidden lg:block")}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading">Production Pipeline</h1>
              <p className="text-text-muted text-sm">{orders.length} total orders</p>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchOrders} disabled={loading}>
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
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ShoppingCart className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h2 className="text-xl font-heading mb-2">No Orders Yet</h2>
                <p className="text-text-secondary">Orders will appear here when customers submit designs.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pipelineStages.map((stage) => {
                const stageOrders = getOrdersByStage(stage.id);
                const Icon = stage.icon;

                return (
                  <div key={stage.id} className="flex-shrink-0 w-64">
                    {/* Stage Header */}
                    <div className={cn("rounded-t-lg border-t-4 p-3 bg-dark", stage.color)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-4 h-4", stage.text)} />
                          <span className="font-medium text-sm">{stage.label}</span>
                        </div>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", stage.bg, stage.text)}>
                          {stageOrders.length}
                        </span>
                      </div>
                    </div>

                    {/* Stage Orders */}
                    <div className="bg-carbon rounded-b-lg p-2 min-h-[300px] max-h-[calc(100vh-280px)] overflow-y-auto space-y-2">
                      {stageOrders.length === 0 ? (
                        <div className="text-center py-8">
                          <Icon className="w-6 h-6 text-text-muted mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-text-muted">No orders</p>
                        </div>
                      ) : (
                        stageOrders.map((order) => {
                          const itemCount = Array.isArray(order.designData) ? order.designData.length : 0;
                          const isSelected = selectedOrder?.id === order.id;

                          return (
                            <button
                              key={order.id}
                              onClick={() => selectOrder(order)}
                              className={cn(
                                "w-full text-left p-3 rounded-lg border transition-all",
                                isSelected
                                  ? "border-accent bg-accent/10"
                                  : "border-border bg-dark hover:border-accent/50"
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-xs font-medium text-accent">
                                  {order.orderNumber}
                                </span>
                                <ChevronRight className="w-3 h-3 text-text-muted" />
                              </div>
                              <p className="text-sm truncate text-text-secondary">
                                {order.customerName || order.customerEmail || "Guest"}
                              </p>
                              <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                                <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                                <span>{formatDate(order.createdAt)}</span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Detail Sidebar */}
        {selectedOrder && (
          <div className="w-full lg:w-[480px] border-l border-border bg-dark overflow-y-auto">
            {/* Sidebar Header */}
            <div className="sticky top-0 bg-dark border-b border-border p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-heading text-lg">{selectedOrder.orderNumber}</h2>
                <p className="text-xs text-text-muted">{formatFullDate(selectedOrder.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span className="ml-1 hidden sm:inline">{saveSuccess ? "Saved!" : "Save"}</span>
                </Button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-carbon rounded-lg lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-3">Status</h3>
                <div className="grid grid-cols-3 gap-2">
                  {pipelineStages.slice(0, 6).map((stage) => {
                    const Icon = stage.icon;
                    const isSelected = editStatus === stage.id;
                    return (
                      <button
                        key={stage.id}
                        onClick={() => setEditStatus(stage.id)}
                        className={cn(
                          "p-2 rounded-lg border text-center transition-all",
                          isSelected ? `border-current ${stage.text} ${stage.bg}` : "border-border hover:border-accent/50"
                        )}
                      >
                        <Icon className={cn("w-4 h-4 mx-auto mb-1", isSelected ? stage.text : "text-text-muted")} />
                        <p className={cn("text-xs", isSelected ? stage.text : "text-text-secondary")}>{stage.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-3">Customer</h3>
                <div className="bg-carbon rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-text-muted" />
                    <span className="text-sm">{selectedOrder.customerName || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-text-muted" />
                    <a href={`mailto:${selectedOrder.customerEmail}`} className="text-sm text-accent hover:underline">
                      {selectedOrder.customerEmail || "—"}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-text-muted" />
                    <span className="text-sm">{selectedOrder.customerPhone || "—"}</span>
                  </div>
                  {selectedOrder.customerNotes && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-text-muted mb-1">Customer Notes</p>
                      <p className="text-sm">{selectedOrder.customerNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Design */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-3">Design</h3>
                <div className="bg-carbon rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Case</span>
                    <span>{selectedOrder.caseName || "Custom"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Size</span>
                    <span>{selectedOrder.caseWidth}" × {selectedOrder.caseHeight}"</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Options</span>
                    <span>{selectedOrder.fingerPulls ? "Finger pulls" : "No pulls"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Needs Case</span>
                    <span>{selectedOrder.needsCase ? "Yes" : "No"}</span>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-text-muted mb-2">
                      Cutouts ({Array.isArray(selectedOrder.designData) ? selectedOrder.designData.length : 0})
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {Array.isArray(selectedOrder.designData) && selectedOrder.designData.map((item, i) => (
                        <div key={item.id || i} className="flex justify-between text-xs py-1">
                          <span>{item.name}</span>
                          <span className="text-text-muted">
                            {item.width?.toFixed(1)}" × {item.height?.toFixed(1)}" × {item.depth?.toFixed(1)}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-3">Admin Notes</h3>
                <textarea
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  placeholder="Internal notes..."
                  rows={3}
                  className="w-full bg-carbon border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Tracking */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-3">Tracking</h3>
                <input
                  type="text"
                  value={editTrackingNumber}
                  onChange={(e) => setEditTrackingNumber(e.target.value)}
                  placeholder="Tracking number..."
                  className="w-full bg-carbon border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={() => downloadSvg(selectedOrder.id)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Cut File (SVG)
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => window.open(`mailto:${selectedOrder.customerEmail}?subject=Re: Order ${selectedOrder.orderNumber}`)}
                  disabled={!selectedOrder.customerEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Customer
                </Button>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-text-muted">Created</span>
                    <span className="ml-auto text-xs">{formatFullDate(selectedOrder.createdAt)}</span>
                  </div>
                  {selectedOrder.paidAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-text-muted">Paid</span>
                      <span className="ml-auto text-xs">{formatFullDate(selectedOrder.paidAt)}</span>
                    </div>
                  )}
                  {selectedOrder.shippedAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-text-muted">Shipped</span>
                      <span className="ml-auto text-xs">{formatFullDate(selectedOrder.shippedAt)}</span>
                    </div>
                  )}
                  {selectedOrder.deliveredAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span className="text-text-muted">Delivered</span>
                      <span className="ml-auto text-xs">{formatFullDate(selectedOrder.deliveredAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
