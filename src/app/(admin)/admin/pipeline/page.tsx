"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  DollarSign,
  Loader2,
  RefreshCw,
  ArrowRight,
  User,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  caseName: string | null;
  caseWidth: number | null;
  caseHeight: number | null;
  designData: unknown[];
  createdAt: string;
}

const pipelineStages = [
  { 
    id: "PENDING", 
    label: "Pending Review", 
    icon: Clock, 
    color: "border-yellow-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-500",
    description: "Awaiting review & quote"
  },
  { 
    id: "PAID", 
    label: "New Orders", 
    icon: DollarSign, 
    color: "border-green-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    description: "Payment received"
  },
  { 
    id: "PROCESSING", 
    label: "Processing", 
    icon: Package, 
    color: "border-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
    description: "CNC cutting in progress"
  },
  { 
    id: "SHIPPED", 
    label: "Shipped", 
    icon: Truck, 
    color: "border-purple-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
    description: "On the way to customer"
  },
  { 
    id: "DELIVERED", 
    label: "Delivered", 
    icon: CheckCircle, 
    color: "border-green-600",
    bgColor: "bg-green-600/10",
    textColor: "text-green-600",
    description: "Completed orders"
  },
];

export default function PipelinePage() {
  const router = useRouter();
  const { user, loading: authLoading, canAccessAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getOrdersByStage = (stageId: string) => {
    return orders.filter(order => order.status === stageId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status)).length;

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
              <Link href="/admin" className="text-text-secondary hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/pipeline" className="text-white font-medium">
                Pipeline
              </Link>
              <Link href="/admin/orders" className="text-text-secondary hover:text-white">
                Orders
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading">Production Pipeline</h1>
            <p className="text-text-secondary mt-1">
              {activeOrders} active orders • {totalOrders} total
            </p>
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
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {pipelineStages.map((stage, index) => {
              const stageOrders = getOrdersByStage(stage.id);
              const Icon = stage.icon;
              
              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  {/* Stage Header */}
                  <div className={cn("rounded-t-lg border-t-4 p-4 bg-dark", stage.color)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-5 h-5", stage.textColor)} />
                        <h3 className="font-heading">{stage.label}</h3>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        stage.bgColor, stage.textColor
                      )}>
                        {stageOrders.length}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">{stage.description}</p>
                  </div>

                  {/* Stage Content */}
                  <div className="bg-carbon rounded-b-lg p-3 min-h-[400px] space-y-3">
                    {stageOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Icon className="w-8 h-8 text-text-muted mx-auto mb-2" />
                        <p className="text-sm text-text-muted">No orders</p>
                      </div>
                    ) : (
                      stageOrders.map((order) => {
                        const itemCount = Array.isArray(order.designData) ? order.designData.length : 0;
                        
                        return (
                          <Link key={order.id} href={`/admin/orders/${order.id}`}>
                            <Card className="hover:border-accent/50 transition-colors cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <span className="font-mono text-sm font-medium text-accent">
                                    {order.orderNumber}
                                  </span>
                                  <ArrowRight className="w-4 h-4 text-text-muted" />
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-text-secondary">
                                    <User className="w-3 h-3" />
                                    <span className="truncate">
                                      {order.customerName || order.customerEmail || "Guest"}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-text-muted">
                                    <Package className="w-3 h-3" />
                                    <span>{order.caseName || "Custom Case"}</span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs text-text-muted">
                                    <span>{itemCount} cutout{itemCount !== 1 ? "s" : ""}</span>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })
                    )}
                  </div>

                  {/* Connector Arrow */}
                  {index < pipelineStages.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-2 transform -translate-y-1/2">
                      <ArrowRight className="w-4 h-4 text-text-muted" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Cancelled Column */}
            <div className="flex-shrink-0 w-80">
              <div className="rounded-t-lg border-t-4 border-red-500 p-4 bg-dark">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <h3 className="font-heading">Cancelled</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                    {getOrdersByStage("CANCELLED").length}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">Cancelled orders</p>
              </div>
              <div className="bg-carbon rounded-b-lg p-3 min-h-[400px] space-y-3">
                {getOrdersByStage("CANCELLED").length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No cancelled orders</p>
                  </div>
                ) : (
                  getOrdersByStage("CANCELLED").map((order) => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`}>
                      <Card className="hover:border-accent/50 transition-colors cursor-pointer opacity-60">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                            <ArrowRight className="w-4 h-4 text-text-muted" />
                          </div>
                          <p className="text-sm text-text-muted truncate">
                            {order.customerName || order.customerEmail || "Guest"}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {!loading && orders.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {pipelineStages.map((stage) => {
              const count = getOrdersByStage(stage.id).length;
              const Icon = stage.icon;
              return (
                <Card key={stage.id}>
                  <CardContent className="p-4 text-center">
                    <Icon className={cn("w-6 h-6 mx-auto mb-2", stage.textColor)} />
                    <p className="text-2xl font-heading">{count}</p>
                    <p className="text-xs text-text-muted">{stage.label}</p>
                  </CardContent>
                </Card>
              );
            })}
            <Card>
              <CardContent className="p-4 text-center">
                <XCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-heading">{getOrdersByStage("CANCELLED").length}</p>
                <p className="text-xs text-text-muted">Cancelled</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
