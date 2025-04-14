import express from "express";
import { Router } from "express";
import { AccountController } from "../controller/user.controller";
import { authenticateToken } from "../middleware/authmiddleware";
import { authorizeRole } from "../middleware/roleAuth";

const router = express.Router();

// Forgot/Reset Password
router.post("/accounts/forgot-password", (req, res) => {
  AccountController.forgotPassword(req, res);
});

router.post("/accounts/reset-password", (req, res) => {
  AccountController.resetPassword(req, res);
});

// Admin CRUD
router.get("/accounts", authenticateToken, authorizeRole(["Admin"]), (req, res) => {
  AccountController.getAllUsers(req, res);
});

router.get("/accounts/:id", authenticateToken, authorizeRole(["Admin"]), (req, res) => {
  AccountController.getAccountById(req, res);
});

router.put("/accounts/:id", authenticateToken, authorizeRole(["Admin"]), (req, res) => {
  AccountController.updateAccount(req, res);
});

router.delete("/accounts/:id", authenticateToken, authorizeRole(["Admin"]), (req, res) => {
  AccountController.deleteAccountById(req, res);
});

export default router;
