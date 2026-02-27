import { type NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleWebhookEvent } from '@/services/paymentService';

/**
 * Razorpay webhook endpoint.
 *
 * Razorpay sends signed POST requests here for payment events.
 * We must:
 *   1. Read the raw body (needed for signature verification).
 *   2. Verify the X-Razorpay-Signature header.
 *   3. Process the event and return 200 immediately.
 *
 * Always return 200 — any non-200 triggers Razorpay retries.
 * Failures are silently swallowed to avoid leaking internals.
 *
 * Register this URL in your Razorpay Dashboard → Webhooks.
 * Set RAZORPAY_WEBHOOK_SECRET to the secret configured there.
 */
export async function POST(request: NextRequest) {
  // 1. Read raw body as string — required for HMAC verification
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // 2. Verify signature header
  const signature = request.headers.get('x-razorpay-signature') ?? '';
  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    // Return 200 to stop retries; log in production
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // 3. Parse and route event
  try {
    const payload = JSON.parse(rawBody) as {
      event: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
          };
        };
      };
    };

    const event = payload.event ?? '';
    const entity = payload.payload?.payment?.entity;

    if (entity?.id && entity?.order_id) {
      await handleWebhookEvent(event, {
        id: entity.id,
        order_id: entity.order_id,
      });
    }
  } catch {
    // Parsing or DB error — still return 200 to avoid retries
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
