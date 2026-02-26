import { type NextRequest } from 'next/server';
import { registerUser } from '@/services/userService';
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { created, error, serverError } from '@/lib/response';

export async function POST(request: NextRequest) {
  let body: { name?: unknown; email?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return error('Invalid request body', 400);
  }

  try {
    const user = await registerUser(
      String(body.name ?? ''),
      String(body.email ?? ''),
      String(body.password ?? ''),
    );

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const response = created({ user });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
