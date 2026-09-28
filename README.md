# Threads — full-stack store

A production-shaped e-commerce site for **Threads** (women's & kids' clothing,
Bahria Phase 8, Rawalpindi): Vue 3 storefront + admin panel, Node/Express API,
MongoDB Atlas (free tier) for data, Cloudinary (free tier) for product photos,
and Stripe Checkout for card payments alongside cash on delivery.

```
threads-store/
├── backend/     Express API (MongoDB, JWT auth, Cloudinary, Stripe)
└── frontend/    Vue 3 + Vite storefront and admin panel
```

## Why this stack, and what's free

You asked for a free database that can also handle product pictures. Two
things to know:

1. **MongoDB Atlas's free M0 cluster** (512 MB) is genuinely free forever,
   not a trial — plenty of room for products, orders, and admin accounts.
2. **You should not store the actual image files inside MongoDB.** Images
   are stored on **Cloudinary** (also free — 25 GB storage / 25 GB bandwidth
   a month, no card required), and MongoDB just stores the image *URL*.
   This is the standard, correct pattern — storing binary images in a
   document database bloats it fast and is slow to serve.

Both are 100% free to start, no credit card needed for Atlas or Cloudinary.

## 1. Set up your free services (10 minutes)

1. **MongoDB Atlas**: create a free account at mongodb.com/cloud/atlas →
   create an M0 (free) cluster → add a database user → under Network
   Access, allow access from anywhere (`0.0.0.0/0`) for now → copy your
   connection string.
2. **Cloudinary**: create a free account at cloudinary.com → your
   dashboard shows your Cloud Name, API Key, and API Secret directly.
3. **Stripe**: create a free account at stripe.com → toggle "Test mode" →
   Developers → API keys → copy your test secret key. You can launch
   with just Cash on Delivery and add real Stripe keys later; test mode
   costs nothing and lets you rehearse the full card-payment flow first.

## 2. Backend setup

```bash
cd backend
cp .env.example .env     # then fill in your Atlas/Cloudinary/Stripe values
npm install
npm run seed:admin       # creates your first admin login from .env
npm run dev               # http://localhost:5000
```

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

Visit `http://localhost:5173` for the storefront and
`http://localhost:5173/admin/login` for the admin panel (log in with the
email/password you set in `backend/.env` before seeding).

## Adding your 169 products

`backend/scripts/importProducts.js` bulk-imports directly from your stock
sheet (.xlsx or .csv) instead of retyping 169 products by hand.

```bash
cd backend
npm run import:products -- /path/to/your/sheet.xlsx --dry-run   # preview first, writes nothing
npm run import:products -- /path/to/your/sheet.xlsx              # then run for real
```

It's pre-wired for a sheet with **Barcode / Product Name / Category / Price
/ Stock / Size / Color / Description** columns, and maps category text
like "Ladies Unstitched" or "Girls Collection" onto this app's category
list automatically. Your sheet's real headers are almost certainly worded
differently — open `COLUMN_MAP` and `CATEGORY_RULES` near the top of the
script and adjust the right-hand values to match your actual column
headers exactly (matching is case-insensitive). Always run with
`--dry-run` first — it prints every row it would import, and lists any
rows it had to skip (missing barcode, bad price, etc.) — before importing
for real. Share the sheet or just its header row with me any time and I'll
edit the mapping for you directly instead.

## Deploying for free

- **Backend**: Render.com free web service, or Railway's free trial —
  point it at the same `.env` values.
- **Frontend**: Vercel or Netlify free tier — set `VITE_API_URL` to your
  deployed backend's URL.
- Update `CLIENT_URL` in the backend `.env` to your deployed frontend URL
  (needed for Stripe's redirect and CORS).

## Notes on how it's built

- **Auth**: JWT-based admin login (`bcryptjs` + `jsonwebtoken`). There's no
  customer login — checkout is guest-only, which fits COD-first retail and
  keeps friction low.
- **Stock**: each product either has a single `totalStock` count, or (for
  products with sizes/colors) per-variant stock. Placing an order
  decrements stock automatically; Stripe orders only decrement once the
  webhook confirms payment, so an abandoned card checkout never locks up
  inventory.
- **Design**: a warm parchment ground, ink type, and a single indigo
  accent (kept out of the terracotta/cream look that's become the generic
  "AI-built site" tell) — Fraunces for headlines, Inter for everything
  else, editorial-catalog layout rather than rounded SaaS cards.
