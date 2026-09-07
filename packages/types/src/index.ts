export type ID = string;
export type ProductCategory = "clothes" | "gas" | "rice" | "agriculture";
export type GasBrand = "indane" | "hp" | "bharat";
export type UserRole = "customer" | "owner" | "staff";
export type OrderStatus = "new" | "confirmed" | "preparing" | "ready_for_delivery" | "out_for_delivery" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "upi";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type ReturnRequestStatus = "requested" | "approved" | "rejected" | "pickup_pending" | "received" | "refunded" | "closed";
export type NotificationChannel = "in_app" | "sms" | "whatsapp";

export interface TimestampLike { seconds: number; nanoseconds: number; }
export interface BaseDocument { id: ID; createdAt: TimestampLike; updatedAt: TimestampLike; }

export interface Address extends BaseDocument {
  userId: string; label: "home" | "work" | "other"; fullName: string; phoneNumber: string;
  addressLine1: string; addressLine2?: string; landmark?: string; city: string; state: string; postalCode: string;
  latitude?: number; longitude?: number; deliveryZoneId?: string; isDefault: boolean;
}

export interface User extends BaseDocument {
  phoneNumber: string | null; displayName: string; email?: string | null; photoURL?: string | null;
  role: UserRole; isActive: boolean; isBlocked: boolean; defaultAddressId?: string | null;
  stats: { totalOrders: number; totalSpent: number }; lastLoginAt?: TimestampLike | null;
}

export interface ProductImage { publicId: string; secureUrl: string; width?: number; height?: number; altText?: string; }
export interface ProductVariant {
  id: string; name: string; sku: string; price: number; compareAtPrice?: number;
  stockQuantity: number; lowStockThreshold: number; attributes?: Record<string, string>;
}
export interface Product extends BaseDocument {
  name: string; slug: string; description: string; category: ProductCategory; subcategory?: string; brand?: string;
  gasBrand?: GasBrand; sku: string; price: number; compareAtPrice?: number; stockQuantity: number;
  lowStockThreshold: number; images: ProductImage[]; variants?: ProductVariant[]; tags: string[];
  isActive: boolean; isFeatured: boolean; ratingSummary: { average: number; count: number };
  engagement: { likeCount: number; commentCount: number }; seo?: { title?: string; description?: string };
}

export interface OrderItemSnapshot {
  productId: string; name: string; sku: string; image?: string; quantity: number; unitPrice: number; subtotal: number;
  variantId?: string; variantName?: string;
}
export interface OrderAddressSnapshot {
  fullName: string; phoneNumber: string; addressLine1: string; addressLine2?: string; landmark?: string;
  city: string; state: string; postalCode: string; deliveryZoneId?: string;
}
export interface OrderStatusHistory { status: OrderStatus; changedAt: TimestampLike; changedBy: string; note?: string; }
export interface Order extends BaseDocument {
  orderNumber: string; userId?: string | null; isGuest: boolean; items: OrderItemSnapshot[];
  subtotal: number; discount: number; deliveryCharge: number; totalAmount: number; currency: "INR";
  coupon?: { couponId: string; code: string; discountAmount: number } | null; deliveryAddress: OrderAddressSnapshot;
  status: OrderStatus; statusHistory: OrderStatusHistory[];
  payment: { method: PaymentMethod; status: PaymentStatus; transactionId?: string | null };
  customerNote?: string; cancellation?: { cancelledAt: TimestampLike; cancelledBy: "customer" | "admin"; reason: string };
  deliveredAt?: TimestampLike | null; returnWindowEndsAt?: TimestampLike | null;
}

export interface Coupon extends BaseDocument {
  code: string; description?: string; discountType: "percentage" | "fixed"; discountValue: number;
  maximumDiscount?: number; minimumOrderValue?: number; maximumUses?: number; usedCount: number; perUserLimit?: number;
  applicableCategories?: ProductCategory[]; applicableProductIds?: string[]; startsAt: TimestampLike; expiresAt: TimestampLike;
  isActive: boolean; firstOrderOnly?: boolean;
}
export interface DeliveryZone extends BaseDocument {
  name: string; postalCodes: string[]; cities?: string[]; deliveryCharge: number; freeDeliveryAbove?: number;
  minimumOrderValue?: number; estimatedDeliveryMinutes?: number; isActive: boolean;
}
export interface Wishlist extends BaseDocument { userId: string; productIds: string[]; }
export interface ProductLike extends BaseDocument { productId: string; userId: string; }
export interface Rating extends BaseDocument {
  productId: string; userId: string; orderId: string; rating: 1 | 2 | 3 | 4 | 5; review?: string;
  isVerifiedPurchase: true; isPublished: boolean; moderatedBy?: string; moderatedAt?: TimestampLike;
}
export interface Comment extends BaseDocument {
  productId: string; userId: string; content: string; parentCommentId?: string | null; depth: 0 | 1;
  isPublished: boolean; isDeleted: boolean; moderatedBy?: string; moderatedAt?: TimestampLike;
}
export interface MessageThread extends BaseDocument {
  userId: string; orderId?: string | null; subject?: string; status: "open" | "closed"; lastMessageAt?: TimestampLike;
  lastMessagePreview?: string; unreadForCustomer: number; unreadForAdmin: number; assignedAdminId?: string | null;
}
export interface Message extends BaseDocument {
  threadId: string; senderId: string; senderRole: "customer" | "owner" | "staff"; body: string;
  attachments?: { url: string; type: string; name?: string }[]; readBy: string[]; isDeleted: boolean;
}
export interface ReturnRequest extends BaseDocument {
  orderId: string; userId: string; items: { productId: string; quantity: number; reason: string }[];
  reason: string; status: ReturnRequestStatus; customerNote?: string; adminNote?: string; refundAmount?: number;
  requestedAt: TimestampLike; resolvedAt?: TimestampLike;
}
export interface Banner extends BaseDocument {
  title: string; subtitle?: string; image: { publicId: string; secureUrl: string };
  link?: { type: "product" | "category" | "external"; value: string }; position: number;
  startsAt?: TimestampLike; expiresAt?: TimestampLike; isActive: boolean; seoAltText?: string;
}
export interface AuditLog extends BaseDocument {
  actorId: string; actorRole: "owner" | "staff"; action: string; resourceType: string; resourceId: string;
  before?: Record<string, unknown>; after?: Record<string, unknown>; metadata?: Record<string, unknown>;
  ipAddress?: string; userAgent?: string;
}
export interface NotificationLog extends BaseDocument {
  userId: string; type: string; title: string; body: string; channel: NotificationChannel; status: "pending" | "sent" | "failed";
  relatedOrderId?: string; sentAt?: TimestampLike; failureReason?: string;
}
