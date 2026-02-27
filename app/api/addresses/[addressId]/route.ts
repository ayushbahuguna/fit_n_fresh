import { type NextRequest } from 'next/server';
import {
  updateAddress,
  deleteAddress,
  type AddressInput,
} from '@/services/addressService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, error, serverError } from '@/lib/response';

interface Params {
  params: Promise<{ addressId: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error('Invalid request body', 400);
  }

  try {
    const session = await requireAuth();
    const { addressId: addressIdStr } = await params;
    const addressId = parseInt(addressIdStr, 10);
    if (isNaN(addressId)) return error('Invalid address ID', 400);

    const name = String(body.name ?? '').trim();
    const line1 = String(body.line1 ?? '').trim();
    const line2 = body.line2 ? String(body.line2).trim() : null;
    const city = String(body.city ?? '').trim();
    const state = String(body.state ?? '').trim();
    const pincode = String(body.pincode ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const is_default = body.is_default === true;

    if (!name) return error('Name is required', 400);
    if (!line1) return error('Address line 1 is required', 400);
    if (!city) return error('City is required', 400);
    if (!state) return error('State is required', 400);
    if (!/^\d{6}$/.test(pincode)) return error('Enter a valid 6-digit pincode', 400);
    if (!/^\d{10}$/.test(phone)) return error('Enter a valid 10-digit phone number', 400);

    const input: AddressInput = { name, line1, line2, city, state, pincode, phone, is_default };
    const address = await updateAddress(session.userId, addressId, input);
    return ok(address);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { addressId: addressIdStr } = await params;
    const addressId = parseInt(addressIdStr, 10);
    if (isNaN(addressId)) return error('Invalid address ID', 400);

    await deleteAddress(session.userId, addressId);
    return ok({ deleted: true });
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
