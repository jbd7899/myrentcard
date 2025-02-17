import { Building2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="container">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-[#4361ee]" />
              <span className="ml-2 text-xl font-bold">
                <span className="text-[#4361ee]">My</span>
                <span className="text-[#3a0ca3]">RentCard</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                <Link href="#how-it-works">
                  <span className="text-gray-600 hover:text-gray-900 cursor-pointer">How It Works</span>
                </Link>
                <Link href="#benefits">
                  <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Benefits</span>
                </Link>
                <Link href="#testimonials">
                  <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Testimonials</span>
                </Link>
                <Link href="#faq">
                  <span className="text-gray-600 hover:text-gray-900 cursor-pointer">FAQ</span>
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <Link href={user.type === 'landlord' ? '/landlord' : '/tenant'}>
                      <Button variant="ghost">Dashboard</Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/auth">
                    <Button className="bg-[#4361ee] hover:bg-[#3a0ca3] text-white">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <button className="menu-toggle">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}