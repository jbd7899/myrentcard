import React, { useState } from 'react';
import { ArrowRight, Clock, Shield, Building2, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";

// Success page component
const SuccessPage = ({ formData }: { formData: any }) => {
  const [showAccountForm, setShowAccountForm] = useState(false);
  const screeningLink = `https://myrentcard.com/apply/${Math.random().toString(36).substr(2, 9)}`;
  const { user, registerMutation } = useAuth();
  const { toast } = useToast();

  const registerForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      type: "landlord",
      name: formData.managerName || "",
      email: formData.businessEmail || "",
      phone: "",
    },
    resolver: zodResolver(
      insertUserSchema.extend({
        confirmPassword: insertUserSchema.shape.password,
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      })
    ),
  });

  const handleRegister = async (data: any) => {
    try {
      await registerMutation.mutateAsync({
        ...data,
        type: "landlord",
      });
      toast({
        title: "Account created successfully",
        description: "You can now manage your properties and view applications",
      });
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success Page Content */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Your Pre-Screening Page is Ready!</h2>
        <p className="text-gray-600 mb-4">
          Share this link with potential tenants to receive instant RentCard submissions
        </p>
        <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <p className="text-sm text-blue-800">
            ✨ Recommended: Create a free account to manage submissions and update your screening page
          </p>
        </div>
      </div>

      {user ? (
        <Card className="p-6 border-2 border-blue-100">
          <CardHeader>
            <CardTitle>Account Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-center mb-4">Your account is already connected!</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6 border-2 border-blue-100">
          <CardHeader>
            <CardTitle>Create Your Free Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">With a free account you can:</p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  View and manage tenant submissions
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Update your screening requirements anytime
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Save your page for future properties
                </li>
                <li className="flex items-center">
                  <span className="bg-blue-100 rounded-full p-1 mr-2">✓</span>
                  Access basic analytics and insights
                </li>
              </ul>
              <div className="pt-4">
                <Button 
                  onClick={() => setShowAccountForm(!showAccountForm)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 font-semibold"
                  size="lg"
                >
                  Create Free Account
                </Button>
                <p className="text-sm text-center mt-2 text-gray-500">
                  Optional premium features available for power users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showAccountForm && !user && (
        <Card className="p-6 mt-6">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 font-semibold"
                  size="lg"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Complete Account Setup"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card className="p-6 mt-8">
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg break-all text-center">
            <p className="font-mono text-gray-800">{screeningLink}</p>
          </div>
          <Button className="w-full mt-4">
            Copy Link
          </Button>
        </CardContent>
      </Card>

      <Card className="p-6 mt-8">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Share your link</h3>
              <p className="text-gray-600">
                Add this link to your property listings or share directly with interested tenants
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Tenants submit instantly</h3>
              <p className="text-gray-600">
                Interested tenants can submit their complete RentCard profile with one click
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Review qualified candidates</h3>
              <p className="text-gray-600">
                Only receive submissions from tenants who meet your requirements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Form schema for the requirements form
const requirementsFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  managerName: z.string().min(1, "Contact name is required"),
  businessEmail: z.string().email("Invalid email address"),
  requirements: z.object({
    minCreditScore: z.string(),
    minIncome: z.string(),
    noEvictions: z.boolean(),
    cleanRentalHistory: z.boolean(),
  }),
});

type RequirementsFormData = z.infer<typeof requirementsFormSchema>;

// Requirements form component
const RequirementsForm = ({ onSubmit }: { onSubmit: (data: RequirementsFormData) => void }) => {
  const form = useForm<RequirementsFormData>({
    defaultValues: {
      businessName: '',
      managerName: '',
      businessEmail: '',
      requirements: {
        minCreditScore: '',
        minIncome: '',
        noEvictions: true,
        cleanRentalHistory: true,
      },
    },
    resolver: zodResolver(requirementsFormSchema),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        Customize Your Pre-Screening Requirements
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business/Property Management Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="managerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Tenant Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requirements.minCreditScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Credit Score</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 650" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requirements.minIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Monthly Income</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 3000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="requirements.noEvictions"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded"
                        />
                      </FormControl>
                      <FormLabel>No prior evictions</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requirements.cleanRentalHistory"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded"
                        />
                      </FormControl>
                      <FormLabel>Clean rental payment history</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg text-lg font-semibold"
              size="lg"
            >
              Create Pre-Screening Page <ArrowRight className="inline ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

// Landing page component
const LandingPage = ({ onProceed }: { onProceed: () => void }) => (
  <div className="max-w-6xl mx-auto px-4 py-12">
    <h1 className="text-4xl font-bold text-center mb-4">
      Pre-Screen Tenants Instantly
    </h1>
    <p className="text-xl text-center text-gray-600 mb-4">
      Create your custom pre-screening page and receive qualified RentCard profiles from interested tenants
    </p>
    <p className="text-center text-blue-600 font-semibold mb-12">
      Core features are free • Optional premium features available
    </p>

    <div className="grid md:grid-cols-3 gap-8 mb-12">
      <Card className="p-6">
        <CardHeader>
          <Clock className="w-12 h-12 text-blue-600 mb-4" />
          <CardTitle>Save Time</CardTitle>
        </CardHeader>
        <CardContent>
          Only meet with pre-qualified tenants who match your requirements. 
          No more wasted showings or lengthy phone screenings.
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <Shield className="w-12 h-12 text-blue-600 mb-4" />
          <CardTitle>Verified Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          Receive complete RentCard profiles with verified rental history, 
          income, and references. Tenants with RentCard accounts can submit with just one click.
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <Building2 className="w-12 h-12 text-blue-600 mb-4" />
          <CardTitle>Multiple Properties</CardTitle>
        </CardHeader>
        <CardContent>
          Show interested tenants your other available properties that match their needs. 
          Convert more leads and fill vacancies faster with cross-property recommendations.
        </CardContent>
      </Card>
    </div>

    <div className="text-center">
      <Button
        onClick={onProceed}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg text-lg font-semibold"
        size="lg"
      >
        Create Pre-Screening Page
      </Button>
    </div>
  </div>
);

// Main LandlordFlow component
const LandlordFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RequirementsFormData>({
    businessName: '',
    managerName: '',
    businessEmail: '',
    requirements: {
      minCreditScore: '',
      minIncome: '',
      noEvictions: true,
      cleanRentalHistory: true,
    },
  });

  const handleFormSubmit = (data: RequirementsFormData) => {
    setFormData(data);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 1 && <LandingPage onProceed={() => setStep(2)} />}
      {step === 2 && <RequirementsForm onSubmit={handleFormSubmit} />}
      {step === 3 && <SuccessPage formData={formData} />}
    </div>
  );
};

export default LandlordFlow;