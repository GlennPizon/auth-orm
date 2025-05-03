import { Request, Response, NextFunction } from 'express';
import { expressjwt as jwt } from 'express-jwt';
import dotenv from 'dotenv';
import { AppDataSource } from '../data-source'; // your TypeORM data source
import { Accounts } from '../entity/Accounts';
import { RefreshToken } from '../entity/RefreshToken';

dotenv.config();
// Extend Express's Request interface
interface AuthenticatedRequest extends Request {
    user?: {
      id: string;
      role?: string;
      ownsToken?: boolean;
    };
  }
  
  // Authorization middleware
  export function authorize(roles: string[] | string = []) {
    if (typeof roles === 'string') {
      roles = [roles];
    }
  
    return [
      // Authenticate JWT and attach `req.user`
      jwt({
        secret: process.env.JWT_SECRET as string,
        algorithms: ['HS256'],
      }),
  
      // Authorize user by role and check token ownership
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const accountRepo = AppDataSource.getRepository(Accounts);
  
        try {
          const account = await accountRepo.findOne({
            where: { id: req.user!.id },
            relations: ['refreshTokens'],
          });
  
          if (!account || (roles.length && !roles.includes(account.role))) {
            return res.status(401).json({ message: 'Unauthorized' });
          }
  
          // Set authenticated user info
          req.user!.role = account.role;
  
          // Find the token from the Authorization header
          const authHeader = req.headers.authorization || '';
          const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
  
          // Check token ownership
          req.user!.ownsToken = !!account.refreshToken?.find(rt => rt.token === token);
  
          next();
        } catch (err) {
          console.error('Authorization Error:', err);
          res.status(401).json({ message: 'Unauthorized' });
        }
      },
    ];
  }