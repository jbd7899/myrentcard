import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Building2, Users, TrendingUp, Eye } from 'lucide-react';
import type { Property, Application } from '@shared/schema';

interface PropertyAnalyticsProps {
  properties: Property[];
  applications: Application[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const PropertyAnalytics: React.FC<PropertyAnalyticsProps> = ({
  properties,
  applications
}) => {
  // Calculate key metrics
  const totalPageViews = properties.reduce((acc, p) => acc + (p.pageViews || 0), 0);
  const totalSubmissions = properties.reduce((acc, p) => acc + (p.submissionCount || 0), 0);
  const averageConversionRate = totalPageViews ? (totalSubmissions / totalPageViews) * 100 : 0;

  // Property performance data
  const propertyPerformance = properties.map(property => ({
    name: property.title,
    pageViews: property.pageViews || 0,
    submissions: property.submissionCount || 0,
    conversionRate: property.pageViews ? ((property.submissionCount || 0) / property.pageViews) * 100 : 0
  }));

  // Calculate key metrics (from original code, modified)
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === 'Rented').length;
  const occupancyRate = totalProperties ? (occupiedProperties / totalProperties) * 100 : 0;
  const totalApplications = applications.length;
  const averageApplicationsPerProperty = totalProperties ? totalApplications / totalProperties : 0;

  const monthlyRevenue = properties.reduce((acc, property) => acc + (property.status === 'Rented' ? property.rent : 0), 0);

  const statusData = [
    { name: 'Available', value: properties.filter(p => p.status === 'Available').length },
    { name: 'Rented', value: properties.filter(p => p.status === 'Rented').length },
    { name: 'Pending', value: properties.filter(p => p.status === 'Pending').length }
  ];

  // Sample application trend data (you would typically get this from your backend)
  const applicationTrends = [
    { month: 'Jan', applications: 4 },
    { month: 'Feb', applications: 6 },
    { month: 'Mar', applications: 8 },
    { month: 'Apr', applications: 5 },
    { month: 'May', applications: 9 },
    { month: 'Jun', applications: 7 }
  ];

  return (
    <div className="space-y-6">
      {/* High-level metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all property pages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              RentCard applications received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Views to submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={propertyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="pageViews" name="Page Views" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="submissions" name="Submissions" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Property Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle className="text-lg">{property.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Page Views</span>
                  <span>{property.pageViews || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Submissions</span>
                  <span>{property.submissionCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Conversion Rate</span>
                  <span>
                    {property.pageViews 
                      ? (((property.submissionCount || 0) / property.pageViews) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Original charts and cards remain mostly unchanged */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Property Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyAnalytics;