const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('../config/config');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FreelancerFlow API',
            version: '1.0.0',
            description: 'A comprehensive API for freelancers to manage clients, projects, invoices, payments, and expenses',
            contact: {
                name: 'FreelancerFlow Support',
                email: 'support@freelancerflow.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: 'Development server',
            },
            {
                url: 'https://your-production-url.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        status: {
                            type: 'string',
                            example: 'fail',
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: '507f1f77bcf86cd799439011',
                        },
                        fullName: {
                            type: 'string',
                            example: 'John Doe',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com',
                        },
                        defaultHourlyRate: {
                            type: 'number',
                            example: 50,
                        },
                        currency: {
                            type: 'string',
                            example: 'USD',
                        },
                        role: {
                            type: 'string',
                            enum: ['freelancer', 'admin'],
                            example: 'freelancer',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Client: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        name: {
                            type: 'string',
                            example: 'Acme Corp',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'contact@acme.com',
                        },
                        phone: {
                            type: 'string',
                            example: '+1234567890',
                        },
                        company: {
                            type: 'string',
                            example: 'Acme Corporation',
                        },
                        address: {
                            type: 'string',
                        },
                        notes: {
                            type: 'string',
                        },
                    },
                },
                Project: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                        clientId: {
                            type: 'string',
                        },
                        title: {
                            type: 'string',
                            example: 'Website Redesign',
                        },
                        description: {
                            type: 'string',
                        },
                        billingType: {
                            type: 'string',
                            enum: ['Hourly', 'Fixed'],
                            example: 'Hourly',
                        },
                        hourlyRate: {
                            type: 'number',
                            example: 75,
                        },
                        fixedPrice: {
                            type: 'number',
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'on_hold', 'completed', 'cancelled'],
                            example: 'active',
                        },
                        startDate: {
                            type: 'string',
                            format: 'date',
                        },
                        deadline: {
                            type: 'string',
                            format: 'date',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
    if (config.enableSwagger) {
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'FreelancerFlow API Documentation',
        }));

        // Serve swagger JSON
        app.get('/api-docs.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(specs);
        });
    }
};

module.exports = setupSwagger;
