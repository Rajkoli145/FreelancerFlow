# FreelancerFlow

FreelancerFlow is a comprehensive dashboard for freelancers to manage clients, projects, invoices, payments, and expenses. It provides a user-friendly interface to track finances, monitor project progress, and streamline client communication.

## Features

- **Dashboard:** Get a quick overview of your freelance business with key metrics like total earnings, outstanding payments, and active projects.
- **Client Management:** Add, edit, and view client information, including contact details and project history.
- **Project Tracking:** Create and manage projects, log time spent on tasks, and monitor project budgets.
- **Invoice Generation:** Generate professional invoices from project data and send them to clients.
- **Payment Tracking:** Record payments received and keep track of outstanding invoices.
- **Expense Management:** Log business-related expenses to get a clear picture of your profitability.
- **Reporting:** Generate reports to analyze your income, expenses, and project profitability.

## Tech Stack

**Frontend:**

- React
- Vite
- Tailwind CSS
- Axios

**Backend:**

- Node.js
- Express
- MongoDB
- Mongoose

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm
- MongoDB

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/FreelancerFlow.git
    cd FreelancerFlow
    ```

2.  **Install backend dependencies:**

    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

4.  **Set up environment variables:**

    Create a `.env` file in the `backend` directory and add the following:

    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

### Usage

1.  **Start the backend server:**

    ```bash
    cd backend
    npm start
    ```

2.  **Start the frontend development server:**

    ```bash
    cd ../frontend
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## Folder Structure

```
FreelancerFlow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── layouts/
    │   ├── pages/
    │   ├── routes/
    │   └── styles/
    ├── public/
    └── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.
