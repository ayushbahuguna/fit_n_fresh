import { COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth';
import { ok } from '@/lib/response';

export async function POST() {
  const response = ok({ message: 'Logged out successfully' });
  response.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
