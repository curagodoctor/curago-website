import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { AlertCircle, Brain, Activity, CheckCircle2, ArrowRight, Phone, Calendar, MessageCircle, ExternalLink, FileText, X } from 'lucide-react';
import type { GbsiResult, GbsiAnswers } from '../../../types/gbsi';
import { getAlarmingSignsText } from './scoringEngine';

interface GbsiResultScreenProps {
  result: GbsiResult;
  answers: GbsiAnswers;
  userName: string;
  onRetake: () => void;
}

// Razorpay configuration for online consultation
const RAZORPAY_CONSULTATION_BUTTON_ID = 'pl_S16kCY67frwiRs'; // Razorpay Payment Button ID
const CONSULTATION_AMOUNT = 100000; // ₹1000 in paise

declare global {
  interface Window {
    Razorpay: any;
    dataLayer: any[];
  }
}

export default function GbsiResultScreen({
  result,
  answers,
  userName,
  onRetake,
}: GbsiResultScreenProps) {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const paymentFormRef = React.useRef<HTMLFormElement>(null);

  // Load Razorpay checkout script
  React.useEffect(() => {
    const checkoutScript = document.createElement('script');
    checkoutScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
    checkoutScript.async = true;
    document.body.appendChild(checkoutScript);

    return () => {
      if (document.body.contains(checkoutScript)) {
        document.body.removeChild(checkoutScript);
      }
    };
  }, []);

  // Show popup after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Load Razorpay payment button into form when popup shows
  React.useEffect(() => {
    if (showPopup && paymentFormRef.current) {
      // Clear any existing content
      paymentFormRef.current.innerHTML = '';

      // Create and append the payment button script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', RAZORPAY_CONSULTATION_BUTTON_ID);
      script.async = true;

      paymentFormRef.current.appendChild(script);

      // Add custom styling to the Razorpay button
      const style = document.createElement('style');
      style.textContent = `
        .razorpay-payment-button {
          width: 100% !important;
          padding: 16px 24px !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          background-color: #096b17 !important;
          border: none !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.3s !important;
        }
        .razorpay-payment-button:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
          transform: scale(1.05) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [showPopup]);

  // Handle online consultation payment
  const handleOnlineConsultation = () => {
    setIsPaymentLoading(true);

    // Track initiate checkout event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'initiatecheckout',
      test_type: 'gbsi_consultation',
      amount: 1000,
      currency: 'INR',
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ initiatecheckout event pushed to dataLayer (GBSI Online Consultation, ₹1000)');

    // Open Razorpay payment link
    const paymentUrl = `https://razorpay.com/payment-button/${RAZORPAY_CONSULTATION_BUTTON_ID}/view/?amount=${CONSULTATION_AMOUNT}`;

    // Add success redirect URL parameter
    const redirectUrl = encodeURIComponent(`${window.location.origin}/schedule-consultation`);
    const paymentUrlWithRedirect = `${paymentUrl}&redirect_url=${redirectUrl}`;

    window.open(paymentUrlWithRedirect, '_blank');

    setIsPaymentLoading(false);
  };

  // Handle Priority Circle 365 application
  const handlePriorityCircleApply = () => {
    // Open Priority Circle form
    window.open('https://dryuvaraj.curago.in/apply', '_blank');
  };

  // Handle Priority Circle 365 info
  const handlePriorityCircleInfo = () => {
    // Open Priority Circle main page
    window.open('https://dryuvaraj.curago.in', '_blank');
  };

  // Handle WhatsApp appointment booking
  const handleWhatsAppAppointment = () => {
    const whatsappNumber = '919148615951'; // CuraGo WhatsApp number
    const message = encodeURIComponent(
      `Hi, I've completed the GBSI Assessment and would like to book an in-clinic appointment. My name is ${userName || 'User'}.`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle WhatsApp chat from popup
  const handleWhatsAppChat = () => {
    const whatsappNumber = '919148615951'; // CuraGo WhatsApp number
    const message = encodeURIComponent(
      `Hi, I've received my GBSI Assessment results. I would like to discuss my results. My name is ${userName || 'User'}.`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setShowPopup(false); // Close popup after clicking
  };

  // Handle consultation booking from popup
  const handlePopupConsultation = () => {
    handleOnlineConsultation();
    setShowPopup(false); // Close popup after clicking
  };

  // Render action buttons section
  const renderActionButtons = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-12"
    >
      <Card className="p-8 bg-white border-2 border-[#096b17]/20">
        <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#096b17' }}>
          Next Steps & Support
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Book Online Consultation */}
          <button
            onClick={handleOnlineConsultation}
            disabled={isPaymentLoading}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            style={{ backgroundColor: '#096b17', color: '#ffffff' }}
          >
            <Calendar className="w-5 h-5" />
            {isPaymentLoading ? 'Opening...' : 'Book Online Consultation (₹1000)'}
          </button>

          {/* Apply for Priority Circle 365 */}
          <button
            onClick={handlePriorityCircleApply}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 bg-white border-2"
            style={{ color: '#096b17', borderColor: '#096b17' }}
          >
            <FileText className="w-5 h-5" />
            Apply for Priority Circle 365
          </button>

          {/* Know More about Priority Circle 365 */}
          <button
            onClick={handlePriorityCircleInfo}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 bg-white border-2"
            style={{ color: '#096b17', borderColor: '#096b17' }}
          >
            <ExternalLink className="w-5 h-5" />
            Know More - Priority Circle 365
          </button>

          {/* Book In-Clinic Appointment on WhatsApp */}
          <button
            onClick={handleWhatsAppAppointment}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            style={{ backgroundColor: '#25D366', color: '#ffffff' }}
          >
            <MessageCircle className="w-5 h-5" />
            Book In-Clinic on WhatsApp
          </button>
        </div>

        <p className="text-sm text-center mt-6 italic" style={{ color: '#096b17' }}>
          Choose the option that best suits your needs. Our team is here to support your gut health journey.
        </p>
      </Card>
    </motion.div>
  );

  const renderResultContent = () => {
    switch (result.resultType) {
      case 'clinicalPriority':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                  Urgent Surgical Evaluation Recommended
                </h2>
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <Card className="p-8 bg-white border-2 border-[#096b17]/20">
              <div className="space-y-4" style={{ color: '#096b17' }}>
                <p className="text-lg leading-relaxed">
                  Based on your reports of{' '}
                  <span className="font-bold">
                    {getAlarmingSignsText(answers.alarmingSigns)}
                  </span>
                  {answers.age === 'over50' && ' and your age'}
                  {answers.familyHistory.includes('colorectalCancer') &&
                    ' and your family history'}, we cannot categorize this as simple IBS.
                </p>

                <p className="text-lg leading-relaxed">
                  As a Surgical Gastroenterologist, I recommend a physical examination and likely
                  an Endoscopy/Colonoscopy to rule out structural issues immediately.
                </p>

                <Card className="mt-6 p-4 bg-red-50 border-2 border-red-200">
                  <p className="text-sm font-semibold text-red-700">
                    ⚠️ This assessment does not replace professional medical advice. Please seek
                    immediate medical attention.
                  </p>
                </Card>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/bookconsultation"
                className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              >
                Book Urgent Consultation
              </a>
              <button
                onClick={onRetake}
                className="inline-block bg-white hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 shadow-md"
                style={{ color: '#096b17', borderColor: '#096b1733' }}
              >
                Retake Assessment
              </button>
            </div>

            {/* Action Buttons */}
            {renderActionButtons()}
          </motion.div>
        );

      case 'brainGutOverdrive':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                  Your Axis is Hypersensitive
                </h2>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              {result.ibsType && (
                <p className="text-xl font-semibold" style={{ color: '#096b17' }}>Type: {result.ibsType}</p>
              )}
            </div>

            <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
              <div className="space-y-4 text-white group-hover:text-white">
                <p className="text-lg leading-relaxed">
                  You meet the Rome IV criteria for IBS. Your{' '}
                  {answers.brainFog === 'yesFrequently' && '"Brain Fog" and '}
                  {answers.stressLevel > 7 && 'high stress levels '}
                  suggest your Vagus nerve is in a state of hyper-vigilance.
                </p>

                <p className="text-lg leading-relaxed">
                  Your reports are likely "Normal" because the issue is{' '}
                  <span className="font-bold">communication, not anatomy</span>.
                </p>

                <div className="mt-6 space-y-3">
                  <h3 className="text-xl font-bold">Your Brain-Gut Axis Score</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-white/30 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${(result.axisScore / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold">
                      {result.axisScore}/3
                    </span>
                  </div>
                  <p className="text-sm">
                    Brain-Gut Sensitivity: <span className="font-bold capitalize">{result.brainGutSensitivity}</span>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white border-2 border-[#096b17]/20">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#096b17' }}>Recommended Next Steps</h3>
              <ul className="space-y-3" style={{ color: '#096b17' }}>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Start the 12-Month Gut-Brain Recalibration Program</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Learn vagus nerve regulation techniques</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Personalized dietary modifications based on your triggers</span>
                </li>
              </ul>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/bookconsultation"
                className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#096b17', color: '#ffffff' }}
              >
                Apply for Founder's Membership (₹1000)
              </a>
              <button
                onClick={onRetake}
                className="inline-block bg-white hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 shadow-md"
                style={{ color: '#096b17', borderColor: '#096b1733' }}
              >
                Retake Assessment
              </button>
            </div>

            {/* Action Buttons */}
            {renderActionButtons()}
          </motion.div>
        );

      case 'mechanicalMetabolic':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                  Upper GI Dysfunction & Metabolic Load
                </h2>
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
              <div className="space-y-4 text-white group-hover:text-white">
                <p className="text-lg leading-relaxed">
                  Your symptoms point toward{' '}
                  <span className="font-bold">
                    Functional Dyspepsia or GERD
                  </span>
                  {answers.fattyLiver === 'yes' && ', complicated by Fatty Liver'}.
                </p>

                <p className="text-lg leading-relaxed">
                  {answers.fattyLiver === 'yes' &&
                    'Your liver is struggling to process the metabolic load, which is why you may feel sluggish. '}
                  {answers.refluxFrequency === 'dailyNightly' &&
                    'Your frequent reflux needs to be addressed to prevent complications. '}
                  {answers.fullnessFactor === 'yes' &&
                    'The early fullness suggests your digestive motility may be affected.'}
                </p>

                <Card className="mt-6 p-4 bg-white/20 border-2 border-white/30">
                  <h4 className="font-bold mb-2">Key Issues Identified:</h4>
                  <ul className="space-y-1 text-sm">
                    {answers.refluxFrequency === 'dailyNightly' && (
                      <li>• Daily/Nightly Reflux or Acidity</li>
                    )}
                    {answers.fullnessFactor === 'yes' && (
                      <li>• Early Satiety (Uncomfortable Fullness)</li>
                    )}
                    {answers.fattyLiver === 'yes' && <li>• Fatty Liver Disease</li>}
                  </ul>
                </Card>
              </div>
            </Card>

            <Card className="p-8 bg-white border-2 border-[#096b17]/20">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#096b17' }}>Recommended Treatment Plan</h3>
              <ul className="space-y-3" style={{ color: '#096b17' }}>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Custom Diet & Lifestyle Protocol for upper GI health</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Metabolic load management strategies</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>
                    {answers.fattyLiver === 'yes'
                      ? 'Liver health optimization program'
                      : 'Digestive health monitoring'}
                  </span>
                </li>
              </ul>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/bookconsultation"
                className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#096b17', color: '#ffffff' }}
              >
                Book Online Consultation
              </a>
              <button
                onClick={onRetake}
                className="inline-block bg-white hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 shadow-md"
                style={{ color: '#096b17', borderColor: '#096b1733' }}
              >
                Retake Assessment
              </button>
            </div>

            {/* Action Buttons */}
            {renderActionButtons()}
          </motion.div>
        );

      case 'allClear':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                  You're Doing Great!
                </h2>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xl font-semibold" style={{ color: '#096b17' }}>But Watch the Habits</p>
            </div>

            <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
              <div className="space-y-4 text-white group-hover:text-white">
                <p className="text-lg leading-relaxed">
                  You don't meet the criteria for IBS or serious pathology. Your symptoms are
                  likely{' '}
                  <span className="font-bold">"Lifestyle Gastritis"</span> caused
                  by:
                </p>

                {(answers.dietaryHabits.lateNightDinners ||
                  answers.dietaryHabits.highCaffeine ||
                  answers.dietaryHabits.frequentJunk ||
                  answers.dietaryHabits.skipBreakfast) && (
                  <Card className="mt-4 p-4 bg-white/20 border-2 border-white/30">
                    <h4 className="font-bold mb-2">
                      Habits to Watch Out For:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {answers.dietaryHabits.lateNightDinners && (
                        <li>• Late night dinners</li>
                      )}
                      {answers.dietaryHabits.highCaffeine && <li>• High caffeine intake</li>}
                      {answers.dietaryHabits.frequentJunk && (
                        <li>• Frequent junk/processed food</li>
                      )}
                      {answers.dietaryHabits.skipBreakfast && <li>• Skipping breakfast</li>}
                    </ul>
                  </Card>
                )}

                <p className="text-lg leading-relaxed mt-4">
                  Small adjustments to these habits can help you maintain optimal gut health and
                  prevent future issues.
                </p>
              </div>
            </Card>

            <Card className="p-8 bg-white border-2 border-[#096b17]/20">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#096b17' }}>
                Preventive Care Recommendations
              </h3>
              <ul className="space-y-3" style={{ color: '#096b17' }}>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Maintain regular meal times</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Moderate caffeine and processed food intake</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Continue monitoring stress levels</span>
                </li>
              </ul>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => alert('Guide download coming soon!')}
                className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#096b17', color: '#ffffff' }}
              >
                Download Free Gut Guide
              </button>
              <button
                onClick={onRetake}
                className="inline-block bg-white hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 shadow-md"
                style={{ color: '#096b17', borderColor: '#096b1733' }}
              >
                Retake Assessment
              </button>
            </div>

            {/* Action Buttons */}
            {renderActionButtons()}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] pt-24 pb-12 px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#096b17' }}>
            Your Gut-Brain Sensitivity Index Report
          </h1>
          {userName && (
            <p className="text-xl font-semibold" style={{ color: '#096b17' }}>
              Results for {userName}
            </p>
          )}
        </motion.div>

        {renderResultContent()}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-white/80 border border-[#096b17]/20">
            <p className="text-sm text-center italic" style={{ color: '#096b17' }}>
              <strong>Disclaimer:</strong> This assessment is for informational purposes only and does not constitute medical
              advice. Please consult with a healthcare professional for proper diagnosis and treatment.
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Popup Modal - Appears after 5 seconds */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: '#096b17' }}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-[#096b17]/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" style={{ color: '#096b17' }} />
                </div>
              </div>

              {/* Message */}
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold" style={{ color: '#096b17' }}>
                  Check Your Email!
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  You would have received your test result PDF in your email inbox/spam.
                  If you want to book an online consultation, book an appointment.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Razorpay Payment Button */}
                <form ref={paymentFormRef} className="w-full">
                  {/* Razorpay payment button script will be loaded here */}
                </form>

                {/* Chat on WhatsApp Button */}
                <a
                  href={`https://wa.me/919148615951?text=${encodeURIComponent(`Hi, I've completed the GBSI Assessment. My name is ${userName || 'User'}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat Now on WhatsApp
                </a>
              </div>

              {/* Close text */}
              <p className="text-center text-sm text-gray-500">
                Click the × button or anywhere outside to close
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
