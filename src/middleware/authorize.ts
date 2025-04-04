import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/config.json';
import { AppDataSource } from '../data-source';
import { Account } from '../accounts/account.model';
import { Role } from '../_helpers/role'; // Assuming you define roles here

interface AuthenticatedRequest extends Request {
    user?: Account;
}

export const authorize = (roles: Role[] = []) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization?.split(' ');
        if (!authHeader || authHeader[0] !== 'Bearer' || !authHeader[1]) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader[1];

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
            const userRepository = AppDataSource.getRepository(Account);
            const user = await userRepository.findOneBy({ id: decoded.sub });

            if (!user || (roles.length && !roles.includes(user.role))) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    };
};