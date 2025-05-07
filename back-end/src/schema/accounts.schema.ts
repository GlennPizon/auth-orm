import Joi from "joi";
import {validate} from '../middleware/validate-request'
import { Request, Response } from "express";

 export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    "any.only": "Passwords do not match"
  }),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  title: Joi.string().required(),
  acceptTerms: Joi.boolean().valid(true).required().messages({
    "any.only": "You must accept the terms"
  })
});

export const authenticateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const validateResetTokenSchema = Joi.object({
  token: Joi.string().required()
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    "any.only": "Passwords do not match"
  })
});

export const createAccountSchema = Joi.object({
  email: Joi.string().email().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  title: Joi.string().required(),
  role: Joi.string().valid("Admin", "User").required()
});

export const updateAccountSchema = Joi.object({
  firstname: Joi.string().optional(),
  lastname: Joi.string().optional(),
  title: Joi.string().optional(),
  role: Joi.string().valid("Admin", "User").optional(),
  isActive: Joi.boolean().optional()
});

export const deleteAccountSchema = Joi.object({
  id: Joi.string().required()
});

export const getAccountByIdSchema = Joi.object({
  id: Joi.string().required()
});

export const getAllAccountsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional()
});

export const getAccountByEmailSchema = Joi.object({
  email: Joi.string().email().required()
});




export default{  
    registerSchema,
    authenticateSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    validateResetTokenSchema,
    resetPasswordSchema,
    createAccountSchema,
    updateAccountSchema,
    deleteAccountSchema,
    getAccountByIdSchema,
    getAllAccountsSchema,
    getAccountByEmailSchema
}