import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, QrCode, Copy, Share2, Building2, PlusCircle, Edit, ChartBar } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import BulkApplicationManager from './BulkApplicationManager';
import type { Property, Application, ScreeningPage } from '@shared/schema';
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
  });

  // Fetch applications with proper typing and error handling
  const { 
    data: applications,
    isLoading: applicationsLoading,
    error: applicationsError 
  } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  // Fetch screening pages
  const {
    data: screeningPages,
    isLoading: screeningPagesLoading,
    error: screeningPagesError
  } = useQuery<ScreeningPage[]>({
    queryKey: ['/api/screening-pages'],
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
    window.open(`/qr-code/${screeningPageId}`, '_blank');
  };

  const shareScreeningPage = (screeningPageId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Rental Screening Page',
        text: 'Check out this rental screening page',
        url: `${window.location.origin}/screening/${screeningPageId}`,
      }).catch(() => {
        toast({
          title: "Sharing failed",
          description: "Could not share the screening page",
          variant: "destructive",
        });
      });
    } else {
      copyToClipboard(`${window.location.origin}/screening/${screeningPageId}`);
    }
  };

  // Loading state
  if (propertiesLoading || applicationsLoading || screeningPagesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (propertiesError || applicationsError || screeningPagesError) {
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
          <Link href="/create-screening">
            <Button className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4" />
              <span>Create New Screening Page</span>
            </Button>
          </Link>
        </div>

        {/* General Screening Page */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>General Screening Page</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Default screening page for all rental applications
                </p>
              </div>
              <div className="bg-blue-100 px-3 py-1 rounded text-sm">
                <span className="font-medium">{screeningPages?.find(p => p.type === 'general')?.views || 0}</span> views
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                <Link href="/analytics/general">
                  <Button variant="outline">
                    <ChartBar className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property-Specific Screening Pages */}
        <div className="grid gap-4 md:grid-cols-2">
          {properties?.map((property) => {
            const screeningPage = screeningPages?.find(p => p.propertyId === property.id);
            return (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{property.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                    </div>
                    <div className="bg-blue-100 px-3 py-1 rounded text-sm">
                      <span className="font-medium">{screeningPage?.views || 0}</span> views
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Status: {property.status}</p>
                      <p>Applications: {screeningPage?.submissions?.length || 0}</p>
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
                      <Link href={`/analytics/property/${property.id}`}>
                        <Button variant="outline">
                          <ChartBar className="w-4 h-4 mr-2" />
                          Analytics
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Properties Overview Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Properties Overview</h2>
          <Link href="/add-property">
            <Button className="flex items-center space-x-2">
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
                <div className="mt-4 space-y-2">
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