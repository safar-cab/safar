# MSG91 SMS Setup Guide

## 1. Create Account

1. Go to https://msg91.com
2. Sign up with email + phone
3. Verify account

## 2. DLT Registration (Mandatory in India)

### What is DLT?
Distributed Ledger Technology — TRAI mandate for all SMS in India. Must register sender ID and message templates.

### Steps
1. Choose a DLT portal (any one):
   - Jio: https://trueconnect.jio.com
   - Airtel: https://www.airtel.in/business/commercial-communication
   - Vodafone-Idea: https://www.vilpower.in
2. Register as **Entity** (business/individual)
3. Submit documents: PAN, business registration
4. Register **Sender ID** (6 chars, e.g., "CABAPP")
5. Register **Message Templates** (exact text with variables)
6. Wait for approval (2-5 business days)

### Template Examples to Register

```
Template 1 (OTP):
"Your OTP for {#var#} is {#var#}. Valid for 10 minutes. Do not share."

Template 2 (Booking Confirmed):
"Booking {#var#} confirmed. {#var#} on {#var#}. Driver: {#var#}. Track: {#var#}"

Template 3 (Ride Started):
"Your ride has started. Driver {#var#} en route. Track live: {#var#}"

Template 4 (Ride Completed):
"Ride completed. Amount: Rs.{#var#}. Rate your ride: {#var#}"

Template 5 (Cancellation):
"Booking {#var#} cancelled. Refund Rs.{#var#} in 5-7 days."

Template 6 (Payment):
"Payment Rs.{#var#} received for booking {#var#}. Thank you."
```

## 3. Get API Key

1. MSG91 Dashboard → Settings → API Keys
2. Create new API key
3. Copy authkey

## 4. Environment Variables

```env
MSG91_AUTH_KEY=xxxxxxxxxxxxxxxxxxxxx
MSG91_SENDER_ID=CABAPP
MSG91_OTP_TEMPLATE_ID=xxxxxxxxxxxxx
```

## 5. Install SDK

```bash
npm install msg91-sdk
# Or use REST API directly (simpler)
```

## 6. Send OTP

```typescript
// lib/sms.ts

const MSG91_BASE = 'https://control.msg91.com/api/v5';

export async function sendOTP(phone: string) {
  const res = await fetch(`${MSG91_BASE}/otp?template_id=${process.env.MSG91_OTP_TEMPLATE_ID}&mobile=91${phone}`, {
    method: 'POST',
    headers: {
      'authkey': process.env.MSG91_AUTH_KEY!,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}

export async function verifyOTP(phone: string, otp: string) {
  const res = await fetch(`${MSG91_BASE}/otp/verify?mobile=91${phone}&otp=${otp}`, {
    method: 'POST',
    headers: {
      'authkey': process.env.MSG91_AUTH_KEY!,
    },
  });
  return res.json();
}

export async function sendSMS(phone: string, templateId: string, variables: Record<string, string>) {
  const res = await fetch(`${MSG91_BASE}/flow/`, {
    method: 'POST',
    headers: {
      'authkey': process.env.MSG91_AUTH_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: templateId,
      short_url: '0',
      recipients: [{
        mobiles: `91${phone}`,
        ...variables,
      }],
    }),
  });
  return res.json();
}
```

## 7. OTP Widget (Free Alternative)

MSG91 offers a pre-built OTP widget (no extra charge):
1. Dashboard → OTP → Widget
2. Configure look and feel
3. Embed in your app
4. Handles send + verify + retry automatically

## 8. Pricing
- Transactional SMS: ₹0.16-0.30 per SMS
- OTP Widget: No additional charge
- Buy credits in bulk for lower rates

## 9. Testing
- Use MSG91 sandbox for testing
- Test numbers available in dashboard
- Check delivery reports in MSG91 dashboard
