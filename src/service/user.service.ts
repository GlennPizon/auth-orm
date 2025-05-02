// src/service/account.service.ts
import { AppDataSource } from "../data-source";
import { User } from "../entity/Accounts";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/send-email";
import dotenv from "dotenv";
import { Roles } from "../utils/role";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

export class AccountService {
  private userRepo = AppDataSource.getRepository(User);

  async register(email: string, password: string): Promise<{ message: string }> {
    const existingUser = await this.userRepo.findOneBy({ email });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = random();

    const userCount = await this.userRepo.count();
    const role = userCount === 0 ? Roles.Admin : Roles.User;
    let id = random();

    const newUser = this.userRepo.create({
      id,
      email,
      password: hashedPassword,
      verificationToken,
      role,
    });

    await this.userRepo.save(newUser);

    const link = `http://localhost:${process.env.APP_PORT}/verify-email?token=${verificationToken}`;
    await sendEmail(email, "Verify your Email", `Click to verify your email: <a href="${link}">${link}</a>`);

    return { message: "Registration successful, check your email to verify." };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOneBy({ verificationToken: token });
    if (!user) {
      throw new Error("Invalid or expired token");
    }

    user.isVerified = true;
    user.verificationToken = null;
    await this.userRepo.save(user);

    return { message: "Email verified successfully." };
  }

  async authenticate(email: string, password: string): Promise<{
    message: string;
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  }> {
    const user = await this.userRepo.findOneBy({ email });
    if (!user || !user.isVerified) {
      throw new Error("Invalid email or email not verified");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect password");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: parseInt(jwtExpiresIn) }
    );

    return {
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
