"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { signInWithGoogle as fbSignInWithGoogle, signOut as fbSignOut, onAuthChange } from "../app/firebase";

type User = null | {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
};

type AuthContextValue = {
  user: User;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (u) {
        setUser({ uid: u.uid, displayName: u.displayName, photoURL: u.photoURL, email: u.email });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function signInWithGoogle() {
    setLoading(true);
    await fbSignInWithGoogle();
    setLoading(false);
  }

  async function signOut() {
    setLoading(true);
    await fbSignOut();
    setLoading(false);
  }

  return <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
