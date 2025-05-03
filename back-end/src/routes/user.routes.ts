// src/accounts/account.routes.ts
import { Router } from "express";
import { AccountController } from "../controller/user.controller";
import { authorize } from "../middleware/authorize";
import { Role } from "../utils/role";

const router = Router();

// Define routes for user account management

router.post("/authenticate",AccountController.authenticateSchema, AccountController.authenticate);
router.post("/refresh-token", AccountController.refreshToken);
router.post("/logout", AccountController.logout);
router.post("revoke-token",authorize(), AccountController.revokeToken);
router.post("/register",AccountController.registerSchema,AccountController.register);
router.get("/verify-email",AccountController.verifyEmailSchema, AccountController.verifyEmail);
router.post("/forgot-password", AccountController.forgotPasswordSchema, AccountController.forgotPassword);
router.post("/validate-reset-token",AccountController.validateResetTokenSchema ,AccountController.validateResetToken);
router.post("/reset-password",AccountController.resetPasswordSchema ,AccountController.resetPassword);
router.get("/", authorize("Admin"),AccountController.getAllAccounts);
router.get("/:id", authorize(), AccountController.getAccountById);
router.post("/", authorize(Role.Admin),AccountController.createSchema, AccountController.createAccount);
router.put("/:id", authorize(), AccountController.updateSchema, AccountController.updateAccount);
router.delete("/:id", authorize(), AccountController.deleteAccount);


export default router;
