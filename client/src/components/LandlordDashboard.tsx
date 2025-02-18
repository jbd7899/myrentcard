import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon } from 'lucide-react';
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Property Dashboard</h2>
        <div className="space-x-4">
          <Link href="/request-info">
            <Button
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Create Screening Page</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Properties Overview */}
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