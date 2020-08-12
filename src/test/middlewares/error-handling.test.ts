import { errorHandler } from '../../middlewares/error-handling';
import { stub } from 'sinon';
import { mockRequest, mockResponse } from 'mock-req-res';
import { expect } from 'chai';

describe('errorHandler', () => {
  let initialEnvironmentVariable: string | undefined;

  before(() => {
    initialEnvironmentVariable = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = initialEnvironmentVariable;
  });

  it('should return error message and stack in development mode.', () => {
    const message = 'message';
    const stack = 'stack';
    const error = new Error(message);
    error.stack = stack;
    const statusCode = 404;
    const res = mockResponse({ statusCode });
    process.env.NODE_ENV = 'development';

    errorHandler(error, mockRequest(), res, stub());

    expect(res.json).to.have.been.calledWith({
      message,
      stack,
    });
    expect(res.status).to.have.been.calledWith(statusCode);
  });

  it('should return error message without stack in production mode.', () => {
    const message = 'message';
    const error = new Error(message);
    const statusCode = 404;
    const res = mockResponse({ statusCode });
    process.env.NODE_ENV = 'production';

    errorHandler(error, mockRequest(), res, stub());

    expect(res.json).to.be.calledWith({
      message,
      stack: undefined,
    });
    expect(res.status).to.have.been.calledWith(statusCode);
  });

  it('should change status code to 500 if unexpected error occurred.', () => {
    const error = new Error('Unexpected error');
    const res = mockResponse({ statusCode: 200 });

    errorHandler(error, mockRequest(), res, stub());

    expect(res.status).to.have.been.calledWith(500);
  });
});
