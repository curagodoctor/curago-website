import { Smartphone, Award, MessageSquare } from 'lucide-react';
import { BookingForm } from './BookingForm';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { trackButtonClick, trackWhatsAppClick } from '../utils/tracking';

interface HeroProps {
  onBookAppointment?: () => void;
}

export function Hero({ onBookAppointment }: HeroProps) {
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
                CuraGo is India's beloved Mental health Platform
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
                ₹1200 = 1 Video Consultation of minimum 45 mins duration + 1 month of Free Unlimited WhatsApp Support
              </p>
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
                  className="w-full bg-white text-[#096b17] hover:bg-gray-100 h-14 transition-all duration-300"
                >
                  AURA Index
                </Button>

                {/* Row 2 */}
                <a 
                  href="https://wa.me/917021227203" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full"
                  onClick={() => trackWhatsAppClick('hero')}
                >
                  <Button className="w-full bg-white text-[#096b17] hover:bg-gray-100 h-12 transition-all duration-300">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                    </svg>
                    Say 'hi' on WhatsApp
                  </Button>
                </a>

                <Button
                  onClick={() => {
                    trackButtonClick('Request a Callback', 'cta', 'hero');
                    scrollToContact();
                  }}
                  className="w-full bg-white text-[#096b17] hover:bg-gray-100 h-12 transition-all duration-300"
                >
                  Request a Callback
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
    </section>
  );
}
