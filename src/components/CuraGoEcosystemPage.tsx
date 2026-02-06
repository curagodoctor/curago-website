import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Users,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  Quote,
  ArrowRight,
  Building,
  Zap,
  Loader2,
  Lightbulb,
  Clock,
  Mail
} from 'lucide-react';
import { trackButtonClick } from '../utils/tracking';

interface CuraGoEcosystemPageProps {
  onApply?: () => void;
  onNavigate?: (page: string) => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export function CuraGoEcosystemPage({ onApply, onNavigate }: CuraGoEcosystemPageProps) {
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackEmail, setCallbackEmail] = useState('');
  const [callbackTime, setCallbackTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleApplyClick = () => {
    trackButtonClick('Apply to Join Umbrella', 'curago_ecosystem', 'cta');
    const callbackSection = document.getElementById('request-callback');
    if (callbackSection) {
      callbackSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!callbackName.trim() || !callbackPhone.trim() || !callbackEmail.trim() || !callbackTime) {
      setSubmitError('Please fill in all fields');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!phoneRegex.test(callbackPhone)) {
      setSubmitError('Please enter a valid phone number');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(callbackEmail)) {
      setSubmitError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const phoneNumber = callbackPhone.startsWith('+91')
        ? callbackPhone
        : `+91${callbackPhone.replace(/^0+/, '')}`;

      const response = await fetch('https://server.wylto.com/webhook/bEuLwz0FEikxPweVfv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: callbackName.trim(),
          phoneNumber: phoneNumber,
          email: callbackEmail.trim(),
          preferredTime: callbackTime
        })
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setCallbackName('');
        setCallbackPhone('');
        setCallbackEmail('');
        setCallbackTime('');
        trackButtonClick('Callback Request Submitted', 'curago_ecosystem', 'form');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Callback request failed:', error);
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScienceMeetsMindClick = () => {
    trackButtonClick('Science Meets Mind', 'curago_ecosystem', 'services');
    if (onNavigate) {
      onNavigate('science-meets-mind');
    } else {
      window.location.href = '/science-meets-mind';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 bg-[#096b17] overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              CuraGo: The Specialized Patient Discovery & Practice Growth Ecosystem
            </h1>

            <p className="text-xl md:text-2xl text-[#64CB81] font-medium mb-8">
              Where Ethical Clinical Expertise Meets High-Performance Patient Acquisition.
            </p>

            <Button
              onClick={handleApplyClick}
              size="lg"
              className="bg-[#64CB81] hover:bg-[#5ab56e] text-[#053d0b] px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Apply to Join the Umbrella
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* What is CuraGo Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#FFFDBD' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              What is CuraGo?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              An elite ecosystem designed exclusively for verified medical consultants
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              className="bg-[#096b17] rounded-2xl p-8 text-white"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">The Umbrella Ecosystem</h3>
              <p className="text-white/90 leading-relaxed">
                CuraGo is not just software — it's an <span className="font-semibold text-[#64CB81]">integrated growth engine</span> that combines technology, marketing, and patient coordination under one roof.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#096b17] rounded-2xl p-8 text-white"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Handpicked Excellence</h3>
              <p className="text-white/90 leading-relaxed">
                We handpick dedicated consultants who prioritize <span className="font-semibold text-[#64CB81]">ethical, scientific medical practice</span> and empower them with the same systems that have scaled our own clinical landmarks.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Established Services Section */}
      <section className="py-16 md:py-24 bg-[#096b17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              Our Established Services
            </h2>
            <p className="text-lg text-white max-w-2xl mx-auto">
              Explore our specialized healthcare platforms designed to provide you with the best care
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Dr Yuvaraj's Gastro Digital Clinic */}
            <motion.a
              href="https://dryuvaraj.curago.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              style={{ backgroundColor: '#FFFDBD' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8 }}
              onClick={() => trackButtonClick('Dr Yuvaraj Clinic', 'curago_ecosystem', 'services')}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#096b17]" />
              <div className="p-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#096b17] transition-colors">
                    Dr Yuvaraj's Gastro Digital Clinic
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Expert gastroenterology consultations with Dr. Yuvaraj T, MS, MCh (Gold Medalist). Get personalized digestive health care from a leading specialist.
                </p>
                <div className="flex items-center gap-2 text-[#096b17] font-semibold">
                  <span>Book Consultation</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </motion.a>

            {/* Mental Health Platform */}
            <motion.div
              onClick={handleScienceMeetsMindClick}
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              style={{ backgroundColor: '#FFFDBD' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#096b17]" />
              <div className="p-8">
                <div className="mb-4">
                  <span className="text-xs font-semibold text-[#096b17] uppercase tracking-wider">Mental Health Platform</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-[#096b17] transition-colors">
                    Science Meets Mind
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  India's trusted online mental health platform. Connect with verified psychiatrists and psychologists for confidential consultations.
                </p>
                <div className="flex items-center gap-2 text-[#096b17] font-semibold">
                  <span>Explore Mental Health Services</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>

            {/* Anxiety Care */}
            <motion.a
              href="/atm"
              onClick={(e) => {
                e.preventDefault();
                trackButtonClick('Anxiety Care', 'curago_ecosystem', 'services');
                window.location.href = '/atm';
              }}
              className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              style={{ backgroundColor: '#FFFDBD' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#096b17]" />
              <div className="p-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#096b17] transition-colors">
                    Anxiety Care
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Specialized anxiety assessment and management tools. Understand your anxiety triggers and get personalized care recommendations.
                </p>
                <div className="flex items-center gap-2 text-[#096b17] font-semibold">
                  <span>Start Assessment</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </motion.a>
          </div>
        </div>
      </section>

      {/* 4-Stage Practice Growth Engine */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#FFFDBD' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              The 4-Stage Practice Growth Engine
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We solve the "Patient-Doctor Gap" through a single, integrated system that manages the entire patient lifecycle.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stage 1 */}
            <motion.div
              className="bg-[#096b17] rounded-2xl p-6 text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-lg font-bold mb-2">Discovery & Acquisition</h3>
              <p className="text-xs font-semibold text-[#64CB81] mb-3 uppercase tracking-wider">The Engine</p>
              <p className="text-white/90 text-sm leading-relaxed">
                Hyper-targeted Paid Marketing (Meta, Google, GTM) to find your "Action-Taking Cluster" of patients.
              </p>
            </motion.div>

            {/* Stage 2 */}
            <motion.div
              className="bg-[#096b17] rounded-2xl p-6 text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-lg font-bold mb-2">Technology Support</h3>
              <p className="text-xs font-semibold text-[#64CB81] mb-3 uppercase tracking-wider">The Infrastructure</p>
              <ul className="text-white/90 text-sm space-y-1">
                <li>High-converting websites</li>
                <li>Automated booking systems</li>
                <li>WhatsApp & Email automation</li>
              </ul>
            </motion.div>

            {/* Stage 3 */}
            <motion.div
              className="bg-[#096b17] rounded-2xl p-6 text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-bold mb-2">Patient Coordination</h3>
              <p className="text-xs font-semibold text-[#64CB81] mb-3 uppercase tracking-wider">The Human Touch</p>
              <p className="text-white/90 text-sm leading-relaxed">
                Dedicated support desk for patient coordination and pre-consultation calls so you focus on clinical work.
              </p>
            </motion.div>

            {/* Stage 4 */}
            <motion.div
              className="bg-[#096b17] rounded-2xl p-6 text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-2">Long-Term Value</h3>
              <p className="text-xs font-semibold text-[#64CB81] mb-3 uppercase tracking-wider">The Retention</p>
              <p className="text-white/90 text-sm leading-relaxed">
                Automated follow-ups and engagement increasing Lifetime Value (LTV) of every patient.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Immediate Footfall Section */}
      <section className="py-16 md:py-24 bg-[#096b17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-5xl mx-auto"
            {...fadeInUp}
          >
            <div className="grid lg:grid-cols-5 gap-8 items-center">
              {/* Left side - Question */}
              <div className="lg:col-span-2 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Does this solve the "Immediate Footfall" problem?
                </h2>
                <p className="text-white">
                  Let's be transparent about what to expect.
                </p>
              </div>

              {/* Right side - Answer */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: '#FFFDBD' }}>
                  <div className="bg-[#096b17]/20 p-6">
                    <h3 className="text-xl font-bold text-[#096b17] flex items-center gap-3">
                      <Lightbulb className="h-6 w-6 text-[#096b17]" />
                      The Honest Truth
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Medical growth is not a "one-size-fits-all" switch. Immediate footfall depends on your geography, niche, existing reputation, and local organic brand presence.
                    </p>

                    <div className="bg-[#096b17]/10 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-[#096b17] shrink-0 mt-0.5" />
                        <p className="text-gray-700">
                          However, with time and <span className="font-semibold text-[#096b17]">data-backed strategies</span>, our system ensures every consultant reaches their target goal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The CuraGo Umbrella Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#FFFDBD' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              The CuraGo Umbrella: Exclusivity by Design
            </h2>
            <p className="text-xl text-gray-600">
              We are not an open directory. CuraGo is a curated label of excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              className="bg-[#096b17] rounded-2xl p-6 md:p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <ShieldCheck className="h-8 w-8 text-[#64CB81]" />
                <h3 className="text-xl font-bold text-white">Verified Only</h3>
              </div>
              <p className="text-white leading-relaxed">
                We only onboard consultants committed to ethical and value-driven medicine.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#096b17] rounded-2xl p-6 md:p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <Users className="h-8 w-8 text-[#64CB81]" />
                <h3 className="text-xl font-bold text-white">The Interview Stage</h3>
              </div>
              <p className="text-white leading-relaxed">
                Every consultant undergoes a vetting process. We only partner with those who align with the CuraGo philosophy of scientific excellence.
              </p>
            </motion.div>
          </div>

          {/* Advantages */}
          <motion.div
            className="bg-[#096b17]/10 rounded-2xl p-6 md:p-10"
            {...fadeInUp}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Advantages of Joining the Ecosystem
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#096b17] rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Shared Algorithmic Learning</h4>
                  <p className="text-gray-600 text-sm">Benefit from the data and "Creative Moats" we have already built across different geographies.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#096b17] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Founding Team Support</h4>
                  <p className="text-gray-600 text-sm">Constant strategic support from the core CuraGo team.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#096b17] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Subsidized Scale</h4>
                  <p className="text-gray-600 text-sm">Access premium tools and marketing at a fraction of the cost through our collective subscription model.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#096b17] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">In-House Execution</h4>
                  <p className="text-gray-600 text-sm">We do the heavy lifting — from ad management to tech troubleshooting — internally.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Founder's Journey Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#FFFDBD' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-6xl mx-auto"
            {...fadeInUp}
          >
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              {/* Left - Image */}
              <motion.div
                className="order-2 lg:order-1"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src="/profile.svg"
                      alt="Dr. Yuvaraj T - Founder of CuraGo"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-[#096b17] rounded-xl p-5 shadow-lg">
                      <h3 className="text-xl font-bold text-white">Dr. Yuvaraj T</h3>
                      <p className="text-[#64CB81] font-medium">MS, MCh (Gold Medalist)</p>
                      <p className="text-white text-sm">Founder of CuraGo</p>
                    </div>
                    <div className="bg-[#096b17] rounded-xl p-5 shadow-lg flex items-center justify-center">
                      <p className="text-white text-base font-semibold text-center">
                        "CuraGo is the system I wish I had when I started."
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right - Content */}
              <motion.div
                className="order-1 lg:order-2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                  The Founder's Journey: Why CuraGo?
                </h2>

                <div className="flex items-start gap-3 mb-6">
                  <Quote className="h-8 w-8 text-[#096b17] shrink-0" />
                  <p className="text-lg text-gray-700 leading-relaxed italic">
                    CuraGo's evolution is a masterclass in founder-led iteration. We didn't start in a boardroom; we started in the trenches.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#096b17] rounded-xl p-5">
                    <h4 className="text-white font-bold mb-2">The Pivot to Precision</h4>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Our journey began in broad Home Healthcare, moved to Online Telehealth, and specialized in Mental Health for Tier 2/3 India.
                    </p>
                  </div>

                  <div className="bg-[#096b17] rounded-xl p-5">
                    <h4 className="text-white font-bold mb-2">The Realization</h4>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Through this process, I realized that the greatest challenge for brilliant Indian doctors isn't clinical skill—it's Discovery.
                    </p>
                  </div>

                  <div className="bg-[#096b17] rounded-xl p-5">
                    <h4 className="text-white font-bold mb-2">The Mission</h4>
                    <p className="text-white/90 text-sm leading-relaxed">
                      I learned Meta ads, GTM, and sales from scratch to solve this for my own practice. Now, I am opening that "Surgical-Grade" marketing system to other doctors who want to practice ethically while growing predictably.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: '#FFFDBD' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
              Are you a dedicated consultant ready to scale?
            </h2>

            <Button
              onClick={handleApplyClick}
              size="lg"
              className="bg-[#096b17] hover:bg-[#075110] text-white px-10 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl mb-6"
            >
              Apply to Join the Umbrella
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-gray-600 text-sm">
              (Note: Selection is subject to the Interview Phase)
            </p>
          </motion.div>
        </div>
      </section>

      {/* Request Callback Form Section */}
      <section id="request-callback" className="py-16 md:py-24" style={{ backgroundColor: '#096b17' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-2xl mx-auto"
            {...fadeInUp}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                Request a Callback
              </h2>
              <p className="text-lg text-white/90">
                Have questions? Leave your details and our team will get back to you shortly.
              </p>
            </div>

            <div className="rounded-2xl p-8 md:p-10 shadow-2xl" style={{ backgroundColor: '#FFFDBD' }}>
              {submitSuccess ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-16 h-16 bg-[#096b17] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#096b17' }}>Thank You!</h3>
                  <p className="mb-6" style={{ color: '#096b17' }}>
                    We've received your request. Our team will call you back soon.
                  </p>
                  <Button
                    onClick={() => setSubmitSuccess(false)}
                    className="bg-[#096b17] hover:bg-[#075110] text-white"
                  >
                    Submit Another Request
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="callback-name" className="block text-sm font-semibold mb-2" style={{ color: '#096b17' }}>
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="callback-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={callbackName}
                        onChange={(e) => setCallbackName(e.target.value)}
                        className="bg-white h-12 text-base rounded-lg text-black placeholder:text-gray-500 border-[#096b17] focus:border-[#096b17] focus:ring-[#096b17]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="callback-phone" className="block text-sm font-semibold mb-2" style={{ color: '#096b17' }}>
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="callback-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value)}
                        className="bg-white h-12 text-base rounded-lg text-black placeholder:text-gray-500 border-[#096b17] focus:border-[#096b17] focus:ring-[#096b17]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="callback-email" className="block text-sm font-semibold mb-2" style={{ color: '#096b17' }}>
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <Input
                        id="callback-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={callbackEmail}
                        onChange={(e) => setCallbackEmail(e.target.value)}
                        className="bg-white h-12 text-base rounded-lg text-black placeholder:text-gray-500 border-[#096b17] focus:border-[#096b17] focus:ring-[#096b17]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="callback-time" className="block text-sm font-semibold mb-2" style={{ color: '#096b17' }}>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Preferred Callback Time <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <Select value={callbackTime} onValueChange={setCallbackTime}>
                        <SelectTrigger
                          className="bg-white text-base rounded-lg text-black border-[#096b17] focus:border-[#096b17] focus:ring-[#096b17]"
                          style={{ height: '48px' }}
                        >
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9am-12pm">Morning (9:00 AM - 12:00 PM)</SelectItem>
                          <SelectItem value="12pm-3pm">Afternoon (12:00 PM - 3:00 PM)</SelectItem>
                          <SelectItem value="3pm-6pm">Evening (3:00 PM - 6:00 PM)</SelectItem>
                          <SelectItem value="6pm-9pm">Night (6:00 PM - 9:00 PM)</SelectItem>
                          <SelectItem value="anytime">Anytime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {submitError && (
                    <motion.p
                      className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {submitError}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full h-12 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-70"
                    style={{ backgroundColor: '#096b17' }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Request a Callback'
                    )}
                  </Button>

                  <p className="text-xs text-center" style={{ color: '#096b17', opacity: 0.7 }}>
                    By submitting, you agree to receive a call from our team regarding your inquiry.
                  </p>
                </form>
              )}
            </div>

            <p className="text-white/70 text-xs mt-4 text-center">
              We respond within ~10 minutes (9:00 AM–9:00 PM). Your details are private.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default CuraGoEcosystemPage;
