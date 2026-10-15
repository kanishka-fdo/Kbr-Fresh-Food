# KBR Fresh Foods — Digital Transformation Platform

A full-stack web application for **KBR Fresh Foods** (Negombo, Sri Lanka) covering
retail e-commerce, delivery tracking with Google Maps, wholesale B2B ordering
(Keells / Food City / hotels / restaurants), and a business analytics dashboard.

Built to cover four project epics:
1. **Customer & Account Management** — registration, email verification, login, profiles, addresses
2. **Product & Inventory Management** — stock, categories, expiry tracking, low-stock alerts
3. **Order, Delivery & Google Maps** — cart, checkout, driver assignment, live route tracking
4. **Wholesale Supply & Business Analytics** — bulk quotes/approvals, sales trend, inventory forecast

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React (Vite), React Router, Tailwind CSS, Recharts, Axios |
| Backend    | Node.js, Express.js |
| Database   | MongoDB (Mongoose) |
| Auth       | JWT + bcrypt |
| Email      | Nodemailer (falls back to console logging if no SMTP is configured) |
| Maps       | Google Maps JavaScript API + Directions API |

---

## Project Structure

```
kbr-fresh-foods/
├── backend/          # Express + MongoDB REST API
│   ├── config/       # DB connection
│   ├── models/       # Mongoose schemas
│   ├── controllers/  # Route logic
│   ├── routes/       # Express routers
│   ├── middleware/    # JWT auth + role-based access control
│   ├── utils/        # Email, JWT helpers, seed script
│   └── server.js
└── frontend/          # React (Vite) client
    └── src/
        ├── api/       # Axios instance + service calls
        ├── context/   # Auth & Cart state
        ├── components/
        └── pages/     # customer/, staff/, admin/, driver/, wholesale/
```

---

## Opening this project in IntelliJ IDEA

1. Unzip this archive.
2. In IntelliJ: **File → Open** and select the unzipped `kbr-fresh-foods` folder (this opens both `backend` and `frontend` as one project).
3. IntelliJ will detect `package.json` in both folders — when prompted, let it configure Node.js interpreters for each. If not prompted, go to **Settings → Languages & Frameworks → Node.js** and confirm it's enabled for both folders.
4. Open a terminal panel in IntelliJ (Alt+F12) for each of the steps below — you'll run backend and frontend in two separate terminal tabs.

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set at minimum:
- `MONGO_URI` — a local MongoDB instance (`mongodb://127.0.0.1:27017/kbr_fresh_foods`) or a MongoDB Atlas connection string
- `JWT_SECRET` — any long random string

Email (`EMAIL_USER` / `EMAIL_PASS`) and Google Maps are optional for local dev — see the **Running without external services** section below.

**You'll need MongoDB running.** Options:
- Install MongoDB Community Server locally, or
- Use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste its connection string into `MONGO_URI`

Seed demo data (creates an admin, staff member, driver, customer, and an approved wholesale buyer, plus sample fruit & veg inventory):

```bash
npm run seed
```

This prints demo login credentials to the console when it finishes — use those to log in once the app is running.

Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default. Check `http://localhost:5000/api/health` to confirm it's up.

---

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:5173` by default and expects the backend at `http://localhost:5000/api` (configurable via `VITE_API_URL`).

---

## Running without external services (email & Google Maps)

This project is designed to work end-to-end even without real API keys, so you can demo it immediately:

- **No SMTP configured?** Verification and password-reset emails are printed to the backend console instead of being sent — copy the link from the terminal to continue.
- **No Google Maps API key?** Delivery-route views show a clear placeholder explaining the map isn't configured, without breaking checkout or order tracking.

To enable the real experience:
- Add Gmail/Mailtrap SMTP credentials to `backend/.env` (`EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`)
- Add a Google Maps JavaScript API key (with Directions API enabled) to `frontend/.env` as `VITE_GOOGLE_MAPS_API_KEY`

---

## Demo accounts (after running `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kbrfreshfoods.lk | Admin@123 |
| Staff | staff@kbrfreshfoods.lk | Staff@123 |
| Driver | driver@kbrfreshfoods.lk | Driver@123 |
| Customer | customer@example.com | Customer@123 |
| Wholesale (Keells demo) | procurement@keells-demo.lk | Keells@123 |

---

## What's new in this version

**Redesigned storefront** — the homepage now has a full landing-page layout inspired by professional grocery-supplier sites: a hero banner, a colorful "Shop by Category" grid, a "Why Choose Us" accordion with trust stats, and a footer with contact details — all built with Tailwind gradients and a consistent color system per food category (no external stock photos, so nothing ever breaks from a dead image link or licensing issue). Swap in real product photography later by populating the `images` array already present on the `Product` model and rendering it in `ProductCard.jsx`.

**Expanded catalog** — 8 categories (Fruits, Vegetables, Dairy & Eggs, Rice & Grains, Spices & Herbs, Bakery, Beverages, Seafood) and ~35 seeded products covering a full grocery range, not just fruit and veg. Staff can add further categories and products directly from **Staff → Inventory** in the app.

**Hardened backend security**:
- `helmet` — sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- `express-rate-limit` — throttles all API traffic (300 req/15min per IP) with a stricter limit on `/api/auth` (20 req/15min) to slow credential-stuffing attempts
- `express-mongo-sanitize` — strips `$`/`.` operators from incoming data to block NoSQL injection
- `hpp` — guards against HTTP parameter pollution
- `compression` — gzip response compression
- existing: JWT auth, bcrypt password hashing, email verification, role-based access control, request body size limits

## Key features by role

- **Customer** — browse products, cart, checkout with address + payment method, live order tracking with delivery-route map, notifications
- **Staff** — order management (status updates, driver assignment), inventory CRUD with low-stock/expiry alerts, wholesale order approval
- **Admin** — everything Staff can do, plus business analytics dashboard (sales trend, top products, inventory forecast, customer report) and user/role management
- **Driver** — view assigned deliveries, advance order status, see the route to each delivery address
- **Wholesale buyer** — request bulk quotes at wholesale pricing (subject to minimum order quantities), track approval status

## Academic integrity note

If you're submitting this as coursework, review your module's AI-usage disclosure policy and make sure to personalize the code/documentation (comments, naming, README) before submission — this scaffold is meant as a strong starting point, not a drop-in final submission.
