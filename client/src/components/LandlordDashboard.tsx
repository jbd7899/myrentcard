import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, QrCode, Copy, Share2, Building2, PlusCircle, Edit, ChartBar, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import BulkApplicationManager from './BulkApplicationManager';
import type { Property, Application, ScreeningPage } from '@shared/schema';


const LandlordDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: properties,
    isLoading: propertiesLoading,
    error: propertiesError 
  } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const { 
    data: applications,
    isLoading: applicationsLoading,
    error: applicationsError 
  } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  const {
    data: screeningPages,
    isLoading: screeningPagesLoading,
    error: screeningPagesError
  } = useQuery<ScreeningPage[]>({
    queryKey: ['/api/screening-pages'],
  });

  const generalScreeningPage = screeningPages?.find(p => p.type === 'general');

  const copyToClipboard = async (urlId: string) => {
    try {
      const url = `${window.location.origin}/screening/${urlId}`;
      await navigator.clipboard.writeText(url);
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

  const generateQRCode = (urlId: string) => {
    window.open(`/qr-code/${urlId}`, '_blank');
  };

  const shareScreeningPage = (urlId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Rental Screening Page',
        text: 'Check out this rental screening page',
        url: `${window.location.origin}/screening/${urlId}`,
      }).catch(() => {
        toast({
          title: "Sharing failed",
          description: "Could not share the screening page",
          variant: "destructive",
        });
      });
    } else {
      copyToClipboard(urlId);
    }
  };

  if (propertiesLoading || applicationsLoading || screeningPagesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (propertiesError || applicationsError || screeningPagesError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-red-500">
          Error loading dashboard data. You may need to log in again.
        </div>
        <Button 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
            queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
            queryClient.invalidateQueries({ queryKey: ['/api/screening-pages'] });
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Screening Pages</h2>
          <Link href="/create-screening">
            <Button className="flex items-center space-x-2 group">
              <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
              <span>Create New Screening Page</span>
            </Button>
          </Link>
        </div>

        {generalScreeningPage && (
          <Card hover="lift" className="transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>General Screening Page</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Default screening page for all rental applications
                  </p>
                </div>
                <div className="bg-blue-100 px-3 py-1 rounded text-sm">
                  <span className="font-medium">{generalScreeningPage.views}</span> views
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(generalScreeningPage.urlId)}
                    className="group"
                  >
                    <Copy className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
                    Copy Link
                  </Button>
                  <Button variant="outline" onClick={() => generateQRCode(generalScreeningPage.urlId)} className="group">
                    <QrCode className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
                    QR Code
                  </Button>
                  <Button variant="outline" onClick={() => shareScreeningPage(generalScreeningPage.urlId)} className="group">
                    <Share2 className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
                    Share
                  </Button>
                  <Link href={`/edit-screening/${generalScreeningPage.urlId}`}>
                    <Button variant="outline" className="group">
                      <Edit className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/analytics/${generalScreeningPage.urlId}`}>
                    <Button variant="outline" className="group">
                      <ChartBar className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
                      Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {properties?.map((property) => {
            const screeningPage = screeningPages?.find(p => p.propertyId === property.id);
            if (!screeningPage) return null;

            return (
              <Card 
                key={property.id} 
                hover="glow"
                className="transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">
                        {property.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1 group-hover:text-gray-900 transition-colors duration-200">
                        {property.address}
                      </p>
                    </div>
                    <div className="bg-blue-100 px-3 py-1 rounded text-sm transition-all duration-200 hover:bg-blue-200">
                      <span className="font-medium">{screeningPage.views}</span> views
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p className="transition-colors duration-200 hover:text-gray-900">
                        Status: {property.status}
                      </p>
                      <p className="transition-colors duration-200 hover:text-gray-900">
                        Applications: {screeningPage.submissionCount}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(screeningPage.urlId)}
                        className="group"
                      >
                        <Copy className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
                        Copy Link
                      </Button>
                      <Button variant="outline" onClick={() => generateQRCode(screeningPage.urlId)} className="group">
                        <QrCode className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
                        QR Code
                      </Button>
                      <Button variant="outline" onClick={() => shareScreeningPage(screeningPage.urlId)} className="group">
                        <Share2 className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
                        Share
                      </Button>
                      <Link href={`/edit-screening/${screeningPage.urlId}`}>
                        <Button variant="outline" className="group">
                          <Edit className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/analytics/${screeningPage.urlId}`}>
                        <Button variant="outline" className="group">
                          <ChartBar className="w-4 h-4 mr-2 transition-transform group-hover:scale-110 duration-200" />
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

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Properties Overview</h2>
          <Link href="/add-property">
            <Button className="flex items-center space-x-2 group">
              <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
              <span>Add New Property</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map((property) => (
            <Card 
              key={property.id}
              hover="lift"
              className="transition-all duration-300"
            >
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

      {applications && applications.length > 0 && properties && (
        <BulkApplicationManager
          applications={applications}
          properties={properties}
          //onUpdateApplications={handleUpdateApplications} //This function is not defined in the original code.  Removed to avoid errors.
        />
      )}
    </div>
  );
};

export default LandlordDashboard;