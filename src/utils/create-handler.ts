import { RequestHandler } from 'express';

const createHandler = (handler: RequestHandler): RequestHandler => async (
  req,
  res,
  next
) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default createHandler;
