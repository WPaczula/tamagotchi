import { requireAuthentication } from '../../middlewares/require-authentication';
import { mockRequest, mockResponse } from 'mock-req-res';
import { stub, match } from 'sinon';
import { expect } from 'chai';
import { NextFunction } from 'express';

describe('requireAuthentication', () => {
  it('should pass control to the next middleware if user is not undefined.', () => {
    const req = mockRequest({ user: 1 });
    const next = stub();
    const res = mockResponse();

    requireAuthentication(req, res, next);

    expect(next).to.have.been.called;
  });

  it('should return not authenticated error with 401 status if user does not exist.', () => {
    const req = mockRequest();
    req.user = undefined;
    const next = stub();
    const res = mockResponse();

    requireAuthentication(req, res, next);

    expect(res.status).to.have.been.calledWith(401);
    const error = next.firstCall.args[0];
    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.equal('Not authenticated.');
  });
});
