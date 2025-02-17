import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function LandlordFlow() {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property Name/Address</label>
                <Input placeholder="Enter property name or address" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <Input placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <Input type="email" placeholder="Enter your email" />
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
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Credit Score</label>
                <Input type="number" placeholder="Enter minimum credit score" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Income Requirements</label>
                <Input placeholder="E.g. 3x monthly rent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Requirements</label>
                <Input placeholder="Any other requirements" />
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
              <CardTitle>Create Your Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Your property listing is ready! Create an account to manage your listings and view tenant applications.
              </p>
              {user ? (
                <div className="text-center">
                  <p className="text-green-600 font-medium mb-4">You're already logged in!</p>
                  <Link href="/landlord">
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
