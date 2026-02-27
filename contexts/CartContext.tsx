'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { CartSummary } from '@/types';

interface CartContextValue {
  summary: CartSummary | null;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (!res.ok) return; // unauthenticated or server error — no cart state
      const data: { success: boolean; data: CartSummary } = await res.json();
      if (data.success) setSummary(data.data);
    } catch {
      /* network error — silently ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId: number, quantity = 1) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    const data: { success: boolean; data: CartSummary; message?: string } =
      await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Failed to add to cart');
    setSummary(data.data);
  }, []);

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data: { success: boolean; data: CartSummary; message?: string } =
        await res.json();
      if (!res.ok)
        throw new Error(data.message ?? 'Failed to update quantity');
      setSummary(data.data);
    },
    [],
  );

  const removeItem = useCallback(async (productId: number) => {
    const res = await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
    const data: { success: boolean; data: CartSummary; message?: string } =
      await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Failed to remove item');
    setSummary(data.data);
  }, []);

  return (
    <CartContext.Provider
      value={{ summary, loading, addToCart, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
