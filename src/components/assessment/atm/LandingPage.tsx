import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import './styles/globals.css';

interface LandingPageProps {
  onStart?: () => void;
  onNavigateToWindDown?: () => void;
  onNavigateToDummy?: () => void;
}

export default function LandingPage({ onNavigateToWindDown, onNavigateToDummy }: LandingPageProps) {
  // const [showConsentPopup, setShowConsentPopup] = useState(false);
  // const [consentChecked, setConsentChecked] = useState(false);

  // // Show consent popup after 1 second
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShowConsentPopup(true);
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, []);
  const handleSkipToTest = () => {
    // setShowConsentPopup(false);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'curiosity_exit',
      proxy_value: 0,
      currency: 'INR',
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    console.log('⏭️ curiosity_exit event fired');
    if (onNavigateToDummy) onNavigateToDummy();
  };

  // const handleFollowRecommendation = () => {
  //   setShowConsentPopup(false);
  //   window.dataLayer = window.dataLayer || [];
  //   window.dataLayer.push({
  //     event: 'curiosity_pass',
  //     proxy_value: 0,
  //     currency: 'INR',
  //     page_path: window.location.pathname,
  //     timestamp: new Date().toISOString(),
  //   });
  //   console.log('✅ curiosity_pass event fired');
  //   // Just close the popup, stay on /atm landing page
  // };

  // const handleProceed = () => {
  //   if (!consentChecked) return;
  //   handleFollowRecommendation();
  // };

  // const handleSkipAndExplore = () => {
  //   handleSkipToTest();
  // };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFFBF5] to-[#FFFFFF]">
      {/* Hero - Centered and Clean */}
      <section className="container mx-auto px-4 sm:px-6 pt-32 md:pt-40 lg:pt-48 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            {/* Content with Sequential Animations */}
            <div className="space-y-6 sm:space-y-8">
              {/* Main Headline - Appears First */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight text-[#0A0A0A] font-bold animate-[fadeInUp_0.8s_ease-out_0.1s_both]">
                If you are feeling anxious even on normal days...
              </h1>

              {/* Subline - Appears Second */}
              <p className="text-base sm:text-lg md:text-xl text-[#3A3A3A] leading-relaxed max-w-2xl mx-auto animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
                it is our medical recommendation that you take a short wind-down so your answers are accurate
              </p>

              {/* CTAs - Appear Third */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
                <Button
                  onClick={handleSkipToTest}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white hover:bg-[#F8F9FA] text-[#3A3A3A] hover:text-[#0A0A0A] px-6 sm:px-8 h-12 sm:h-14 rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl border-2 border-[#E5E7EB] hover:border-[#096b17] text-sm sm:text-base"
                >
                  Skip and Go to the test
                </Button>

                <Button
                  onClick={() => {
                    // setShowConsentPopup(false);
                    if (onNavigateToWindDown) onNavigateToWindDown();
                  }}
                  size="lg"
                  style={{
                    background: 'linear-gradient(to right, #096b17, #075110)',
                    color: 'white',
                  }}
                  className="w-full sm:w-auto hover:opacity-90 px-6 sm:px-8 h-12 sm:h-14 rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl text-sm sm:text-base border-0"
                >
                  Follow CuraGo's recommendation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consent Popup - Non-closeable - COMMENTED OUT */}
      {/* <AnimatePresence>
        {showConsentPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Before You Begin</h3>

              <div className="space-y-3 sm:space-y-4 text-gray-700 mb-5 sm:mb-6 text-sm sm:text-base">
                <p className="leading-relaxed">
                  CuraGo uses this assessment as part of a structured clinical process to help people understand anxiety patterns and triggers.
                </p>
                <p className="font-semibold text-gray-900">This is not a casual quiz.</p>

                <p className="leading-relaxed">To ensure accuracy and usefulness:</p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>You'll be guided through a short wind-down step before the assessment</li>
                  <li>You'll answer a few self-reflective questions</li>
                  <li>Your result will be generated as a personal report</li>
                  <li>To deliver and explain this report, we will request your WhatsApp number and email later in the process</li>
                </ul>

                <p className="leading-relaxed">
                  This helps us keep results secure, retrievable, and clinically meaningful.
                </p>
              </div>

              <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 w-5 h-5 flex-shrink-0 text-[#096b17] bg-white border-gray-300 rounded focus:ring-[#096b17] focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm sm:text-base text-gray-800 font-medium group-hover:text-gray-900 leading-snug">
                    I understand how this process works and I'm proceeding seriously
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleProceed}
                  disabled={!consentChecked}
                  className={`w-full py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                    consentChecked
                      ? 'bg-gradient-to-r from-[#096b17] to-[#075110] text-white hover:from-[#075110] hover:to-[#053d0b] cursor-pointer shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed
                </Button>

                <Button
                  onClick={handleSkipAndExplore}
                  className="w-full bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-50 py-3 rounded-xl font-semibold text-sm sm:text-base cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Skip and explore the test
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
}