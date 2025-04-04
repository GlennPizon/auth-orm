import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../helpers/db';
import { Account } from './account.entity';
import { validateRequest } from '../middleware/validate-request';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { Role } from '../helpers/role';
import jwt from 'jsonwebtoken';
import config from '../config/config.json';
import { RefreshToken } from './refresh-token.entity';
import { sendEmail } from '../helpers/send-email';

const userRepository = AppDataSource.getRepository(Account);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

export const register = [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4 and 20 characters'),
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create({ email, passwordHash: hashedPassword, role: Role.User });
        await userRepository.save(user);

        const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '1h' });

        const refreshToken = new RefreshToken();
        refreshToken.token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '7d' });
        refreshToken.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        refreshToken.account = user;
        await refreshTokenRepository.save(refreshToken);

        const verifyUrl = `http://localhost:3000/verify-email?token=${token}`;
        const html = `<p>Please click the following link to verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`;