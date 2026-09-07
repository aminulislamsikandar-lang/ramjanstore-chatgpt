# RamjanStore Architecture

## Surfaces

- `apps/storefront`: customer-facing React/Vite application.
- `apps/admin`: isolated admin React/Vite application.
- `backend`: Node.js/Express API and privileged business logic.
- `packages/types`: shared domain contracts.
- `packages/validation`: shared Zod request schemas.

## Trust boundaries

The browser is untrusted. Firebase client authentication supplies an ID token; Express verifies it before protected operations. The Firebase Admin SDK is used only on the server. Client-side Firestore writes are disabled for operational collections.

## Data ownership

Firestore is the system of record. Products, orders, coupons, delivery zones, support threads, reviews, returns, banners, audit logs, and notification logs are top-level collections. Orders store immutable product and address snapshots so historical orders do not change when catalogue data changes.

## Inventory

Order creation must validate prices, coupon rules, delivery zone, and stock on the server and deduct stock inside a Firestore transaction. The client never supplies authoritative totals or stock values.

## Media

Cloudinary stores product and banner media. The backend signs uploads and restricts folders to `ramjanstore/products` and `ramjanstore/banners`.

## Authentication

Customers use Firebase Phone OTP. Admins use Firebase Email/Password plus MFA and custom claims (`owner` or `staff`). Authorization is enforced server-side on every administrative operation.

## Realtime

Use Firestore `onSnapshot` selectively for customer order status, notification counts, and support threads. Avoid broad listeners for high-volume collections.

## Payments

COD is the required v1 payment method. UPI should be implemented behind a provider interface so gateway-specific code does not leak into order logic.
