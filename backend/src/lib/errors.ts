// An error with an HTTP status code.
// Services throw this; the global error handler turns it into a JSON response.
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
