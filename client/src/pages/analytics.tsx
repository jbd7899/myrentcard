import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ScreeningPage, ScreeningSubmission } from '@shared/schema';
import { Loader2 } from 'lucide-react';

const AnalyticsPage = () => {
  const [location] = useLocation();
  const pageId = location.split('/').pop() || '';
  const isGeneral = pageId === 'general';

  // Fetch screening page data
  const { data: screeningPage, isLoading: pageLoading } = useQuery<ScreeningPage>({
    queryKey: [`/api/screening-pages/${isGeneral ? 'general' : pageId.replace('property-', '')}`],
  });

  // Fetch submissions data
  const { data: submissions, isLoading: submissionsLoading } = useQuery<ScreeningSubmission[]>({
    queryKey: [`/api/screening-pages/${isGeneral ? 'general' : pageId.replace('property-', '')}/submissions`],
  });

  if (pageLoading || submissionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Prepare data for charts
  const submissionsByStatus = submissions?.reduce((acc: any, submission) => {
    acc[submission.status] = (acc[submission.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = submissionsByStatus ? Object.entries(submissionsByStatus).map(([status, count]) => ({
    status,
    count,
  })) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{screeningPage?.views || 0}</div>
            <p className="text-sm text-gray-600 mt-2">Total page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{screeningPage?.uniqueVisitors || 0}</div>
            <p className="text-sm text-gray-600 mt-2">Unique visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{screeningPage?.submissionCount || 0}</div>
            <p className="text-sm text-gray-600 mt-2">Total submissions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Submissions by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Number of Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
