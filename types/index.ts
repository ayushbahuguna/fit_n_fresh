// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

// ─── Address ─────────────────────────────────────────────────────────────────

export interface Address {
  id: number;
  user_id: number;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_default: boolean;
  created_at: Date;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Snapshot of shipping address stored directly on the order row (immutable)
export interface ShippingAddress {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_id: string | null;
  razorpay_order_id: string | null;
  total: number;
  shipping_address: ShippingAddress;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

// Enriched order item including product name/slug for display
export interface OrderItemWithProduct extends OrderItem {
  product_name: string;
  product_slug: string;
}

export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product_id: number;
  quantity: number;
}

export interface CartItemWithProduct {
  product_id: number;
  quantity: number;
  product: {
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
    is_active: boolean;
  };
}

export interface CartSummary {
  items: CartItemWithProduct[];
  total: number;
  itemCount: number;
}
