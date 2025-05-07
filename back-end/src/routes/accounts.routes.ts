// src/accounts/account.routes.ts
import { Router } from "express";
import { AccountController } from "../controller/accounts.controller";
import {authorize}  from "../middleware/authorize";
import { Role } from "../utils/role";
import { validate } from '../middleware/validate-request';
import Joi from "joi";
import { authenticateSchema, registerSchema, verifyEmailSchema, forgotPasswordSchema, validateResetTokenSchema, resetPasswordSchema, createAccountSchema, updateAccountSchema, deleteAccountSchema, getAllAccountsSchema, getAccountByIdSchema } from "../schema/accounts.schema";

const router = Router();

// Define routes for user account management

router.post("/authenticate", validate(authenticateSchema), AccountController.authenticate);
router.post("/refresh-token", AccountController.refreshToken);
router.post("/revoke-token", authorize(), AccountController.revokeToken);  // Fixed: Added missing slash
router.post("/register",validate(registerSchema)), AccountController.register);
router.get("/verify-email", validate(verifyEmailSchema), AccountController.verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), AccountController.forgotPassword);
router.post("/validate-reset-token", validate(validateResetTokenSchema), AccountController.validateResetToken);
router.post("/reset-password", validate(resetPasswordSchema), AccountController.resetPassword);
router.get("/", authorize(Role.Admin), AccountController.getAllAccounts);
router.get("/:id", authorize(), AccountController.getAccountById);
router.post("/", authorize(Role.Admin), validate(createAccountSchema), AccountController.createAccount);
router.put("/:id", authorize(), validate(updateAccountSchema), AccountController.updateAccount);
router.delete("/:id", authorize(), AccountController.deleteAccount);

export default router;






