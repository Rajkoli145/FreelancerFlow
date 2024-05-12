import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import AuthContext from '../context/AuthContext';

// Helper: render a ProtectedRoute with a controllable auth context
const renderProtectedRoute = ({ isAuthenticated = false, loading = false } = {}) => {
    const contextValue = {
        isAuthenticated,
        loading,
        user: isAuthenticated ? { email: 'user@example.com' } : null,
    };

    return render(
        <AuthContext.Provider value={contextValue}>
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe('ProtectedRoute', () => {
    it('renders children when user is authenticated', () => {
        renderProtectedRoute({ isAuthenticated: true });
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to /login when user is not authenticated', () => {
        renderProtectedRoute({ isAuthenticated: false });
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('shows a loader while authentication is being checked', () => {
        renderProtectedRoute({ isAuthenticated: false, loading: true });
        // Should not show content or redirect while loading
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('renders protected content after loading completes with valid auth', () => {
        renderProtectedRoute({ isAuthenticated: true, loading: false });
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
});
