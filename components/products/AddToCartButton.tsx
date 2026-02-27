'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';

interface AddToCartButtonProps {
  productId: number;
  productName: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

type ButtonState = 'idle' | 'loading' | 'added' | 'error';

export default function AddToCartButton({
  productId,
  productName: _productName,
  disabled = false,
  size = 'md',
  fullWidth = true,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [state, setState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (disabled) {
    return (
      <Button variant="secondary" size={size} fullWidth={fullWidth} disabled>
        Out of Stock
      </Button>
    );
  }

  async function handleClick() {
    if (state !== 'idle') return;
    setState('loading');
    try {
      await addToCart(productId);
      setState('added');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add to cart');
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  if (state === 'added') {
    return (
      <Button variant="primary" size={size} fullWidth={fullWidth} aria-live="polite">
        <CheckIcon />
        Added to Cart
      </Button>
    );
  }

  if (state === 'error') {
    return (
      <Button variant="outline" size={size} fullWidth={fullWidth} aria-live="polite">
        {errorMsg || 'Failed'}
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size={size}
      fullWidth={fullWidth}
      loading={state === 'loading'}
      onClick={handleClick}
    >
      Add to Cart
    </Button>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
