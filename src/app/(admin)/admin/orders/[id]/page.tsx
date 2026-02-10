import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Download,
  Clock
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  PROCESSING: "default",
  SHIPPED: "secondary",
  DELIVERED: "success",
  CANCELLED: "error",
};

async function getOrder(id: string) {
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: true,
      shippingAddress: true,
      items: {
        include: {
          product: true,
          foamOption: true,
          upload: true,
        },
      },
      shopJobs: true,
    },
  });

  return order;
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

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
              <Link href="/admin" className="text-text-secondary hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/orders" className="text-accent">
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
        {/* Back Button */}
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading mb-2">{order.orderNumber}</h1>
            <div className="flex items-center gap-4 text-text-secondary">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(order.createdAt).toLocaleString()}
              </span>
              <Badge variant={statusColors[order.status]}>
                {order.status}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-heading">{formatPrice(order.total)}</div>
            {order.paidAt && (
              <div className="text-sm text-success">
                Paid on {new Date(order.paidAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            {item.product?.name || "Custom Foam Insert"}
                          </h4>
                          {item.foamOption && (
                            <p className="text-sm text-text-secondary">
                              Foam: {item.foamOption.name}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                            <span>Qty: {item.quantity}</span>
                            <span>Unit: {formatPrice(item.unitPrice)}</span>
                            {item.isCustomCut && (
                              <Badge variant="secondary">Custom Cut</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-heading">{formatPrice(item.totalPrice)}</div>
                        </div>
                      </div>

                      {/* Upload Info */}
                      {item.upload && (
                        <div className="mt-4 p-3 bg-carbon rounded-[4px]">
                          <div className="text-sm text-text-secondary mb-2">
                            Custom Cut File
                          </div>
                          <div className="flex items-center gap-4">
                            {item.upload.originalUrl && (
                              <img
                                src={item.upload.originalUrl}
                                alt="Upload preview"
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <Badge variant={item.upload.status === "APPROVED" ? "success" : "warning"}>
                                {item.upload.status}
                              </Badge>
                              {item.upload.outlineDxfUrl && (
                                <a
                                  href={item.upload.outlineDxfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 mt-2 text-sm text-accent hover:underline"
                                >
                                  <Download className="w-4 h-4" />
                                  Download DXF
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-border space-y-2">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <div className="flex justify-between font-heading text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Production Jobs */}
            {order.shopJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Production Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.shopJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 bg-carbon rounded-[4px]"
                      >
                        <div>
                          <Badge variant={statusColors[job.status] || "default"}>
                            {job.status}
                          </Badge>
                          {job.notes && (
                            <p className="text-sm text-text-muted mt-1">{job.notes}</p>
                          )}
                        </div>
                        <Link href="/admin/queue">
                          <Button variant="secondary" size="sm">
                            View in Queue
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.user ? (
                  <div>
                    <div className="font-medium">{order.user.name || "No name"}</div>
                    <div className="text-text-secondary">{order.user.email}</div>
                  </div>
                ) : (
                  <div className="text-text-muted">Guest checkout</div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-text-secondary space-y-1">
                    <div>{order.shippingAddress.name}</div>
                    <div>{order.shippingAddress.line1}</div>
                    {order.shippingAddress.line2 && (
                      <div>{order.shippingAddress.line2}</div>
                    )}
                    <div>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zip}
                    </div>
                    <div>{order.shippingAddress.country}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Status</span>
                    <Badge variant={order.status === "PAID" || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED" ? "success" : "warning"}>
                      {order.status === "PENDING" ? "Unpaid" : "Paid"}
                    </Badge>
                  </div>
                  {order.stripePaymentId && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Stripe ID</span>
                      <span className="font-mono text-xs">{order.stripePaymentId.slice(0, 20)}...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.status === "PAID" && (
                  <form action={`/api/admin/orders/${order.id}/process`} method="POST">
                    <Button type="submit" className="w-full">
                      Start Processing
                    </Button>
                  </form>
                )}
                {order.status === "PROCESSING" && (
                  <form action={`/api/admin/orders/${order.id}/ship`} method="POST">
                    <Button type="submit" className="w-full">
                      Mark as Shipped
                    </Button>
                  </form>
                )}
                {order.status === "SHIPPED" && (
                  <form action={`/api/admin/orders/${order.id}/deliver`} method="POST">
                    <Button type="submit" className="w-full">
                      Mark as Delivered
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
