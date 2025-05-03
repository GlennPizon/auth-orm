// src/accounts/account.controller.ts
import { Request, Response } from "express";
import { AccountService } from "../service/user.service";
import { StatusCodes } from "http-status-codes";

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

      const origin: string = "http://localhost:" + process.env.APP_PORT;

      const result = await accountService.register(
        email,
        password,
        confirmPassword,
        firstname,
        lastname,
        title,
        acceptTerms,
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
      const { email, password, ipAddress } = req.body;
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
      const { email, password, firstname, lastname, title } = req.body;
      const result = await accountService.updateAccount(
        id,
        email,
        password,
        firstname,
        lastname,
        title
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


}
