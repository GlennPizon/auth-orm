import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[ERROR]', err.stack || err);

  // Custom application error (simple string)
  if (typeof err === 'string') {
    const is404 = err.toLowerCase().endsWith('not found');
    return res.status(is404 ? 404 : 400).json({ message: err });
  }

  // JWT authentication error
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
// Joi validation error handling
if (err.details) { // ✅ Checking if details exist instead of err.isJoi
  return res.status(400).json({
    message: "Validation error",
    details: err.details.map((d: any) => ({
      field: d.path.join("."),
      message: d.message.replace(/"/g, "")
    }))
  });
}


  // Fallback to 500
  return res.status(500).json({ message: 'Internal server error' });
};
