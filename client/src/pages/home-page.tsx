import { Building2, Shield, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Find Your Perfect Rental Match
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline your rental journey with RentCard. Whether you're a tenant looking for your next home or a landlord seeking quality tenants, we've got you covered.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth">
                <Button size="lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Why Choose RentCard
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to rent with confidence
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Shield className="w-8 h-8 text-blue-600" />
                  <CardTitle>Verified Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  Trust and transparency with verified rental histories and tenant profiles.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <CardTitle>Streamlined Process</CardTitle>
                </CardHeader>
                <CardContent>
                  Easy application submission and management for both tenants and landlords.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Users className="w-8 h-8 text-blue-600" />
                  <CardTitle>Quality Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  Smart matching system connects the right tenants with the right properties.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
