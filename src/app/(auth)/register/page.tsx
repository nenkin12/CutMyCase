import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";

const benefits = [
  "AI-powered foam design from photos",
  "Precision CNC cutting",
  "Track your orders",
  "Save your designs",
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-radial">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Benefits */}
        <div className="hidden md:block space-y-8">
          <div>
            <h1 className="text-4xl font-heading mb-4">
              Precision Foam, <span className="text-accent">Perfectly Cut</span>
            </h1>
            <p className="text-text-secondary">
              Join thousands of professionals who trust CutMyCase for their custom foam inserts.
            </p>
          </div>

          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <span className="text-text-secondary">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <Card>
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
    </div>
  );
}
