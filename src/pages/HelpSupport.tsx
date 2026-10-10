import { BookOpen, LifeBuoy, Mail, MessageSquare, ShieldQuestion } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { PageHeader } from '@/components/dashboard/PageHeader';

const FAQS = [
  {
    q: 'How do I reset my password?',
    a: 'Go to Security settings and choose “Send reset link”. We will email you a secure link that expires shortly for your protection.',
  },
  {
    q: 'Why do I need to verify my email?',
    a: 'Email verification confirms you own the address on your account. It enables account recovery and keeps your workspace secure.',
  },
  {
    q: 'How is my data protected?',
    a: 'Authentication is handled by Supabase Auth and all profile data is protected with database Row Level Security, so you can only ever access your own records.',
  },
  {
    q: 'Can I change my email address?',
    a: 'Email changes are managed by your authentication provider. Contact support if you need to update the email on your account.',
  },
];

export default function HelpSupport() {
  useDocumentTitle('Help & support');
  return (
    <div>
      <PageHeader
        title="Help & support"
        description="Answers to common questions and ways to reach our team."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Frequently asked questions"
              description="Quick answers to the most common topics."
              action={<BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />}
            />
            <CardBody className="pt-0">
              <div className="divide-y divide-line">
                {FAQS.map((item) => (
                  <details key={item.q} className="group py-4 first:pt-0 last:pb-0">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-content marker:content-none">
                      <span className="flex items-center gap-2.5">
                        <ShieldQuestion className="h-4 w-4 shrink-0 text-content-faint" aria-hidden="true" />
                        {item.q}
                      </span>
                      <span
                        className="text-content-faint transition-transform group-open:rotate-45"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-2.5 pl-[26px] text-sm leading-relaxed text-content-muted">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Contact support"
              description="We usually respond within one business day."
              action={<LifeBuoy className="h-5 w-5 text-accent" aria-hidden="true" />}
            />
            <CardBody className="space-y-3 pt-0">
              <a
                href="mailto:support@example.com"
                className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.06]"
              >
                <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium text-content">Email support</span>
                  <span className="block text-xs text-content-muted">support@example.com</span>
                </span>
              </a>
              <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-4">
                <MessageSquare className="h-5 w-5 text-accent" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium text-content">Live chat</span>
                  <span className="block text-xs text-content-muted">Weekdays, 9am–6pm</span>
                </span>
              </div>
              <p className="text-xs text-content-faint">
                Placeholder contact details — replace with your real support channels.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
