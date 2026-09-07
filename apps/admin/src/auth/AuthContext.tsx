import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, onIdTokenChanged, type User } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = getApps().length ? getApps()[0] : initializeApp(config);
const auth = getAuth(app);
type AuthValue={user:User|null;loading:boolean;token:string|null};
const AuthContext=createContext<AuthValue>({user:null,loading:true,token:null});
export function AuthProvider({children}:{children:ReactNode}){const [user,setUser]=useState<User|null>(null);const [loading,setLoading]=useState(true);const [token,setToken]=useState<string|null>(null);useEffect(()=>onIdTokenChanged(auth,async u=>{setUser(u);setToken(u?await u.getIdToken():null);setLoading(false)}),[]);const value=useMemo(()=>({user,loading,token}),[user,loading,token]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export function useAuth(){return useContext(AuthContext)}
