import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req,
  res,
  next
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};
