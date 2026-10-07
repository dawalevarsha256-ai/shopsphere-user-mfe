import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <main className="um-page">
      <section className="um-card um-auth-card">
        <p className="um-brand">ShopSphere</p>
        <h1 className="um-title">{title}</h1>
        <p className="um-subtitle">{subtitle}</p>
        {children}
        {footer && <p className="um-footer-text">{footer}</p>}
      </section>
    </main>
  );
}
