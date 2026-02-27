import { type NextRequest } from 'next/server';
import {
  getUserAddresses,
  createAddress,
  type AddressInput,
} from '@/services/addressService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, created, error, serverError } from '@/lib/response';

export async function GET() {
  try {
    const session = await requireAuth();
    const addresses = await getUserAddresses(session.userId);
    return ok(addresses);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error('Invalid request body', 400);
  }

  try {
    const session = await requireAuth();

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
    const address = await createAddress(session.userId, input);
    return created(address);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
