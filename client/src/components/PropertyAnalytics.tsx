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
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';
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
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === 'Rented').length;
  const occupancyRate = totalProperties ? (occupiedProperties / totalProperties) * 100 : 0;
  const totalApplications = applications.length;
  const averageApplicationsPerProperty = totalProperties ? totalApplications / totalProperties : 0;
  
  // Monthly revenue data (sample calculation)
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              Occupancy Rate: {occupancyRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {averageApplicationsPerProperty.toFixed(1)} per property
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {occupiedProperties} rented properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalApplications ? ((occupiedProperties / totalApplications) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Applications to tenants
            </p>
          </CardContent>
        </Card>
      </div>

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
