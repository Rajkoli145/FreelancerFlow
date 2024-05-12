import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../components/ui/Button';

describe('Button', () => {
    it('renders with the provided text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<Button onClick={handleClick}>Submit</Button>);
        await user.click(screen.getByRole('button'));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows a spinner and is disabled when loading', () => {
        render(<Button loading>Saving</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        // Spinner SVG should be in the DOM
        expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('is disabled when the disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not call onClick when disabled', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<Button disabled onClick={handleClick}>Disabled</Button>);
        await user.click(screen.getByRole('button'));

        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders with type="submit" when specified', () => {
        render(<Button type="submit">Send</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('defaults to type="button"', () => {
        render(<Button>Default</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('applies the fullWidth class when fullWidth is true', () => {
        render(<Button fullWidth>Full</Button>);
        expect(screen.getByRole('button').className).toContain('w-full');
    });

    it('does not call onClick when loading', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<Button loading onClick={handleClick}>Loading</Button>);
        await user.click(screen.getByRole('button'));

        expect(handleClick).not.toHaveBeenCalled();
    });
});
