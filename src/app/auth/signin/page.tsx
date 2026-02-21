"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already signed in
  if (user) {
    router.push("/");
    return null;
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      const errorCode = (err as { code?: string })?.code || "";

      // Handle specific Firebase auth errors
      if (errorCode === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed. Please try again.");
      } else if (errorCode === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please allow popups for this site.");
      } else if (errorCode === "auth/cancelled-popup-request") {
        setError("Sign-in was cancelled. Please try again.");
      } else if (errorCode === "auth/unauthorized-domain") {
        setError("This domain is not authorized for sign-in. Please contact support.");
      } else if (errorMessage.includes("unauthorized-domain")) {
        setError("This domain is not authorized for sign-in. Please contact support.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      // Make error messages more user-friendly
      if (message.includes("auth/invalid-email")) {
        setError("Invalid email address");
      } else if (message.includes("auth/wrong-password")) {
        setError("Incorrect password");
      } else if (message.includes("auth/user-not-found")) {
        setError("No account found with this email");
      } else if (message.includes("auth/email-already-in-use")) {
        setError("An account already exists with this email");
      } else if (message.includes("auth/weak-password")) {
        setError("Password should be at least 6 characters");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-[4px] p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-heading text-accent">CUTMYCASE</h1>
            </Link>
            <p className="text-text-secondary mt-2">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-[4px] text-error text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 mb-6"
            size="lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-text-muted">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-dark border border-border rounded-[4px] focus:outline-none focus:border-accent"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-dark border border-border rounded-[4px] focus:outline-none focus:border-accent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full" variant="secondary">
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-text-muted hover:text-accent"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-text-muted hover:text-accent">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
