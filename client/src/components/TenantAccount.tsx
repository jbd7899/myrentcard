import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Mail, Phone, Edit2, Share2, Eye, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Application } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

const TenantAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();

  // Fetch applications
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    retry: 3,
  });

  // User's shared applications
  const sharedApplications = applications?.map(app => ({
    recipient: "Property Manager",
    propertyId: app.propertyId,
    dateShared: new Date(app.createdAt).toLocaleDateString(),
    status: app.status,
    message: app.message
  })) || [];

  const sampleMessage = `Hi, I'm ${user?.name} and I'm interested in your property. I've shared my RentCard with you which includes my complete rental application and history. You can view it at the link below.`;

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

      {/* Sharing History Section */}
      {activeTab === 'sharing' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your RentCard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Sample Message</h3>
                <p className="text-gray-600 mb-4">{sampleMessage}</p>
                <div className="flex space-x-4">
                  <Button className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Share via Email</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Share via SMS</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Property ID</th>
                      <th className="px-4 py-2 text-left">Date Submitted</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedApplications.map((app, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-3">Property #{app.propertyId}</td>
                        <td className="px-4 py-3">{app.dateShared}</td>
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
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4" />
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
        <Card>
          <CardHeader>
            <CardTitle>Rental References</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Request New Reference</span>
              </Button>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600">No references collected yet. Share the reference request form with your previous landlords to start building your rental history.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantAccount;