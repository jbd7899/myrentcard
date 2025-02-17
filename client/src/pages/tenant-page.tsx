import { useAuth } from '@/hooks/use-auth';
import TenantAccount from '@/components/TenantAccount';

export default function TenantPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Welcome back, {user?.name}
          </h1>
          <TenantAccount />
        </div>
      </div>
    </div>
  );
}
