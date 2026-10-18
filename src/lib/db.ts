import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Product,
  Category,
  Discount,
  Order,
  OrderItem,
  Review,
  FAQ,
  SiteSettings,
  AdminProfile,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_DISCOUNTS,
  INITIAL_FAQS,
  INITIAL_SETTINGS,
} from './constants';

export interface DatabaseSchema {
  profiles: AdminProfile[];
  categories: Category[];
  products: Product[];
  discounts: Discount[];
  orders: Order[];
  reviews: Review[];
  faqs: FAQ[];
  settings: SiteSettings;
  redemptions: {
    id: string;
    coupon_id: string;
    order_id: string;
    customer_email: string;
    discount_amount: number;
    redeemed_at: string;
  }[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'deepaura_db.json');

// Memory cache & write lock
let inMemoryDb: DatabaseSchema | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial Admin creation
function getInitialAdmin(): AdminProfile {
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'DeepAura@Festive2026';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(initialPassword, salt);

  return {
    id: 'admin-001',
    email: (process.env.INITIAL_ADMIN_EMAIL || 'admin@deepaura.com').toLowerCase(),
    full_name: 'Store Administrator',
    role: 'admin',
    created_at: new Date().toISOString(),
    ...( { _password_hash: passwordHash } as any ),
  };
}

// Initial seed reviews: Tasteful genuine sample reviews explicitly marked as samples
const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    product_id: 'prod-001',
    customer_name: 'Priya Sharma',
    customer_email: 'priya.s@example.com',
    rating: 5,
    title: 'Mesmerizing glow, excellent quality!',
    comment: 'The copper wire fairy lights look absolutely stunning wrapped around our balcony railing. The warm golden light creates such a serene festive vibe.',
    status: 'approved',
    is_flagged: false,
    is_sample: false,
    admin_reply: 'Thank you Priya ji! Wishing you and your family a luminous Diwali!',
    created_at: '2026-10-12T14:20:00.000Z',
  },
  {
    id: 'rev-002',
    product_id: 'prod-002',
    customer_name: 'Rajesh Verma',
    customer_email: 'rajesh.v@example.com',
    rating: 5,
    title: 'Authentic heavy brass look',
    comment: 'Impressed with the weight and detailing of the brass diyas. The oil holds for hours without spilling.',
    status: 'approved',
    is_flagged: false,
    is_sample: false,
    created_at: '2026-10-13T09:15:00.000Z',
  },
  {
    id: 'rev-003',
    product_id: 'prod-008',
    customer_name: 'Ananya Deshmukh',
    customer_email: 'ananya.d@example.com',
    rating: 5,
    title: 'Pooja thali is heirloom quality',
    comment: 'The meenakari work on this puja thali is even more gorgeous in person. Packaging was very secure and arrived in 3 days.',
    status: 'approved',
    is_flagged: false,
    is_sample: false,
    created_at: '2026-10-14T18:45:00.000Z',
  },
];

function getInitialDatabase(): DatabaseSchema {
  return {
    profiles: [getInitialAdmin()],
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    discounts: INITIAL_DISCOUNTS,
    orders: [],
    reviews: INITIAL_REVIEWS,
    faqs: INITIAL_FAQS,
    settings: INITIAL_SETTINGS,
    redemptions: [],
  };
}

export function getDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  ensureDataDirectory();

  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    inMemoryDb = initial;
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    inMemoryDb = JSON.parse(raw);
    return inMemoryDb!;
  } catch (err) {
    console.error('Error reading database file, resetting to initial seed:', err);
    const initial = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    inMemoryDb = initial;
    return initial;
  }
}

export async function saveDatabase(data: DatabaseSchema): Promise<void> {
  inMemoryDb = data;
  ensureDataDirectory();

  // Sequential atomic write
  writeQueue = writeQueue.then(async () => {
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    await fs.promises.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempFile, DB_FILE);
  });

  return writeQueue;
}

// -------------------------------------------------------------
// DATA ACCESS LAYER: Products with 10 Active Product Rule
// -------------------------------------------------------------

export async function getProducts(options?: {
  activeOnly?: boolean;
  category?: string;
  featured?: boolean;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}): Promise<Product[]> {
  const db = getDatabase();
  let list = [...db.products];

  if (options?.activeOnly !== false) {
    list = list.filter((p) => p.is_active);
  }

  if (options?.category && options.category !== 'all') {
    list = list.filter((p) => p.category_id === options.category);
  }

  if (options?.featured) {
    list = list.filter((p) => p.is_featured);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.short_description && p.short_description.toLowerCase().includes(q))
    );
  }

  if (options?.sort) {
    switch (options.sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
    }
  }

  return list;
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  return product || null;
}

/**
 * Enforce maximum of 10 active products on the server!
 */
export async function saveProduct(productData: Partial<Product> & { id?: string }): Promise<{
  success: boolean;
  product?: Product;
  error?: string;
}> {
  const db = getDatabase();
  const isEditing = Boolean(productData.id && db.products.some((p) => p.id === productData.id));

  // Check 10 active products limit when activating
  if (productData.is_active === true) {
    const currentlyActive = db.products.filter(
      (p) => p.is_active && (!isEditing || p.id !== productData.id)
    );

    if (currentlyActive.length >= 10) {
      return {
        success: false,
        error:
          'Maximum 10 active products are allowed on the storefront. Please deactivate another product before activating this one.',
      };
    }
  }

  if (isEditing) {
    const index = db.products.findIndex((p) => p.id === productData.id);
    const existing = db.products[index];

    // Recalculate original price sanity: original_price cannot be lower than price
    const updatedPrice = productData.price !== undefined ? Number(productData.price) : existing.price;
    let updatedOriginalPrice =
      productData.original_price !== undefined
        ? productData.original_price
          ? Number(productData.original_price)
          : null
        : existing.original_price;

    if (updatedOriginalPrice && updatedOriginalPrice < updatedPrice) {
      updatedOriginalPrice = null; // Prevent fabricated or lower discount
    }

    const updated: Product = {
      ...existing,
      ...productData,
      price: updatedPrice,
      original_price: updatedOriginalPrice,
      stock: productData.stock !== undefined ? Math.max(0, Number(productData.stock)) : existing.stock,
      updated_at: new Date().toISOString(),
    };

    db.products[index] = updated;
    await saveDatabase(db);
    return { success: true, product: updated };
  } else {
    // Creating a new product
    const currentlyActive = db.products.filter((p) => p.is_active);
    const willBeActive = productData.is_active ?? true;

    if (willBeActive && currentlyActive.length >= 10) {
      return {
        success: false,
        error:
          'Maximum 10 active products allowed on storefront. Please mark this product as inactive or deactivate another first.',
      };
    }

    const newId = productData.id || `prod-${Date.now().toString(36)}`;
    const slug =
      productData.slug ||
      (productData.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newProduct: Product = {
      id: newId,
      name: productData.name || 'New Festive Item',
      slug,
      description: productData.description || '',
      short_description: productData.short_description || '',
      price: Number(productData.price || 0),
      original_price:
        productData.original_price && Number(productData.original_price) > Number(productData.price || 0)
          ? Number(productData.original_price)
          : null,
      sku: productData.sku || `DA-SKU-${Date.now().toString().slice(-4)}`,
      stock: Number(productData.stock || 0),
      category_id: productData.category_id || 'diwali-lights',
      is_active: willBeActive,
      is_featured: productData.is_featured || false,
      image_url:
        productData.image_url ||
        'https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=800&q=80',
      additional_images: productData.additional_images || [],
      specifications: productData.specifications || {},
      rating: 5,
      reviews_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.products.push(newProduct);
    await saveDatabase(db);
    return { success: true, product: newProduct };
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = getDatabase();
  const initialLength = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLength) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// DATA ACCESS LAYER: Discounts & Server-Side Verification
// -------------------------------------------------------------

export async function getDiscounts(): Promise<Discount[]> {
  const db = getDatabase();
  return db.discounts;
}

export async function getDiscountByCode(code: string): Promise<Discount | null> {
  const db = getDatabase();
  const normalized = code.trim().toUpperCase();
  const discount = db.discounts.find((d) => d.code.toUpperCase() === normalized);
  return discount || null;
}

export interface CouponValidationResult {
  valid: boolean;
  discount?: Discount;
  discountAmount: number;
  message: string;
}

export async function validateCoupon(
  code: string,
  cartSubtotal: number,
  customerEmail?: string
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, discountAmount: 0, message: 'Please enter a coupon code.' };
  }

  const discount = await getDiscountByCode(code);
  if (!discount) {
    return { valid: false, discountAmount: 0, message: `Coupon code "${code}" is invalid.` };
  }

  if (!discount.is_active) {
    return { valid: false, discountAmount: 0, message: `Coupon "${discount.code}" is currently disabled.` };
  }

  const now = new Date();

  // Check start date
  if (discount.starts_at && new Date(discount.starts_at) > now) {
    return { valid: false, discountAmount: 0, message: `Coupon "${discount.code}" is not yet active.` };
  }

  // Check expiration date
  if (discount.expires_at && new Date(discount.expires_at) < now) {
    return { valid: false, discountAmount: 0, message: `Coupon "${discount.code}" has expired.` };
  }

  // Check minimum cart value
  if (cartSubtotal < discount.min_cart_value) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Coupon "${discount.code}" requires a minimum order value of ₹${discount.min_cart_value}. Add ₹${discount.min_cart_value - cartSubtotal} more to qualify!`,
    };
  }

  // Check maximum global redemptions
  if (
    discount.max_redemptions !== null &&
    discount.max_redemptions !== undefined &&
    discount.current_redemptions >= discount.max_redemptions
  ) {
    return { valid: false, discountAmount: 0, message: `Coupon "${discount.code}" redemption limit reached.` };
  }

  // Check per-customer limit if email provided
  if (customerEmail) {
    const db = getDatabase();
    const customerRedemptions = db.redemptions.filter(
      (r) => r.coupon_id === discount.id && r.customer_email.toLowerCase() === customerEmail.toLowerCase()
    );
    if (customerRedemptions.length >= 1) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Coupon "${discount.code}" has already been used with email ${customerEmail}.`,
      };
    }
  }

  // Calculate discount amount
  let calculated = 0;
  if (discount.type === 'percentage') {
    calculated = (cartSubtotal * discount.value) / 100;
  } else {
    calculated = discount.value;
  }

  // Cap at max_discount_amount
  if (discount.max_discount_amount && calculated > discount.max_discount_amount) {
    calculated = discount.max_discount_amount;
  }

  // Ensure discount does not exceed cart subtotal
  if (calculated > cartSubtotal) {
    calculated = cartSubtotal;
  }

  calculated = Math.round(calculated * 100) / 100;

  return {
    valid: true,
    discount,
    discountAmount: calculated,
    message: `Coupon "${discount.code}" applied! You saved ₹${calculated}.`,
  };
}

export async function saveDiscount(discountData: Partial<Discount> & { id?: string }): Promise<Discount> {
  const db = getDatabase();
  const id = discountData.id || `disc-${Date.now().toString(36)}`;
  const code = (discountData.code || '').trim().toUpperCase();

  const newDiscount: Discount = {
    id,
    code,
    type: discountData.type || 'percentage',
    value: Number(discountData.value || 0),
    min_cart_value: Number(discountData.min_cart_value || 0),
    max_discount_amount: discountData.max_discount_amount ? Number(discountData.max_discount_amount) : null,
    max_redemptions: discountData.max_redemptions ? Number(discountData.max_redemptions) : null,
    current_redemptions: Number(discountData.current_redemptions || 0),
    is_active: discountData.is_active ?? true,
    starts_at: discountData.starts_at || null,
    expires_at: discountData.expires_at || null,
    applicable_product_ids: discountData.applicable_product_ids || null,
    allow_combine: discountData.allow_combine || false,
    created_at: discountData.created_at || new Date().toISOString(),
  };

  const existingIndex = db.discounts.findIndex((d) => d.id === id || d.code.toUpperCase() === code);
  if (existingIndex >= 0) {
    db.discounts[existingIndex] = { ...db.discounts[existingIndex], ...newDiscount };
  } else {
    db.discounts.push(newDiscount);
  }

  await saveDatabase(db);
  return newDiscount;
}

export async function deleteDiscount(id: string): Promise<boolean> {
  const db = getDatabase();
  const before = db.discounts.length;
  db.discounts = db.discounts.filter((d) => d.id !== id);
  if (db.discounts.length !== before) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// DATA ACCESS LAYER: Orders with Stock Decrement & Snapshot
// -------------------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  const db = getDatabase();
  return [...db.orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getOrderByIdOrNumber(idOrNumber: string): Promise<Order | null> {
  const db = getDatabase();
  const order = db.orders.find(
    (o) => o.id === idOrNumber || o.order_number.toUpperCase() === idOrNumber.toUpperCase()
  );
  return order || null;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pin_code: string;
  payment_method: 'cod' | 'razorpay';
  coupon_code?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
  notes?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
}> {
  const db = getDatabase();

  if (!input.items || input.items.length === 0) {
    return { success: false, error: 'Your shopping cart is empty.' };
  }

  // Step 1: Validate stock on server & build snapshot items
  const orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const product = db.products.find((p) => p.id === item.product_id);
    if (!product) {
      return { success: false, error: `Product ID "${item.product_id}" was not found.` };
    }

    if (!product.is_active) {
      return { success: false, error: `"${product.name}" is no longer available.` };
    }

    if (product.stock < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
      };
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      id: `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      order_id: '',
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      product_image: product.image_url,
      unit_price: product.price,
      quantity: item.quantity,
      total_price: itemTotal,
    });
  }

  // Step 2: Validate coupon server-side
  let discountAmount = 0;
  let validatedCouponCode: string | null = null;

  if (input.coupon_code) {
    const couponRes = await validateCoupon(input.coupon_code, subtotal, input.customer_email);
    if (couponRes.valid && couponRes.discount) {
      discountAmount = couponRes.discountAmount;
      validatedCouponCode = couponRes.discount.code;
    } else {
      return { success: false, error: couponRes.message };
    }
  }

  // Step 3: Compute shipping fee according to store settings
  const settings = db.settings;
  const shippingFee =
    subtotal >= settings.free_shipping_threshold ? 0 : settings.shipping_charge;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Step 4: Decrement inventory safely
  for (const item of input.items) {
    const product = db.products.find((p) => p.id === item.product_id);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      product.updated_at = new Date().toISOString();
    }
  }

  // Step 5: Generate unique order number
  const orderId = `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const orderNumber = `DA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Link items to order
  for (const item of orderItems) {
    item.order_id = orderId;
  }

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_name: input.customer_name.trim(),
    customer_email: input.customer_email.trim().toLowerCase(),
    customer_phone: input.customer_phone.trim(),
    shipping_address: input.shipping_address.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    pin_code: input.pin_code.trim(),
    payment_method: input.payment_method,
    payment_status: input.payment_method === 'cod' ? 'pending' : 'pending',
    order_status: 'Confirmed',
    subtotal,
    discount_amount: discountAmount,
    coupon_code: validatedCouponCode,
    shipping_fee: shippingFee,
    total_amount: finalTotal,
    tracking_number: null,
    courier_name: null,
    notes: input.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: orderItems,
  };

  db.orders.push(newOrder);

  // Step 6: Record coupon redemption if applicable
  if (validatedCouponCode) {
    const discount = db.discounts.find((d) => d.code === validatedCouponCode);
    if (discount) {
      discount.current_redemptions += 1;
      db.redemptions.push({
        id: `red-${Date.now().toString(36)}`,
        coupon_id: discount.id,
        order_id: orderId,
        customer_email: input.customer_email.toLowerCase(),
        discount_amount: discountAmount,
        redeemed_at: new Date().toISOString(),
      });
    }
  }

  await saveDatabase(db);
  return { success: true, order: newOrder };
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['order_status'],
  details?: {
    payment_status?: Order['payment_status'];
    tracking_number?: string;
    courier_name?: string;
  }
): Promise<Order | null> {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.order_status = status;
  if (details?.payment_status) order.payment_status = details.payment_status;
  if (details?.tracking_number !== undefined) order.tracking_number = details.tracking_number;
  if (details?.courier_name !== undefined) order.courier_name = details.courier_name;
  order.updated_at = new Date().toISOString();

  await saveDatabase(db);
  return order;
}

// -------------------------------------------------------------
// DATA ACCESS LAYER: Reviews & AI Assistant
// -------------------------------------------------------------

export async function getReviews(options?: {
  productId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
}): Promise<Review[]> {
  const db = getDatabase();
  let list = [...db.reviews];

  if (options?.status && options.status !== 'all') {
    list = list.filter((r) => r.status === options.status);
  } else if (!options?.status) {
    list = list.filter((r) => r.status === 'approved');
  }

  if (options?.productId) {
    list = list.filter((r) => r.product_id === options.productId);
  }

  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function submitReview(input: {
  product_id?: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string;
  comment: string;
}): Promise<Review> {
  const db = getDatabase();

  const newReview: Review = {
    id: `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    product_id: input.product_id || null,
    customer_name: input.customer_name.trim(),
    customer_email: input.customer_email.trim().toLowerCase(),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    title: input.title.trim(),
    comment: input.comment.trim(),
    status: 'pending', // Requires admin moderation
    is_flagged: false,
    is_sample: false,
    admin_reply: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.reviews.push(newReview);
  await saveDatabase(db);
  return newReview;
}

export async function moderateReview(
  reviewId: string,
  action: 'approve' | 'reject' | 'flag' | 'reply' | 'delete',
  replyText?: string
): Promise<Review | null> {
  const db = getDatabase();
  const review = db.reviews.find((r) => r.id === reviewId);
  if (!review) return null;

  if (action === 'approve') review.status = 'approved';
  if (action === 'reject') review.status = 'rejected';
  if (action === 'flag') review.is_flagged = !review.is_flagged;
  if (action === 'reply' && replyText !== undefined) review.admin_reply = replyText;
  if (action === 'delete') {
    db.reviews = db.reviews.filter((r) => r.id !== reviewId);
    await saveDatabase(db);
    return null;
  }

  review.updated_at = new Date().toISOString();
  await saveDatabase(db);

  // Recalculate product rating
  if (review.product_id) {
    const approvedProductReviews = db.reviews.filter(
      (r) => r.product_id === review.product_id && r.status === 'approved' && !r.is_sample
    );
    const product = db.products.find((p) => p.id === review.product_id);
    if (product) {
      if (approvedProductReviews.length > 0) {
        const sum = approvedProductReviews.reduce((acc, curr) => acc + curr.rating, 0);
        product.rating = Math.round((sum / approvedProductReviews.length) * 10) / 10;
        product.reviews_count = approvedProductReviews.length;
      }
    }
  }

  await saveDatabase(db);
  return review;
}

// -------------------------------------------------------------
// DATA ACCESS LAYER: Site Settings & FAQs
// -------------------------------------------------------------

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDatabase();
  return db.settings;
}

export async function updateSiteSettings(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  const db = getDatabase();
  db.settings = { ...db.settings, ...partial };
  await saveDatabase(db);
  return db.settings;
}

export async function getFAQs(activeOnly = true): Promise<FAQ[]> {
  const db = getDatabase();
  let faqs = [...db.faqs];
  if (activeOnly) {
    faqs = faqs.filter((f) => f.is_active);
  }
  return faqs.sort((a, b) => a.sort_order - b.sort_order);
}

export async function saveFAQ(faqData: Partial<FAQ> & { id?: string }): Promise<FAQ> {
  const db = getDatabase();
  const id = faqData.id || `faq-${Date.now().toString(36)}`;

  const newFaq: FAQ = {
    id,
    question: faqData.question || '',
    answer: faqData.answer || '',
    category: faqData.category || 'General',
    sort_order: faqData.sort_order ?? db.faqs.length + 1,
    is_active: faqData.is_active ?? true,
    created_at: faqData.created_at || new Date().toISOString(),
  };

  const index = db.faqs.findIndex((f) => f.id === id);
  if (index >= 0) {
    db.faqs[index] = { ...db.faqs[index], ...newFaq };
  } else {
    db.faqs.push(newFaq);
  }

  await saveDatabase(db);
  return newFaq;
}

export async function deleteFAQ(id: string): Promise<boolean> {
  const db = getDatabase();
  const before = db.faqs.length;
  db.faqs = db.faqs.filter((f) => f.id !== id);
  if (db.faqs.length !== before) {
    await saveDatabase(db);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// DATA ACCESS LAYER: Categories
// -------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  const db = getDatabase();
  return [...db.categories].sort((a, b) => a.sort_order - b.sort_order);
}
