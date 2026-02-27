'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── Razorpay Checkout JS type declarations ───────────────────────────────────

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// ─── Script loader (idempotent) ───────────────────────────────────────────────

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

type PayStatus = 'idle' | 'loading' | 'verifying' | 'error';

interface Props {
  orderId: number;
  total: number;
}

export default function PayButton({ orderId, total }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<PayStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handlePay() {
    setStatus('loading');
    setErrorMessage('');

    // 1. Create Razorpay order on the server
    let rzpData: {
      razorpay_order_id: string;
      amount: number;
      currency: string;
      key_id: string;
    };

    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.message ?? 'Unable to initiate payment. Please try again.');
        setStatus('error');
        return;
      }
      rzpData = json.data;
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setStatus('error');
      return;
    }

    // 2. Lazily load Razorpay Checkout JS (cached after first load)
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setErrorMessage(
        'Could not load the payment gateway. Disable any ad blockers and try again.',
      );
      setStatus('error');
      return;
    }

    // 3. Open Razorpay modal — status stays 'loading' until the user
    //    either pays (handler runs) or dismisses (ondismiss runs).
    const rzp = new window.Razorpay({
      key: rzpData.key_id,
      amount: rzpData.amount,
      currency: rzpData.currency,
      name: 'Fit N Fresh',
      description: `Order #${orderId}`,
      order_id: rzpData.razorpay_order_id,

      // 4. Payment success — verify server-side before updating UI
      handler: async (response) => {
        setStatus('verifying');
        try {
          const vRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const vJson = await vRes.json();
          if (!vRes.ok) {
            setErrorMessage(
              vJson.message ?? 'Payment verification failed. Please contact support.',
            );
            setStatus('error');
            return;
          }
          // Refresh the Server Component — order will now show payment_status='paid'
          router.refresh();
        } catch {
          setErrorMessage(
            'Verification error. Your payment may have been captured — contact support with your order number.',
          );
          setStatus('error');
        }
      },

      theme: { color: '#3A0A4A' },

      // User closed modal without paying
      modal: { ondismiss: () => setStatus('idle') },
    });

    rzp.open();
  }

  const isDisabled = status === 'loading' || status === 'verifying';

  return (
    <div className="space-y-3">
      {errorMessage && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={isDisabled}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-accent-light active:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {status === 'loading' && (
          <>
            <Spinner />
            Initiating Payment…
          </>
        )}
        {status === 'verifying' && (
          <>
            <Spinner />
            Verifying Payment…
          </>
        )}
        {(status === 'idle' || status === 'error') && (
          <>
            <LockIcon />
            Pay ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </>
        )}
      </button>

      <p className="text-center text-xs text-ink-subtle">
        Secured by Razorpay · All prices in INR
      </p>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div
      className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
      aria-hidden="true"
    />
  );
}

function LockIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
