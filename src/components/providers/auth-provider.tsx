"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Role-based access
export type UserRole = "admin" | "fulfillment" | "user";

// Admin - full access to everything
export const ADMIN_EMAILS = [
  "nukicben@gmail.com",
];

// Fulfillment - can view/manage orders and pipeline
export const FULFILLMENT_EMAILS = [
  "rentzind@gmail.com",
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isFulfillment: boolean;
  canAccessAdmin: boolean; // Admin OR Fulfillment
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: "user",
  isAdmin: false,
  isFulfillment: false,
  canAccessAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
  const isFulfillment = user?.email ? FULFILLMENT_EMAILS.includes(user.email) : false;
  const canAccessAdmin = isAdmin || isFulfillment;

  const role: UserRole = isAdmin ? "admin" : isFulfillment ? "fulfillment" : "user";

  return (
    <AuthContext.Provider value={{ user, loading, role, isAdmin, isFulfillment, canAccessAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
