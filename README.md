# DeepAura — Premium Diwali Decoration E-Commerce Website & Admin Panel

A production-ready, full-stack Diwali Decoration e-commerce web application with a complete storefront, shopping cart, checkout, order tracking, and an extensive Admin Panel.

---

## 🌟 Brand & Aesthetics

- **Brand Name**: DeepAura — Diwali Decor
- **Tagline**: *"Light Up Every Corner of Your Celebration"*
- **Aesthetic**: Royal Indian festive aesthetic with warm ivory (`#FFFDF9`), deep maroon (`#400812`), saffron (`#E36414`), and antique gold (`#D4AF37`) accents.
- **Currency**: INR (₹)
- **Storefront Limit**: Strictly enforced limit of **10 active storefront products** for a curated, high-delight shopping experience.

---

## 🚀 Key Features

### Storefront Experience
1. **Festive Announcement Bar**: Displays promotional discounts with an optional live countdown timer.
2. **Navigation Bar**: Brand logo, category filtering that filters the active catalog, live cart counter, search bar, and wishlist.
3. **Diwali Hero Section**: Animated diya flame, floating golden particle embers, glowing backdrop aura, and customizable CTAs.
4. **Verified Benefits Strip**: Displays only verified store claims (Festive Collection, Secure Checkout, Easy Ordering, Customer Support).
5. **Shop Catalog (Exactly 10 Starter Products)**:
   - *Premium LED Fairy String Lights*
   - *Decorative Brass-Style Diya Set*
   - *Floral Door Toran*
   - *Decorative Rangoli Stencil Kit*
   - *Flameless LED Candle Set*
   - *Lotus LED Decorative Lamp*
   - *Festive Paper Lantern Set*
   - *Premium Decorative Puja Thali*
   - *Artificial Marigold Flower Garland*
   - *Luxury Diwali Home Decoration Combo*
6. **Product Cards**: High-res images with zoom hover, rating stars, real sale & original prices with discount badge, stock availability, Wishlist toggle, Quick View modal, and Add-to-Cart animation.
7. **Featured Bestsellers**: Toggleable bestseller curation.
8. **Festive Promo Banner**: Mid-page banner with one-click copyable coupon code (e.g. `FESTIVE20`).
9. **Genuine Customer Reviews**: Rating distribution (5-star breakdown bars), published reviews with verified labels, review submission form with moderation queue, and explicit separation of AI demonstration samples.
10. **FAQ Accordion**: 5+ essential customer questions covering ordering, delivery timelines, COD, coupons, and returns.
11. **Slide-Out Cart Drawer**: Live item count, quantity increment/decrement, free delivery progress bar (threshold at ₹999), coupon application, and pricing breakdown.
12. **Complete Checkout Flow**: Full shipping address collection, Cash on Delivery (COD) and Razorpay online payment option, server-side inventory verification, and stock deduction.
13. **Order Confirmation & Tracking**:
    - Confetti celebration animation.
    - Unique order number (`DA-2026-XXXX`).
    - Itemized snapshot of purchased goods and pricing.
    - Real-time order status tracking (`/order-status/[orderId]`) with visual stepper timeline (Confirmed → Packing → Shipped → Delivered).

---

### Admin Panel (`/admin/login` & `/admin`)
1. **Secure Admin Authentication**: Bcrypt password verification, signed JWT session cookies, and route protection.
2. **Dashboard**: Live metrics (Total Orders, Confirmed Revenue, Pending Orders, Delivered Orders, Active Products 10/10 limit, Low-Stock watchlist, Bestsellers calculated from real orders, and daily sales chart).
3. **Product Management (`/admin/products`)**:
   - Edit prices, descriptions, SKUs, inventory, and categories.
   - Live image upload (`/api/admin/upload`).
   - **Max 10 Active Products Enforcement**: Server and client strictly prevent activating an 11th product without deactivating another first.
4. **Advanced Discount Management (`/admin/discounts`)**:
   - Percentage discounts (%) or fixed rupee discounts (₹).
   - Coupon codes, start dates, and expiry dates.
   - Minimum cart value requirements.
   - Maximum discount amount caps.
   - Global and per-customer redemption limits.
   - Real-time enable/disable toggles.
5. **Order Management (`/admin/orders`)**:
   - Search by Order ID, customer name, email, or phone.
   - Status filtering (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded).
   - AWB tracking number & courier partner assignment.
   - Export all orders to CSV.
   - **Printable Tax Invoice** (`/admin/orders/[id]/invoice`).
6. **Review Management & AI Review Assistant (`/admin/reviews`)**:
   - Approve, reject, flag, delete, and reply to customer reviews.
   - **AI Review Assistant**: Summarizes customer feedback, drafts empathetic festive replies, and detects promotional spam. Includes graceful heuristic fallback when no API key is provided.
7. **Storefront Content Management (`/admin/content`)**:
   - Control brand logo, announcements, countdown timer, hero headlines, promo banners, and section visibility without code edits.
8. **Store Settings (`/admin/settings`)**:
   - Shipping fees, free delivery threshold, COD availability, Razorpay toggle, contact info, and legal policies.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion & Canvas Confetti
- **Icons**: Lucide React
- **Database**:
  - Out-of-the-box local ACID JSON database (`data/deepaura_db.json`) with atomic file writes and mutex locking.
  - Full Supabase PostgreSQL schema migration script (`supabase/migrations/001_initial_schema.sql`) and seed SQL (`supabase/seed.sql`).
- **Authentication**: Bcrypt.js & JsonWebToken (JWT) with HTTP-only cookies.

---

## 📦 Setup & Local Development Instructions

### 1. Prerequisites
- Node.js v18.0.0 or later (v20+ or v24+ recommended)
- npm v9+

### 2. Installation
```bash
# Clone or navigate to the project directory
cd "DIWALI SITE"

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default `.env.local` contents:
```env
ADMIN_JWT_SECRET=deepaura_diwali_secure_session_secret_key_2026_festive_salt
INITIAL_ADMIN_EMAIL=admin@deepaura.com
INITIAL_ADMIN_PASSWORD=DeepAura@Festive2026
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Database Seeding
Seed the database with the initial 10 starter products, categories, coupons, FAQs, and default admin account:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Administrator Access

- **Admin Login URL**: `http://localhost:3000/admin/login`
- **Default Email**: `admin@deepaura.com`
- **Default Password**: `DeepAura@Festive2026`

*(You can change the email and password anytime in `.env.local` or the database)*

---

## 🗄️ Supabase PostgreSQL Setup Instructions

If you wish to deploy with a cloud Supabase database:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
4. Paste the contents of `supabase/seed.sql` to populate the 10 starter products.
5. In your `.env.local`, set:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## 💳 Payment Gateway Setup Instructions (Razorpay)

1. Sign up at [razorpay.com](https://razorpay.com) and navigate to **Settings → API Keys**.
2. Generate your Test Key ID and Key Secret.
3. In `.env.local`, set:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=your_key_secret
   ```
4. In the Admin Panel (`/admin/settings`), enable the **Razorpay Online Payments** toggle.

---

## 🤖 AI Provider Setup Instructions (Admin Review Assistant)

1. Obtain a free Google Gemini API key at [ai.google.dev](https://aistudio.google.com/).
2. In `.env.local`, set:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. If no key is set, the assistant runs in a built-in heuristic mode with clear setup notices.

---

## 🧪 Automated Test Suite

Run the full end-to-end test suite (33 automated checks):
```bash
node scripts/test_flows.js
```

### Verified Test Results:
- ✅ Storefront homepage loads with status 200 and Diwali branding
- ✅ Exactly 10 active products in storefront catalog
- ✅ Category filters filter the same 10 products
- ✅ Dynamic product details pages (`/product/[id]`) with SSR and SEO
- ✅ Coupon validation with min-cart threshold enforcement
- ✅ Order placement flow with inventory stock reduction
- ✅ Order confirmation page with unique `DA-2026-XXXX` order numbers
- ✅ Real-time order tracking lookup (`/order-status`)
- ✅ Customer review submission with pending moderation state
- ✅ Admin login with bcrypt verification & secure HTTP-only cookies
- ✅ Protection of admin APIs against unauthorized requests (401)
- ✅ **Strict server enforcement of maximum 10 active products**
- ✅ Admin order status updates and AWB tracking assignment
- ✅ AI Review Assistant report and reply drafting
- ✅ Admin dashboard analytics from actual order records
- ✅ Printable tax invoices (`/admin/orders/[id]/invoice`)
- ✅ Production build (`next build`) compilation with 0 errors
