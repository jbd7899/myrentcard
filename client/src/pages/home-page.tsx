import { Building2, Shield, Calendar, Users } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>One Rental Form. Multiple Landlords. Easy Pre-Screening.</h1>
            <p>Fill out your rental profile once and send it to landlords instantly via email or text - completely free. Save time and get ahead in the rental process. No account needed to start.</p>
            <div className="hero-buttons">
              <Link href="/auth" className="cta-button">Get Started – Create Your RentCard</Link>
              <Link href="/auth" className="cta-button-secondary">Request Tenant Info Now</Link>
              <div className="hero-link-wrapper" style={{width: '100%', textAlign: 'center', marginTop: '1rem'}}>
                <Link href="/sample" className="sample-link" style={{color: '#4361ee', textDecoration: 'underline', fontSize: '0.875rem'}}>
                  View Sample Pre-Screening Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works py-16 bg-white">
        <div className="container">
          <div className="section-title">
            <h2>How It Works</h2>
            <p>A simple 3-step process that saves time for everyone</p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Fill Out One Simple Form</h3>
              <p>Enter your rental details, history, and preferences once. No more repetitive applications for each property.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Share Instantly with Landlords</h3>
              <p>Send your profile to multiple landlords via email or text with just one click. Control exactly what information is shared.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Get Pre-Qualified & Move Faster</h3>
              <p>Stand out from other applicants with your complete profile. Get responses quicker and secure your dream rental faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="section-title">
            <h2>Benefits for Everyone</h2>
            <p>How MyRentCard helps both tenants and landlords</p>
          </div>
          <div className="benefits-container">
            <div className="benefit-column">
              <div className="column-title">
                <h3 className="text-2xl font-bold mb-6">For Tenants</h3>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">No More Repetitive Applications</h4>
                  <p>Fill out your information just once and use it for multiple properties, saving hours of tedious form-filling.</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Respond Instantly to Opportunities</h4>
                  <p>When you find a great apartment, send your profile immediately—before other applicants even start their paperwork.</p>
                </div>
              </div>
            </div>
            <div className="benefit-column">
              <div className="column-title">
                <h3 className="text-2xl font-bold mb-6">For Landlords</h3>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Pre-Screen Effortlessly</h4>
                  <p>Request comprehensive tenant information with one click and receive organized profiles instantly.</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Save Time & Resources</h4>
                  <p>Eliminate hours spent on phone calls, emails, and sorting through incomplete applications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}