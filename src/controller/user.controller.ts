import { Request, Response } from "express";
import { AccountService } from "../service/user.service";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source"; // ✅ Import this
import { User } from "../entity/User"; // ✅ Your User Entity

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
  
      const result = await accountService.register(
        email,
        password,
        confirmPassword,
        firstname,
        lastname,
        title,
        acceptTerms
      );
  
      res.status(StatusCodes.CREATED).json(result);
  
    } catch (err: any) {
      // 👇 MAJOR FIX: show error.message clearly in response
      res.status(StatusCodes.BAD_REQUEST).json({
        message: err.message || "Registration failed"
      });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      const result = await accountService.verifyEmail(token as string);
      res.json(result);
    } catch (err) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: `Invalid email or not verified` });
    }
  }

  static async authenticate(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await accountService.authenticate(email, password);
      res.json(result);
    } catch (err) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: `Invalid email or password` });
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await accountService.deleteAccount(email, password);
      res.json(result);
    } catch (err) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: `Invalid email or password` });
    }
  }
  static async getAccountById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await AppDataSource.getRepository(User).findOneBy({ id });

  
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      }
  
      res.json(user);
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
    }
  }
  
  static async updateAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
  
      await AppDataSource.getRepository(User).update(id, data);
      res.json({ message: "Account updated successfully" });
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Update failed" });
    }
  }
  
  static async deleteAccountById(req: Request, res: Response) {
    try {
      const { id } = req.params;
  
      await AppDataSource.getRepository(User).delete(id);
      res.json({ message: "Account deleted successfully" });
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Delete failed" });
    }
  }
  

  // 🔁 Forgot Password
  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const user = await AppDataSource.getRepository(User).findOneBy({ email });

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User not found." });
      }

      const token = jwt.sign({ id: user.id }, "reset-secret", {
        expiresIn: "15m",
      });

      res.json({
        message: "Password reset link sent!",
        resetLink: `/reset-password?token=${token}`,
      });
    } catch (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Something went wrong." });
    }
  }

                                                                                static async getAllUsers(req: Request, res: Response) {
                                                                                  try {
                                                                                    const users = await AppDataSource.getRepository(User).find();
                                                                                    res.json(users);
                                                                                  } catch (err) {
                                                                                    res
                                                                                      .status(StatusCodes.INTERNAL_SERVER_ERROR)
                                                                                      .json({ message: "Something went wrong." });
                                                                                  }
                                                                                }
                                                                                

  // 🔁 Reset Password
  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;

    try {
      const decoded: any = jwt.verify(token, "reset-secret");
      const user = await AppDataSource.getRepository(User).findOneBy({
        id: decoded.id,
      });

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "User not found." });
      }

      user.password = newPassword;
      await AppDataSource.getRepository(User).save(user);

      res.json({ message: "Password successfully reset." });
    } catch (err) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid or expired token." });
    }
  }
}
