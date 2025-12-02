import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { trackWhatsAppClick, trackButtonClick } from '../utils/tracking';

interface NavbarProps {
  onBookAppointment: () => void;
  currentPage?: string; // 'home' | 'team' | 'booking' | 'contact' | 'aura' | 'atm' | ...
  onNavigate?: (page: string) => void;
}

export function Navbar({ onBookAppointment, currentPage = 'home', onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track which section is currently in view
  useEffect(() => {
    if (currentPage !== 'home') {
      setActiveSection(currentPage);
      return;
    }

    const handleSectionScroll = () => {
      const scrollY = window.scrollY;
      
      // Check if we're at the very top (hero/home section)
      if (scrollY < 100) {
        setActiveSection('home');
        return;
      }
      
      const sections = ['services', 'about', 'team'];
      let activeSection = 'home'; // default
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = scrollY + rect.top;
          
          // If we've scrolled past the start of this section (with some offset)
          if (scrollY >= elementTop - 200) {
            activeSection = section;
          }
        }
      }
      
      setActiveSection(activeSection);
    };

    handleSectionScroll();
    window.addEventListener('scroll', handleSectionScroll);
    return () => window.removeEventListener('scroll', handleSectionScroll);
  }, [currentPage]);

  // helper: go to Assessment
  const goToAssessment = (path: string) => {
    history.pushState(null, '', path);
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
              className={`${baseLink} ${activeSection === 'home' ? 'text-[#096b17]' : ''}`}
            >
              Home
              <span className={underline(activeSection === 'home')} />
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

            <a 
              href="/#services" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage === 'aura' || currentPage === 'atm') {
                  // Navigate away from assessment pages to home
                  window.location.href = '/#services';
                } else if (onNavigate) {
                  onNavigate('home');
                  setTimeout(() => {
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`${baseLink} ${activeSection === 'services' ? 'text-[#096b17]' : ''}`}
            >
              Our Services
              <span className={underline(activeSection === 'services')} />
            </a>

            <a 
              href="/#about" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage === 'aura' || currentPage === 'atm') {
                  // Navigate away from assessment pages to home
                  window.location.href = '/#about';
                } else if (onNavigate) {
                  onNavigate('home');
                  setTimeout(() => {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`${baseLink} ${activeSection === 'about' ? 'text-[#096b17]' : ''}`}
            >
              About Us
              <span className={underline(activeSection === 'about')} />
            </a>

            {/* AURA Index - path route */}
            <a
              href="/aura-rise-index"
              onClick={(e) => {
                e.preventDefault();
                goToAssessment('/aura-rise-index');
              }}
              className={`${baseLink} ${currentPage === 'aura' ? 'text-[#096b17]' : ''}`}
            >
              AURA Index
              <span className={underline(currentPage === 'aura')} />
            </a>

            {/* ATM Tool - path route */}
            <a
              href="/anxiety-trigger-mapping"
              onClick={(e) => {
                e.preventDefault();
                goToAssessment('/anxiety-trigger-mapping');
              }}
              className={`${baseLink} ${currentPage === 'atm' ? 'text-[#096b17]' : ''}`}
            >
              ATM Tool  
              <span className={underline(currentPage === 'atm')} />
            </a>

            <a 
              href="/contact" 
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('contact');
                } else {
                  // Allow default navigation to /contact
                }
              }}
              className={`${baseLink} ${currentPage === 'contact' ? 'text-[#096b17]' : ''}`}
            >
              Contact Us
              <span className={underline(currentPage === 'contact')} />
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
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-2.462-.96-4.779-2.705-6.526-1.746-1.746-4.065-2.711-6.526-2.713-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.092-.634zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414l-.005.009z"/>
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
                      }
                      setMobileOpen(false);
                    }}
                    className="py-2 text-gray-800"
                  >
                    Mental Health Team
                  </a>

                  <a 
                    href="/#services" 
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      if (currentPage === 'aura' || currentPage === 'atm') {
                        // Navigate away from assessment pages to home
                        window.location.href = '/#services';
                      } else if (onNavigate) {
                        onNavigate('home');
                        setTimeout(() => {
                          document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      } else {
                        setTimeout(() => {
                          document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }} 
                    className="py-2 text-gray-800"
                  >
                    Our Services
                  </a>

                  <a 
                    href="/#about" 
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      if (currentPage === 'aura' || currentPage === 'atm') {
                        // Navigate away from assessment pages to home
                        window.location.href = '/#about';
                      } else if (onNavigate) {
                        onNavigate('home');
                        setTimeout(() => {
                          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      } else {
                        setTimeout(() => {
                          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }} 
                    className="py-2 text-gray-800"
                  >
                    About Us
                  </a>

                  <a
                    href="/aura-rise-index"
                    onClick={(e) => {
                      e.preventDefault();
                      goToAssessment('/aura-rise-index');
                    }}
                    className="py-2 text-gray-800"
                  >
                    AURA Index
                  </a>

                  <a
                    href="/anxiety-trigger-mapping"
                    onClick={(e) => {
                      e.preventDefault();
                      goToAssessment('/anxiety-trigger-mapping');
                    }}
                    className="py-2 text-gray-800"
                  >
                    ATM Tool  
                  </a>

                  <a 
                    href="/contact" 
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate('contact');
                      }
                      setMobileOpen(false);
                    }} 
                    className="py-2 text-gray-800"
                  >
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
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-2.462-.96-4.779-2.705-6.526-1.746-1.746-4.065-2.711-6.526-2.713-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.092-.634zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414l-.005.009z"/>
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
