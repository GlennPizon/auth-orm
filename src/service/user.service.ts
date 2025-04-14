// src/service/account.service.ts
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/send-email";
import dotenv from "dotenv";
import { Roles } from "../utils/role";

dotenv.config();

// ✅ Declare these with correct types
const jwtSecret = process.env.JWT_SECRET || "helloworld";
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || "6h") as string;

export class AccountService {
  private userRepo = AppDataSource.getRepository(User);

  async register(
    email: string,
    password: string,
    confirmPassword: string,
    firstname: string,
    lastname: string,
    title: string,
    acceptTerms: boolean
  ): Promise<{ message: string }> {
    if (!acceptTerms) throw new Error("You must accept the terms and conditions.");
    if (!email?.trim()) throw new Error("Email cannot be empty");
    if (!password?.trim() || !confirmPassword?.trim()) throw new Error("Password cannot be empty");
    if (password !== confirmPassword) throw new Error("Passwords do not match");
    if (!firstname?.trim()) throw new Error("First name cannot be empty");
    if (!lastname?.trim()) throw new Error("Last name cannot be empty");
    if (!title?.trim()) throw new Error("Title cannot be empty");

    const existingUser = await this.userRepo.findOneBy({ email });
    if (existingUser) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = random();
    const userCount = await this.userRepo.count();
    const role = userCount === 0 ? Roles.Admin : Roles.User;
    const id = random();

    const newUser = this.userRepo.create({
      id,
      email,
      password: hashedPassword,
      firstname,
      lastname,
      title,
      acceptTerms,
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
    if (!user) throw new Error("Invalid or expired token");

    user.isVerified = true;
    user.verificationToken = null;
    await this.userRepo.save(user);

    return { message: "Email verified successfully." };
  }

  async deleteAccount(email: string, password: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new Error("Invalid email");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Incorrect password");

    await this.userRepo.remove(user);
    return { message: "Account deleted successfully." };
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
    if (!user || !user.isVerified) throw new Error("Invalid email or email not verified");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Incorrect password");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      {
        expiresIn: jwtExpiresIn as any, // <-- ✅ no more errors
      }
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
