export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_MIME_TYPE: "INVALID_MIME_TYPE",
  STORAGE_ERROR: "STORAGE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMIT: "RATE_LIMIT",
  CIRCULAR_REFERENCE: "CIRCULAR_REFERENCE",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  USER_EXISTS: "USER_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  FOLDER_NOT_EMPTY: "FOLDER_NOT_EMPTY",
};

export const createError = (
  code: string,
  message: string,
  statusCode: number = 500
): AppError => {
  return new AppError(code, message, statusCode);
};

export const ErrorResponses = {
  unauthorized: createError(
    ErrorCodes.UNAUTHORIZED,
    "You must be logged in to access this resource",
    401
  ),
  forbidden: createError(
    ErrorCodes.FORBIDDEN,
    "You do not have permission to access this resource",
    403
  ),
  notFound: createError(
    ErrorCodes.NOT_FOUND,
    "The requested resource was not found",
    404
  ),
  conflict: (msg: string) =>
    createError(ErrorCodes.CONFLICT, msg, 409),
  validationError: (msg: string) =>
    createError(ErrorCodes.VALIDATION_ERROR, msg, 400),
  fileTooLarge: createError(
    ErrorCodes.FILE_TOO_LARGE,
    "File exceeds maximum size",
    413
  ),
  invalidMimeType: createError(
    ErrorCodes.INVALID_MIME_TYPE,
    "File type is not allowed",
    400
  ),
  storageError: createError(
    ErrorCodes.STORAGE_ERROR,
    "Failed to process file storage",
    500
  ),
  internalError: createError(
    ErrorCodes.INTERNAL_ERROR,
    "An internal server error occurred",
    500
  ),
  rateLimit: createError(
    ErrorCodes.RATE_LIMIT,
    "Too many requests. Please try again later",
    429
  ),
  circularReference: createError(
    ErrorCodes.CIRCULAR_REFERENCE,
    "Cannot move folder to itself or its child",
    400
  ),
  userExists: createError(
    ErrorCodes.USER_EXISTS,
    "User with this email already exists",
    409
  ),
  invalidCredentials: createError(
    ErrorCodes.INVALID_CREDENTIALS,
    "Invalid email or password",
    401
  ),
};
