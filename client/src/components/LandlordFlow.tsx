import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users } from 'lucide-react';

const LandlordFlow = () => {
  const [properties] = useState([
    {
      id: 1,
      title: "Parkview Apartments #204",
      status: "Available",
      applications: 3,
      lastUpdated: "2025-02-15"
    },
    {
      id: 2,
      title: "Downtown Loft",
      status: "Rented",
      applications: 0,
      lastUpdated: "2025-02-10"
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Properties</h2>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle className="text-lg">{property.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={property.status === "Available" ? "text-green-600" : "text-blue-600"}>
                    {property.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Applications</span>
                  <span>{property.applications}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated</span>
                  <span>{property.lastUpdated}</span>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Building2 className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Applications
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LandlordFlow;
