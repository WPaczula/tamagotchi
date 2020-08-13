import { ErrorRequestHandler } from 'express';
import ValidationError from '../errors/validation';

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = res.statusCode;

  if (error instanceof ValidationError) {
    statusCode = 400;
  } else {
    statusCode = statusCode >= 400 ? statusCode : 500;
  }

  res.status(statusCode).json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};
