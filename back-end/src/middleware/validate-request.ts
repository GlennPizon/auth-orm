import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export function validate(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: false, stripUnknown: true })  );

    if (error) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message.replace(/"/g, '')
        }))
      });   
      return; // Prevents further execution
    }

    req.body = value; // Assign validated & potentially sanitized data
    next();
  };
}
