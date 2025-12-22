const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

/**
 * Validation Schemas
 */
const schemas = {
    // User/Auth Schemas
    signup: Joi.object({
        fullName: Joi.string().min(2).max(100).required().trim(),
        email: Joi.string().email().required().lowercase().trim(),
        password: Joi.string().min(6).max(128).required(),
        defaultHourlyRate: Joi.number().min(0).optional(),
        currency: Joi.string().length(3).uppercase().optional(),
    }),

    login: Joi.object({
        email: Joi.string().email().required().lowercase().trim(),
        password: Joi.string().required(),
    }),

    updateProfile: Joi.object({
        fullName: Joi.string().min(2).max(100).optional().trim(),
        email: Joi.string().email().optional().lowercase().trim(),
        defaultHourlyRate: Joi.number().min(0).optional(),
        currency: Joi.string().length(3).uppercase().optional(),
        profilePicture: Joi.string().optional(),
    }),

    updatePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).max(128).required(),
    }),

    // Client Schemas
    createClient: Joi.object({
        name: Joi.string().min(2).max(100).required().trim(),
        email: Joi.string().email().optional().lowercase().trim(),
        phone: Joi.string().optional().trim(),
        company: Joi.string().max(100).optional().trim(),
        address: Joi.string().max(500).optional().trim(),
        notes: Joi.string().max(1000).optional().trim(),
    }),

    updateClient: Joi.object({
        name: Joi.string().min(2).max(100).optional().trim(),
        email: Joi.string().email().optional().lowercase().trim(),
        phone: Joi.string().optional().trim(),
        company: Joi.string().max(100).optional().trim(),
        address: Joi.string().max(500).optional().trim(),
        notes: Joi.string().max(1000).optional().trim(),
    }),

    // Project Schemas
    createProject: Joi.object({
        clientId: Joi.string().required(),
        title: Joi.string().min(2).max(200).required().trim(),
        description: Joi.string().max(2000).optional().trim(),
        billingType: Joi.string().valid('Hourly', 'Fixed').required(),
        hourlyRate: Joi.number().min(0).when('billingType', {
            is: 'Hourly',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
        fixedPrice: Joi.number().min(0).when('billingType', {
            is: 'Fixed',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
        startDate: Joi.date().optional(),
        deadline: Joi.date().optional(),
        status: Joi.string().valid('active', 'on_hold', 'completed', 'cancelled').optional(),
    }),

    updateProject: Joi.object({
        clientId: Joi.string().optional(),
        title: Joi.string().min(2).max(200).optional().trim(),
        description: Joi.string().max(2000).optional().trim(),
        billingType: Joi.string().valid('Hourly', 'Fixed').optional(),
        hourlyRate: Joi.number().min(0).optional(),
        fixedPrice: Joi.number().min(0).optional(),
        startDate: Joi.date().optional(),
        deadline: Joi.date().optional(),
        completedDate: Joi.date().optional(),
        status: Joi.string().valid('active', 'on_hold', 'completed', 'cancelled').optional(),
    }),

    // TimeLog Schemas
    createTimeLog: Joi.object({
        projectId: Joi.string().required(),
        date: Joi.date().required(),
        hours: Joi.number().min(0.1).max(24).required(),
        description: Joi.string().max(1000).optional().trim(),
        billable: Joi.boolean().optional(),
    }),

    updateTimeLog: Joi.object({
        projectId: Joi.string().optional(),
        date: Joi.date().optional(),
        hours: Joi.number().min(0.1).max(24).optional(),
        description: Joi.string().max(1000).optional().trim(),
        billable: Joi.boolean().optional(),
        invoiced: Joi.boolean().optional(),
    }),

    // Invoice Schemas
    createInvoice: Joi.object({
        clientId: Joi.string().required(),
        projectId: Joi.string().optional(),
        invoiceNumber: Joi.string().required().trim(),
        issueDate: Joi.date().optional(),
        dueDate: Joi.date().required(),
        items: Joi.array().items(
            Joi.object({
                description: Joi.string().required().trim(),
                quantity: Joi.number().min(0).required(),
                rate: Joi.number().min(0).required(),
                amount: Joi.number().min(0).required(),
                timeLogId: Joi.string().optional(),
            })
        ).min(1).required(),
        subtotal: Joi.number().min(0).required(),
        taxRate: Joi.number().min(0).max(100).optional(),
        taxAmount: Joi.number().min(0).optional(),
        discountAmount: Joi.number().min(0).optional(),
        totalAmount: Joi.number().min(0).required(),
        currency: Joi.string().length(3).uppercase().optional(),
        notes: Joi.string().max(1000).optional().trim(),
    }),

    // Expense Schemas
    createExpense: Joi.object({
        category: Joi.string().required().trim(),
        amount: Joi.number().min(0).required(),
        date: Joi.date().required(),
        description: Joi.string().max(1000).optional().trim(),
        projectId: Joi.string().optional(),
        receipt: Joi.string().optional(),
    }),

    // Payment Schemas
    createPayment: Joi.object({
        invoiceId: Joi.string().required(),
        amount: Joi.number().min(0).required(),
        paymentDate: Joi.date().optional(),
        paymentMethod: Joi.string().valid('cash', 'check', 'bank_transfer', 'credit_card', 'paypal', 'stripe', 'other').optional(),
        transactionId: Joi.string().optional().trim(),
        notes: Joi.string().max(500).optional().trim(),
    }),

    // MongoDB ObjectId validation
    mongoId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
};

/**
 * Validation Middleware Factory
 */
const validate = (schemaName, property = 'body') => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            throw new Error(`Validation schema '${schemaName}' not found`);
        }

        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            throw new ValidationError(errorMessage);
        }

        // Replace request data with validated and sanitized data
        req[property] = value;
        next();
    };
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const { error } = schemas.mongoId.validate(req.params[paramName]);

        if (error) {
            throw new ValidationError(`Invalid ${paramName}: must be a valid MongoDB ObjectId`);
        }

        next();
    };
};

module.exports = {
    validate,
    validateObjectId,
    schemas,
};
