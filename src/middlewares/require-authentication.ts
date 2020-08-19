import { RequestHandler } from 'express';

export const requireAuthentication: RequestHandler = (req, res, next) => {
  if (req.user !== undefined) {
    next();
  } else {
    res.status(401);
    next(new Error('Not authenticated.'));
  }
};
