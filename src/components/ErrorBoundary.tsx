import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log a redacted error only — never include tokens or credentials.
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error.message, info.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-base px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-danger/30 bg-danger-soft">
            <AlertOctagon className="h-7 w-7 text-danger" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-content">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-sm text-sm text-content-muted">
            An unexpected error occurred. Reloading usually fixes it. If the problem
            persists, contact support.
          </p>
          <Button className="mt-8" onClick={this.handleReset}>
            Reload application
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
