import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users, Upload } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Property, PropertyRequirements, Application } from '@shared/schema';
import PropertyAnalytics from './PropertyAnalytics';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NewPropertyFormData {
  title: string;
  description: string;
  imageUrl: string;
  address: string;
  units: string;
  parkingSpaces: string;
  requirements: PropertyRequirements;
}

const LandlordDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [newProperty, setNewProperty] = useState<NewPropertyFormData>({
    title: '',
    description: '',
    imageUrl: '',
    address: '',
    units: '',
    parkingSpaces: '',
    requirements: {
      noEvictions: true,
      cleanRentalHistory: true
    }
  });

  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const { data: applications, isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: Omit<Property, 'id' | 'createdAt' | 'pageViews' | 'uniqueVisitors' | 'submissionCount'>) => {
      // First upload the image if selected
      let imageUrl = null;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            throw new Error('Failed to upload image');
          }
          const data = await response.json();
          imageUrl = data.url;
        } catch (error) {
          console.error('Image upload error:', error);
          throw new Error('Failed to upload image');
        }
      }

      // Then create the property with the image URL
      const response = await apiRequest('POST', '/api/properties', { 
        ...propertyData, 
        imageUrl 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: "Property added successfully",
      });
      setShowAddProperty(false);
      setSelectedImage(null);
      setNewProperty({
        title: '',
        description: '',
        imageUrl: '',
        address: '',
        units: '',
        parkingSpaces: '',
        requirements: {
          noEvictions: true,
          cleanRentalHistory: true
        }
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to add property: " + error.message,
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const propertyData = {
      title: newProperty.title,
      description: newProperty.description,
      imageUrl: null, // Will be set after upload
      address: newProperty.address,
      units: parseInt(newProperty.units),
      parkingSpaces: parseInt(newProperty.parkingSpaces),
      requirements: newProperty.requirements,
      status: 'Available' as const,
      available: true,
      landlordId: 1, // This should come from the authenticated user
    };

    try {
      await createPropertyMutation.mutateAsync(propertyData);
    } catch (error) {
      console.error('Failed to create property:', error);
    }
  };

  if (isLoadingProperties || isLoadingApplications) {
    return <div className="p-8">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Property Dashboard</h2>
        <Button
          onClick={() => setShowAddProperty(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Button>
      </div>

      {/* Analytics Section */}
      {properties && applications && (
        <PropertyAnalytics
          properties={properties}
          applications={applications}
        />
      )}

      {/* Add Property Form */}
      {showAddProperty && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Add New Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={newProperty.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Property Image</Label>
                <div className="mt-1 flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  {selectedImage && (
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={newProperty.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="units">Number of Units</Label>
                  <Input
                    id="units"
                    type="number"
                    name="units"
                    value={newProperty.units}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                  <Input
                    id="parkingSpaces"
                    type="number"
                    name="parkingSpaces"
                    value={newProperty.parkingSpaces}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={newProperty.address}
                  onChange={handleInputChange}
                  required
                />
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createPropertyMutation.isPending}
                >
                  {createPropertyMutation.isPending ? "Adding..." : "Add Property"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Property List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties?.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle className="text-lg">{property.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {property.imageUrl && (
                <div className="mb-4">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={property.status === "Available" ? "text-green-600" : "text-blue-600"}>
                    {property.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Units</span>
                  <span>{property.units} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Parking</span>
                  <span>{property.parkingSpaces} spaces</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Views</span>
                  <span>{property.pageViews || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Applications</span>
                  <span>{property.submissionCount || 0}</span>
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