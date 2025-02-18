import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { formatDistance } from 'date-fns';
import { CheckCircle2, XCircle, Filter, Search } from 'lucide-react';

interface Application {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  propertyId: number;
  tenantId: number;
  message?: string | null;
}

interface Property {
  id: number;
  title: string;
  rent: number;
}

interface BulkApplicationManagerProps {
  applications: Application[];
  properties: Property[];
  onUpdateApplications: (applicationIds: number[], status: 'approved' | 'rejected') => Promise<void>;
}

export default function BulkApplicationManager({ 
  applications, 
  properties,
  onUpdateApplications 
}: BulkApplicationManagerProps) {
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(applications.map(app => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (applicationId: number, checked: boolean) => {
    if (checked) {
      setSelectedApplications([...selectedApplications, applicationId]);
    } else {
      setSelectedApplications(selectedApplications.filter(id => id !== applicationId));
    }
  };

  const handleBulkAction = async (status: 'approved' | 'rejected') => {
    try {
      await onUpdateApplications(selectedApplications, status);
      toast({
        title: "Success",
        description: `Successfully ${status} ${selectedApplications.length} applications`,
      });
      setSelectedApplications([]);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} applications`,
        variant: "destructive",
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesProperty = filterProperty === 'all' || app.propertyId.toString() === filterProperty;
    const matchesSearch = searchTerm === '' || 
      properties.find(p => p.id === app.propertyId)?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesProperty && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Application Management</CardTitle>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('approved')}
              disabled={selectedApplications.length === 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('rejected')}
              disabled={selectedApplications.length === 0}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Selected
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <Select onValueChange={setFilterStatus} defaultValue={filterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <Select onValueChange={setFilterProperty} defaultValue={filterProperty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Applications Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedApplications.length === applications.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => {
                const property = properties.find(p => p.id === application.propertyId);
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedApplications.includes(application.id)}
                        onCheckedChange={(checked) => 
                          handleSelectApplication(application.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>{property?.title}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDistance(new Date(application.createdAt), new Date(), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {application.message || 'No message'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBulkAction(
                          application.status === 'approved' ? 'rejected' : 'approved'
                        )}
                      >
                        {application.status === 'approved' ? 
                          <XCircle className="w-4 h-4" /> : 
                          <CheckCircle2 className="w-4 h-4" />
                        }
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}