import { notFound } from '../../middlewares/not-found';
import { mockRequest, mockResponse } from 'mock-req-res';
import { expect } from 'chai';
import { NextFunction } from 'express';

describe('notFound', () => {
  it('should return error message and stack in development mode.', () => {
    let error: Error = new Error();
    const next = ((e: Error) => {
      error = e;
    }) as NextFunction;
    const notFoundUrl = 'url';
    const req = mockRequest({ originalUrl: notFoundUrl });

    notFound(req, mockResponse(), next);

    expect(error.message).to.contain('Not found');
    expect(error.message).to.contain(notFoundUrl);
  });
});
