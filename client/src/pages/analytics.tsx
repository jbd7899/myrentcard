import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import type { ScreeningPage, ScreeningSubmission } from '@shared/schema';
import { Loader2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsPage = () => {
  const [location] = useLocation();
  const urlId = location.split('/').pop() || '';

  // Fetch screening page data using urlId
  const { data: screeningPage, isLoading: pageLoading } = useQuery<ScreeningPage>({
    queryKey: [`/api/screening/${urlId}`],
    enabled: !!urlId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch submissions data
  const { data: submissions, isLoading: submissionsLoading } = useQuery<ScreeningSubmission[]>({
    queryKey: [`/api/screening-pages/${screeningPage?.id}/submissions`],
    enabled: !!screeningPage?.id,
    refetchInterval: 30000,
  });

  if (pageLoading || submissionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!screeningPage) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  // Prepare data for charts
  const submissionsByStatus = submissions?.reduce((acc: Record<string, number>, submission) => {
    acc[submission.status] = (acc[submission.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const statusData = Object.entries(submissionsByStatus).map(([status, count]) => ({
    status,
    count,
  }));

  // Prepare pie chart data
  const pieData = statusData.map(({ status, count }) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  // Calculate conversion rate
  const conversionRate = screeningPage.submissionCount > 0 
    ? ((screeningPage.submissionCount / screeningPage.views) * 100).toFixed(1)
    : '0';

  // Prepare time-based data (mock data for now, replace with real data when available)
  const timeData = [
    { time: '1 Day', views: screeningPage.views * 0.2 },
    { time: '3 Days', views: screeningPage.views * 0.5 },
    { time: '1 Week', views: screeningPage.views * 0.8 },
    { time: '2 Weeks', views: screeningPage.views },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">{screeningPage.title} - Analytics</h1>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card hover="lift" className="transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{screeningPage.views}</div>
            <p className="text-sm text-gray-600 mt-2">Total page views</p>
          </CardContent>
        </Card>

        <Card hover="lift" className="transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{screeningPage.uniqueVisitors}</div>
            <p className="text-sm text-gray-600 mt-2">Unique visitors</p>
          </CardContent>
        </Card>

        <Card hover="lift" className="transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{screeningPage.submissionCount}</div>
            <p className="text-sm text-gray-600 mt-2">Total submissions</p>
          </CardContent>
        </Card>

        <Card hover="lift" className="transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{conversionRate}%</div>
            <p className="text-sm text-gray-600 mt-2">Views to submissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submissions by Status */}
        <Card hover="glow" className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Submissions by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="status" 
                    tick={{ fill: '#666' }}
                    tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <YAxis tick={{ fill: '#666' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="var(--primary)" 
                    name="Number of Submissions"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card hover="glow" className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Views Over Time */}
        <Card hover="glow" className="transition-all duration-300 lg:col-span-2">
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fill: '#666' }} />
                  <YAxis tick={{ fill: '#666' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;