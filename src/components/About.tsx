import { Shield, Clock, Smartphone, Award } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { trackButtonClick } from '../utils/tracking';

interface AboutProps {
  onGetStarted: () => void;
}

export function About({ onGetStarted }: AboutProps) {
  return (
    <section id="about" className="py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: '#FFFDBD' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-5">
              CuraGo | Science Meets Mind
            </h2>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              CuraGo is India's beloved Online Mental Health Platform, built with one simple belief — that empathy and care must come before everything else. We're here to make mental health support accessible, affordable, and stigma-free for every Indian, wherever they are.
            </p>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              Founded by Dr. Yuvaraj Thiruvengadam, a Surgical Gastroenterologist and passionate healthcare innovator, CuraGo was born out of a vision to bring state of the art, hospital-grade expertise and compassion directly to people's homes. Under his guidance, CuraGo combines medical credibility with a deep human touch, ensuring that every consultation feels safe, supportive, and personal.
            </p>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              Our team includes expert psychiatrists, psychologists, and counsellors trained from India's most reputed institutions, bringing clinical experience along with genuine compassion to each session.
            </p>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              Whether you're dealing with anxiety, depression, stress, or relationship issues, CuraGo offers trusted psychiatric consultations and psychologist therapy sessions online — all 100% confidential, safe, and secure.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              At CuraGo, we don't just treat symptoms — we listen, understand, and help you heal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-[#64CB81]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-[#096b17]" />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1">Verified Psychiatrists and Psychologists</h4>
                  <p className="text-gray-600 text-sm">MCI/RCI registered doctors</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-[#64CB81]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-[#096b17]" />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1">Anytime WhatsApp Support</h4>
                  <p className="text-gray-600 text-sm">Instant support and follow-ups through secure messaging</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-[#64CB81]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-6 w-6 text-[#096b17]" />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1">Same Day Booking</h4>
                  <p className="text-gray-600 text-sm">100% online - no office visits, complete privacy</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-[#64CB81]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-[#096b17]" />
                </div>
                <div>
                  <h4 className="text-gray-900 mb-1">Empathy-First Care</h4>
                  <p className="text-gray-600 text-sm">Compassionate support with complete confidentiality</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => {
                trackButtonClick('Get Started Today', 'about_section', 'cta');
                onGetStarted();
              }}
              size="lg"
              className="bg-[#096b17] hover:bg-[#075110] text-white px-8 h-12 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Get Started Today
            </Button>
          </motion.div>

          <motion.div 
            className="lg:pl-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <motion.div
                className="rounded-2xl overflow-hidden shadow-2xl group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src='/16b9238802f15faff48f3e863da5ccc19bd1bc5f.png'
                  alt="Dr. Yuvaraj Thiruvengadam - Founder, CuraGo"
                  className="w-full h-auto object-cover"
                  width="800"
                  height="1000"
                  loading='lazy'
                />
              </motion.div>
              <motion.div 
                className="mt-6 bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#096b17]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h4 className="text-xl text-gray-900 mb-2">Dr. Yuvaraj Thiruvengadam</h4>
                <p className="text-[#096b17] mb-2">Founder and Director</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Surgical Gastroenterologist and Healthcare Innovator dedicated to making quality mental health care accessible to every Indian through technology and compassion.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
