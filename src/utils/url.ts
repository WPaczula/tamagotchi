import { Request } from 'express';

export const getCurrentUrl = (req: Request) =>
  `${req.protocol}://${req.get('host')}${req.originalUrl}`;
