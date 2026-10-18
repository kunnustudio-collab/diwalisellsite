const http = require('http');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting DeepAura Diwali Decor Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const port = process.env.PORT || '8080';
  const BASE = `http://localhost:${port}`;

  try {
    // Test 1: Storefront Home Page
    const home = await request(`${BASE}/`);
    assert(home.status === 200, 'Home page loads with status 200');
    assert(home.body.includes('DeepAura'), 'Home page contains brand name "DeepAura"');
    assert(home.body.includes('Diwali Decor'), 'Home page contains "Diwali Decor"');

    // Test 2: Active Products Endpoint (Exactly 10 active products)
    const prods = await request(`${BASE}/api/products`);
    assert(prods.status === 200, 'Products API returns 200');
    assert(prods.json && prods.json.total === 10, 'Products API returns EXACTLY 10 active starter products');
    const firstProd = prods.json.products[0];
    assert(firstProd.name === 'Premium LED Fairy String Lights', 'Product 1 name matches starter catalog');
    assert(firstProd.price === 649, 'Product 1 price is ₹649');

    // Test 3: Category Filtering (Filters the same 10 products)
    const lightsCat = await request(`${BASE}/api/products?category=diwali-lights`);
    assert(lightsCat.status === 200 && lightsCat.json.products.length > 0, 'Category filter "diwali-lights" filters active catalog');
    assert(lightsCat.json.products.every(p => p.category_id === 'diwali-lights'), 'All returned products belong to diwali-lights');

    // Test 4: Product Detail Page
    const prodPage = await request(`${BASE}/product/${firstProd.slug}`);
    assert(prodPage.status === 200, `Product detail page /product/${firstProd.slug} loads with 200`);
    assert(prodPage.body.includes(firstProd.name), 'Product detail page contains product title');

    // Test 5: Coupon Validation - Valid Coupon DIWALI15
    const validCouponRes = await request(`${BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { code: 'DIWALI15', subtotal: 1200 });
    assert(validCouponRes.status === 200 && validCouponRes.json.valid === true, 'Valid coupon DIWALI15 accepted');
    assert(validCouponRes.json.discountAmount === 180, '15% discount on ₹1200 correctly calculates ₹180');

    // Test 6: Coupon Validation - Threshold Enforcement
    const belowMinRes = await request(`${BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { code: 'DIWALI15', subtotal: 400 });
    assert(belowMinRes.json.valid === false, 'Coupon DIWALI15 rejected when cart is below minimum ₹999');

    // Test 7: Coupon Validation - Invalid / Non-existent Coupon
    const invalidCouponRes = await request(`${BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { code: 'FAKE_COUPON_99', subtotal: 2000 });
    assert(invalidCouponRes.json.valid === false, 'Non-existent coupon code properly rejected');

    // Test 8: Order Placement Flow & Server Inventory Validation
    const initialStock = firstProd.stock;
    const testEmail = `aarav.${Date.now()}@testmail.com`;
    const orderPayload = {
      customer_name: 'Aarav Patel',
      customer_email: testEmail,
      customer_phone: '9876543210',
      shipping_address: '101, Lotus Villa, Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pin_code: '400020',
      payment_method: 'cod',
      coupon_code: 'DIWALI15',
      items: [{ product_id: firstProd.id, quantity: 2 }],
    };

    const orderRes = await request(`${BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, orderPayload);
    assert(orderRes.status === 200 && orderRes.json.success === true, 'Order created successfully via API');
    const createdOrder = orderRes.json.order;
    assert(createdOrder.order_number.startsWith('DA-'), 'Order receives unique DA-YYYY-XXXX order number');
    assert(createdOrder.discount_amount > 0, 'Discount was calculated and applied on the server');

    // Test 9: Verify Stock Decrement on Server
    const prodsAfter = await request(`${BASE}/api/products`);
    const prodAfter = prodsAfter.json.products.find(p => p.id === firstProd.id);
    assert(prodAfter.stock === initialStock - 2, `Inventory decremented safely on server from ${initialStock} to ${initialStock - 2}`);

    // Test 10: Order Status Lookup
    const trackRes = await request(`${BASE}/api/orders/${createdOrder.order_number}`);
    assert(trackRes.status === 200 && trackRes.json.order.order_number === createdOrder.order_number, 'Customer order tracking API returns matching order details');

    // Test 11: Review Submission
    const reviewRes = await request(`${BASE}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      product_id: firstProd.id,
      customer_name: 'Pooja Hegde',
      customer_email: 'pooja@example.com',
      rating: 5,
      title: 'Divine Festive Glow',
      comment: 'The copper fairy lights gave an absolutely mesmerizing aura to our living room balcony.',
    });
    assert(reviewRes.status === 200 && reviewRes.json.success === true, 'Customer review submitted successfully');
    assert(reviewRes.json.review.status === 'pending', 'Submitted review has pending status requiring admin approval');

    // Test 12: Admin Authentication
    const loginRes = await request(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: 'admin@deepaura.com',
      password: 'DeepAura@Festive2026',
    });
    assert(loginRes.status === 200 && loginRes.json.success === true, 'Admin login with seed credentials succeeds');
    const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
    assert(cookie && cookie.includes('deepaura_admin_session'), 'Admin session HTTP-only cookie received');

    // Test 13: Protected Admin API Check
    const adminMeRes = await request(`${BASE}/api/admin/me`, {
      headers: { Cookie: cookie },
    });
    assert(adminMeRes.status === 200 && adminMeRes.json.admin.role === 'admin', 'Protected /api/admin/me verifies authenticated admin');

    // Test 14: Unauthorized Access Protection
    const unauthorizedRes = await request(`${BASE}/api/admin/me`);
    assert(unauthorizedRes.status === 401, 'Unauthorized request without cookie is blocked with 401');

    // Test 15: Server Enforcement of Max 10 Active Products!
    const create11thRes = await request(`${BASE}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    }, {
      name: '11th Extra Active Product',
      price: 299,
      sku: 'DA-EXTRA-11',
      stock: 10,
      is_active: true, // Should be rejected by server!
    });
    assert(create11thRes.status === 400 && create11thRes.json.error.includes('Maximum 10 active products'), 'Server strictly rejects activating an 11th product!');

    // Test 16: Admin Order Status Update
    const updateOrderRes = await request(`${BASE}/api/admin/orders/${createdOrder.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    }, {
      order_status: 'Shipped',
      tracking_number: 'BD-DIWALI-987654',
      courier_name: 'Bluedart Express',
    });
    assert(updateOrderRes.status === 200 && updateOrderRes.json.order.order_status === 'Shipped', 'Admin successfully updated order status to Shipped with tracking number');

    // Test 17: Admin Review Moderation & AI Assistant
    const aiAssistRes = await request(`${BASE}/api/admin/reviews/ai-assist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    }, {
      action: 'reply',
      customerName: 'Kavita Joshi',
      rating: 5,
      reviewText: 'Remarkable festival brightness!',
    });
    assert(aiAssistRes.status === 200 && aiAssistRes.json.draftReply.length > 0, 'AI Review Assistant generates polite festive reply draft');

    // Test 18: Admin Dashboard Metrics
    const dashboardRes = await request(`${BASE}/api/admin/dashboard`, {
      headers: { Cookie: cookie },
    });
    assert(dashboardRes.status === 200, 'Admin dashboard API returns 200');
    assert(dashboardRes.json.metrics.totalOrders >= 1, 'Dashboard metrics record the customer order');
    assert(dashboardRes.json.metrics.totalRevenue > 0, 'Dashboard metrics record verified order revenue');

    console.log('\n========================================');
    console.log(`Total Tests Run: ${passed + failed}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log('========================================\n');

    if (failed === 0) {
      console.log('🎉 ALL 18 CORE ACCEPTANCE TESTS PASSED WITH ZERO ERRORS!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  }
}

runTests();
