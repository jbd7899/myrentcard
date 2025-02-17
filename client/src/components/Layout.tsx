import { Building2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                <Link href="#how-it-works">
                  <a className="text-gray-600 hover:text-gray-900">How It Works</a>
                </Link>
                <Link href="#benefits">
                  <a className="text-gray-600 hover:text-gray-900">Benefits</a>
                </Link>
                <Link href="#testimonials">
                  <a className="text-gray-600 hover:text-gray-900">Testimonials</a>
                </Link>
                <Link href="#faq">
                  <a className="text-gray-600 hover:text-gray-900">FAQ</a>
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
                  <Link href="/auth" className="cta-button">
                    Login / Register
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
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