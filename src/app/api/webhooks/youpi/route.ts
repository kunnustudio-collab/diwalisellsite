import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { markOrderPaid, getSiteSettings, getOrderByIdOrNumber } from '@/lib/db';

/**
 * YouPI-PG Sovereign UPI Payment Gateway Webhook Receiver
 * Specifications: https://github.com/youpi-pg/YouPI-PG
 *
 * Headers sent by YouPI-PG:
 * - x-gateway-signature: sha256=<64_char_hex_hash>
 * - x-gateway-event: SUCCESS
 * - x-gateway-delivery-id: <uuid>
 * - x-gateway-timestamp: <timestamp_ms>
 */

export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body as text for cryptographic HMAC-SHA256 signature verification
    const rawBody = await req.text();

    // 2. Extract signature header (case-insensitive check)
    const signatureHeader =
      req.headers.get('x-gateway-signature') ||
      req.headers.get('X-Gateway-Signature') ||
      '';

    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      return NextResponse.json(
        { error: 'Missing or malformed X-Gateway-Signature header. Must be sha256=<hex>' },
        { status: 400 }
      );
    }

    const signatureHex = signatureHeader.slice('sha256='.length).trim();

    // 3. Obtain secret key from environment or store settings
    const settings = await getSiteSettings();
    const webhookSecret =
      process.env.YOUPI_WEBHOOK_SECRET ||
      settings.youpi_webhook_secret ||
      'yp_sec_diwali_decor_2026_supersecret';

    // 4. Compute expected HMAC-SHA256 hash over raw body
    const computedHex = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody, 'utf8')
      .digest('hex');

    // 5. Timing-safe constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signatureHex, 'utf8');
    const compBuffer = Buffer.from(computedHex, 'utf8');

    if (sigBuffer.length !== compBuffer.length || !crypto.timingSafeEqual(sigBuffer, compBuffer)) {
      console.warn('[YouPI-PG Webhook] Signature verification failed.', {
        receivedSigLength: sigBuffer.length,
        computedSigLength: compBuffer.length,
      });
      return NextResponse.json(
        { error: 'Invalid webhook signature. Request unauthenticated.' },
        { status: 401 }
      );
    }

    // 6. Signature valid: Parse verified JSON payload safely
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const {
      event,
      orderId,
      order_id,
      amount,
      utr,
      paymentId,
      payment_id,
    } = payload;

    const targetOrderId = (orderId || order_id || '').toString();
    const effectiveUtr = utr || paymentId || payment_id || 'UPI_BANK_CREDIT';
    const effectivePaymentId = paymentId || payment_id || utr || `yp_${Date.now()}`;

    if (!targetOrderId) {
      return NextResponse.json({ error: 'Missing orderId in payload' }, { status: 400 });
    }

    // Check if order exists
    const existingOrder = await getOrderByIdOrNumber(targetOrderId);
    if (!existingOrder) {
      console.warn(`[YouPI-PG Webhook] Order not found for ID/Number: ${targetOrderId}`);
      return NextResponse.json({ error: `Order ${targetOrderId} not found` }, { status: 404 });
    }

    // 7. Authoritatively fulfill and confirm order
    const updatedOrder = await markOrderPaid(targetOrderId, {
      utr: effectiveUtr,
      paymentId: effectivePaymentId,
      notes: `Verified via YouPI-PG Webhook (Amount: ₹${amount || existingOrder.total_amount}, UTR: ${effectiveUtr})`,
    });

    console.log(
      `[YouPI-PG Webhook] Order ${updatedOrder?.order_number} authoritatively verified and marked PAID!`
    );

    return NextResponse.json({
      status: 'received',
      success: true,
      order_id: updatedOrder?.order_number || targetOrderId,
      payment_status: 'paid',
      order_status: updatedOrder?.order_status || 'Confirmed',
    });
  } catch (err: any) {
    console.error('[YouPI-PG Webhook] Processing error:', err);
    return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
  }
}

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({
    status: 'active',
    gateway: 'YouPI-PG Sovereign UPI Payment Gateway',
    repository: 'https://github.com/youpi-pg/YouPI-PG',
    configured: Boolean(settings.youpi_enabled),
    endpoint: '/api/webhooks/youpi',
    specs: {
      zero_fee: true,
      direct_settlement: true,
      signature_header: 'x-gateway-signature',
      algorithm: 'HMAC-SHA256 (sha256=<hex>)',
    },
  });
}
