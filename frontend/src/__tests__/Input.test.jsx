import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../components/ui/Input';

describe('Input', () => {
    it('renders a text input with the provided label', () => {
        render(<Input label="Email Address" name="email" />);

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('renders without a label when none is provided', () => {
        render(<Input name="email" id="email" />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows the provided placeholder text', () => {
        render(<Input name="email" id="email" placeholder="you@example.com" />);
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });

    it('calls onChange when user types', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(<Input name="email" id="email" onChange={handleChange} />);
        await user.type(screen.getByRole('textbox'), 'hello');

        expect(handleChange).toHaveBeenCalled();
    });

    it('displays an error message when the error prop is provided', () => {
        render(<Input name="email" id="email" error="Email is required" />);
        expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('does not display an error when no error prop is given', () => {
        render(<Input name="email" id="email" />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays helper text when provided and no error', () => {
        render(<Input name="email" id="email" helperText="Use your work email" />);
        expect(screen.getByText('Use your work email')).toBeInTheDocument();
    });

    it('hides helper text when an error is also provided', () => {
        render(
            <Input name="email" id="email" helperText="Use your work email" error="Required" />
        );
        expect(screen.queryByText('Use your work email')).not.toBeInTheDocument();
        expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<Input name="email" id="email" disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('shows a required asterisk when required is true', () => {
        render(<Input label="Email" name="email" required />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    describe('password toggle', () => {
        it('renders as type="password" by default', () => {
            render(<Input type="password" name="password" id="password" showPasswordToggle />);
            const input = document.querySelector('input[name="password"]');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'password');
        });

        it('toggles to type="text" when the eye button is clicked', async () => {
            const user = userEvent.setup();
            render(<Input type="password" name="password" id="password" showPasswordToggle />);

            const toggle = screen.getByRole('button');
            await user.click(toggle);

            // After toggle, the input type should change
            const input = document.querySelector('input[name="password"]');
            expect(input).toHaveAttribute('type', 'text');
        });

        it('toggles back to type="password" on second click', async () => {
            const user = userEvent.setup();
            render(<Input type="password" name="password" id="password" showPasswordToggle />);

            const toggle = screen.getByRole('button');
            await user.click(toggle); // show
            await user.click(toggle); // hide

            const input = document.querySelector('input[name="password"]');
            expect(input).toHaveAttribute('type', 'password');
        });
    });
});
