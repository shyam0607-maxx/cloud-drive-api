import { Request, Response, NextFunction } from "express";
import { AppError, ErrorCodes } from "../utils/errors";
import { ZodError } from "zod";

export const errorHandler = (
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    const messages = error.errors.map((err) => {
      const path = err.path.join(".");
      return `${path}: ${err.message}`;
    });

    res.status(400).json({
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: messages.join("; "),
      },
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: error.message,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: "An unknown error occurred",
    },
  });
};
