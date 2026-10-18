const crypto = require('crypto');

async function testYoupiIntegration() {
  const baseUrl = 'http://localhost:8080';
  const secret = process.env.YOUPI_WEBHOOK_SECRET || 'yp_sec_diwali_decor_2026_supersecret';

  console.log('--- Starting YouPI-PG Integration Verification ---');

  // Step 1: Check Webhook Health / GET route
  console.log('\n[1/4] Checking GET /api/webhooks/youpi status...');
  const healthRes = await fetch(`${baseUrl}/api/webhooks/youpi`);
  const healthData = await healthRes.json();
  console.log('Health response:', healthData);
  if (!healthRes.ok || healthData.status !== 'active') {
    throw new Error('GET /api/webhooks/youpi failed');
  }
  console.log('✓ YouPI Webhook endpoint is active and healthy.');

  // Step 2: Create a sample order with payment_method: 'youpi'
  console.log('\n[2/4] Placing order with payment_method: "youpi"...');
  const orderRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Ananya Sharma',
      customer_email: 'ananya.sharma@festivetest.in',
      customer_phone: '9876501234',
      shipping_address: 'Flat 301, Diya Heights, Baner Road',
      city: 'Pune',
      state: 'Maharashtra',
      pin_code: '411045',
      payment_method: 'youpi',
      items: [
        { product_id: 'prod-001', quantity: 1 },
        { product_id: 'prod-002', quantity: 1 }
      ],
      notes: 'Please pack in festive gift wrapping'
    })
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.success) {
    throw new Error('Failed to create order: ' + JSON.stringify(orderData));
  }

  const order = orderData.order;
  console.log(`✓ Order placed: ${order.order_number} (ID: ${order.id})`);
  console.log(`  Initial payment_status: ${order.payment_status}, order_status: ${order.order_status}`);
  console.log(`  Total Amount: ₹${order.total_amount}`);

  // Step 3: Test Webhook with INVALID signature (Security Check)
  console.log('\n[3/4] Testing Webhook security with INVALID signature...');
  const testPayload = JSON.stringify({
    event: 'SUCCESS',
    orderId: order.order_number,
    amount: order.total_amount,
    utr: 'UTR_TEST_99887766',
    paymentId: 'yp_pay_test_001'
  });

  const fakeSig = 'sha256=' + '0'.repeat(64);
  const badRes = await fetch(`${baseUrl}/api/webhooks/youpi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gateway-signature': fakeSig,
      'x-gateway-event': 'SUCCESS'
    },
    body: testPayload
  });

  console.log(`  Invalid signature status code: ${badRes.status} (Expected: 401)`);
  if (badRes.status !== 401) {
    throw new Error('Security check failed: Endpoint did not reject invalid signature!');
  }
  console.log('✓ Rejected invalid signature with 401 Unauthorized.');

  // Step 4: Test Webhook with VALID HMAC-SHA256 signature
  console.log('\n[4/4] Testing Webhook verification with VALID HMAC-SHA256 signature...');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(testPayload, 'utf8');
  const validHex = hmac.digest('hex');
  const validSigHeader = `sha256=${validHex}`;

  const validRes = await fetch(`${baseUrl}/api/webhooks/youpi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gateway-signature': validSigHeader,
      'x-gateway-event': 'SUCCESS',
      'x-gateway-delivery-id': 'deliv-test-uuid-1234',
      'x-gateway-timestamp': Date.now().toString()
    },
    body: testPayload
  });

  const validData = await validRes.json();
  console.log('Webhook verification response:', validData);
  if (!validRes.ok || !validData.success) {
    throw new Error('Webhook failed with valid signature: ' + JSON.stringify(validData));
  }
  console.log('✓ Webhook successfully accepted and verified!');

  // Verify that the order is now marked PAID in the database
  const verifyRes = await fetch(`${baseUrl}/api/orders/${order.order_number}`);
  const verifyData = await verifyRes.json();
  const updatedOrder = verifyData.order;

  console.log('\n--- Final Verified Order State in Database ---');
  console.log(`Order Number: ${updatedOrder.order_number}`);
  console.log(`Payment Status: ${updatedOrder.payment_status} (Expected: paid)`);
  console.log(`Order Status: ${updatedOrder.order_status} (Expected: Confirmed)`);
  console.log(`UTR: ${updatedOrder.utr}`);
  console.log(`Payment ID: ${updatedOrder.payment_id}`);

  if (updatedOrder.payment_status !== 'paid' || updatedOrder.order_status !== 'Confirmed') {
    throw new Error('Order status was not updated properly after webhook verification!');
  }

  console.log('\n🎉 ALL YouPI-PG INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

testYoupiIntegration().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
