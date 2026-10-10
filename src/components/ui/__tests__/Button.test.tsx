import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders its label and is keyboard accessible', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Sign in</Button>);

    const button = screen.getByRole('button', { name: 'Sign in' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(clicked).toBe(true);
  });

  it('shows a busy state and blocks interaction while loading', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(
      <Button isLoading onClick={() => (clicked = true)}>
        Saving
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await user.click(button);
    expect(clicked).toBe(false);
  });
});
