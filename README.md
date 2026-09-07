# RamjanStore

Hyperlocal e-commerce platform for Clothes, Gas, Rice and Agriculture Products.

## Repository layout

- `apps/storefront` — customer React/Vite web app
- `apps/admin` — isolated admin React/Vite web app
- `backend` — Node.js + Express + Firebase Admin API
- `packages/types` — shared TypeScript domain contracts
- `packages/validation` — shared Zod validation schemas
- `firestore` — rules and composite indexes
- `docs` — architecture, security and deployment notes

## Local development

```bash
npm install
npm run dev:backend
npm run dev:storefront
npm run dev:admin
```

Backend environment variables are documented in `.env.example`. Never commit real Firebase or Cloudinary secrets.

## Current foundation

- Firebase Admin initialization
- Cloudinary signed-upload foundation
- Strict Firestore client security rules
- Firestore composite indexes
- Express production middleware stack
- Centralized typed error handling
- Shared domain types and Zod validation
- Separate storefront/admin application shells

## API

Health check: `GET /api/v1/health`

Upload signatures are protected admin endpoints under `/api/v1/uploads/*`.

## Architecture principle

The browser is untrusted. The Express API is authoritative for prices, stock, coupons, delivery charges, order creation, refunds and administrative mutations. Firestore transactions are required for stock deduction during checkout.
