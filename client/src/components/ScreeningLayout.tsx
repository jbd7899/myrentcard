import { ReactNode } from 'react';

interface ScreeningLayoutProps {
  children: ReactNode;
}

export default function ScreeningLayout({ children }: ScreeningLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl font-bold">
              <span className="text-[#4361ee]">My</span>
              <span className="text-[#3a0ca3]">RentCard</span>
            </span>
          </div>
          <p className="text-gray-600">
            Professional Tenant Screening Service
          </p>
          <p className="text-sm text-gray-500">
            Contact: support@myrentcard.com | (555) 123-4567
          </p>
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
