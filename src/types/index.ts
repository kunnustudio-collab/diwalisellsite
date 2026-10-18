export type UserRole = 'admin' | 'customer';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number | null;
  sku: string;
  stock: number;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  image_url: string;
  additional_images?: string[];
  specifications?: Record<string, string>;
  rating?: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number; // e.g. 20 for 20% or 100 for ₹100
  min_cart_value: number;
  max_discount_amount?: number | null;
  max_redemptions?: number | null;
  current_redemptions: number;
  is_active: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  applicable_product_ids?: string[] | null; // null = sitewide
  allow_combine?: boolean;
  created_at?: string;
}

export type PaymentMethod = 'cod' | 'razorpay' | 'youpi';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pin_code: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string | null;
  shipping_fee: number;
  total_amount: number;
  tracking_number?: string | null;
  courier_name?: string | null;
  payment_id?: string | null;
  utr?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Review {
  id: string;
  product_id?: string | null; // null for general store review
  customer_name: string;
  customer_email: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  is_flagged: boolean;
  is_sample: boolean; // clearly distinguishes AI sample from genuine customer
  admin_reply?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface PoliciesConfig {
  shipping: string;
  returns: string;
  privacy: string;
  terms: string;
}

export interface SocialLinksConfig {
  instagram: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
}

export interface SiteSettings {
  brand_name: string;
  brand_tagline: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  
  // Announcement Bar
  announcement_text: string;
  announcement_enabled: boolean;
  announcement_countdown_date?: string | null;

  // Hero Section
  hero_heading: string;
  hero_subheading: string;
  hero_cta_primary_text: string;
  hero_cta_primary_link: string;
  hero_cta_secondary_text: string;
  hero_cta_secondary_link: string;
  hero_image_url: string;
  hero_enabled: boolean;

  // Promo Banner
  promo_banner_heading: string;
  promo_banner_description: string;
  promo_banner_coupon: string;
  promo_banner_cta: string;
  promo_banner_enabled: boolean;
  promo_banner_image: string;
  promo_start_date?: string | null;
  promo_end_date?: string | null;

  // Store & Logistics
  shipping_charge: number;
  free_shipping_threshold: number;
  cod_enabled: boolean;
  razorpay_enabled: boolean;
  youpi_enabled: boolean;
  youpi_gateway_url?: string;
  youpi_merchant_key?: string;
  youpi_webhook_secret?: string;
  youpi_vpa?: string;
  tax_percentage: number;
  currency: string;
  currency_symbol: string;
  maintenance_mode: boolean;

  // Policies & Social
  policies: PoliciesConfig;
  social_links: SocialLinksConfig;
  
  // Section visibility toggles
  show_featured: boolean;
  show_promo_banner: boolean;
  show_reviews: boolean;
  show_faqs: boolean;
  show_benefits: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
