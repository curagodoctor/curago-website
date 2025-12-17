import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, TrendingUp, Video, CheckCircle, Calendar } from 'lucide-react';
import { Button } from './ui/button';

export default function ConsultationLandingPage() {
  useEffect(() => {
    // Load Razorpay embed button script
    const script = document.createElement('script');
    script.src = 'https://cdn.razorpay.com/static/embed_btn/bundle.js';
    script.defer = true;
    script.id = 'razorpay-embed-btn-js';

    if (!document.getElementById('razorpay-embed-btn-js')) {
      document.body.appendChild(script);
    } else {
      const rzp = (window as any)['_rzp_'];
      if (rzp && rzp.init) {
        rzp.init();
      }
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleATMRedirect = () => {
    window.location.href = '/atm';
  };

  return (
    <section className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#64CB81] rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Talk to an Anxiety Specialist.<br />Get Clarity in One Session.
          </h1>

          <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
            If anxiety is affecting your daily life, this session helps you understand what's happening and what to do next.
          </p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-10"
          style={{ backgroundColor: '#FFFDBD' }}
        >
          {/* What We Offer */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-5 text-center" style={{ color: '#096b17' }}>
              What We Offer
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#096b17' }} />
                <p className="text-base text-gray-800">
                  <strong>45-minute 1-on-1 video consultation</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#096b17' }} />
                <p className="text-base text-gray-800">
                  <strong>Conducted by a qualified mental health professional</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#096b17' }} />
                <div className="text-base text-gray-800">
                  <p className="font-semibold mb-1">Understand:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Why your anxiety keeps recurring</li>
                    <li>Whether this needs treatment or not</li>
                    <li>Clear next steps (therapy, lifestyle, or reassurance)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature Icons */}
            <div className="flex flex-row gap-3 mb-6 overflow-x-auto">
              <div className="bg-white/80 rounded-xl p-4 border-2 border-[#096b17]/20 text-center flex-1 min-w-[140px]">
                <Shield className="w-6 h-6 mx-auto mb-1" style={{ color: '#096b17' }} />
                <p className="font-semibold text-gray-800 text-xs md:text-sm">Private & Confidential</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border-2 border-[#096b17]/20 text-center flex-1 min-w-[140px]">
                <Clock className="w-6 h-6 mx-auto mb-1" style={{ color: '#096b17' }} />
                <p className="font-semibold text-gray-800 text-xs md:text-sm">Same Day Consultations</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border-2 border-[#096b17]/20 text-center flex-1 min-w-[140px]">
                <Calendar className="w-6 h-6 mx-auto mb-1" style={{ color: '#096b17' }} />
                <p className="font-semibold text-gray-800 text-xs md:text-sm">Evidence-Based Approach</p>
              </div>
            </div>

            {/* Primary CTA - Razorpay Button */}
            <div className="text-center mb-6 mt-6">
              <style>
                {`
                  .razorpay-embed-btn button {
                    font-size: 28px !important;
                    padding: 28px 56px !important;
                    border-radius: 20px !important;
                    font-weight: 800 !important;
                    box-shadow: 0 12px 35px rgba(11, 132, 25, 0.4) !important;
                    transition: all 0.3s ease !important;
                    min-width: 400px !important;
                    height: auto !important;
                  }
                  @media (max-width: 640px) {
                    .razorpay-embed-btn button {
                      font-size: 22px !important;
                      padding: 22px 40px !important;
                      min-width: 320px !important;
                    }
                  }
                  .razorpay-embed-btn button:hover {
                    transform: translateY(-3px) !important;
                    box-shadow: 0 18px 45px rgba(11, 132, 25, 0.5) !important;
                  }
                `}
              </style>
              <div
                className="razorpay-embed-btn inline-block"
                data-url="https://pages.razorpay.com/pl_RSf6K4Ml6DJIuq/view"
                data-text="Book Consultation – ₹1200"
                data-color="#0B8419"
                data-size="large"
              />
            </div>

            {/* Secondary CTA */}
            <div className="text-center">
              <a
                onClick={handleATMRedirect}
                className="text-sm text-gray-600 hover:text-[#096b17] underline cursor-pointer transition-colors"
              >
                Not sure yet? Take a quick anxiety self-assessment
              </a>
            </div>
          </div>

          {/* How This Works */}
          <div className="mt-8 pt-6 border-t-2 border-[#096b17]/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-5 text-center" style={{ color: '#096b17' }}>
              How This Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 rounded-xl p-4 border-2 border-[#096b17]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-base" style={{ backgroundColor: '#096b17' }}>
                    1
                  </div>
                  <h3 className="font-bold text-base" style={{ color: '#096b17' }}>
                    Book your session – ₹1200
                  </h3>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/80 rounded-xl p-4 border-2 border-[#096b17]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-base" style={{ backgroundColor: '#096b17' }}>
                    2
                  </div>
                  <h3 className="font-bold text-base" style={{ color: '#096b17' }}>
                    Fill a short form
                  </h3>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/80 rounded-xl p-4 border-2 border-[#096b17]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-base" style={{ backgroundColor: '#096b17' }}>
                    3
                  </div>
                  <h3 className="font-bold text-base" style={{ color: '#096b17' }}>
                    Schedule at your convenience
                  </h3>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/80 rounded-xl p-4 border-2 border-[#096b17]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-base" style={{ backgroundColor: '#096b17' }}>
                    4
                  </div>
                  <h3 className="font-bold text-base" style={{ color: '#096b17' }}>
                    Get clarity on what to do next
                  </h3>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="text-center text-white space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <p className="text-2xl font-semibold mb-1">45+ mins</p>
              <p className="text-sm text-green-100">Consultation Duration</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <p className="text-2xl font-semibold mb-1">100% Online</p>
              <p className="text-sm text-green-100">Video Consultation</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <p className="text-2xl font-semibold mb-1">100% Private</p>
              <p className="text-sm text-green-100">Safe & Confidential</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
