import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAuth, onIdTokenChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from "firebase/auth";
import { firebaseApp } from "../lib/firebase";

interface AdminAuthValue { user: User | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signOut: () => Promise<void>; }
const Context = createContext<AdminAuthValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) { const auth = getAuth(firebaseApp); const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>onIdTokenChanged(auth, async next=>{ setUser(next); if(next) localStorage.setItem("ramjanstore_admin_id_token", await next.getIdToken()); else localStorage.removeItem("ramjanstore_admin_id_token"); setLoading(false); }),[auth]);
 const value=useMemo(()=>({user,loading,signIn:async(email:string,password:string)=>{await signInWithEmailAndPassword(auth,email,password);},signOut:()=>firebaseSignOut(auth)}),[user,loading,auth]); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useAdminAuth(){const value=useContext(Context);if(!value)throw new Error("useAdminAuth must be used inside AuthProvider");return value;}
