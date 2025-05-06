import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Accounts } from '../entity/Accounts';
import { AppDataSource } from '../data-source';

declare global {
  namespace Express {
    interface Request {
      account?: Accounts;
    }
  }
}

export const authorize = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
      if (!token) return res.status(401).json({ message: 'Unauthorized' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { accountId: string };
      const account = await AppDataSource.getRepository(Accounts).findOneBy({ id: decoded.accountId });

      if (!account || (roles.length && !roles.includes(account.role))) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      req.account = account;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};