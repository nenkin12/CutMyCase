"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/providers/auth-provider";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const { user, loading, canAccessAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-carbon animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-[4px] transition-colors"
      >
        <User className="w-4 h-4" />
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-[4px] hover:bg-carbon transition-colors"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-[4px] shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>

          <div className="py-1">
            {canAccessAdmin && (
              <Link
                href="/admin/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-dark transition-colors"
              >
                <Settings className="w-4 h-4 text-accent" />
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-dark transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-text-muted" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
