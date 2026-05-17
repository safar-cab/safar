# Razorpay Setup Guide

## 1. Create Merchant Account

1. Go to https://razorpay.com
2. Click "Sign Up"
3. Enter email, phone, business name
4. Verify email and phone

## 2. Complete KYC

### Documents Needed
- PAN card (individual or business)
- Bank account details (account number, IFSC)
- Business address proof
- GST certificate (optional but recommended)

### Important
> PAN name, bank account name, and GST legal name must match exactly.

### Steps
1. Dashboard → Account & Settings → Business Details
2. Fill business type: "Individual" or "Sole Proprietorship"
3. Upload PAN card
4. Enter bank account details
5. Submit for verification (usually approved in hours)

## 3. Get API Keys

### Test Mode (Development)
1. Dashboard → Account & Settings → API Keys
2. Generate Test Key
3. Save Key ID and Key Secret

### Live Mode (Production)
1. Toggle "Live Mode" in dashboard
2. Generate Live Key
3. Save securely — Key Secret shown only once

## 4. Environment Variables

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

## 5. Install SDK

```bash
npm install razorpay
```

## 6. Server-Side Integration

```typescript
// lib/razorpay.ts
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create Order
export async function createOrder(amount: number, bookingId: string) {
  const order = await razorpay.orders.create({
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    receipt: bookingId,
    notes: { bookingId },
  });
  return order;
}

// Verify Payment
import crypto from 'crypto';

export function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expected === signature;
}

// Create Refund
export async function createRefund(paymentId: string, amount?: number) {
  const refund = await razorpay.payments.refund(paymentId, {
    amount: amount ? amount * 100 : undefined, // undefined = full refund
  });
  return refund;
}
```

## 7. Client-Side Checkout

```typescript
// Load Razorpay script in layout.tsx or _app.tsx
// <Script src="https://checkout.razorpay.com/v1/checkout.js" />

const initiatePayment = async (orderId: string, amount: number) => {
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: amount * 100,
    currency: 'INR',
    name: 'Your Cab Company',
    description: 'Ride Booking Payment',
    order_id: orderId,
    handler: async (response: any) => {
      // Send to server for verification
      await fetch('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });
    },
    prefill: { contact: userPhone, email: userEmail },
    theme: { color: '#3B82F6' },
    method: { upi: true, card: true, netbanking: true, wallet: false },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
```

## 8. Webhook Setup

1. Dashboard → Account & Settings → Webhooks
2. Add webhook URL: `https://yourdomain.in/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`, `refund.processed`
4. Copy webhook secret → save in env

```typescript
// app/api/webhooks/razorpay/route.ts
import crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature')!;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (expected !== signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  switch (event.event) {
    case 'payment.captured':
      // Update booking status to confirmed
      break;
    case 'payment.failed':
      // Update booking status to payment_failed
      break;
    case 'refund.processed':
      // Update refund status
      break;
  }

  return Response.json({ status: 'ok' });
}
```

## 9. UPI QR Code (2026 Update)

> UPI Collect flow deprecated Feb 28, 2026. Use QR or Intent.

Razorpay handles QR generation automatically in their checkout widget.

## 10. Testing

- Use test card: 4111 1111 1111 1111
- Use test UPI: success@razorpay
- Test refund: works in test mode
- Webhook: use Razorpay Dashboard → Test Webhooks
