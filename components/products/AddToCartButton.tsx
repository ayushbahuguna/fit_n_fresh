'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface AddToCartButtonProps {
  productId: number;
  productName: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function AddToCartButton({
  productId: _productId,
  productName: _productName,
  disabled = false,
  size = 'md',
  fullWidth = true,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  if (disabled) {
    return (
      <Button variant="secondary" size={size} fullWidth={fullWidth} disabled>
        Out of Stock
      </Button>
    );
  }

  function handleClick() {
    if (added) return;
    // TODO: dispatch to cart context/store when cart module is built
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button
      variant="primary"
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      aria-live="polite"
    >
      {added ? (
        <span className="flex items-center justify-center gap-2">
          <CheckIcon />
          Added to Cart
        </span>
      ) : (
        'Add to Cart'
      )}
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
