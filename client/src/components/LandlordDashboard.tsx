import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import BulkApplicationManager from './BulkApplicationManager';
import type { Application, Property } from '@shared/schema';

const LandlordDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch applications and properties with proper typing
  const { data: applications } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
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

      {/* Bulk Application Manager */}
      {applications && properties && (
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