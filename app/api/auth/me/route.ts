import { getUserById } from '@/services/userService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, error, serverError } from '@/lib/response';

export async function GET() {
  try {
    const session = await requireAuth();

    // Fetch fresh user from DB — JWT payload may be stale (e.g. role change)
    const user = await getUserById(session.userId);

    if (!user) {
      return error('User no longer exists', 401);
    }

    return ok({ user });
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
