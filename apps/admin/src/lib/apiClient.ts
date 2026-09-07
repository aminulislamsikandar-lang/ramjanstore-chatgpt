import { getAuth } from "firebase/auth";
import "../firebase";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";
export async function apiClient<T>(path:string, options:RequestInit={}):Promise<T>{const user=getAuth().currentUser;const token=user?await user.getIdToken():undefined;const r=await fetch(`${API_URL}${path}`,{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{}) ,...(options.headers??{})}});if(!r.ok){const b=await r.json().catch(()=>null) as {error?:{message?:string};message?:string}|null;throw new Error(b?.error?.message??b?.message??"Request failed")}return r.json() as Promise<T>}
