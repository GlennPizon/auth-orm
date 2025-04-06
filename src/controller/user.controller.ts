// src/accounts/account.controller.ts
import { Request, Response } from "express";
import { AccountService } from "../service/user.service";
import { StatusCodes } from "http-status-codes";

const accountService = new AccountService();

export class AccountController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await accountService.register(email, password);
      res.json(result);
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
      const { email, password } = req.body;
      const result = await accountService.authenticate(email, password);
      res.json(result);
    } catch (err) {
      res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Invalid email or password` });
    }
  }
}
