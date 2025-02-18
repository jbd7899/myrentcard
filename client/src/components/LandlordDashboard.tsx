import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon } from 'lucide-react';
import { Link } from 'wouter';

const LandlordDashboard = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Property Dashboard</h2>
        <div className="space-x-4">
          <Link href="/request-info">
            <Button
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Create Screening Page</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Screening Pages Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Active Screening Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Sample Property</h3>
                <Link href="/apply/lwcvjoa10">
                  <Button variant="ghost" size="sm">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </Link>
              </div>
              <div className="text-sm text-gray-600">
                <p>Views: 0</p>
                <p>Submissions: 0</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordDashboard;