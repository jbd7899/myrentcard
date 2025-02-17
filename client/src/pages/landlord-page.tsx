import { useState } from 'react';
import LandlordFlow from '@/components/LandlordFlow';
import { useAuth } from '@/hooks/use-auth';

export default function LandlordPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Welcome back, {user?.name}
          </h1>
          <LandlordFlow />
        </div>
      </div>
    </div>
  );
}
