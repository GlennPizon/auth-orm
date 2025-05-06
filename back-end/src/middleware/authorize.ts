import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../utils/role';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string;

export function authorize(roles: Role[] = []) {
  if (typeof roles === 'string') {
    roles = [roles as Role];
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, jwtSecret, (err, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }

      // Check if roles are defined in the decoded token
      if (!decoded || !decoded.role) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
      }

      // Check if the user's role is authorized
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      // Attach the decoded user information to the request object
      (req as any).user = decoded;
      next();
    });
  };
}
