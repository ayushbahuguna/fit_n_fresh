import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '@/lib/db';
import { AppError } from '@/lib/errors';
import type { Address } from '@/types';

// ─── DB Row Type ──────────────────────────────────────────────────────────────

interface AddressRow extends RowDataPacket {
  id: number;
  user_id: number;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_default: number; // TINYINT(1)
  created_at: Date;
}

const ADDRESS_COLUMNS =
  'id, user_id, name, line1, line2, city, state, pincode, phone, is_default, created_at';

// ─── Mapper ───────────────────────────────────────────────────────────────────

function toAddress(row: AddressRow): Address {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    phone: row.phone,
    is_default: row.is_default === 1,
    created_at: row.created_at,
  };
}

// ─── Input Type ───────────────────────────────────────────────────────────────

export interface AddressInput {
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_default?: boolean;
}

// ─── Public Service Functions ─────────────────────────────────────────────────

export async function getUserAddresses(userId: number): Promise<Address[]> {
  const [rows] = await pool.execute<AddressRow[]>(
    `SELECT ${ADDRESS_COLUMNS}
     FROM addresses
     WHERE user_id = ?
     ORDER BY is_default DESC, created_at DESC`,
    [userId],
  );
  return rows.map(toAddress);
}

export async function createAddress(
  userId: number,
  data: AddressInput,
): Promise<Address> {
  const conn = await pool.getConnection();
  let insertId = 0;

  try {
    await conn.beginTransaction();

    // First address is always set as default regardless of the flag
    const [countRows] = await conn.execute<RowDataPacket[]>(
      'SELECT COUNT(*) AS cnt FROM addresses WHERE user_id = ?',
      [userId],
    );
    const isFirst = (countRows[0] as { cnt: number }).cnt === 0;
    const makeDefault = data.is_default || isFirst;

    if (makeDefault) {
      await conn.execute(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
        [userId],
      );
    }

    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO addresses
         (user_id, name, line1, line2, city, state, pincode, phone, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.name,
        data.line1,
        data.line2 ?? null,
        data.city,
        data.state,
        data.pincode,
        data.phone,
        makeDefault ? 1 : 0,
      ],
    );

    insertId = result.insertId;
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [rows] = await pool.execute<AddressRow[]>(
    `SELECT ${ADDRESS_COLUMNS} FROM addresses WHERE id = ?`,
    [insertId],
  );
  return toAddress(rows[0]);
}

export async function updateAddress(
  userId: number,
  addressId: number,
  data: AddressInput,
): Promise<Address> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [existing] = await conn.execute<AddressRow[]>(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ? FOR UPDATE',
      [addressId, userId],
    );
    if (existing.length === 0) throw new AppError('Address not found', 404);

    if (data.is_default) {
      await conn.execute(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
        [userId],
      );
    }

    await conn.execute(
      `UPDATE addresses
       SET name = ?, line1 = ?, line2 = ?, city = ?, state = ?,
           pincode = ?, phone = ?, is_default = ?
       WHERE id = ?`,
      [
        data.name,
        data.line1,
        data.line2 ?? null,
        data.city,
        data.state,
        data.pincode,
        data.phone,
        data.is_default ? 1 : 0,
        addressId,
      ],
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [rows] = await pool.execute<AddressRow[]>(
    `SELECT ${ADDRESS_COLUMNS} FROM addresses WHERE id = ?`,
    [addressId],
  );
  return toAddress(rows[0]);
}

export async function deleteAddress(
  userId: number,
  addressId: number,
): Promise<void> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM addresses WHERE id = ? AND user_id = ?',
    [addressId, userId],
  );
  if (result.affectedRows === 0) throw new AppError('Address not found', 404);
}
