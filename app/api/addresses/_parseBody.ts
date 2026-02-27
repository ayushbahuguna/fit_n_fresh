import type { AddressInput } from '@/services/addressService';
import { error } from '@/lib/response';

type ParseResult =
  | { ok: true; input: AddressInput }
  | { ok: false; response: Response };

export function parseAddressBody(body: Record<string, unknown>): ParseResult {
  const name = String(body.name ?? '').trim();
  const line1 = String(body.line1 ?? '').trim();
  const line2 = body.line2 ? String(body.line2).trim() : null;
  const city = String(body.city ?? '').trim();
  const state = String(body.state ?? '').trim();
  const pincode = String(body.pincode ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const is_default = body.is_default === true;

  if (!name) return { ok: false, response: error('Name is required', 400) };
  if (!line1) return { ok: false, response: error('Address line 1 is required', 400) };
  if (!city) return { ok: false, response: error('City is required', 400) };
  if (!state) return { ok: false, response: error('State is required', 400) };
  if (!/^\d{6}$/.test(pincode)) return { ok: false, response: error('Enter a valid 6-digit pincode', 400) };
  if (!/^\d{10}$/.test(phone)) return { ok: false, response: error('Enter a valid 10-digit phone number', 400) };

  return { ok: true, input: { name, line1, line2, city, state, pincode, phone, is_default } };
}
