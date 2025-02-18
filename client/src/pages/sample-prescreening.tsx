import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Building2, Shield, Calendar, Users, PawPrint, Car, Briefcase, HelpCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ScreeningLayout from '@/components/ScreeningLayout';
import type { ScreeningPage } from '@shared/schema';

// Sample screening page data for demonstration
const sampleScreeningPage: ScreeningPage = {
  id: 0,
  createdAt: new Date(),
  title: "Sample Pre-Screening Page",
  description: "This is a sample pre-screening page to demonstrate the application process",
  propertyId: null,
  type: "sample",
  urlId: "sample",
  views: 0,
  uniqueVisitors: 0,
  submissionCount: 0,
  requirements: {
    minCreditScore: "650",
    minIncome: "3000",
    noEvictions: true,
    cleanRentalHistory: true
  }
};

export default function SamplePrescreeningPage() {
  const [loading, setLoading] = useState(false);
  const [showTraditionalForm, setShowTraditionalForm] = useState(false);
  const [, params] = useRoute('/screening/:urlId');
  const urlId = params?.urlId;

  // For the sample page, we'll use the mock data if no urlId is provided
  const { data: screeningPage, isLoading: pageLoading } = useQuery<ScreeningPage>({
    queryKey: [`/api/screening/${urlId}`],
    enabled: !!urlId,
    initialData: !urlId ? sampleScreeningPage : undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      alert('This is a sample application - in a real application, your information would be submitted to the landlord.');
    }, 1500);
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!screeningPage) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Screening Page Not Found</h1>
          <p className="text-gray-600 mt-2">This screening page may have been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <ScreeningLayout screeningPage={screeningPage}>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{screeningPage.title}</CardTitle>
            <CardDescription>
              {screeningPage.description || "Choose how you'd like to apply for this property"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* RentCard Option */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Option 1: Apply with RentCard</h3>
                <p className="text-sm text-gray-600 mb-4">
                  The fastest way to apply - send your verified rental profile instantly
                </p>
                <div className="space-y-4">
                  <button 
                    className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>1-Click Submit with RentCard</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Don't have a RentCard?</span>
                    <button className="text-sm text-blue-600 hover:underline ml-2">
                      Create one now
                    </button>
                  </div>
                </div>
              </div>

              {/* Traditional Application Option */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-2">Option 2: Traditional Application</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Fill out a standard rental application form
                </p>
                <button 
                  className="text-blue-600 hover:underline flex items-center"
                  onClick={() => setShowTraditionalForm(!showTraditionalForm)}
                >
                  <span>{showTraditionalForm ? 'Hide' : 'Show'} Application Form</span>
                  <ArrowRight className={`w-4 h-4 ml-1 transform transition-transform ${showTraditionalForm ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Traditional Application Form */}
              {showTraditionalForm && (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium">
                        <Calendar className="w-4 h-4 mr-2" />
                        Preferred Move-in Date
                      </label>
                      <input type="date" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium">
                        <Users className="w-4 h-4 mr-2" />
                        Number of Occupants
                      </label>
                      <input type="number" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium">
                        <PawPrint className="w-4 h-4 mr-2" />
                        Pet Information
                      </label>
                      <input type="text" className="w-full p-2 border rounded-lg" placeholder="Type and number of pets" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium">
                        <Car className="w-4 h-4 mr-2" />
                        Vehicle Information
                      </label>
                      <input type="text" className="w-full p-2 border rounded-lg" placeholder="Make, model, year" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Current Employment Status
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Self-employed</option>
                        <option>Student</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Reason for Moving
                      </label>
                      <input type="text" className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium">
                      Questions for Landlord
                    </label>
                    <textarea className="w-full p-2 border rounded-lg" rows={3}></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Application
                  </button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust Elements */}
        <div className="space-y-4">
          <Alert>
            <Shield className="w-4 h-4 mr-2" />
            <AlertDescription>
              Your information is secure and will only be shared with the property management
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>RentCard Verified</span>
            <span>•</span>
            <span>256-bit SSL Encryption</span>
            <span>•</span>
            <span>Privacy Protected</span>
          </div>
        </div>
      </main>
    </ScreeningLayout>
  );
}