import { Request, Response, NextFunction } from "express";

export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new Error(`Route not found: ${req.originalUrl}`) as any;
  error.statusCode = 404;
  next(error);
};
