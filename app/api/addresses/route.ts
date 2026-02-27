import { type NextRequest } from 'next/server';
import { getUserAddresses, createAddress } from '@/services/addressService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, created, error, serverError } from '@/lib/response';
import { parseAddressBody } from './_parseBody';

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

  const parsed = parseAddressBody(body);
  if (!parsed.ok) return parsed.response;

  try {
    const session = await requireAuth();
    const address = await createAddress(session.userId, parsed.input);
    return created(address);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
