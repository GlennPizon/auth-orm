import { Request, Response, NextFunction } from 'express';

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (typeof err === 'string') {
    // Custom application error
    const is404 = err.toLowerCase().endsWith('not found');
    const statusCode = is404 ? 404 : 400;
    return res.status(statusCode).json({ message: err });
  }

  if (err.name === 'UnauthorizedError') {
    // JWT authentication error
    return res.status(401).json({ message: 'Invalid Token' });
  }

  // Default to 500 server error
  console.error('Unhandled Error:', err);
  return res.status(500).json({ message: 'Internal Server Error' });
}

export default errorHandler;