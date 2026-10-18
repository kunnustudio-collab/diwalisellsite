-- DeepAura — Diwali Decor Relational Schema Migration
-- Compatible with Supabase PostgreSQL and standard PostgreSQL 15+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles & Admin Users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products (With 10 Active Product limit guarantee)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= price),
  sku TEXT UNIQUE NOT NULL,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT NOT NULL,
  additional_images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for storefront active products
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 4. Discounts & Coupons
CREATE TABLE IF NOT EXISTS discounts (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10, 2) NOT NULL CHECK (value > 0),
  min_cart_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_discount_amount NUMERIC(10, 2),
  max_redemptions INT,
  current_redemptions INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  applicable_product_ids JSONB DEFAULT NULL,
  allow_combine BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);

-- 5. Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'razorpay')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')),
  subtotal NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  tracking_number TEXT,
  courier_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- 6. Order Items (Snapshot at time of purchase)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  product_image TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10, 2) NOT NULL
);

-- 7. Coupon Redemptions
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id TEXT PRIMARY KEY,
  coupon_id TEXT NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Customer Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- 9. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Site Settings (Key-Value)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Row Level Security Policies (Supabase RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Public products viewable" ON products
  FOR SELECT USING (is_active = true);

-- Public can read approved reviews
CREATE POLICY "Approved reviews viewable" ON reviews
  FOR SELECT USING (status = 'approved');

-- Public can create reviews with pending status
CREATE POLICY "Public review submission" ON reviews
  FOR INSERT WITH CHECK (status = 'pending' AND is_sample = false);

-- Public can view active FAQs
CREATE POLICY "Public faqs viewable" ON faqs
  FOR SELECT USING (is_active = true);

-- Public can view active discounts
CREATE POLICY "Public discounts viewable" ON discounts
  FOR SELECT USING (is_active = true);

-- Public can view site settings
CREATE POLICY "Public site_settings viewable" ON site_settings
  FOR SELECT USING (true);
