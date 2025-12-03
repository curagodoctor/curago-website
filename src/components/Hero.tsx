import { Smartphone, Award, MessageSquare } from 'lucide-react';
import { BookingForm } from './BookingForm';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { trackButtonClick } from '../utils/tracking';
import { WhatsAppConfirmDialog } from './WhatsAppConfirmDialog';
import { useState } from 'react';

interface HeroProps {
  onBookAppointment?: () => void;
}

export function Hero({ onBookAppointment }: HeroProps) {
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookNow = () => {
    trackButtonClick('Book Consultation Now', 'cta', 'hero');
    if (onBookAppointment) onBookAppointment();
    else scrollToContact();
  };

  const goAuraIndex = () => {
    trackButtonClick('AURA Index', 'cta', 'hero');
    history.pushState(null, '', '/aura-rise-index');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const goAtmTool = () => {
    trackButtonClick('ATM Tool', 'cta', 'hero');
    history.pushState(null, '', '/atm');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleWhatsAppClick = () => {
    setShowWhatsAppDialog(true);
  };

  return (
    <section
      id="home"
      className="relative pt-20 pb-16 md:pt-24 md:pb-20 bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Glowing orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl opacity-10"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#64CB81] rounded-full blur-3xl opacity-10"
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 30, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Floating Brain Icon */}
        <motion.div
          className="absolute top-32 right-1/4 text-white/5"
          animate={{ y: [0, -30, 0], rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
            <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
            <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
            <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
            <path d="M6 18a4 4 0 0 1-1.967-.516" />
            <path d="M19.967 17.484A4 4 0 0 1 18 18" />
          </svg>
        </motion.div>

        {/* Floating Heart with Pulse */}
        <motion.div
          className="absolute bottom-40 left-1/4 text-white/5"
          animate={{ scale: [1, 1.2, 1], y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </motion.div>

        {/* Floating Plus Medical Symbol */}
        <motion.div
          className="absolute top-1/3 left-16 text-white/5"
          animate={{ rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.div>

        {/* Meditation/Yoga Symbol */}
        <motion.div
          className="absolute bottom-1/4 right-20 text-white/5"
          animate={{ y: [0, -20, 0], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="12" cy="6" r="2" />
            <path d="M12 8v5" />
            <path d="M8 13l4-1 4 1" />
            <path d="M8 13v6" />
            <path d="M16 13v6" />
          </svg>
        </motion.div>

        {/* DNA Helix pattern */}
        <motion.div
          className="absolute top-1/2 right-12 text-white/5"
          animate={{ rotate: [0, 360], y: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M2 15c6.667-6 13.333 0 20-6" />
            <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
            <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
            <path d="M2 9c6.667 6 13.333 0 20 6" />
            <circle cx="7.5" cy="9" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="16.5" cy="15" r="1" />
          </svg>
        </motion.div>

        {/* Abstract Wave Pattern */}
        <motion.div
          className="absolute bottom-12 left-1/3 text-white/5"
          animate={{ x: [0, 30, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          <svg width="130" height="130" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M 20 100 Q 50 70, 80 100 T 140 100 T 200 100" />
            <path d="M 20 120 Q 50 90, 80 120 T 140 120 T 200 120" />
            <path d="M 20 140 Q 50 110, 80 140 T 140 140 T 200 140" />
          </svg>
        </motion.div>

        {/* Shield */}
        <motion.div
          className="absolute top-2/3 left-12 text-white/5"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          <svg width="85" height="85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left column */}
          <div className="text-white pt-8">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              CuraGo | Science Meets Mind
            </motion.h1>

            <motion.div
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <p className="text-xl md:text-2xl leading-relaxed">
                CuraGo is India's beloved Mental Health Platform
              </p>
              <p className="text-lg md:text-xl text-green-50 leading-relaxed">
                Book Online Psychiatric Consultations and Psychologist Therapy Sessions
              </p>
              <div className="space-y-2 text-base md:text-lg text-green-50">
                <p className="flex items-start gap-2">
                  <span className="text-[#64CB81] mt-1">✓</span>
                  <span>Top mental health experts from top institutes of the country</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#64CB81] mt-1">✓</span>
                  <span>100% Confidential, Safe and Secure</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <p className="text-2xl md:text-3xl mb-2">Consultation starts at ₹1200/-</p>
              <p className="text-sm md:text-base text-green-100 leading-relaxed">
                ₹1200 = 1 Video Consultation of minimum 45 mins duration               </p>

            </motion.div>

            {/* Feature icons */}
            <motion.div
              className="grid grid-cols-3 gap-3 sm:gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <motion.div className="flex flex-col items-center text-center group" whileHover={{ scale: 1.05 }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 sm:mb-3 border border-white/20 group-hover:bg-white/30 transition-all">
                  <Smartphone className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <p className="text-xs sm:text-sm">100% Online</p>
                <p className="text-xs sm:text-base">Easy Booking</p>
              </motion.div>

              <motion.div className="flex flex-col items-center text-center group" whileHover={{ scale: 1.05 }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 sm:mb-3 border border-white/20 group-hover:bg-white/30 transition-all">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <p className="text-xs sm:text-sm">Qualified & Trained</p>
                <p className="text-xs sm:text-base">Mental Health Experts</p>
              </motion.div>

              <motion.div className="flex flex-col items-center text-center group" whileHover={{ scale: 1.05 }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 sm:mb-3 border border-white/20 group-hover:bg-white/30 transition-all">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <p className="text-xs sm:text-sm">Support On</p>
                <p className="text-xs sm:text-base">WhatsApp</p>
              </motion.div>
            </motion.div>

            {/* Buttons: 2×2 grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {/* Row 1 */}
                <Button
                  onClick={handleBookNow}
                  size="lg"
                  className="w-full bg-white text-[#096b17] hover:bg-gray-100 h-14 text-lg transition-all duration-300 hover:scale-105"
                >
                  Book Consultation Now
                </Button>

                <Button
                  onClick={goAuraIndex}
                  size="lg"
                  className="w-full bg-white text-[#096b17] hover:bg-gray-100 h-14 text-lg transition-all duration-300 hover:scale-105"
                >
                  AURA Index
                </Button>

                {/* Row 2 */}
                <Button 
                  onClick={handleWhatsAppClick}
                  size="lg"
                  className="w-full bg-white text-[#096b17] hover:bg-gray-100 h-14 text-lg transition-all duration-300 hover:scale-105"
                >
                  {/* <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-2.462-.96-4.779-2.705-6.526-1.746-1.746-4.065-2.711-6.526-2.713-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.092-.634zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414l-.005.009z"/>
                  </svg> */}
                  Say 'hi' on WhatsApp
                </Button>

                <Button
                  onClick={goAtmTool}
                  size="lg"
                  className="w-full bg-white text-[#096b17] hover:bg-gray-100 h-14 text-lg transition-all duration-300 hover:scale-105"
                >
                  ATM Tool
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right column: Booking form (restored) */}
          <motion.div
            id="booking-section"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 100 }}
            className="w-full"
          >
            <BookingForm />
          </motion.div>
        </div>
      </div>

      {/* WhatsApp Confirmation Dialog */}
      <WhatsAppConfirmDialog
        isOpen={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        source="hero"
        message="Hi! I want to get in touch regarding CuraGo mental health services."
      />
    </section>
  );
}
