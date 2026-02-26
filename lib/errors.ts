/**
 * Application-level error that carries an HTTP status code.
 * Thrown by service layer, caught and mapped to JSON responses by API routes.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
