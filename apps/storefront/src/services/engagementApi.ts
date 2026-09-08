import type { Product } from "@ramjanstore/types";
import { apiClient } from "../lib/apiClient";

type WishlistToggle = { liked?: boolean; wishlisted?: boolean };
type WishlistResponse = { data?: Product[]; items?: Product[] };

export const engagementApi = {
  wishlist: (id: string) => apiClient<WishlistToggle>(`/wishlist/${id}/toggle`, { method: "POST" }),
  like: (id: string) => apiClient<{ liked: boolean }>(`/likes/${id}/toggle`, { method: "POST" }),
  rating: (id: string, stars: number, text: string) => apiClient<{ id: string }>(`/ratings/${id}`, { method: "POST", body: JSON.stringify({ stars, text }) }),
  comment: (id: string, text: string, parentCommentId?: string) => apiClient<{ id: string }>(`/comments/${id}`, { method: "POST", body: JSON.stringify({ text, parentCommentId }) }),
  wishlistItems: async () => { const r = await apiClient<WishlistResponse>("/wishlist"); return { data: r.data ?? r.items ?? [] }; },
};
