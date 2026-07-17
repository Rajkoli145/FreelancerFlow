const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

const schemas = {
  signup: Joi.object({
    fullName: Joi.string().trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).required(),
    defaultHourlyRate: Joi.number().min(0).optional(),
    currency: Joi.string().trim().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
  }),

  createClient: Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    phone: Joi.string().trim().optional(),
    company: Joi.string().trim().optional(),
    address: Joi.string().trim().optional(),
    notes: Joi.string().trim().optional(),
  }),

  updateClient: Joi.object({
    name: Joi.string().trim().optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    phone: Joi.string().trim().optional(),
    company: Joi.string().trim().optional(),
    address: Joi.string().trim().optional(),
    notes: Joi.string().trim().optional(),
  }),

  createProject: Joi.object({
    clientId: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'valid MongoDB ObjectId').required(),
    title: Joi.string().trim().required(),
    description: Joi.string().trim().optional(),
    billingType: Joi.string().valid('Hourly', 'Fixed').required(),
    hourlyRate: Joi.number().min(0).when('billingType', {
      is: 'Hourly',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    fixedPrice: Joi.number().min(0).when('billingType', {
      is: 'Fixed',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    status: Joi.string().valid('active', 'on_hold', 'completed', 'cancelled').optional(),
  }),

  updateProject: Joi.object({
    clientId: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'valid MongoDB ObjectId').optional(),
    title: Joi.string().trim().optional(),
    description: Joi.string().trim().optional(),
    billingType: Joi.string().valid('Hourly', 'Fixed').optional(),
    hourlyRate: Joi.number().min(0).optional(),
    fixedPrice: Joi.number().min(0).optional(),
    status: Joi.string().valid('active', 'on_hold', 'completed', 'cancelled').optional(),
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().trim().optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    defaultHourlyRate: Joi.number().min(0).optional(),
    currency: Joi.string().trim().optional(),
    profilePicture: Joi.string().optional(),
  }),

  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};

const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      throw new Error(`Schema ${schemaName} is not defined`);
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      throw new ValidationError(message);
    }

    req.body = value;
    next();
  };
};

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const value = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!value || !objectIdRegex.test(value)) {
      throw new ValidationError(`Invalid ID format for parameter: ${paramName}`);
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateObjectId,
  schemas,
};
