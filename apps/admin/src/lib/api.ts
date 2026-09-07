const baseURL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:5000/api/v1";
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("ramjanstore_admin_id_token");
  const response = await fetch(`${baseURL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const body = await response.json().catch(() => null) as { success?: boolean; data?: T; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(body?.error?.message ?? `Request failed with status ${response.status}`);
  return (body?.data ?? body) as T;
}
