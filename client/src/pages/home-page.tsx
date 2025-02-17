import { Building2, Shield, Calendar, Users, Key } from "lucide-react";
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

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-title">
            <h2>Trusted by Renters & Landlords Nationwide</h2>
            <p>Join thousands of satisfied users who have simplified their rental process</p>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-text">
                "MyRentCard made finding an apartment so much easier! I saved hours of time not having to fill out the same information over and over. Got approved for my dream apartment in just 2 days!"
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Alex R.</h4>
                  <p>Renter in Seattle</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                "As a property manager, MyRentCard has streamlined our entire screening process. We get complete, verified tenant information instantly, saving countless hours on paperwork."
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Sarah M.</h4>
                  <p>Property Manager</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                "The verified rental history feature is a game-changer. I was able to demonstrate my perfect payment record to my new landlord, making approval a breeze."
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>James L.</h4>
                  <p>Recent Mover</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Simplify Renting?</h2>
            <p>Join thousands of happy renters and landlords who have made the smart switch to MyRentCard. Get started for free - no credit card required.</p>
            <div className="cta-buttons">
              <Link href="/auth" className="cta-button-light">Create Your Free RentCard</Link>
              <Link href="/auth" className="cta-button-outline">Request Tenant Info</Link>
            </div>
            <div className="trust-badge">
              <Shield className="w-5 h-5" />
              <span>Your information is safe & secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <Link href="/" className="footer-logo">MyRentCard</Link>
              <p>Making the rental process easier for tenants and landlords. Apply once, rent anywhere.</p>
            </div>
            <div className="footer-links">
              <h4>Product</h4>
              <ul>
                <li><Link href="#">For Tenants</Link></li>
                <li><Link href="#">For Landlords</Link></li>
                <li><Link href="#">Pricing</Link></li>
                <li><Link href="#">Features</Link></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <ul>
                <li><Link href="#">Privacy Policy</Link></li>
                <li><Link href="#">Terms of Service</Link></li>
                <li><Link href="#">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 MyRentCard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}