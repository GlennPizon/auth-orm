// src/middleware/authorize.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../utils/role';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        [key: string]: any;
      };
    }
  }
}

export const authorize = (roles: Role | Role[] = []): ((req: Request, res: Response, next: NextFunction) => void) => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  const jwtSecret = process.env.JWT_SECRET as string;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          res.status(401).json({ message: 'Unauthorized: Token expired' });
          return;
        }
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
      }

      const payload = decoded as { id: string; role: Role };
      if (!payload?.role) {
        res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
        return;
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
        res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        return;
      }

      req.user = payload;
      next();
    });
  };
};