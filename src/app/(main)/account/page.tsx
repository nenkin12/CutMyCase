import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Order, Upload, OrderItem } from "@prisma/client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { User, Package, LogOut, Clock, Truck, CheckCircle } from "lucide-react";

async function getAccountData(userId: string) {
  const [orders, uploads] = await Promise.all([
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: true,
      },
    }),
    db.upload.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    orders: orders as (Order & { items: OrderItem[] })[],
    uploads: uploads as Upload[],
  };
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  PAID: <CheckCircle className="w-4 h-4" />,
  PROCESSING: <Package className="w-4 h-4" />,
  SHIPPED: <Truck className="w-4 h-4" />,
  DELIVERED: <CheckCircle className="w-4 h-4" />,
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const { orders, uploads } = await getAccountData(session.user.id);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-accent" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-heading">
                  {session.user.name || "Welcome"}
                </h1>
                <p className="text-text-secondary">{session.user.email}</p>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="secondary" type="submit">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent" />
                  Recent Orders
                </CardTitle>
                <Link href="/account/orders" className="text-accent text-sm hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {order.orderNumber}
                          </div>
                          <div className="text-xs text-text-muted">
                            {order.items.length} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-heading text-sm">
                            {formatPrice(order.total)}
                          </div>
                          <Badge
                            variant={
                              order.status === "DELIVERED"
                                ? "success"
                                : order.status === "SHIPPED"
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1"
                          >
                            {statusIcons[order.status]}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-text-muted mx-auto mb-2" />
                    <p className="text-text-secondary">No orders yet</p>
                    <Link href="/cases" className="text-accent text-sm hover:underline">
                      Browse cases
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent" />
                  Your Designs
                </CardTitle>
                <Link href="/upload" className="text-accent text-sm hover:underline">
                  New design
                </Link>
              </CardHeader>
              <CardContent>
                {uploads.length > 0 ? (
                  <div className="space-y-4">
                    {uploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="flex items-center gap-4 py-2 border-b border-border last:border-0"
                      >
                        <div className="w-12 h-12 bg-carbon rounded-[4px] overflow-hidden flex-shrink-0">
                          <img
                            src={upload.originalUrl}
                            alt="Upload"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {upload.gearType || "Custom Design"}
                          </div>
                          <div className="text-xs text-text-muted">
                            {new Date(upload.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge
                          variant={
                            upload.status === "PROCESSED"
                              ? "success"
                              : upload.status === "PROCESSING"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {upload.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-text-muted mx-auto mb-2" />
                    <p className="text-text-secondary">No designs yet</p>
                    <Link href="/upload" className="text-accent text-sm hover:underline">
                      Create your first design
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <Link href="/upload">
              <div className="bg-gradient-to-r from-accent/20 to-accent/5 rounded-[4px] p-6 border border-accent/30 hover:border-accent/50 transition-colors">
                <h3 className="font-heading text-xl mb-2">
                  Create New Design
                </h3>
                <p className="text-text-secondary text-sm">
                  Upload your gear and get a custom foam layout
                </p>
              </div>
            </Link>
            <Link href="/cases">
              <div className="bg-carbon rounded-[4px] p-6 border border-border hover:border-accent/50 transition-colors">
                <h3 className="font-heading text-xl mb-2">Browse Cases</h3>
                <p className="text-text-secondary text-sm">
                  Find the perfect case for your gear
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
