// src/service/account.service.ts
import { AppDataSource } from "../data-source";
import { Accounts, } from "../entity/Accounts";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/send-email";
import dotenv from "dotenv";
import { Role } from "../utils/role";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

export class AccountService {
  private userRepo = AppDataSource.getRepository(Accounts);

  async register(
    title: string,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    confirmPassword: string,
    acceptTerms: boolean
  ): Promise<{ message: string }> {
    
    if (!acceptTerms) {
      throw new Error("You must accept the terms and conditions.");
    }
  
    if (!email || email.trim() === "") {
      throw new Error("Email cannot be empty");
    }
  
    if (!password || !confirmPassword || password.trim() === "" || confirmPassword.trim() === "") {
      throw new Error("Password cannot be empty");
    }
  
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
  
    if (!firstname || firstname.trim() === "") {
      throw new Error("First name cannot be empty");
    }
  
    if (!lastname || lastname.trim() === "") {
      throw new Error("Last name cannot be empty");
    }
  
    if (!title || title.trim() === "") {
      throw new Error("Title cannot be empty");
    }
  
    const existingUser = await this.userRepo.findOneBy({ email });
    if (existingUser) {
      throw new Error("Email already exists");
    }
  
    //salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = random();
    const userCount = await this.userRepo.count();
    const role = userCount === 0 ? Role.Admin : Role.User;
    const id = random(); // Or use uuid()
    const token = random();

    const newUser = new Accounts();
    newUser.id = id;
    newUser.title = title;
    newUser.firstName = firstname;
    newUser.lastName = lastname;
    newUser.email = email;
    newUser.passwordHash = hashedPassword;
    newUser.accepTerms = acceptTerms;
    newUser.role = role;
    newUser.verificationToken = token;
    
  
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
    // Set the user as verified
    user.verified = new Date(); // Set the current date as verified date


    // Save the updated user object
    await this.userRepo.save(user);

    // Log to the console
    console.log("Email verified successfully for user:", user.email);

    // Return the success message
    return { message: "Email verified successfully." };
}


  async deleteAccount(email: string, password: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new Error("Invalid email");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Incorrect password");
    }

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
    if (!user || !user.isVerified) {
      throw new Error("Invalid email or email not verified");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
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
