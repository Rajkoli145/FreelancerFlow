import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import AuthContext from '../context/AuthContext';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Helper: render LoginPage with a custom auth context value
const renderLoginPage = (contextValue = {}) => {
    const defaultContext = {
        login: vi.fn().mockResolvedValue({ success: true, user: { id: '1', email: 'test@example.com' } }),
        user: null,
        isAuthenticated: false,
        loading: false,
        ...contextValue,
    };

    return {
        user: userEvent.setup(),
        ...render(
            <AuthContext.Provider value={defaultContext}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </AuthContext.Provider>
        ),
        loginMock: defaultContext.login,
    };
};

describe('LoginPage', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renders the login form with email and password fields', () => {
        renderLoginPage();

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows the FreelancerFlow brand name', () => {
        renderLoginPage();
        expect(screen.getByText('FreelancerFlow')).toBeInTheDocument();
    });

    it('shows a validation error when email is empty on submit', async () => {
        const { user } = renderLoginPage();

        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    });

    it('shows a validation error for invalid email format', async () => {
        const { user } = renderLoginPage();

        await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    it('shows a validation error when password is empty', async () => {
        const { user } = renderLoginPage();

        await user.type(screen.getByLabelText(/email address/i), 'valid@example.com');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });

    it('shows a validation error when password is too short', async () => {
        const { user } = renderLoginPage();

        await user.type(screen.getByLabelText(/email address/i), 'valid@example.com');
        await user.type(screen.getByLabelText(/password/i), 'abc');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    it('calls login with correct credentials on valid submit', async () => {
        const loginMock = vi.fn().mockResolvedValue({ success: true, user: {} });
        const { user } = renderLoginPage({ login: loginMock });

        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('navigates to /dashboard on successful login', async () => {
        const loginMock = vi.fn().mockResolvedValue({ success: true, user: {} });
        const { user } = renderLoginPage({ login: loginMock });

        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('shows an error banner when login fails', async () => {
        const loginMock = vi.fn().mockResolvedValue({
            success: false,
            error: 'Invalid email or password',
        });
        const { user } = renderLoginPage({ login: loginMock });

        await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    });

    it('clears field error when user starts typing', async () => {
        const { user } = renderLoginPage();

        // Submit empty to trigger error
        await user.click(screen.getByRole('button', { name: /sign in/i }));
        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();

        // Start typing — error should clear
        await user.type(screen.getByLabelText(/email address/i), 'a');
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
});
