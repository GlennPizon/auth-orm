import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export function validate(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false, 
      allowUnknown: false, 
      stripUnknown: true 
    });

    if (error) {
      // Instead of handling it here, pass to `error-handler.ts`
      const validationError = new Error("Validation failed");
      (validationError as any).details = error.details.map(err => ({
        field: err.path.join("."),
        message: err.message.replace(/"/g, "")
      }));

      return next(validationError); // ✅ Send error to centralized error handler
    }

    req.body = value; // Assign validated & sanitized data
    next(); // ✅ Continue request processing
  };
}
