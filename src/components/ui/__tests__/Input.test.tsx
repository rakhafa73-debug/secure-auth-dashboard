import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('associates its label and marks invalid state accessibly', () => {
    render(<Input label="Email address" error="Enter a valid email." />);
    const input = screen.getByLabelText('Email address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email.');
  });

  it('hides the password by default and toggles visibility', async () => {
    const user = userEvent.setup();
    render(<Input label="Password" type="password" defaultValue="secret" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
