import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authmiddleware"; // make sure this path is correct

export const authorizeRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role || "")) {
      res.status(403).json({ message: "Forbidden: You do not have access." });
      return; // ✅ important to return so TypeScript is happy
    }

    next(); // ✅ call next() if authorized
  };
};
