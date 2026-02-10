"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Check } from "lucide-react";

const benefits = [
  "AI-powered foam design from photos",
  "Precision CNC cutting",
  "Track your orders",
  "Save your designs",
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn("resend", {
        email,
        callbackUrl: "/",
        redirect: false,
      });
      setEmailSent(true);
    } catch {
      console.error("Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    signIn("google", { callbackUrl: "/" });
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-radial">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We sent a magic link to <strong className="text-white">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-text-secondary text-sm mb-6">
              Click the link in your email to create your account. The link will expire in 24 hours.
            </p>
            <Button
              variant="secondary"
              onClick={() => setEmailSent(false)}
              className="w-full"
            >
              Try a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <Link href="/" className="flex items-center justify-center gap-2 mb-4 md:hidden">
              <div className="w-10 h-10 bg-accent rounded-[2px] flex items-center justify-center">
                <span className="text-white font-heading text-xl">C</span>
              </div>
            </Link>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Get started with your free account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleGoogleRegister}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-text-muted">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleEmailRegister} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                <Mail className="w-4 h-4 mr-2" />
                Continue with Email
              </Button>
            </form>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>

            <p className="text-center text-xs text-text-muted">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-text-secondary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-text-secondary">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
