import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import type { Order, User, OrderItem } from "@prisma/client";

export const dynamic = "force-dynamic";

type OrderWithRelations = Order & {
  user: User | null;
  items: OrderItem[];
};

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  PROCESSING: "default",
  SHIPPED: "secondary",
  DELIVERED: "success",
  CANCELLED: "error",
};

async function getOrders(page: number = 1, status?: string) {
  const take = 20;
  const skip = (page - 1) * take;

  const where = status ? { status: status as Order["status"] } : {};

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: true,
      },
      take,
      skip,
    }),
    db.order.count({ where }),
  ]);

  return {
    orders: orders as OrderWithRelations[],
    total,
    pages: Math.ceil(total / take),
    page,
  };
}

interface OrdersPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const status = params.status;
  const { orders, total, pages } = await getOrders(page, status);

  const statuses = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading">Orders</h1>
          <div className="text-text-secondary">
            {total} total orders
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/admin/orders">
            <Button
              variant={!status ? "default" : "secondary"}
              size="sm"
            >
              All
            </Button>
          </Link>
          {statuses.map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}`}>
              <Button
                variant={status === s ? "default" : "secondary"}
                size="sm"
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </Button>
            </Link>
          ))}
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-text-secondary text-sm">
                      <th className="pb-3 font-medium">Order</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Items</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-carbon/50">
                        <td className="py-4">
                          <span className="font-medium">{order.orderNumber}</span>
                        </td>
                        <td className="py-4">
                          <div>
                            <div className="font-medium">
                              {order.user?.name || "Guest"}
                            </div>
                            <div className="text-sm text-text-muted">
                              {order.user?.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-text-secondary">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-4 font-heading">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-4">
                          <Badge variant={statusColors[order.status]}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-text-secondary text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <div className="text-sm text-text-secondary">
                  Page {page} of {pages}
                </div>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/orders?page=${page - 1}${status ? `&status=${status}` : ""}`}
                    >
                      <Button variant="secondary" size="sm">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                    </Link>
                  )}
                  {page < pages && (
                    <Link
                      href={`/admin/orders?page=${page + 1}${status ? `&status=${status}` : ""}`}
                    >
                      <Button variant="secondary" size="sm">
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
