import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAuth, onIdTokenChanged, signOut as firebaseSignOut, type User as FirebaseUser } from "firebase/auth";
import { firebaseApp } from "../lib/firebase";
import { apiFetch } from "../lib/api";

interface AuthContextValue { user: FirebaseUser | null; loading: boolean; signOut: () => Promise<void>; syncProfile: (input?: { displayName?: string; photoURL?: string | null }) => Promise<unknown>; }
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = getAuth(firebaseApp); const [user, setUser] = useState<FirebaseUser | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => onIdTokenChanged(auth, (next) => { setUser(next); setLoading(false); }), [auth]);
  const value = useMemo(() => ({ user, loading, signOut: () => firebaseSignOut(auth), syncProfile: (input = {}) => apiFetch("/auth/sync", { method: "POST", body: JSON.stringify(input) }) }), [user, loading, auth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside AuthProvider"); return context; }
