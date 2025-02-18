import { ReactNode } from 'react';
import type { ScreeningPage } from '@shared/schema';

interface ScreeningLayoutProps {
  children: ReactNode;
  screeningPage: ScreeningPage;
}

export default function ScreeningLayout({ children, screeningPage }: ScreeningLayoutProps) {
  const branding = screeningPage.branding;

  return (
    <div className="min-h-screen bg-background" 
         style={{
           '--primary-color': branding.primaryColor || '#4361ee',
           '--accent-color': branding.accentColor || '#3a0ca3',
         } as React.CSSProperties}>
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            {branding.logo ? (
              <img src={branding.logo} alt="Company Logo" className="h-12" />
            ) : (
              <span className="text-2xl font-bold">
                <span style={{ color: 'var(--primary-color)' }}>My</span>
                <span style={{ color: 'var(--accent-color)' }}>RentCard</span>
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {screeningPage.title}
          </p>
          <p className="text-sm text-gray-500">
            {screeningPage.description}
          </p>
        </header>
        <main>
          {children}
        </main>
      </div>
      <style jsx>{`
        ${branding.customCss || ''}
      `}</style>
    </div>
  );
}