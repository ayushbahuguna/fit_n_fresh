import { type NextRequest } from 'next/server';
import { updateAddress, deleteAddress } from '@/services/addressService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, error, serverError } from '@/lib/response';
import { parseAddressBody } from '../_parseBody';

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

  const parsed = parseAddressBody(body);
  if (!parsed.ok) return parsed.response;

  try {
    const session = await requireAuth();
    const { addressId: addressIdStr } = await params;
    const addressId = parseInt(addressIdStr, 10);
    if (isNaN(addressId)) return error('Invalid address ID', 400);

    const address = await updateAddress(session.userId, addressId, parsed.input);
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
