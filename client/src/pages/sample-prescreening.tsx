import React, { useState } from 'react';
import { Building2, Shield, Calendar, Users, PawPrint, Car, Briefcase, HelpCircle, ArrowRight, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Sample data for demonstration
const samplePropertyData = {
  title: "Sample Property Pre-Screening",
  description: "This is a demonstration of our pre-screening process. Feel free to explore the features!",
  requirements: {
    minCreditScore: "650+",
    minIncome: "$3,500/month",
    noEvictions: true,
    cleanRentalHistory: true
  },
  propertyDetails: {
    rent: "$2,000/month",
    deposit: "$2,000",
    location: "123 Sample Street, Anytown, USA",
    availability: "Immediate"
  }
};

const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Info className="w-4 h-4 ml-2 text-blue-500" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function SamplePrescreeningPage() {
  const [loading, setLoading] = useState(false);
  const [showTraditionalForm, setShowTraditionalForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      alert('This is a sample pre-screening page. In a real application, your information would be submitted to the landlord.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Demo Notice */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">🎯 Demo Page</h2>
          <p className="text-blue-700">
            This is a sample pre-screening page to demonstrate the application process.
            Feel free to explore the features and hover over the info icons for helpful tips!
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              {samplePropertyData.title}
              <InfoTooltip content="This page shows landlords how tenant information will be presented" />
            </CardTitle>
            <CardDescription>
              {samplePropertyData.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Property Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  Property Requirements
                  <InfoTooltip content="Landlords can set specific requirements that tenants must meet" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <span>Min. Credit Score: {samplePropertyData.requirements.minCreditScore}</span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                    <span>Min. Income: {samplePropertyData.requirements.minIncome}</span>
                  </div>
                </div>
              </div>

              {/* RentCard Option */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  Option 1: Apply with RentCard
                  <InfoTooltip content="RentCard is our fastest application method - create once, use everywhere!" />
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send your verified rental profile instantly
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
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  Option 2: Traditional Application
                  <InfoTooltip content="Fill out a standard rental application if you prefer not to use RentCard" />
                </h3>
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
                        <InfoTooltip content="When would you like to move in? This helps landlords prioritize applications" />
                      </label>
                      <input type="date" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium">
                        <Users className="w-4 h-4 mr-2" />
                        Number of Occupants
                        <InfoTooltip content="Include all adults and children who will live in the property" />
                      </label>
                      <input type="number" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium">
                        <PawPrint className="w-4 h-4 mr-2" />
                        Pet Information
                        <InfoTooltip content="List any pets you have, including type, breed, and size" />
                      </label>
                      <input type="text" className="w-full p-2 border rounded-lg" placeholder="Type and number of pets" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium">
                        <Car className="w-4 h-4 mr-2" />
                        Vehicle Information
                        <InfoTooltip content="List vehicles that will need parking at the property" />
                      </label>
                      <input type="text" className="w-full p-2 border rounded-lg" placeholder="Make, model, year" />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Sample Application
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
    </div>
  );
}