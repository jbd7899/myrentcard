import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { insertScreeningPageSchema } from '@shared/schema';
import type { ScreeningPage } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

const EditScreeningPage = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pageId = location.split('/').pop() || '';
  const isGeneral = pageId === 'general';

  // Fetch existing screening page data
  const { data: screeningPage, isLoading } = useQuery<ScreeningPage>({
    queryKey: [`/api/screening-pages/${isGeneral ? 'general' : pageId.replace('property-', '')}`],
  });

  const form = useForm({
    resolver: zodResolver(insertScreeningPageSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: {
        minCreditScore: 650,
        minIncome: 3000,
        noEvictions: true,
        cleanRentalHistory: true,
      },
    },
  });

  // Update form when data is loaded
  React.useEffect(() => {
    if (screeningPage) {
      // Transform the data to match form structure
      const formData = {
        title: screeningPage.title,
        description: screeningPage.description || '', // Convert null to empty string
        requirements: {
          minCreditScore: screeningPage.requirements.minCreditScore,
          minIncome: screeningPage.requirements.minIncome,
          noEvictions: screeningPage.requirements.noEvictions,
          cleanRentalHistory: screeningPage.requirements.cleanRentalHistory,
        },
      };
      form.reset(formData);
    }
  }, [screeningPage, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(
        'PATCH',
        `/api/screening-pages/${isGeneral ? 'general' : pageId.replace('property-', '')}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/screening-pages/${isGeneral ? 'general' : pageId.replace('property-', '')}`],
      });
      toast({
        title: 'Success',
        description: 'Screening page updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update screening page: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>
            {isGeneral ? 'Edit General Screening Page' : 'Edit Property Screening Page'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Requirements</h3>

                <FormField
                  control={form.control}
                  name="requirements.minCreditScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Credit Score</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                      <FormLabel>Minimum Monthly Income ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements.noEvictions"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>No Prior Evictions</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements.cleanRentalHistory"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Clean Rental History</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditScreeningPage;