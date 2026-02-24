"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Save,
  Loader2,
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  DollarSign,
  Mail,
  Phone,
  User,
  FileText,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  caseId: string | null;
  caseWidth: number | null;
  caseHeight: number | null;
  needsCase: boolean;
  fingerPulls: boolean;
  designData: LayoutItem[];
  svgData: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

interface LayoutItem {
  id: string;
  name: string;
  points: number[][];
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  depth: number;
}

const statusOptions = [
  { value: "PENDING", label: "Pending Review", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { value: "PAID", label: "Paid", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  { value: "PROCESSING", label: "Processing", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "SHIPPED", label: "Shipped", icon: Truck, color: "text-purple-500", bg: "bg-purple-500/10" },
  { value: "DELIVERED", label: "Delivered", icon: CheckCircle, color: "text-green-600", bg: "bg-green-600/10" },
  { value: "CANCELLED", label: "Cancelled", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading, canAccessAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !canAccessAdmin)) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, canAccessAdmin, router]);

  useEffect(() => {
    if (user && canAccessAdmin) {
      fetchOrder();
    }
  }, [id, user, canAccessAdmin]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOrder(data.order);
      setStatus(data.order.status || "PENDING");
      setAdminNotes(data.order.adminNotes || "");
      setTrackingNumber(data.order.trackingNumber || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes, trackingNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOrder(data.order);
      setSuccess("Order updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const downloadSvg = () => {
    window.open(`/api/orders/${id}/svg`, "_blank");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-heading mb-2">Error Loading Order</h2>
            <p className="text-text-secondary mb-4">{error}</p>
            <Link href="/admin/orders"><Button>Back to Orders</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const layoutItems = Array.isArray(order.designData) ? order.designData : [];

  return (
    <div className="min-h-screen bg-black">
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
              <Link href="/admin" className="text-text-secondary hover:text-white">Dashboard</Link>
              <Link href="/admin/pipeline" className="text-text-secondary hover:text-white">Pipeline</Link>
              <Link href="/admin/orders" className="text-white font-medium">Orders</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading">{order.orderNumber}</h1>
              <p className="text-text-muted text-sm">Created {formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={downloadSvg}>
              <Download className="w-4 h-4 mr-2" />Download SVG
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded p-4 mb-6"><p className="text-red-400">{error}</p></div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 rounded p-4 mb-6"><p className="text-green-400">{success}</p></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg mb-4">Order Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = status === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setStatus(option.value)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all text-left",
                          isSelected ? `border-current ${option.color} ${option.bg}` : "border-border hover:border-accent/50"
                        )}
                      >
                        <Icon className={cn("w-5 h-5 mb-2", isSelected ? option.color : "text-text-muted")} />
                        <p className={cn("text-sm font-medium", isSelected ? option.color : "text-text-secondary")}>{option.label}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-accent" />
                  <h3 className="font-heading text-lg">Design Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-dark rounded-lg">
                    <p className="text-text-muted text-sm mb-1">Case</p>
                    <p className="font-medium">{order.caseName || "Custom"}</p>
                    <p className="text-sm text-text-secondary">{order.caseWidth}" × {order.caseHeight}"</p>
                  </div>
                  <div className="p-4 bg-dark rounded-lg">
                    <p className="text-text-muted text-sm mb-1">Options</p>
                    <p className="text-sm">{order.needsCase ? "Needs case" : "Has own case"}</p>
                    <p className="text-sm">{order.fingerPulls ? "With finger pulls" : "No finger pulls"}</p>
                  </div>
                </div>
                <h4 className="font-medium mb-3">Cutouts ({layoutItems.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {layoutItems.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-dark rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-accent/20 text-accent rounded flex items-center justify-center text-xs">{index + 1}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-sm text-text-muted">
                        {item.width?.toFixed(1)}" × {item.height?.toFixed(1)}" × {item.depth?.toFixed(1)}" deep
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-accent" />
                  <h3 className="font-heading text-lg">Admin Notes</h3>
                </div>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this order..."
                  rows={4}
                  className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-accent" />
                  <h3 className="font-heading text-lg">Shipping</h3>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number when shipped..."
                    className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg mb-4">Customer</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-text-muted mt-0.5" />
                    <p className="font-medium">{order.customerName || "—"}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-text-muted mt-0.5" />
                    <a href={`mailto:${order.customerEmail}`} className="text-accent hover:underline">{order.customerEmail || "—"}</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-text-muted mt-0.5" />
                    <a href={`tel:${order.customerPhone}`} className="text-accent hover:underline">{order.customerPhone || "—"}</a>
                  </div>
                </div>
                {order.customerNotes && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-text-muted mb-2">Customer Notes</p>
                    <p className="text-sm bg-dark p-3 rounded-lg">{order.customerNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg mb-4">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Order Created</p>
                      <p className="text-xs text-text-muted">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  {order.paidAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p className="text-sm font-medium">Payment Received</p>
                        <p className="text-xs text-text-muted">{formatDate(order.paidAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <p className="text-sm font-medium">Shipped</p>
                        <p className="text-xs text-text-muted">{formatDate(order.shippedAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                      <div>
                        <p className="text-sm font-medium">Delivered</p>
                        <p className="text-xs text-text-muted">{formatDate(order.deliveredAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start" onClick={() => window.open(`mailto:${order.customerEmail}?subject=Re: Order ${order.orderNumber}`)} disabled={!order.customerEmail}>
                    <Mail className="w-4 h-4 mr-2" />Email Customer
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" onClick={downloadSvg}>
                    <Download className="w-4 h-4 mr-2" />Download Cut File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
