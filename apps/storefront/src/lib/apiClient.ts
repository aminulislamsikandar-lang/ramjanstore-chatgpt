import { getAuth } from "firebase/auth";
import "../firebase";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuth().currentUser ? await getAuth().currentUser!.getIdToken() : undefined;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string }; message?: string } | null;
    throw new Error(body?.error?.message ?? body?.message ?? "Request failed");
  }
  return response.json() as Promise<T>;
}
