import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfUse } from './TermsOfUse';

import { trackWhatsAppClick, trackPhoneClick } from '../utils/tracking';

export function Footer() {
  return (
    <footer className="py-12 relative overflow-hidden" style={{ backgroundColor: '#FFFDBD' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo Section */}
          <div>
            <div className="mb-4">
              <img src='/Logo.svg' alt="CuraGo Logo" className="h-12 w-auto" loading='lazy' />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#096b17' }}>
              India's beloved online mental health platform where science meets life with empathy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4" style={{ color: '#096b17' }}>Quick Links</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#096b17', opacity: 0.8 }}>
              <li><a href="#home" className="hover:opacity-100 transition-opacity">Home</a></li>
              <li><a href="#team" className="hover:opacity-100 transition-opacity">Mental Health Team</a></li>
              <li><a href="#services" className="hover:opacity-100 transition-opacity">Our Services</a></li>
              <li><a href="#about" className="hover:opacity-100 transition-opacity">About Us</a></li>
              <li><a href="#contact" className="hover:opacity-100 transition-opacity">Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4" style={{ color: '#096b17' }}>Services</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#096b17', opacity: 0.8 }}>
              <li>Psychiatric Consultations</li>
              <li>Psychologist Therapy Sessions</li>
              <li>WhatsApp Support</li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="mb-4" style={{ color: '#096b17' }}>Contact Us</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#096b17', opacity: 0.8 }}>
              <li>
                <a href="tel:+918062179639" onClick={() => trackPhoneClick('footer')} className="hover:opacity-100 transition-opacity">
                  +918062179639
                </a>
              </li>
              <li>
                <a href="https://wa.me/917021227203" target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick('footer')} className="hover:opacity-100 transition-opacity">
                  WhatsApp: +917021227203
                </a>
              </li>
              <li>
                <a href="mailto:help@curago.in" className="hover:opacity-100 transition-opacity">
                  help@curago.in
                </a>
              </li>
              <li>09:00 AM - 09:00 PM</li>
              <li>Pan India Service</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-8" style={{ borderColor: '#096b17' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-center md:text-left" style={{ color: '#096b17', opacity: 0.8 }}>
              &copy; 2025 Curago Health Networking Pvt. Ltd.
            </p>
            <div className="flex gap-6 text-xs" style={{ color: '#096b17', opacity: 0.8 }}>
              <PrivacyPolicy />
              <TermsOfUse />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
