import type { ReactNode } from 'react';
import { Lock, ShieldCheck, Fingerprint, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

function GeometricBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid-fade" />
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="authgrid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0H0V44" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authgrid)" />
      </svg>
      <div className="absolute right-[12%] top-[18%] h-40 w-40 rotate-12 rounded-[2rem] border border-line-strong bg-white/[0.02] backdrop-blur-sm" />
      <div className="absolute right-[22%] top-[38%] h-24 w-24 -rotate-6 rounded-3xl border border-primary/30 bg-primary/[0.06]" />
      <div className="absolute right-[8%] bottom-[22%] h-28 w-28 rounded-full border border-accent/20 bg-accent/[0.05]" />
    </div>
  );
}

const HIGHLIGHTS = [
  { icon: Lock, text: 'End-to-end encrypted sessions' },
  { icon: Fingerprint, text: 'Row Level Security on every table' },
  { icon: ShieldCheck, text: 'OWASP-aligned authentication' },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-base lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <GeometricBackdrop />

        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 max-w-md animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs font-medium text-accent">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Premium secure workspace
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-content xl:text-5xl">
            Your workspace.
            <br />
            Your control.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-content-muted">
            SecureAuth keeps every account protected with layered security controls,
            verified identities, and transparent access policies you can trust.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-content-muted">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-accent">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-content-faint">
          <span>© {new Date().getFullYear()} SecureAuth</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            All systems operational
          </span>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-dvh flex-col">
        {/* Mobile header with logo */}
        <header className="flex items-center justify-between px-5 pt-6 lg:hidden">
          <Logo size="md" />
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px] animate-scale-in">{children}</div>
        </div>

        <footer className="px-5 pb-6 text-center text-xs text-content-faint lg:hidden">
          © {new Date().getFullYear()} SecureAuth. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
