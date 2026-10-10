import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface LegalSection {
  heading: string;
  body: string;
}

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  useDocumentTitle(title);
  return (
    <AuthLayout>
      <article className="prose-invert">
        <h1 className="text-2xl font-bold tracking-tight text-content">{title}</h1>
        <p className="mt-2 text-sm text-content-muted">{intro}</p>
        <p className="mt-4 rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-xs text-content-faint">
          This document is a placeholder template. Replace it with legally reviewed
          content before production.
        </p>
        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-sm font-semibold text-content">{section.heading}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-content-muted">
                {section.body}
              </p>
            </section>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/login">
            <Button variant="secondary" fullWidth>
              Back to sign in
            </Button>
          </Link>
        </div>
      </article>
    </AuthLayout>
  );
}

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The rules that govern your use of SecureAuth."
      sections={[
        {
          heading: 'Acceptable use',
          body: 'You agree to use SecureAuth only for lawful purposes and in accordance with your organisation’s policies.',
        },
        {
          heading: 'Account responsibility',
          body: 'You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.',
        },
        {
          heading: 'Service availability',
          body: 'We strive for high availability but do not guarantee uninterrupted service. Planned maintenance will be communicated in advance.',
        },
      ]}
    />
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="How SecureAuth collects, uses, and protects your information."
      sections={[
        {
          heading: 'Data we process',
          body: 'We store your email, display name, and role. Passwords are never stored in our application database — authentication is handled entirely by Supabase Auth.',
        },
        {
          heading: 'Access controls',
          body: 'Row Level Security ensures users can only access their own profile data. Administrative access is limited to verified administrator accounts.',
        },
        {
          heading: 'Your rights',
          body: 'You may request a copy of your data or ask for your account to be deleted at any time by contacting support.',
        },
      ]}
    />
  );
}
