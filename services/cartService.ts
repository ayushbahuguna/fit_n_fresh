import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { AppError } from '@/lib/errors';
import type { CartItemWithProduct } from '@/types';

// ─── Internal DB row types ────────────────────────────────────────────────────

interface ProductCartCheckRow extends RowDataPacket {
  stock: number;
  is_active: number;
  current_qty: number;
}

interface CartJoinRow extends RowDataPacket {
  product_id: number;
  quantity: number;
  product_name: string;
  product_slug: string;
  product_price: string; // DECIMAL returns as string
  product_images: string | string[];
  product_stock: number;
  product_is_active: number;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function parseImages(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function toCartItem(row: CartJoinRow): CartItemWithProduct {
  return {
    product_id: row.product_id,
    quantity: row.quantity,
    product: {
      name: row.product_name,
      slug: row.product_slug,
      price: parseFloat(row.product_price),
      images: parseImages(row.product_images),
      stock: row.product_stock,
      is_active: row.product_is_active === 1,
    },
  };
}

// Fetches the full cart with product details via JOIN — reused by all mutating functions
async function fetchCart(userId: number): Promise<CartItemWithProduct[]> {
  const [rows] = await pool.execute<CartJoinRow[]>(
    `SELECT
       ci.product_id,
       ci.quantity,
       p.name      AS product_name,
       p.slug      AS product_slug,
       p.price     AS product_price,
       p.images    AS product_images,
       p.stock     AS product_stock,
       p.is_active AS product_is_active
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?
     ORDER BY ci.created_at ASC`,
    [userId],
  );
  return rows.map(toCartItem);
}

// Single query: product info + current cart quantity for validation
async function checkProductAndCartQty(
  userId: number,
  productId: number,
): Promise<ProductCartCheckRow | null> {
  const [rows] = await pool.execute<ProductCartCheckRow[]>(
    `SELECT p.stock, p.is_active, COALESCE(ci.quantity, 0) AS current_qty
     FROM products p
     LEFT JOIN cart_items ci ON ci.product_id = p.id AND ci.user_id = ?
     WHERE p.id = ?`,
    [userId, productId],
  );
  return rows[0] ?? null;
}

// ─── Public service functions ─────────────────────────────────────────────────

export async function getCart(userId: number): Promise<CartItemWithProduct[]> {
  return fetchCart(userId);
}

export async function addToCart(
  userId: number,
  productId: number,
  quantity: number,
): Promise<CartItemWithProduct[]> {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError('Quantity must be a positive integer', 422);
  }

  const row = await checkProductAndCartQty(userId, productId);
  if (!row) throw new AppError('Product not found', 404);
  if (row.is_active === 0) throw new AppError('Product is no longer available', 410);

  const projectedQty = row.current_qty + quantity;
  if (projectedQty > row.stock) {
    throw new AppError(
      row.stock === 0
        ? 'This product is out of stock'
        : `Only ${row.stock - row.current_qty} more unit(s) can be added`,
      422,
    );
  }

  // Upsert: insert new row or increment existing quantity atomically
  await pool.execute(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
    [userId, productId, quantity, quantity],
  );

  return fetchCart(userId);
}

export async function updateQuantity(
  userId: number,
  productId: number,
  quantity: number,
): Promise<CartItemWithProduct[]> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new AppError('Quantity must be a non-negative integer', 422);
  }

  // Setting quantity to 0 removes the item
  if (quantity === 0) {
    await removeFromCart(userId, productId);
    return fetchCart(userId);
  }

  const row = await checkProductAndCartQty(userId, productId);
  if (!row) throw new AppError('Product not found', 404);
  if (row.is_active === 0) throw new AppError('Product is no longer available', 410);
  if (row.current_qty === 0) throw new AppError('Item not found in cart', 404);
  if (quantity > row.stock) {
    throw new AppError(`Only ${row.stock} unit(s) available`, 422);
  }

  await pool.execute(
    'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
    [quantity, userId, productId],
  );

  return fetchCart(userId);
}

export async function removeFromCart(
  userId: number,
  productId: number,
): Promise<void> {
  // Idempotent: no error if the item is already absent
  await pool.execute(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId],
  );
}

// Exported for use by orderService after successful payment
export async function clearCart(userId: number): Promise<void> {
  await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
}
