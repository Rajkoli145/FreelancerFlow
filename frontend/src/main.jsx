import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './styles/global/global.css';
import { AuthProvider } from './context/AuthContext';
import LandingPage from "./pages/landingpage/LandingPage";
import AuthPage from "./pages/auth/AuthPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProjectsListPage from "./pages/projects/ProjectsListPage";
import AddProjectPage from "./pages/projects/AddProjectPage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import EditProjectPage from "./pages/projects/EditProjectPage";
import ClientsListPage from "./pages/clients/ClientsListPage";
import AddClientPage from "./pages/clients/AddClientPage";
import EditClientPage from "./pages/clients/EditClientPage";
import ClientDetailsPage from "./pages/clients/ClientDetailsPage";
import InvoicesListPage from "./pages/invoices/InvoicesListPage";
import InvoiceDetailsPage from "./pages/invoices/InvoiceDetailsPage";
import CreateInvoicePage from "./pages/invoices/CreateInvoicePage";
import EditInvoicePage from "./pages/invoices/EditInvoicePage";
import InvoicePaymentPage from "./pages/invoices/InvoicePaymentPage";
import TimeLogsPage from "./pages/time/TimeLogsPage";
import AddTimeLogPage from "./pages/time/AddTimeLogPage";
import EditTimeLogPage from "./pages/time/EditTimeLogPage";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import AddExpensePage from "./pages/expenses/AddExpensePage";
import EditExpensePage from "./pages/expenses/EditExpensePage";
import ReportsPage from "./pages/reports/ReportsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import NotFoundPage from "./pages/errors/NotFoundPage";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page - Root */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes for other pages */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProjectsListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddProjectPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProjectDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EditProjectPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ClientsListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddClientPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ClientDetailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EditClientPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/time"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TimeLogsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/time/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddTimeLogPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/time/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EditTimeLogPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <InvoicesListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateInvoicePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <InvoiceDetailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EditInvoicePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices/:id/payment"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <InvoicePaymentPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Expenses Routes */}
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ExpensesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddExpensePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses/edit/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EditExpensePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Reports Route */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NotificationsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found - Catch all unmatched routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);

