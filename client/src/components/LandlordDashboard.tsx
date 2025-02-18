import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, QrCode, Copy, Share2, Building2, PlusCircle, Edit } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import BulkApplicationManager from './BulkApplicationManager';
import type { Property, Application } from '@shared/schema';
import { Loader2 } from 'lucide-react';

const LandlordDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties with proper typing and error handling
  const { 
    data: properties,
    isLoading: propertiesLoading,
    error: propertiesError 
  } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/properties');
      return res.json();
    },
    retry: 3,
  });

  // Fetch applications with proper typing and error handling
  const { 
    data: applications,
    isLoading: applicationsLoading,
    error: applicationsError 
  } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/applications');
      return res.json();
    },
    retry: 3,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copied",
        description: "The screening page link has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateQRCode = (screeningPageId: string) => {
    // TODO: Implement QR code generation
    toast({
      title: "QR Code",
      description: "QR code generation will be implemented soon",
    });
  };

  const shareScreeningPage = (screeningPageId: string) => {
    // TODO: Implement share functionality
    toast({
      title: "Share",
      description: "Share functionality will be implemented soon",
    });
  };

  // Mutation for bulk updating applications
  const updateApplicationsMutation = useMutation({
    mutationFn: async ({ applicationIds, status }: { applicationIds: number[], status: 'approved' | 'rejected' }) => {
      const response = await apiRequest('PATCH', '/api/applications/bulk', {
        applicationIds,
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Success",
        description: "Applications updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update applications: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateApplications = async (applicationIds: number[], status: 'approved' | 'rejected') => {
    await updateApplicationsMutation.mutateAsync({ applicationIds, status });
  };


  if (propertiesLoading || applicationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (propertiesError || applicationsError) {
    return (
      <div className="text-red-500 p-4">
        Error loading dashboard data. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Screening Pages Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Screening Pages</h2>
        </div>

        {/* General Screening Page */}
        <Card>
          <CardHeader>
            <CardTitle>General Screening Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your default screening page for all rental applications
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/screening/general`)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" onClick={() => generateQRCode('general')}>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
                <Button variant="outline" onClick={() => shareScreeningPage('general')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Link href="/edit-screening/general">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property-Specific Screening Pages */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Property Screening Pages</h3>
            <Link href="/create-screening">
              <Button className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4" />
                <span>Create Property Screening</span>
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {properties?.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>{property.address}</p>
                      <p className="mt-1">Status: {property.status}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(`${window.location.origin}/screening/property/${property.id}`)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button variant="outline" onClick={() => generateQRCode(`property-${property.id}`)}>
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </Button>
                      <Button variant="outline" onClick={() => shareScreeningPage(`property-${property.id}`)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Link href={`/edit-screening/property/${property.id}`}>
                        <Button variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Existing Properties Overview Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Properties Overview</h2>
          <Link href="/request-info">
            <Button
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Property</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{property.address}</p>
                <div className="mt-4">
                  <p>Units: {property.units}</p>
                  <p>Status: {property.status}</p>
                  <p>Views: {property.pageViews}</p>
                  <p>Applications: {property.submissionCount}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bulk Application Manager */}
      {applications && applications.length > 0 && properties && (
        <BulkApplicationManager
          applications={applications}
          properties={properties}
          onUpdateApplications={handleUpdateApplications}
        />
      )}
    </div>
  );
};

export default LandlordDashboard;