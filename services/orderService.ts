import crypto from 'node:crypto';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '@/lib/db';
import { AppError } from '@/lib/errors';
import type {
  Order,
  OrderWithItems,
  OrderItemWithProduct,
  OrderStatus,
  PaymentStatus,
} from '@/types';

// ─── DB Row Types ─────────────────────────────────────────────────────────────

interface AddressRow extends RowDataPacket {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface CartRow extends RowDataPacket {
  product_id: number;
  quantity: number;
  price: string; // DECIMAL returns as string
  name: string;
  slug: string;
}

interface ProductLockRow extends RowDataPacket {
  id: number;
  stock: number;
  is_active: number;
}

interface OrderRow extends RowDataPacket {
  id: number;
  user_id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_id: string | null;
  razorpay_order_id: string | null;
  total: string; // DECIMAL returns as string
  shipping_name: string;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_phone: string;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemRow extends RowDataPacket {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string; // DECIMAL returns as string
  product_name: string;
  product_slug: string;
}

// ─── Column Constants ─────────────────────────────────────────────────────────

const ORDER_COLUMNS = [
  'id', 'user_id', 'order_number', 'status', 'payment_status',
  'payment_id', 'razorpay_order_id', 'total',
  'shipping_name', 'shipping_line1', 'shipping_line2',
  'shipping_city', 'shipping_state', 'shipping_pincode', 'shipping_phone',
  'created_at', 'updated_at',
].join(', ');

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    user_id: row.user_id,
    order_number: row.order_number,
    status: row.status,
    payment_status: row.payment_status,
    payment_id: row.payment_id,
    razorpay_order_id: row.razorpay_order_id,
    total: parseFloat(row.total),
    shipping_address: {
      name: row.shipping_name,
      line1: row.shipping_line1,
      line2: row.shipping_line2,
      city: row.shipping_city,
      state: row.shipping_state,
      pincode: row.shipping_pincode,
      phone: row.shipping_phone,
    },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toOrderItem(row: OrderItemRow): OrderItemWithProduct {
  return {
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    quantity: row.quantity,
    unit_price: parseFloat(row.unit_price),
    product_name: row.product_name,
    product_slug: row.product_slug,
  };
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  // Format: FNF20240215A3B9C2D1 (3 prefix + 8 date + 8 random hex = 19 chars)
  const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `FNF${yyyymmdd}${rand}`;
}

async function fetchOrderWithItems(
  orderId: number,
  userId: number,
): Promise<OrderWithItems | null> {
  const [orderRows] = await pool.execute<OrderRow[]>(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ? AND user_id = ?`,
    [orderId, userId],
  );
  if (orderRows.length === 0) return null;

  const [itemRows] = await pool.execute<OrderItemRow[]>(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
            p.name AS product_name, p.slug AS product_slug
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC`,
    [orderId],
  );

  return { ...toOrder(orderRows[0]), items: itemRows.map(toOrderItem) };
}

// ─── Public Service Functions ─────────────────────────────────────────────────

/**
 * Creates an order from the user's current cart inside a single transaction.
 *
 * Concurrency safety:
 * - Product rows acquired with FOR UPDATE before stock validation.
 * - Products locked in ascending ID order to prevent deadlocks under concurrent orders.
 * - Stock deducted and cart cleared atomically — no window for overselling.
 * - Full rollback on any validation or DB error.
 */
export async function createOrder(
  userId: number,
  addressId: number,
): Promise<OrderWithItems> {
  const conn = await pool.getConnection();
  let orderId = 0;

  try {
    await conn.beginTransaction();

    // ── 1. Fetch cart items ──────────────────────────────────────────────────
    const [cartRows] = await conn.execute<CartRow[]>(
      `SELECT ci.product_id, ci.quantity, p.price, p.name, p.slug
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at ASC`,
      [userId],
    );

    if (cartRows.length === 0) {
      throw new AppError('Cart is empty', 422);
    }

    // ── 2. Lock product rows in ascending ID order (prevents deadlocks) ──────
    const productIds = [...new Set(cartRows.map((r) => r.product_id))].sort(
      (a, b) => a - b,
    );
    const placeholders = productIds.map(() => '?').join(', ');

    const [lockRows] = await conn.execute<ProductLockRow[]>(
      `SELECT id, stock, is_active
       FROM products
       WHERE id IN (${placeholders})
       ORDER BY id
       FOR UPDATE`,
      productIds,
    );

    // ── 3. Validate availability and stock ───────────────────────────────────
    const stockMap = new Map(lockRows.map((r) => [r.id, r]));

    for (const item of cartRows) {
      const prod = stockMap.get(item.product_id);
      if (!prod || prod.is_active === 0) {
        throw new AppError(`"${item.name}" is no longer available`, 422);
      }
      if (item.quantity > prod.stock) {
        throw new AppError(
          prod.stock === 0
            ? `"${item.name}" is out of stock`
            : `Only ${prod.stock} unit(s) of "${item.name}" available`,
          422,
        );
      }
    }

    // ── 4. Validate shipping address ownership ───────────────────────────────
    const [addrRows] = await conn.execute<AddressRow[]>(
      `SELECT name, line1, line2, city, state, pincode, phone
       FROM addresses
       WHERE id = ? AND user_id = ?`,
      [addressId, userId],
    );

    if (addrRows.length === 0) {
      throw new AppError('Shipping address not found', 404);
    }
    const addr = addrRows[0];

    // ── 5. Compute total from DB-locked prices (ignores any client values) ───
    const total = cartRows.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );

    // ── 6. Insert order ──────────────────────────────────────────────────────
    const orderNumber = generateOrderNumber();

    const [orderResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO orders
         (user_id, order_number, total,
          shipping_name, shipping_line1, shipping_line2,
          shipping_city, shipping_state, shipping_pincode, shipping_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderNumber,
        total.toFixed(2),
        addr.name,
        addr.line1,
        addr.line2 ?? null,
        addr.city,
        addr.state,
        addr.pincode,
        addr.phone,
      ],
    );

    orderId = orderResult.insertId;

    // ── 7. Batch-insert order items (price snapshot from DB) ─────────────────
    const itemValues = cartRows.map((item) => [
      orderId,
      item.product_id,
      item.quantity,
      item.price,
    ]);

    await conn.query(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?',
      [itemValues],
    );

    // ── 8. Deduct stock atomically ───────────────────────────────────────────
    for (const item of cartRows) {
      await conn.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id],
      );
    }

    // ── 9. Clear the user's cart ─────────────────────────────────────────────
    await conn.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  // Connection released — fetch the committed order via pool
  const order = await fetchOrderWithItems(orderId, userId);
  if (!order) throw new AppError('Order created but could not be retrieved', 500);
  return order;
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const [rows] = await pool.execute<OrderRow[]>(
    `SELECT ${ORDER_COLUMNS}
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toOrder);
}

export async function getOrderByIdForUser(
  userId: number,
  orderId: number,
): Promise<OrderWithItems | null> {
  return fetchOrderWithItems(orderId, userId);
}

// ─── Payment Update — called by Razorpay webhook handler (Phase 6) ───────────

export interface PaymentUpdateData {
  razorpay_order_id: string;
  payment_id: string;
  payment_status: PaymentStatus;
}

export async function updateOrderPayment(
  orderId: number,
  data: PaymentUpdateData,
): Promise<void> {
  await pool.execute(
    `UPDATE orders
     SET razorpay_order_id = ?, payment_id = ?, payment_status = ?
     WHERE id = ?`,
    [data.razorpay_order_id, data.payment_id, data.payment_status, orderId],
  );
}
