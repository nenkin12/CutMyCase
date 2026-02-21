import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default function OrderDetailPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-heading mb-4">Coming Soon</h1>
        <p className="text-text-secondary mb-6">
          Order details will be available with Shopify integration.
        </p>
        <Link href="/admin/orders">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}
