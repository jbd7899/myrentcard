import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Mail, Phone, Edit2, Share2, Eye, ExternalLink, Plus, Link as LinkIcon } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { Application, RentCard, RentalReference } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

const TenantAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const { toast } = useToast();
  const [newRentCardName, setNewRentCardName] = useState('');
  const [showNewRentCardForm, setShowNewRentCardForm] = useState(false);

  // Update query to include references
  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    retry: 3,
  });

  // Update RentCards query
  const { data: rentCards, isLoading: rentCardsLoading } = useQuery<RentCard[]>({
    queryKey: ['/api/rentcards'],
    retry: 3,
  });

  // Get references
  const { data: references, isLoading: referencesLoading } = useQuery<RentalReference[]>({
    queryKey: ['/api/references'],
    retry: 3,
  });

  // Create new rent card mutation
  const createRentCardMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/rentcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to create rent card');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rentcards'] });
      toast({
        title: "Success",
        description: "New RentCard created successfully",
      });
      setShowNewRentCardForm(false);
      setNewRentCardName('');
    },
  });

  // Request reference mutation
  const requestReferenceMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/references/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to send reference request');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reference Request Sent",
        description: "Your reference request has been sent successfully",
      });
    },
  });

  const handleCreateRentCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRentCardName.trim()) {
      createRentCardMutation.mutate(newRentCardName);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          className={'pb-2 px-4 ' + (activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600')}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={'pb-2 px-4 ' + (activeTab === 'sharing' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600')}
          onClick={() => setActiveTab('sharing')}
        >
          Sharing History
        </button>
        <button
          className={'pb-2 px-4 ' + (activeTab === 'references' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600')}
          onClick={() => setActiveTab('references')}
        >
          References
        </button>
        <button
          className={'pb-2 px-4 ' + (activeTab === 'rentcards' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600')}
          onClick={() => setActiveTab('rentcards')}
        >
          RentCards
        </button>
      </div>

      {/* Profile Section */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <Input value={user?.name || ''} className="mt-1" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <Input value={user?.email || ''} className="mt-1" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <Input value={user?.phone || ''} className="mt-1" disabled />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>Account created: {new Date(user?.createdAt || '').toLocaleDateString()}</span>
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4" />
                <span>Review & Edit</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RentCards Section */}
      {activeTab === 'rentcards' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your RentCards</CardTitle>
                <Button 
                  onClick={() => setShowNewRentCardForm(!showNewRentCardForm)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New RentCard</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNewRentCardForm && (
                <form onSubmit={handleCreateRentCard} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-4">
                    <Input
                      value={newRentCardName}
                      onChange={(e) => setNewRentCardName(e.target.value)}
                      placeholder="Enter RentCard name (e.g., '123 Main St Application')"
                      className="flex-1"
                    />
                    <Button type="submit" disabled={createRentCardMutation.isPending}>
                      Create
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {rentCards && rentCards.length > 0 ? (
                  rentCards.map((card, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                      <div>
                        <h3 className="font-medium">{card.name}</h3>
                        <p className="text-sm text-gray-600">Created: {new Date(card.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>Views: {card.views}</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                          <LinkIcon className="w-4 h-4" />
                          <span>Share</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-600">No RentCards created yet. Create your first RentCard to start sharing with landlords.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sharing History Section */}
      {activeTab === 'sharing' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Property</th>
                      <th className="px-4 py-2 text-left">Date Submitted</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Views</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications?.map((app, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-3">
                          <div className="font-medium">{app.propertyName || `Property #${app.propertyId}`}</div>
                          <div className="text-sm text-gray-600">{app.propertyLocation}</div>
                        </td>
                        <td className="px-4 py-3">{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            app.status === 'approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            {app.views}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* References Section */}
      {activeTab === 'references' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Rental References</CardTitle>
                <Button 
                  onClick={() => {
                    const email = prompt('Enter previous landlord\'s email:');
                    if (email) requestReferenceMutation.mutate(email);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Request New Reference</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {references && references.length > 0 ? (
                  references.map((ref, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{ref.landlordName}</h4>
                          <p className="text-sm text-gray-600">{ref.propertyAddress}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          ref.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ref.status}
                        </span>
                      </div>
                      <p className="text-sm mt-2">{ref.comment}</p>
                      <div className="mt-2 text-sm text-gray-600">
                        Received: {new Date(ref.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-600">No references collected yet. Request references from your previous landlords to build your rental history.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TenantAccount;