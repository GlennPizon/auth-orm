// src/accounts/account.routes.ts
import { Router } from "express";
import { AccountController } from "../controller/user.controller";

const router = Router();

router.post("/register", AccountController.register);
router.get("/verify-email", AccountController.verifyEmail);
router.post("/authenticate", AccountController.authenticate);
router.post("/forgot-password", AccountController.forgotPassword);

export default router;
