# Firestore Schema

## Collections

`users`, `addresses`, `products`, `orders`, `coupons`, `delivery_zones`, `message_threads`, `messages`, `likes`, `comments`, `ratings`, `wishlists`, `return_requests`, `banners`, `audit_logs`, `notification_logs`.

Shared TypeScript contracts live in `packages/types/src/index.ts`.

## Security model

- Products, active banners, published comments and published ratings are publicly readable.
- User-owned documents are readable only by the authenticated owner.
- Support threads/messages are readable by the customer that owns the thread and admins.
- Client writes are disabled for all collections; mutations go through the Express API/Admin SDK.
- Coupons, delivery zones and audit logs are not directly readable by clients.
- A deny-all wildcard rule protects future collections.

## Query/index guidance

The checked-in `firestore/firestore.indexes.json` covers catalogue filters/sorts, customer/admin order views, moderation lists, and support thread queues. Firestore can request additional indexes when a new compound query is introduced; add only the generated requirement after reviewing it.

## Integrity rules

Server-side services must validate product price, stock, coupon eligibility, delivery zone and address ownership at checkout. Inventory deduction and order creation are performed in one Firestore transaction.
