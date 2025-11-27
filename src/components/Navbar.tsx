import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { trackWhatsAppClick, trackButtonClick } from '../utils/tracking';

interface NavbarProps {
  onBookAppointment: () => void;
  currentPage?: string; // 'home' | 'team' | 'booking' | 'contact' | 'aura' | ...
  onNavigate?: (page: string) => void;
}

export function Navbar({ onBookAppointment, currentPage = 'home', onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // helper: go to AURA Index
  const goAura = () => {
    history.pushState(null, '', '/aura-rise-index');          
    window.dispatchEvent(new PopStateEvent('popstate'));
    setMobileOpen(false);
  };

  const baseLink =
    'text-gray-700 hover:text-[#096b17] transition-all duration-300 relative group cursor-pointer';

  const underline = (active: boolean) =>
    `absolute -bottom-1 left-0 h-0.5 bg-[#096b17] transition-all duration-300 ${
      active ? 'w-full' : 'w-0 group-hover:w-full'
    }`;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      }`}
      style={{ backgroundColor: '#FFFDBD' }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a
              href="#home"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('home');
                }
                setMobileOpen(false);
              }}
              className="flex items-center cursor-pointer"
              aria-label="Go to home"
            >
              <img src="/Logo.svg" alt="CuraGo Logo" className="h-10 w-auto" />
            </a>
          </motion.div>

          {/* Desktop Nav */}
          <motion.nav
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a
              href="#home"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('home');
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`${baseLink} ${currentPage === 'home' ? 'text-[#096b17]' : ''}`}
            >
              Home
              <span className={underline(currentPage === 'home')} />
            </a>

            <a
              href="#team"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('team');
                } else {
                  document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`${baseLink} ${currentPage === 'team' ? 'text-[#096b17]' : ''}`}
            >
              Mental Health Team
              <span className={underline(currentPage === 'team')} />
            </a>

            <a href="#services" className={baseLink}>
              Our Services
              <span className={underline(false)} />
            </a>

            <a href="#about" className={baseLink}>
              About Us
              <span className={underline(false)} />
            </a>

            {/* AURA Index - path route */}
            <a
              href="/aura-index"                              // ← text + href updated
              onClick={(e) => {
                e.preventDefault();
                goAura();
              }}
              className={`${baseLink} ${currentPage === 'aura' ? 'text-[#096b17]' : ''}`}
            >
              AURA Index
              <span className={underline(currentPage === 'aura')} />
            </a>

            <a href="/contact" className={baseLink}>
              Contact Us
              <span className={underline(false)} />
            </a>
          </motion.nav>

          {/* Right: WhatsApp + Book Now + Mobile Toggle */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* hide on mobile to reduce clutter */}
            <a
              href="https://wa.me/917021227203"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('header')}
              className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-[#096b17] transition-all duration-300 hover:scale-105"
              aria-label="WhatsApp us"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              <span className="hidden lg:inline">+917021227203</span>
            </a>

            {/* Book Now — hidden on mobile, compact on desktop */}
            <Button
              onClick={() => {
                trackButtonClick('Book Now', 'navbar', 'header');
                onBookAppointment();
              }}
              className="hidden sm:inline-flex bg-[#096b17] hover:bg-[#075110] text-white h-9 px-3 text-sm md:h-10 md:px-4 md:text-base rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Book Now
            </Button>

            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden ml-1 inline-flex items-center justify-center w-10 h-10 rounded-md border border-black/10 hover:bg-black/5"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
              >
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobileMenu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-black/10" style={{ backgroundColor: '#FFFDBD' }}>
                <div className="flex flex-col space-y-3">
                  <a
                    href="#home"
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate('home');
                      }
                      setMobileOpen(false);
                    }}
                    className="py-2 text-gray-800"
                  >
                    Home
                  </a>

                  <a
                    href="#team"
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate('team');
                      } else {
                        document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
                      }
                      setMobileOpen(false);
                    }}
                    className="py-2 text-gray-800"
                  >
                    Mental Health Team
                  </a>

                  <a href="#services" onClick={() => setMobileOpen(false)} className="py-2 text-gray-800">
                    Our Services
                  </a>

                  <a href="#about" onClick={() => setMobileOpen(false)} className="py-2 text-gray-800">
                    About Us
                  </a>

                  <a
                    href="/aura-index"                      // ← text + href updated
                    onClick={(e) => {
                      e.preventDefault();
                      goAura();
                    }}
                    className="py-2 text-gray-800"
                  >
                    AURA Index
                  </a>

                  <a href="/contact" onClick={() => setMobileOpen(false)} className="py-2 text-gray-800">
                    Contact Us
                  </a>

                  <a
                    href="https://wa.me/917021227203"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackWhatsAppClick('header_mobile');
                      setMobileOpen(false);
                    }}
                    className="py-2 text-gray-800 inline-flex items-center gap-2"
                  >
                    WhatsApp
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
