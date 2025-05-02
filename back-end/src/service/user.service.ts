// src/service/account.service.ts
import { AppDataSource } from "../data-source";
import { Accounts } from "../entity/Accounts";
import { RefreshToken } from "../entity/RefreshToken";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/send-email";
import dotenv from "dotenv";
import { Role } from "../utils/role";
import { MoreThan } from "typeorm";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

export class AccountService {
  private userRepo = AppDataSource.getRepository(Accounts);
  private refreshTokenRepo = AppDataSource.getRepository(RefreshToken);



  async revokeToken(token: string, ipAddress: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepo.findOneBy({ token });
    if (!refreshToken) {
      throw new Error("Invalid token");
    }
    refreshToken.revoked = new Date();
    refreshToken.revokedByIp = ipAddress;
    await this.refreshTokenRepo.save(refreshToken);
  } 

  async register(
    title: string,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    confirmPassword: string,
    acceptTerms: boolean,
    origin: string
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
       await this.sendAlreadyRegisteredEmail(email, origin);
       return { message: "Email already registered, check your inbox for verification." };
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
    //await sendEmail(email, "Verify your Email", `Click to verify your email: <a href="${link}">${link}</a>`);
    await this.sendVerificationEmail(newUser, origin);
    return { message: "Registration successful, check your email to verify." };
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
  
 async authenticate(email: string, password: string, ipAddress: string):Promise<{ id: string; email: string; jwtToken: string; refreshToken: string }> {
    
  // Validate input
    const accountRepository = AppDataSource.getRepository(Accounts);

    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

    // Find user in the database
    const account = await accountRepository.findOne({ where: { email }, select: ['id', 'email', 'passwordHash', 'isVerified'] });

    if (!account || !account.isVerified || !(await bcrypt.compare(password, account.passwordHash))) {
        throw new Error('Email or password is incorrect');
    }

    // Generate JWT and refresh token
    const jwtToken = await generateJwtToken(account);
    const refreshToken = await generateRefreshToken(account, ipAddress);

    // Save refresh token
    await refreshTokenRepository.save(refreshToken);

    // Return account details and tokens
    return {
        id: account.id,
        email: account.email,
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async verifyEmail(token: string): Promise<{ message: string }> {
  const account = await this.userRepo.findOneBy({ verificationToken: token });

  if (!account) {
    throw new Error("Verificaton Faile");
  }

  account.verified = new Date(); // Set the current date as verified date
  account.verificationToken = null; // Clear the verification token

  await this.userRepo.save(account);

  return { message: "Email verified successfully" };
}

async forgotPassword(email: string, origin ): Promise<{ message: string }> {
  const account = await this.userRepo.findOneBy({email});

  if (!account) {
    throw new Error("Email not found");
  }

  account.resetToken = await randomTokenString();
  account.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
  await this.userRepo.save(account);

  await sendPasswordResetEmail(account.email, origin);
  return { message: "Password reset email sent" };

}

async validateResetToken(token: string): Promise<Accounts> {
    const account = await this.userRepo.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: MoreThan(new Date())
        }
    });

    if (!account) {
        throw new Error('Invalid token');
    }

    return account;
}


async resetPassword(token: string, password: string): Promise<{ message: string }> {
  const account = await this.validateResetToken(token);
  account.passwordHash = await bcrypt.hash(password, 10);
  account.passwordReset = new Date();
  account.resetToken = null;
  await this.userRepo.save(account);
  return { message: "Password reset successful" };
}

async getAll(){
  const account = await this.userRepo.find();
  return account.map(x => basicDetails(x));
}

async getbyId(id: string){
  const account = await this.userRepo.findOneBy({id});
  return basicDetails(account);
}


 async create(params: { email: string; password: string }): Promise<Accounts> {
    const accountRepository = AppDataSource.getRepository(Accounts);

    // Validate if email already exists
    if (await accountRepository.findOne({ where: { email: params.email } })) {
        throw new Error(`Email "${params.email}" is already registered`);
    }

    // Create account entity
    const account = new Accounts();
    account.email = params.email;
    account.passwordHash = await bcrypt.hash(params.password, 10); // Secure password hashing
    account.verified = new Date(); // Mark account as verified

    // Save account to the database
    await accountRepository.save(account);

    // Return essential account details
    return basicDetails(account);
}


async update(id: string, params: { email?: string; password?: string }): Promise<Accounts> {
  const accountRepository = AppDataSource.getRepository(Accounts);

  // Find the account by ID
  const account = await accountRepository.findOneBy({ id });
  if (!account) {
    throw new Error("Account not found");
  }

  // Update email if provided and different from current email
  if (params.email && params.email !== account.email) {
    const existingAccount = await accountRepository.findOneBy({ email: params.email });
    if (existingAccount) {
      throw new Error("Email already exists");
    }
    account.email = params.email;
  }

  // Update password if provided
  if (params.password) {
    account.passwordHash = await bcrypt.hash(params.password, 10); // Secure password hashing
  }

  // Save updated account to the database
  await accountRepository.save(account);

  return this.basicDetails(account);
}



basicDetails(account: Accounts) {
  return {
    id: account.id,
    email: account.email,
    title: account.title,
    firstName: account.firstName,
    lastName: account.lastName,
    role: account.role,
    created: account.created,
    updated: account.updated
  };
}

  async _delete(id: string): Promise<void> {
    const accountRepository = AppDataSource.getRepository(Accounts);
    const account = await accountRepository.findOneBy({ id });
    if (!account) {
      throw new Error("Account not found");
    }
    await accountRepository.remove(account);
  }

  async getAccount(id: string): Promise<Accounts>{
    const accounts = await this.userRepo.findOneBy({id});
    if (!accounts) {
      throw new Error("Account not found");
    }
    return accounts;

  }


  async getRefreshToken(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepo.findOneBy({ token });
    if (!refreshToken || !refreshToken.isActive) {
      throw new Error("Invalid refresh token");
    }
    refreshToken;
  }

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

async generateJwtToken(account: Accounts): Promise<string> {
    const payload = { sub: account.id, id: account.id};
    jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
  }

  async generateRefreshToken(account: Accounts, ipAddress: string): Promise<RefreshToken> {
    const newToken = new RefreshToken();
    newToken.token = await this.randomTokenString();
    newToken.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    newToken.created = new Date();
    newToken.createdByIp = ipAddress;
    newToken.account = account;
    return newToken;
  }

  async randomTokenString(): Promise<string> {
    return random();
  }

  async sendVerificationEmail(account: Accounts, origin: string): Promise<void> {
    let message;

    if(origin){
      const verifyUrl = `${origin}/verify-email?token=${account.verificationToken}`;
      message = `Click to verify your email: <a href="${verifyUrl}">${verifyUrl}</a>`;
    }

    else{
      message = `Click to verify your email: <a href="http://localhost:${process.env.APP_PORT}/verify-email?token=${account.verificationToken}">Verify Email</a>`;

    }

    await sendEmail({
      to: account.email,
      subject: "Verify your email",
      text: message,
      html: `<h4>Verify Email</h4><p>${message}</p>`,
    });
  }


  async sendAlreadyRegisteredEmail(email: string, origin: string): Promise<void> {
    let message;
  
    if (origin) {
      message = `Click to reset your password: <a href="${origin}/reset-password">Reset Password</a>`;
    } else {
      message = `Click to reset your password: <a href="http://localhost:${process.env.APP_PORT}/reset-password">Reset Password</a>`;
    }

    await sendEmail({
      to: email,
      subject: "Password Reset",
      text: message,
      html: `<h4>Password Reset</h4><p>${message}</p>`,
    });

  }

    async sendPasswordResetEmail(account: Accounts, origin: string): Promise<void> {
      let message;

      if (origin) {
        const resetUrl = `${origin}/reset-password?token=${account.resetToken}`;
        message = `Click to reset your password: <a href="${resetUrl}">${resetUrl}</a>`;

      }

      else {
        message = `Click to reset your password: <a href="http://localhost:${process.env.APP_PORT}/reset-password?token=${account.resetToken}">Reset Password</a>`;
        
      }

      await sendEmail({
        to: account.email,
        subject: "Password Reset",
        text: message,
        html: `<h4>Password Reset</h4><p>${message}</p>`,
      });
    }


}



