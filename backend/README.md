# FreelancerFlow - Production-Ready Backend

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Node.js-20.x-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-6.0-green.svg" alt="MongoDB">
  <img src="https://img.shields.io/badge/Express-5.x-lightgrey.svg" alt="Express">
  <img src="https://img.shields.io/badge/Tests-Passing-brightgreen.svg" alt="Tests">
  <img src="https://img.shields.io/badge/Coverage-70%25+-brightgreen.svg" alt="Coverage">
</p>

A production-ready, enterprise-grade REST API for freelancers to manage clients, projects, time logs, invoices, payments, and expenses.

## 🚀 Features

### Core Functionality
- ✅ **Authentication & Authorization** - JWT-based auth with Role-Based Access Control and **Firebase Social Auth (Google/GitHub)** support.
- ✅ **Client Management** - Full CRUD operations for client data
- ✅ **Project Tracking** - Hourly and fixed-price billing support
- ✅ **Time Logging** - Track billable and non-billable hours
- ✅ **Invoice Generation** - Professional PDF invoices with automatic calculations
- ✅ **Payment Tracking** - Record and monitor payments
- ✅ **Expense Management** - Track business expenses
- ✅ **Reporting & Analytics** - Financial reports and insights
- ✅ **Notifications** - Real-time notification system
- ✅ **Admin Dashboard** - Administrative controls and metrics

### Security Features
- 🔒 **Input Sanitization** - Protection against NoSQL injection and XSS
- 🔒 **Rate Limiting** - Configurable rate limits per endpoint type
- 🔒 **Helmet.js** - Security headers and CSP
- 🔒 **CORS** - Whitelist-based origin control
- 🔒 **JWT Authentication** - Secure token-based authentication
- 🔒 **Password Hashing** - Bcrypt with configurable rounds
- 🔒 **HPP Protection** - HTTP Parameter Pollution prevention

### Production Features
- 📊 **Comprehensive Logging** - Winston with log rotation
- 📊 **Error Tracking** - Structured error handling
- 📊 **API Documentation** - Swagger/OpenAPI 3.0
- 📊 **Health Checks** - Monitoring endpoints
- 📊 **Graceful Shutdown** - Proper cleanup on termination
- 📊 **Environment Validation** - Required config checks on startup

### Testing & Quality
- ✅ **Unit Tests** - Comprehensive test coverage
- ✅ **Integration Tests** - API endpoint testing
- ✅ **CI/CD Pipeline** - GitHub Actions automation
- ✅ **Code Coverage** - 70%+ coverage requirement
- ✅ **Security Audits** - Automated vulnerability scanning

## 📋 Prerequisites

- **Node.js** >= 18.x
- **MongoDB** >= 6.0
- **npm** >= 9.x

## 🛠️ Installation

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/Rajkoli145/FreelancerFlow.git
cd FreelancerFlow/backend
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration

Create a \`.env\` file in the backend directory:

\`\`\`bash
cp .env.example .env
\`\`\`

**Required Environment Variables:**

\`\`\`env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/freelancerflow

# Authentication (REQUIRED - Generate secure key)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_CHANGE_THIS
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# Security
BCRYPT_ROUNDS=10

# Features
ENABLE_SWAGGER=true
\`\`\`

**Generate a secure JWT secret:**

\`\`\`bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
\`\`\`

### 4. Start MongoDB

\`\`\`bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Or use your local MongoDB installation
mongod
\`\`\`

### 5. Run the application

\`\`\`bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
\`\`\`

The server will start on `http://localhost:5000`

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

**Swagger UI:** `http://localhost:5000/api-docs`

**OpenAPI JSON:** `http://localhost:5000/api-docs.json`

## 🧪 Testing

\`\`\`bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests for CI/CD
npm run test:ci
\`\`\`

## 🔍 Code Quality

\`\`\`bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
\`\`\`

## 📁 Project Structure

\`\`\`
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── config.js    # Environment config with validation
│   │   ├── db.js        # Database connection
│   │   └── swagger.js   # API documentation setup
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── clientController.js
│   │   ├── projectController.js
│   │   └── ...
│   ├── middleware/      # Custom middleware
│   │   ├── authMiddleware.js      # JWT authentication
│   │   ├── errorMiddleware.js     # Error handling
│   │   └── validateMiddleware.js  # Input validation
│   ├── models/          # Mongoose schemas
│   │   ├── user.js
│   │   ├── Client.js
│   │   ├── Project.js
│   │   └── ...
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   ├── logger.js          # Winston logger
│   │   ├── errors.js          # Custom error classes
│   │   └── pdfGenerator.js    # Invoice PDF generation
│   ├── __tests__/       # Test files
│   │   ├── setup/
│   │   └── *.test.js
│   └── index.js         # Application entry point
├── logs/                # Application logs (auto-generated)
├── coverage/            # Test coverage reports
├── .env.example         # Environment variables template
├── jest.config.json     # Jest configuration
└── package.json
\`\`\`

## 🔐 Security Best Practices

### Implemented Security Measures

1. **No Hardcoded Secrets** - All sensitive data in environment variables
2. **Input Validation** - Joi schemas for all API inputs
3. **SQL/NoSQL Injection Protection** - express-mongo-sanitize
4. **XSS Protection** - xss-clean middleware
5. **Rate Limiting** - Configurable per endpoint type
6. **CORS** - Whitelist-based origin control
7. **Security Headers** - Helmet.js with CSP
8. **Error Sanitization** - No sensitive data in error responses
9. **Logging** - Structured logging without sensitive data
10. **Dependency Audits** - Regular npm audit checks

### Security Checklist for Production

- [ ] Generate strong JWT secret (64+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS only
- [ ] Configure proper CORS origins
- [ ] Set up firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use environment-specific rate limits
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Keep dependencies updated

## 🚀 Deployment

### Environment Variables for Production

\`\`\`env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/freelancerflow
JWT_SECRET=<64-character-random-string>
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_MAX_REQUESTS=50
ENABLE_SWAGGER=false
\`\`\`

### Deployment Platforms

#### Heroku

\`\`\`bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
\`\`\`

#### Railway

\`\`\`bash
railway login
railway init
railway up
\`\`\`

#### AWS EC2 / DigitalOcean

1. Set up Node.js environment
2. Install PM2: `npm install -g pm2`
3. Start application: `pm2 start src/index.js --name freelancerflow`
4. Configure nginx as reverse proxy
5. Set up SSL with Let's Encrypt

## 📊 Monitoring

### Health Check Endpoints

- **Basic Health:** `GET /health`
- **API Health:** `GET /api/health`

### Logs

Logs are stored in `logs/` directory:
- `combined-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only
- `exceptions-YYYY-MM-DD.log` - Uncaught exceptions
- `rejections-YYYY-MM-DD.log` - Unhandled promise rejections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Maintain 70%+ code coverage
- Follow existing code style
- Update documentation
- Add JSDoc comments for functions

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/firebase` - Login/Signup with Firebase OAuth (Google/GitHub)

### Clients
- `GET /api/client` - List all clients
- `POST /api/client` - Create client
- `GET /api/client/:id` - Get client details
- `PUT /api/client/:id` - Update client
- `DELETE /api/client/:id` - Delete client

### Projects
- `GET /api/project` - List all projects
- `POST /api/project` - Create project
- `GET /api/project/:id` - Get project details
- `PUT /api/project/:id` - Update project
- `DELETE /api/project/:id` - Delete project

*See Swagger documentation for complete API reference*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Raj Koli**
- GitHub: [@Rajkoli145](https://github.com/Rajkoli145)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the database
- All open-source contributors

## 📞 Support

For support, email support@freelancerflow.com or open an issue on GitHub.

---

**Made with ❤️ for freelancers worldwide**
