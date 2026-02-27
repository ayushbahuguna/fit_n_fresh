import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { AppError } from '@/lib/errors';
import type { Product } from '@/types';

// ─── Internal DB row type ─────────────────────────────────────────────────────

interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string; // DECIMAL returns as string from mysql2
  stock: number;
  images: string | string[]; // JSON column — may be pre-parsed or raw string
  is_active: number; // TINYINT(1)
  created_at: Date;
  updated_at: Date;
}

// ─── Input types (used by API routes) ────────────────────────────────────────

export interface CreateProductInput {
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  is_active?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

// ─── Private helpers ──────────────────────────────────────────────────────────

const PRODUCT_COLUMNS =
  'id, name, slug, description, price, stock, images, is_active, created_at, updated_at';

function parseImages(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: parseFloat(row.price),
    stock: row.stock,
    images: parseImages(row.images),
    is_active: row.is_active === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function validateAndNormalize(
  input: CreateProductInput,
): Required<CreateProductInput> {
  const name = (input.name ?? '').trim();
  const description = (input.description ?? '').trim();

  if (!name || name.length > 255)
    throw new AppError('Name must be 1–255 characters', 422);
  if (!description) throw new AppError('Description is required', 422);

  const price = Number(input.price);
  if (!isFinite(price) || price <= 0)
    throw new AppError('Price must be a positive number', 422);

  const stock = Math.floor(Number(input.stock));
  if (!isFinite(stock) || stock < 0)
    throw new AppError('Stock must be a non-negative integer', 422);

  if (!Array.isArray(input.images) || input.images.length === 0)
    throw new AppError('At least one image URL is required', 422);

  const slug = (input.slug ?? '').trim() || generateSlug(name);
  if (!slug) throw new AppError('Could not derive a valid slug from name', 422);

  return {
    name,
    slug,
    description,
    price,
    stock,
    images: input.images,
    is_active: input.is_active ?? true,
  };
}

// ─── Public: listing & detail ─────────────────────────────────────────────────

export async function getActiveProducts(): Promise<Product[]> {
  const [rows] = await pool.execute<ProductRow[]>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE is_active = 1 ORDER BY created_at DESC`,
  );
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [rows] = await pool.execute<ProductRow[]>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE slug = ? AND is_active = 1`,
    [slug],
  );
  return rows[0] ? toProduct(rows[0]) : null;
}

// ─── Admin: full CRUD ─────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const [rows] = await pool.execute<ProductRow[]>(
    `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY created_at DESC`,
  );
  return rows.map(toProduct);
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const data = validateAndNormalize(input);

  const [slugCheck] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM products WHERE slug = ?',
    [data.slug],
  );
  if (slugCheck.length > 0)
    throw new AppError('A product with this slug already exists', 409);

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO products (name, slug, description, price, stock, images, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      data.name,
      data.slug,
      data.description,
      data.price,
      data.stock,
      JSON.stringify(data.images),
      data.is_active ? 1 : 0,
    ],
  );

  const [rows] = await pool.execute<ProductRow[]>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`,
    [result.insertId],
  );
  return toProduct(rows[0]);
}

export async function updateProduct(
  id: number,
  input: UpdateProductInput,
): Promise<Product> {
  const [existing] = await pool.execute<ProductRow[]>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`,
    [id],
  );
  if (!existing[0]) throw new AppError('Product not found', 404);

  const current = toProduct(existing[0]);

  // Merge: incoming fields override current values
  const merged: CreateProductInput = {
    name: input.name ?? current.name,
    slug: input.slug ?? current.slug,
    description: input.description ?? current.description,
    price: input.price ?? current.price,
    stock: input.stock ?? current.stock,
    images: input.images ?? current.images,
    is_active: input.is_active ?? current.is_active,
  };

  const data = validateAndNormalize(merged);

  if (data.slug !== current.slug) {
    const [slugCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM products WHERE slug = ? AND id != ?',
      [data.slug, id],
    );
    if (slugCheck.length > 0)
      throw new AppError('A product with this slug already exists', 409);
  }

  await pool.execute(
    'UPDATE products SET name=?, slug=?, description=?, price=?, stock=?, images=?, is_active=? WHERE id=?',
    [
      data.name,
      data.slug,
      data.description,
      data.price,
      data.stock,
      JSON.stringify(data.images),
      data.is_active ? 1 : 0,
      id,
    ],
  );

  const [rows] = await pool.execute<ProductRow[]>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`,
    [id],
  );
  return toProduct(rows[0]);
}

export async function deleteProduct(id: number): Promise<void> {
  const [existing] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM products WHERE id = ?',
    [id],
  );
  if (!existing[0]) throw new AppError('Product not found', 404);

  // Soft delete — preserves FK integrity with order_items
  await pool.execute('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
}
