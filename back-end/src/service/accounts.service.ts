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
const from = process.env.SMTP_USER as string;


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

  
  async refreshToken(token: string, ipAddress: string): Promise<{ jwtToken: string; refreshToken: string }> {
    const refreshToken = await this.refreshTokenRepo.findOneBy({
      token,
      expires: MoreThan(new Date()),
    });
    if (!refreshToken) {
      throw new Error("Invalid refresh token");
    }
    const account = await this.userRepo.findOneBy({ id: refreshToken.account.id });
    if (!account) {
      throw new Error("Account not found");
    }
    const newRefreshToken = await this.generateRefreshToken(account, ipAddress);
    await this.refreshTokenRepo.save(newRefreshToken);
    const jwtToken = await this.generateJwtToken(account);
    return { jwtToken: jwtToken.token, refreshToken: newRefreshToken.token };
  }



  async register2({
    email,
    password,
    confirmPassword,
    firstname,
    lastname,
    title,
    acceptTerms,
  },
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
    newUser.acceptTerms = acceptTerms;
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
 
  async authenticate(
    email: string,
    password: string,
    ipAddress: string
  ): Promise<any> {
  
    const accountRepository = AppDataSource.getRepository(Accounts);
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  
    const account = await accountRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'isVerified', 'title', 'firstName', 'lastName', 'role', 'created', 'updated'],
    });
  
    if (!account || !account.isVerified || !(await bcrypt.compare(password, account.passwordHash))) {
      throw new Error('Email or password is incorrect');
    }
  
    const jwtToken = await this.generateJwtToken(account);
    const refreshToken = await this.generateRefreshToken(account, ipAddress);
  
    await refreshTokenRepository.save(refreshToken);
  
    const userDetails = await this.basicDetails(account);
  
    return {
      ...userDetails,
      jwtToken,
      refreshToken: refreshToken.token,
    };
  }
  

async verifyEmail(token: string): Promise<{ message: string }> {
  const account = await this.userRepo.findOneBy({ verificationToken: token });

  if (!account) {
    throw new Error("Verificaton Failed");
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

  account.resetToken = await this.randomTokenString();
  account.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
  await this.userRepo.save(account);

  await this.sendPasswordResetEmail(account, origin);
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
  return account.map(x => this.basicDetails(x));
}

async getbyId(id: string){
  const account = await this.userRepo.findOneBy({id});
  return this.basicDetails(account);
}


 async create(params: any): Promise<Pick<Accounts, 'id' | 'email' | 'title' | 'firstName' | 'lastName' | 'role' | 'created' | 'updated'>> {
   
    // Validate if email already exists
    if (await this.userRepo.findOne({ where: { email: params.email } })) {
      // If email already exists, send an email to the user
      await this.sendAlreadyRegisteredEmail(params.email, params.origin);
      // Throw an error to indicate that the email is already registered
        throw new Error(`Email "${params.email}" is already registered`);
    }
    let pass;
    if(params.password === params.confirmPassword && params.password !== null && params.confirmPassword !== null){
      const salt = await bcrypt.genSalt(10);
      pass = await bcrypt.hash(params.password, salt); // Hash the password
    }else{
      throw new Error("Password and Confirm Password do not match");
    }

    let id: string = random(); // Generate a random ID for the new account
    // Check if the ID already exists in the database and generate a new one if it does
    while (await this.userRepo.findOne({ where: { id } })) {
      id = random();
    }

    let verificationToken = random(); // Generate a random verification token
    // Check if the verification token already exists in the database and generate a new one if it does
    while (await this.userRepo.findOne({ where: { verificationToken } })) {
      verificationToken = random();

 
    // Create account entity
    const newAccount = new Accounts();
    newAccount.id = id
    newAccount.title = params.title;
    newAccount.firstName = params.firstName;
    newAccount.lastName = params.lastName;
    newAccount.email = params.email;
    newAccount.passwordHash = pass;
    newAccount.acceptTerms = params.acceptTerms; // Fix typo
    newAccount.role = Role.User; // Default role
    newAccount.verificationToken = verificationToken; // Set the verification token
    newAccount.verified = new Date();
    newAccount.created = new Date();
    newAccount.updated = new Date();


    // Save account to the database
    await this.userRepo.save(newAccount);

    return this.basicDetails(newAccount);
}
 }


async update(id: string, params: { email?: string; password?: string }): Promise<Pick<Accounts, 'id' | 'email' | 'title' | 'firstName' | 'lastName' | 'role' | 'created' | 'updated'>> {
  
  // Find the account by ID
  const account = await this.userRepo.findOneBy({ id });
  if (!account) {
    throw new Error("Account not found");
  }

  // Update email if provided and different from current email
  if (params.email && params.email !== account.email &&await this.userRepo.findOneBy({ email: params.email })) {
    throw new Error("Email already exists");
    
  }

  // Update password if provided
  if (params.password) {
    account.passwordHash = await bcrypt.hash(params.password, 10); // Secure password hashing
  }

  //copy params to account
  Object.assign(account, params);
  account.updated = new Date(); // Update the updated date


  // Save updated account to the database
  await this.userRepo.save(account);

  return this.basicDetails(account);
}


async basicDetails(account: Accounts): Promise<Pick<Accounts, 'id' | 'email' | 'title' | 'firstName' | 'lastName' | 'role' | 'created' | 'updated'>> {
  if (!account) throw new Error("Account not found");

  const { id, title, firstName, lastName, email, role, created, updated } = account;

  return {
    id,
    email,
    title,
    firstName,
    lastName,
    role,
    created,
    updated
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

  async generateJwtToken(account: Accounts): Promise<{ token: string }> { 
    return jwt.sign({ sub: account.id, role: account.role }, jwtSecret as jwt.Secret, {
      expiresIn: jwtExpiresIn,
    });
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
      message = `
      <p>Please use the below token to verify your email with the <code>/verify-email</code> api route:</p>
      <p><code>${account.verificationToken}</code></p>
      `;

    }

    await sendEmail(
      account.email,
      "Sign-Up verification Api-Verify Email",
      `<h4>Verify your Email</h4>
      <p>Thank you for registering. Please verify your email address to complete your registration.</p>
      <p>${message}</p>`,
      from

    );

  }

  async sendAlreadyRegisteredEmail(email: string, origin: string): Promise<void> {
    let message;
  
    if (origin) {
      message = `
        If you don't know your password, please use the below token to reset your password with the <code>/forgot-password</code> api route:
      `
    } else {
      message = `Click to reset your password: <a href="/forgot-password">Reset Password</a>`;
    }

    await sendEmail(
      email,
      "Sign Up Verification API - Email Already Registered", 
      `<h4>Email Already Registered</h4>
      <p>Your ${email} is already registered.}</p>
      <p>${message}</p>`,
      from
    );


  }

    async sendPasswordResetEmail(account: Accounts, origin: string): Promise<void> {
      let message;

      if (origin) {
        const resetUrl = `${origin}/reset-password?token=${account.resetToken}`;
        message = `Click to reset your password: the link below is valid for 1 hour: <br>
                  <a href="${resetUrl}">${resetUrl}</a>`;

      }

      else {
        message = `Click to reset your password: with the <code>/reset-password</code> api route: <br>
                  <p>Use the below token to reset your password:</p>
                  <p><code>${account.resetToken}</code></p>`
        
      }

      await sendEmail(
        account.email,
        "Sign Up Verification API - Password Reset",
        `<h4>Password Reset Email</h4>
        <p>${message}</p>`,
        from
      );



    }

  }

     





