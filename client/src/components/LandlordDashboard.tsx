import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Property, PropertyRequirements } from '@shared/schema';

interface NewPropertyFormData {
  title: string;
  description: string;
  rent: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  requirements: PropertyRequirements;
}

const LandlordDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newProperty, setNewProperty] = useState<NewPropertyFormData>({
    title: '',
    description: '',
    rent: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    requirements: {
      minCreditScore: 650,
      minIncome: 3000,
      noEvictions: true,
      cleanRentalHistory: true
    }
  });

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const createPropertyMutation = useMutation({
    mutationFn: (propertyData: Omit<Property, 'id' | 'createdAt'>) => 
      apiRequest('/api/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: "Property added successfully",
      });
      setShowAddProperty(false);
      setNewProperty({
        title: '',
        description: '',
        rent: '',
        address: '',
        bedrooms: '',
        bathrooms: '',
        requirements: {
          minCreditScore: 650,
          minIncome: 3000,
          noEvictions: true,
          cleanRentalHistory: true
        }
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const propertyData = {
      title: newProperty.title,
      description: newProperty.description,
      rent: parseInt(newProperty.rent),
      address: newProperty.address,
      bedrooms: parseInt(newProperty.bedrooms),
      bathrooms: parseInt(newProperty.bathrooms),
      requirements: newProperty.requirements,
      status: 'Available' as const,
      available: true,
      landlordId: 1, // TODO: Get from auth context
    };

    createPropertyMutation.mutate(propertyData);
  };

  if (isLoading) {
    return <div className="p-8">Loading properties...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Properties</h2>
        <Button 
          onClick={() => setShowAddProperty(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Button>
      </div>

      {showAddProperty && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Add New Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newProperty.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={newProperty.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Rent</label>
                  <input
                    type="number"
                    name="rent"
                    value={newProperty.rent}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={newProperty.address}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={newProperty.bedrooms}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={newProperty.bathrooms}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddProperty(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createPropertyMutation.isPending}
                >
                  {createPropertyMutation.isPending ? "Adding..." : "Add Property"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties?.map((property) => (
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
                  <span className="text-gray-500">Rent</span>
                  <span>${property.rent}/month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Size</span>
                  <span>{property.bedrooms}bd {property.bathrooms}ba</span>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Building2 className="w-4 h-4 mr-2" />
                    Details
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

export default LandlordDashboard;