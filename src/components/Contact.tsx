import { Phone, Mail, Smartphone, ShieldCheck, CheckCircle2, Ban, Users, Lock, Star } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { motion } from 'framer-motion';
import { trackWhatsAppClick, trackPhoneClick } from '../utils/tracking';

const PHONE_E164 = '+918062179639';
const PHONE_DISPLAY = '+91 80621 79639';
const WHATSAPP_E164 = '917021227203';
const WHATSAPP_TEXT = encodeURIComponent(
  'Hi! I came from Facebook. I want to book a service. Preferred date/time: __. Area: __.'
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_E164}?text=${WHATSAPP_TEXT}`;

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, when: 'beforeChildren', staggerChildren: 0.12 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Contact() {
  const onWhatsApp = () => {
    trackWhatsAppClick?.('contact_section');
  };

  const onPhone = () => {
    trackPhoneClick?.('contact_section');
  };

  return (
    <section
      id="contact"
      className="pt-24 md:pt-28 pb-12 md:pb-20 relative overflow-hidden"
      style={{ backgroundColor: '#096b17' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 1) Reassurance header */}
        <div className="text-center mb-6 md:mb-8">
          {/* 5. Mobile: reduce size & force single line */}
          <h2 className="text-[22px] sm:text-3xl md:text-4xl lg:text-5xl text-white mb-3 sm:mb-4 whitespace-nowrap md:whitespace-normal tracking-tight">
            Still unsure where to start?
          </h2>

          {/* 6. Subtext prominent */}
          <p className="text-white max-w-3xl mx-auto text-lg sm:text-xl font-semibold">
            Take your <span className="underline decoration-white/50 underline-offset-4">Free Clarity Call</span> today
          </p>

          {/* 7. Icons: no commitment/judgement/pressure */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4" /> No commitment
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs sm:text-sm">
              <Ban className="w-4 h-4" /> No judgement
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4" /> No pressure
            </span>
          </div>

          {/* 8. Separate line */}
          <p className="text-white/90 max-w-3xl mx-auto text-sm sm:text-base mt-3">
            Let us understand you better and guide you to the next best step.
          </p>

          {/* 9. Additional icon-type line */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs sm:text-sm">
              <Users className="w-4 h-4" /> 1000+ Happy Families
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4" /> 100% Verified Experts
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs sm:text-sm">
              <Lock className="w-4 h-4" /> 100% Confidential
            </span>
          </div>
        </div>

        {/* 2 / 8 / 9 / 10. Form first, named, 70% visible above fold, CTA label */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Form title */}
          <h3 className="text-white text-xl sm:text-2xl font-semibold mb-3 text-center">
            Book Free Clarity Call
          </h3>

          {/* Keep most of the form visible by reducing margins/padding around it */}
          <div className="rounded-2xl overflow-hidden">
            {/* If your ContactForm supports props, you can pass `title`/`ctaText` safely.
                Otherwise it will be ignored without breaking. */}
            <ContactForm /* title="Book Free Clarity Call" ctaText="Book Free Clarity Call" */ />
          </div>

          {/* 9. Ensure ≥70% of form seen: keep helper text compact */}
          <p className="text-white/70 text-xs mt-2 text-center">
            We respond within ~10 minutes (9:00 AM–9:00 PM). Your details are private.
          </p>

          {/* Primary quick-contact buttons — 11. tighten space below WhatsApp */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsApp}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold bg-white text-[#096b17] hover:opacity-90"
              aria-label="Chat on WhatsApp"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Chat on WhatsApp (Fastest)
            </a>
            <a
              href={`tel:${PHONE_E164}`}
              onClick={onPhone}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold bg-[#FFFDBD] text-[#096b17] hover:opacity-90"
              aria-label="Call us now"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </a>
          </div>

          {/* Optional secondary CTA matching form button text */}
          <div className="mt-3 flex justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsApp}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold bg-[#0CE479] text-[#083E10] hover:opacity-90"
              aria-label="Book Free Clarity Call"
            >
              Book Free Clarity Call
            </a>
          </div>
        </motion.div>

        {/* Divider hint to scroll (kept compact to retain above-the-fold visibility) */}
        <div className="mt-8 mb-6 flex items-center justify-center">
          <div className="h-px w-20 bg-white/30" />
          <span className="mx-3 text-white/70 text-sm">or scroll for our contact details</span>
          <div className="h-px w-20 bg-white/30" />
        </div>

        {/* 3) Contact info grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid lg:grid-cols-2 gap-8 items-start"
        >
          {/* Left copy + trust chips */}
          <motion.div variants={itemVariants} className="text-center lg:text-left">
            <div className="mb-4">
              <h3 className="text-2xl text-white mb-2">Prefer speaking to a human?</h3>
              <p className="text-white/90 leading-relaxed">
                Call or WhatsApp us—tell us what’s on your mind. We’ll help you decide the
                right service and a time that works for you.
              </p>
            </div>

            {/* 12/13/14. Trust bar labels updated; GST removed */}
            <ul className="flex flex-wrap gap-2 mb-2 justify-center lg:justify-start">
              <li className="text-xs font-medium bg-white/10 text-white px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Star className="w-4 h-4" /> 4.8 Overall Rating
              </li>
              <li className="text-xs font-medium bg-white/10 text-white px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Users className="w-4 h-4" /> 1000+ Happy Families
              </li>
            </ul>

            {/* 15. Service hours tab removed */}
          </motion.div>

          {/* Right: cards */}
          <motion.div variants={containerVariants} className="space-y-3">
            <motion.a
              variants={itemVariants}
              href={`tel:${PHONE_E164}`}
              onClick={onPhone}
              className="block"
              aria-label="Call phone number"
            >
              <div className="rounded-xl p-3 shadow-lg hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: '#FFFDBD' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#096b17' }}>
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden text-left">
                    <h4 className="mb-0.5 text-sm sm:text-base truncate" style={{ color: '#096b17' }}>Phone Number</h4>
                    <p className="text-xs sm:text-sm truncate" style={{ color: '#096b17' }}>{PHONE_DISPLAY}</p>
                    <p className="text-[10px] sm:text-xs truncate" style={{ color: '#096b17', opacity: 0.7 }}>Available 09:00 AM–09:00 PM</p>
                  </div>
                </div>
              </div>
            </motion.a>

            <motion.a
              variants={itemVariants}
              href="mailto:help@curago.in"
              className="block"
              aria-label="Email us"
            >
              <div className="rounded-xl p-3 shadow-lg hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: '#FFFDBD' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#096b17' }}>
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden text-left">
                    <h4 className="mb-0.5 text-sm sm:text-base truncate" style={{ color: '#096b17' }}>Email</h4>
                    <p className="text-xs sm:text-sm truncate" style={{ color: '#096b17' }}>help@curago.in</p>
                  </div>
                </div>
              </div>
            </motion.a>

            <motion.a
              variants={itemVariants}
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsApp}
              className="block"
              aria-label="Open WhatsApp chat"
            >
              <div className="rounded-xl p-3 shadow-lg hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: '#FFFDBD' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#096b17' }}>
                    <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden text-left">
                    <h4 className="mb-0.5 text-sm sm:text-base truncate" style={{ color: '#096b17' }}>WhatsApp</h4>
                    <p className="text-xs sm:text-sm truncate" style={{ color: '#096b17' }}>+{WHATSAPP_E164}</p>
                    <p className="text-[10px] sm:text-xs truncate" style={{ color: '#096b17', opacity: 0.7 }}>Fastest response</p>
                  </div>
                </div>
              </div>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
