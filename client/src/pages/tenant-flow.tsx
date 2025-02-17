import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function TenantFlow() {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input placeholder="Enter your phone number" />
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        );
      
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Rental History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Address</label>
                <Input placeholder="Enter your current address" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employment Status</label>
                <Input placeholder="Enter your employment status" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Income</label>
                <Input placeholder="Enter your monthly income" />
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Save Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Your RentCard is ready! Create an account to save your information and access it anytime.
              </p>
              {user ? (
                <div className="text-center">
                  <p className="text-green-600 font-medium mb-4">You're already logged in!</p>
                  <Link href="/tenant">
                    <Button>Go to Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link href="/auth">
                    <Button className="w-full">Create Account</Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    Skip for now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-md mx-auto p-6">
        {renderStep()}
      </div>
    </div>
  );
}
