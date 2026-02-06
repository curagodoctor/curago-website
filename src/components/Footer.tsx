import React, { useState } from 'react';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfUse } from './TermsOfUse';
import { trackPhoneClick } from '../utils/tracking';
import { WhatsAppConfirmDialog } from './WhatsAppConfirmDialog';

export function Footer() {
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  const handleWhatsAppClick = () => {
    setShowWhatsAppDialog(true);
  };

  return (
    <footer className="py-12 relative overflow-hidden" style={{ backgroundColor: '#FFFDBD' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo Section */}
          <div>
            <div className="mb-4">
              <img src='/Logo.svg?v=6' alt="CuraGo Logo" className="h-12 w-auto" width="192" height="48" loading='lazy' />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#096b17' }}>
              CuraGo: The Specialized Patient Discovery & Practice Growth Ecosystem. Connecting healthcare excellence with patients across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4" style={{ color: '#096b17' }}>Quick Links</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#096b17', opacity: 0.8 }}>
              <li>
                <a
                  href="https://dryuvaraj.curago.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 transition-opacity"
                >
                  Dr Yuvaraj's Gastro Digital Clinic
                </a>
              </li>
              <li>
                <a href="/atm" className="hover:opacity-100 transition-opacity">
                  Anxiety Care
                </a>
              </li>
              <li>
                <a href="/science-meets-mind" className="hover:opacity-100 transition-opacity">
                  Mental Health Services
                </a>
              </li>
              <li>
                <a href="/" className="hover:opacity-100 transition-opacity">
                  Join Us
                </a>
              </li>
            </ul>
          </div>

          {/* Our Established Services */}
          <div>
            <h4 className="mb-4" style={{ color: '#096b17' }}>Our Established Services</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#096b17', opacity: 0.8 }}>
              <li>
                <a
                  href="https://dryuvaraj.curago.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 transition-opacity"
                >
                  Gastroenterology Consultations
                </a>
              </li>
              <li>
                <a href="/science-meets-mind" className="hover:opacity-100 transition-opacity">
                  Mental Health Platform
                </a>
              </li>
              <li>
                <a href="/atm" className="hover:opacity-100 transition-opacity">
                  Anxiety Assessment & Care
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="mb-4" style={{ color: '#096b17' }}>Contact Us</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#096b17', opacity: 0.8 }}>
              <li>
                <a href="tel:+917021227203" onClick={() => trackPhoneClick('footer')} className="hover:opacity-100 transition-opacity">
                  +917021227203
                </a>
              </li>
              <li>
                <button onClick={handleWhatsAppClick} className="hover:opacity-100 transition-opacity text-left">
                  WhatsApp: +917021227203
                </button>
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

      {/* WhatsApp Confirmation Dialog */}
      <WhatsAppConfirmDialog
        isOpen={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        source="footer"
        message="Hi! I want to get in touch regarding CuraGo mental health services."
      />
    </footer>
  );
}
