// src/accounts/account.controller.ts
import { Request, Response } from "express";
import { AccountService } from "../service/accounts.service";
import { StatusCodes } from "http-status-codes";
import { Role } from "../utils/role";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate-request";
import Joi from "joi";


const accountService = new AccountService();

export class AccountController {
  static async register(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        confirmPassword,
        firstname,
        lastname,
        title,
        acceptTerms
      } = req.body;

      const origin: string = req.get("origin");
      const result = await accountService.register(
        {
        email,
        password,
        confirmPassword,
        firstname,
        lastname,
        title,
        acceptTerms
        },
        origin
      );
      res.status(StatusCodes.CREATED).json(result);
      
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json(err);
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      const result = await accountService.verifyEmail(token as string);
      res.json(result);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ msg: `Invalid email or not verified` });
    }
  }

  static async authenticate(req: Request, res: Response) {
    try {
      const { email, password} = req.body;
      const ipAddress = req.ip;
      const result = await accountService.authenticate(email, password,ipAddress);
      res.json(result);
    } catch (err) {
      res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Invalid email or password` });
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await accountService.deleteAccount(email, password);
      res.json(result);
    } catch (err) {
      res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Invalid email or password` });
    }
  }

  static async getAllAccounts(req: Request, res: Response) {
    try {
      const result = await accountService.getAll();
      res.json(result);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json(err);
    }
  }


  static async getAccountById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await accountService.getbyId(id);
      res.json(result);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json(err);
    }
  }

  static async updateAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, password} = req.body;
      const result = await accountService.update(
        id,
        {email,
          password}
        
        
      );
      res.json(result);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json(err);
    }
  }

  static async createAccount(req: Request, res: Response) {
    try {
      const {title, firstName, lastName, email, password, confirmPassword, acceptTerms} = req.body;
      const result = await accountService.create({
        title,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        acceptTerms
      }
      );
      
      res.json(result);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json(err);
    }
  }


   static async forgotPassword(req: Request, res: Response) {
      try {
        const { email } = req.body;
        const origin: string = req.get("origin");
        const result = await accountService.forgotPassword(email, origin);
        res.json(result);
      } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json(err);
      }
    }

  static  async resetPassword(req: Request, res: Response) {
      try {
        const { token, password } = req.body;
        const result = await accountService.resetPassword(token, password);
        res.json(result);
      } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json(err);
      }
    }

  
    static async refreshToken(req: Request, res: Response) {
      try {
        const { token } = req.cookies.refreshToken;
        const ipAddress = req.ip;

        const result = await accountService.refreshToken(token, ipAddress);
        res.json(result);
      } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json(err);
      }
    }





}
