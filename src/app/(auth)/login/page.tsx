import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-radial">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="CutMyCase" className="w-10 h-10 rounded" />
          </Link>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            User accounts will be available when we integrate with Shopify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-text-secondary text-sm text-center">
            For now, you can use our design tool without an account.
          </p>
          <Link href="/upload" className="block">
            <Button className="w-full">
              Design Custom Foam
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="secondary" className="w-full">
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
