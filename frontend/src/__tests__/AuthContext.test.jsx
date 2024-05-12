import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Mock the API modules
vi.mock('../api/authApi', () => ({
    login: vi.fn(),
    signup: vi.fn(),
    getMe: vi.fn(),
    loginWithFirebase: vi.fn(),
}));

vi.mock('../api/axioInstance', () => ({
    default: {
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    },
}));

import { login as loginApi, signup as signupApi, getMe } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

// Test consumer component that exposes auth context values
const TestConsumer = () => {
    const auth = useAuth();
    return (
        <div>
            <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
            <span data-testid="loading">{String(auth.loading)}</span>
            <span data-testid="user">{auth.user ? auth.user.email : 'null'}</span>
            <button onClick={() => auth.login('test@example.com', 'pass123')}>Login</button>
            <button onClick={() => auth.logout()}>Logout</button>
            <button onClick={() => auth.signup({ email: 'new@example.com', password: 'pass123', fullName: 'New' })}>
                Signup
            </button>
        </div>
    );
};

const renderWithAuth = () => {
    return render(
        <MemoryRouter>
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        </MemoryRouter>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('provides default unauthenticated state', async () => {
        getMe.mockRejectedValue(new Error('No token'));

        renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });

        expect(screen.getByTestId('authenticated').textContent).toBe('false');
        expect(screen.getByTestId('user').textContent).toBe('null');
    });

    it('restores session from localStorage token on mount', async () => {
        localStorage.setItem('authToken', 'valid-token');
        getMe.mockResolvedValue({
            success: true,
            data: { email: 'restored@example.com', fullName: 'Restored User' },
        });

        renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('restored@example.com');
        });

        expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    it('clears token on failed session restore', async () => {
        localStorage.setItem('authToken', 'expired-token');
        getMe.mockRejectedValue(new Error('Unauthorized'));

        renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });

        expect(localStorage.getItem('authToken')).toBeNull();
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });

    it('login() sets user and token on success', async () => {
        getMe.mockRejectedValue(new Error('No token'));
        loginApi.mockResolvedValue({
            success: true,
            data: {
                token: 'new-jwt-token',
                user: { email: 'loggedin@example.com', id: '1' },
            },
        });

        renderWithAuth();
        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });

        await act(async () => {
            screen.getByText('Login').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('authenticated').textContent).toBe('true');
        });
        expect(localStorage.getItem('authToken')).toBe('new-jwt-token');
    });

    it('login() returns error on failure', async () => {
        getMe.mockRejectedValue(new Error('No token'));
        loginApi.mockRejectedValue({ message: 'Invalid credentials' });

        renderWithAuth();
        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });

        let result;
        await act(async () => {
            // Access auth context via consumer — test via state assertion
            screen.getByText('Login').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('authenticated').textContent).toBe('false');
        });
    });

    it('logout() clears user and removes token', async () => {
        localStorage.setItem('authToken', 'valid-token');
        getMe.mockResolvedValue({
            success: true,
            data: { email: 'user@example.com' },
        });

        renderWithAuth();

        await waitFor(() => {
            expect(screen.getByTestId('authenticated').textContent).toBe('true');
        });

        await act(async () => {
            screen.getByText('Logout').click();
        });

        expect(screen.getByTestId('authenticated').textContent).toBe('false');
        expect(screen.getByTestId('user').textContent).toBe('null');
        expect(localStorage.getItem('authToken')).toBeNull();
    });
});
