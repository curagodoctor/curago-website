import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { AtmAnswers, UserInfo, AnxietyPattern } from '../../../types/atm';
import { trackButtonClick, trackPhoneClick, trackFormSubmission } from '../../../utils/tracking';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap, Brain, Shield, Target, Clock, AlertTriangle, MessageCircle, X, Phone, User, Mail } from 'lucide-react';
import { FloatingButtons } from '../../FloatingButtons';
import { sendAtmResultsToGoogleSheets } from '../../../utils/googleSheets';

interface ResultScreenProps {
  answers: AtmAnswers;
  userInfo: UserInfo;
  onRetake: () => void;
  onUpgradeToFull?: () => void; // Navigate to actual quiz
}

const patternDetails: Record<
  AnxietyPattern,
  {
    explanation: string;
    neurological: string;
    impact: string[];
    microAction: { title: string; description: string };
    cta: string;
    Icon: React.ComponentType<any>;
    color: string;
  }
> = {
  'Overthinking Loop Anxiety': {
    explanation:
      "Your mind starts the anxiety before anything else. You're stuck in mental loops, overcalculating small triggers until they feel bigger than they are.",
    neurological:
      'Your prefrontal cortex is overloaded with predictions, threats, and “what-if” thoughts.',
    impact: ['Sleep disturbance', 'Mental fatigue', 'Decision paralysis'],
    microAction: {
      title: 'Label the Thought',
      description:
        '“Right now my mind is running a future story, not a reality.” This alone can reduce anxiety significantly.',
    },
    cta: 'Talk to CuraGo – you don’t have to solve everything inside your head.',
    Icon: Brain,
    color: 'violet',
  },
  'Somatic Spike Anxiety': {
    explanation:
      'Your anxiety hits the body first. Tight chest, shaky hands, heart spikes → your body sends the alarm before your mind.',
    neurological: 'Your nervous system is stuck in a high-alert loop, releasing adrenaline.',
    impact: ['Panic-like sensations', 'Exhaustion', 'Avoiding intense situations'],
    microAction: {
      title: '4-4-4 Reset',
      description: 'Breathe In for 4s, Hold for 4s, Breathe Out for 4s. Repeat 5 times.',
    },
    cta: 'Your body responds fast to the right intervention—CuraGo can guide you.',
    Icon: Zap,
    color: 'rose',
  },
  'Emotional Reactivity Anxiety': {
    explanation:
      'Your emotions hijack the situation before logic does. You react fast, feel fast, and sometimes crash emotionally.',
    neurological: 'Your amygdala (the brain’s emotional center) is firing on high alert.',
    impact: ['Mood swings', 'Sensitivity', 'Emotional burnout'],
    microAction: {
      title: '10-Second Pause Rule',
      description: 'Before you react, pause for 10 seconds. This allows your logical brain to catch up.',
    },
    cta: 'CuraGo can help you regulate emotions, not suppress them.',
    Icon: AlertTriangle,
    color: 'rose',
  },
  'Control/Perfection Anxiety': {
    explanation:
      'Your anxiety starts with decisions and responsibility. You fear making the wrong move and losing control.',
    neurological: 'Your brain is trained to seek certainty and avoid risk at any cost.',
    impact: ['Delayed decisions', 'High mental load', 'Irritation when things go “off-plan”'],
    microAction: {
      title: 'The 51% Rule',
      description: 'If a decision feels even 51% right, move forward. You can adjust later.',
    },
    cta: 'CuraGo can help you break the perfection loop.',
    Icon: Shield,
    color: 'teal',
  },
  'Memory Reactivation Anxiety': {
    explanation:
      'Old memories are mixing with present triggers. Small, unrelated events can remind your nervous system of past moments.',
    neurological: 'Your hippocampus tags old emotional data as a “present threat,” triggering a past response.',
    impact: ['Sudden emotional drops', 'Feeling unsafe', 'Over-reading social cues'],
    microAction: {
      title: 'Where Am I Right Now?',
      description: 'Name 3 objects around you. This simple act brings your brain back to the present moment.',
    },
    cta: 'CuraGo helps you separate past from present safely.',
    Icon: Clock,
    color: 'violet',
  },
  'Mixed-pattern Anxiety': {
    explanation:
      'Your anxiety has more than one starting point. Thoughts, body sensations, and emotions can all trigger a blended pattern.',
    neurological:
      'Multiple neural pathways are activated, creating a complex and sometimes unpredictable anxiety response.',
    impact: ['Feeling overwhelmed', 'Unpredictable triggers', 'Difficulty finding a single solution'],
    microAction: {
      title: 'Identify the “First Hit”',
      description:
        'When anxiety starts, ask: What came first? A thought, a feeling, or a physical sensation? Just noticing this reduces chaos.',
    },
    cta: 'CuraGo will help you decode your pattern clearly.',
    Icon: Zap,
    color: 'teal',
  },
};

function determineAnxietyPattern(answers: AtmAnswers): {
  pattern: AnxietyPattern;
  confidence: number;
} {
  const { q1, q2, q3, q5 } = answers;

  if (q1 === 1 && (q3 === 1 || q5 === 1)) {
    return { pattern: 'Overthinking Loop Anxiety', confidence: 0.85 };
  }
  if (q1 === 2 || q3 === 3 || q5 === 2) {
    return { pattern: 'Somatic Spike Anxiety', confidence: 0.83 };
  }
  if (q1 === 3 || q5 === 3) {
    return { pattern: 'Emotional Reactivity Anxiety', confidence: 0.81 };
  }
  if (q1 === 4 || q2 === 2 || q3 === 5) {
    return { pattern: 'Control/Perfection Anxiety', confidence: 0.78 };
  }
  if (q2 === 5 && (q3 === 2 || q3 === 4)) {
    return { pattern: 'Memory Reactivation Anxiety', confidence: 0.85 };
  }

  return { pattern: 'Mixed-pattern Anxiety', confidence: 0.55 };
}

export default function ResultScreen({ answers, onRetake, onUpgradeToFull }: ResultScreenProps) {
  const result = useMemo(() => determineAnxietyPattern(answers), [answers]);
  const details = patternDetails[result.pattern];
  const { Icon, color } = details;

  // Form and popup states
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [showAcknowledgmentPopup, setShowAcknowledgmentPopup] = useState(false);
  const [showClarityCallPopup, setShowClarityCallPopup] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [acknowledgmentClosedTime, setAcknowledgmentClosedTime] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    callbackTime: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const handleBookNow = () => {
    trackButtonClick('Book Now', 'floating_cta', 'atm_results');
    // Navigate to booking page
    history.pushState(null, '', '/');
    window.location.hash = '#booking';
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // No tracking for dummy/preview test

  // Show first popup after 0.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFormPopup(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Hide loading animation after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingAnimation(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Show first popup after 2.5 seconds (1.5s animation + 1s delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFormPopup(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Show acknowledgment popup for 2 seconds after form submission
  useEffect(() => {
    if (isFormSubmitted && !showAcknowledgmentPopup) {
      setShowAcknowledgmentPopup(true);
      const timer = setTimeout(() => {
        setShowAcknowledgmentPopup(false);
        setAcknowledgmentClosedTime(Date.now());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFormSubmitted, showAcknowledgmentPopup]);

  // Show clarity call popup 10 seconds after acknowledgment closes
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (acknowledgmentClosedTime) {
      // If acknowledgment was shown and closed, start timer from that moment
      timer = setTimeout(() => {
        setShowClarityCallPopup(true);
      }, 10000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [acknowledgmentClosedTime]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'WhatsApp number is required';
    } else if (!/^\d{10}$/.test(formData.whatsapp)) {
      errors.whatsapp = 'Please enter a valid 10-digit mobile number';
    }

    // Email is now required
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Callback time is optional, no validation needed

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsFormSubmitted(true);
      setShowFormPopup(false);

      // Send webhook with form data - FIRES FIRST (Dummy webhook with simplified payload)
      try {
        const webhookPayload = {
          name: formData.name,
          phoneNumber: formData.whatsapp.startsWith('+91') ? formData.whatsapp : `+91${formData.whatsapp}`
        };

        await fetch('https://server.wylto.com/webhook/Hacozq964ffmXsqE0y', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });

        console.log('✅ Dummy assessment webhook sent successfully');
      } catch (error) {
        console.error('❌ Failed to send dummy assessment webhook:', error);
      }

      // Send to Google Sheets and trigger email (email is now required)
      sendAtmResultsToGoogleSheets({
        testType: 'atm_preview',
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.whatsapp.startsWith('+91') ? formData.whatsapp : `+91${formData.whatsapp}`,
        pattern: result.pattern,
        confidence: result.confidence,
        explanation: details.explanation,
        neurological: details.neurological,
        impact: details.impact,
        microActionTitle: details.microAction.title,
        microActionDescription: details.microAction.description,
        eventId: Date.now().toString(),
      }).catch(err => {
        console.error('❌ Failed to send to Google Sheets:', err);
        // Don't block user experience if Google Sheets fails
      });

      // Track form submission - FIRES SECOND (dummy/preview flow = ₹0)
      trackFormSubmission('lead', {
        name: formData.name,
        phone: formData.whatsapp,
        email: formData.email,
        source: 'ATM Preview Results',
        value: 0.00,
        currency: 'INR',
      });

      // Track button click - FIRES THIRD
      trackButtonClick('ATM Form Submitted', 'form', 'atm_results');
    }
  };


  const handleInputChange = (field: string, value: string) => {
    if (field === 'whatsapp') {
      // Only allow digits and limit to 10 characters
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      {/* Loading Animation */}
      {showLoadingAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto"
              />
            </div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl md:text-2xl text-white font-medium"
            >
              Analyzing the responses...
            </motion.p>
          </motion.div>
        </motion.div>
      )}

      {!showLoadingAnimation && (
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] pt-20">
      <header className="container mx-auto px-4 sm:px-6 py-4 flex justify-end items-center gap-3">
        {onUpgradeToFull && (
          <Button
            onClick={() => {
              trackButtonClick('Upgrade to Full Assessment', 'cta', 'dummy_results_header');
              onUpgradeToFull();
            }}
            size="sm"
            className="rounded-full bg-[#64CB81] hover:bg-[#4CAF50] text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm font-semibold px-6 py-2"
          >
            Get Full Assessment
          </Button>
        )}
        <Button
          onClick={() => {
            trackButtonClick('Retake Preview', 'cta', 'dummy_results_header');
            onRetake();
          }}
          variant="outline"
          size="sm"
          className="rounded-full bg-white/30 backdrop-blur-md border border-white/30 hover:bg-white/40 text-white shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium px-4 py-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake Quiz
        </Button>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 text-center bg-white/30 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl sm:rounded-3xl">
            <Badge className="mb-4 sm:mb-6 text-white bg-[#64CB81] border-none px-4 py-2 text-sm font-medium rounded-full">
              Your Anxiety Pattern
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">{result.pattern}</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">{details.explanation}</p>
          </Card>
        </motion.div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card className="p-4 sm:p-6 h-full bg-white/30 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#64CB81] flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg sm:text-xl">Why It Happens</h3>
              </div>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">{details.neurological}</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Card className="p-4 sm:p-6 h-full bg-white/30 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#64CB81] flex items-center justify-center">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg sm:text-xl">Common Impacts</h3>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {details.impact.map((item, index) => (
                  <Badge
                    key={index}
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Micro Action Section - Blurred if form not submitted */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.6 }}
          className={`relative ${!isFormSubmitted ? 'filter blur-lg' : ''}`}
        >
          <Card className="p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 bg-white/30 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl shadow-lg relative">
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#64CB81] flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-lg sm:text-xl font-bold text-white">💡</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3">{details.microAction.title}</h3>
                <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed">{details.microAction.description}</p>
              </div>
            </div>
          </Card>
          
          {/* Unlock Overlay */}
          {!isFormSubmitted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-lg rounded-xl sm:rounded-2xl">
              <Card className="p-8 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg border-2 border-white/40 rounded-2xl shadow-2xl max-w-md mx-4 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#64CB81] to-[#4CAF50] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-xl mb-3 leading-tight">Unlock Your Full Analysis</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                    Your assessment is complete and your personal report is ready.
                    <br /><br />
                    To deliver your detailed result securely and privately, we link it to your WhatsApp number and email. This allows us to send you your complete PDF report and ensures you can access it again anytime.
                    <br /><br />
                    <span className="font-semibold">Your information is safe with us</span>
                    <br /><br />
                    Enter your details below to unlock your full result.
                  </p>
                  <Button
                    onClick={() => {
                      setShowFormPopup(true);
                      setFormPopupClosedTime(null); // Reset the timer
                    }}
                    className="w-full bg-gradient-to-r from-[#64CB81] to-[#4CAF50] text-white hover:from-[#4CAF50] hover:to-[#64CB81] rounded-xl py-3 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Submit Details to Unlock
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
          <Card className="p-6 sm:p-8 lg:p-10 text-center bg-white/30 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl shadow-lg">
            <p className="text-lg sm:text-xl lg:text-2xl text-white mb-6 sm:mb-8 font-medium leading-relaxed">{details.cta}</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl text-white mb-6 sm:mb-8 font-bold">Ready to take your next step?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
              <Button
                onClick={() => {
                  trackButtonClick('Book Free Clarity Call', 'cta', 'atm_results_bottom');
                  window.location.href = '/contact';
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-[#64CB81] text-white hover:bg-[#64CB81]/90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm sm:text-base"
              >
                Book Free Clarity Call
              </Button>
              <Button
                onClick={() => {
                  trackButtonClick('Chat Now on WhatsApp', 'cta', 'atm_results_bottom');
                  window.open('https://wa.me/917021227203?text=' + encodeURIComponent('Hi! I completed my ATM assessment and would like to chat.'), '_blank', 'noopener,noreferrer');
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-white text-[#096b17] border border-white/20 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Chat
              </Button>
              <Button
                onClick={() => {
                  trackButtonClick('Our Mental Health Team', 'cta', 'atm_results_bottom');
                  const el = document.getElementById('team');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.location.assign('/#mental-health-team');
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-white text-[#096b17] border border-white/20 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base"
              >
                Our Team
              </Button>
              <Button
                onClick={() => {
                  trackButtonClick('Book Consultation Now', 'cta', 'atm_results_bottom');
                  const el = document.getElementById('home');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.location.assign('/#home');
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-white text-[#096b17] border border-white/20 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base"
              >
                Book Consultation
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Form Popup Overlay - MANDATORY (cannot be closed) */}
      <AnimatePresence>
        {showFormPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 sm:p-5">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Your Clinical Analysis Is Ready</h3>
                </div>

                <div className="text-sm text-gray-600 mb-4 leading-relaxed space-y-4">
                  <p>Your assessment has been completed and a detailed analysis has been generated.</p>

                  <p>Because these results involve psychological and behavioral patterns, CuraGo does not release them as a standalone report. Interpreting such findings without context can lead to misunderstanding or unnecessary distress.</p>

                  <p>As part of our medical protocol, a CuraGo Care Expert reviews the results with you personally to ensure they are explained accurately and responsibly.</p>

                  <p>To proceed, please verify your WhatsApp number and email. This allows us to:</p>

                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Securely link your report to you</li>
                    <li>Schedule a brief clinical callback</li>
                    <li>Review your results and clarify the appropriate next steps</li>
                  </ol>

                  <p>Your information is confidential and handled strictly as part of your care.</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3">
                  {/* Name Field */}
                  <div>
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-gray-500 mr-2" />
                      <label className="text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border  focus:ring-2 focus:ring-[#64CB81] focus:border-[#64CB81] outline-none transition-colors ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>

                  {/* WhatsApp Field */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <label className="text-sm font-medium text-gray-700">
                        WhatsApp Number *
                      </label>
                    </div>
                    <div className="flex  overflow-hidden">
                      <span className="inline-flex items-center px-3 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm font-medium">
                        +91
                      </span>
                      <input
                        type="text"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#64CB81] focus:border-[#64CB81] outline-none transition-colors ${
                          formErrors.whatsapp ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter 10-digit number"
                        maxLength={10}
                      />
                    </div>
                    {formErrors.whatsapp && <p className="text-red-500 text-sm mt-1">{formErrors.whatsapp}</p>}
                  </div>

                  {/* Email Field */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <label className="text-sm font-medium text-gray-700">
                        Email Address *
                      </label>
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border  focus:ring-2 focus:ring-[#64CB81] focus:border-[#64CB81] outline-none transition-colors ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Preferred Callback Time Field */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 text-gray-500 mr-2" />
                      <label className="text-sm font-medium text-gray-700">
                        Preferred Callback Time
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.callbackTime}
                      onChange={(e) => handleInputChange('callbackTime', e.target.value)}
                      className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#64CB81] focus:border-[#64CB81] outline-none transition-colors ${
                        formErrors.callbackTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Morning 10-12, Evening 5-7"
                    />
                    {formErrors.callbackTime && <p className="text-red-500 text-sm mt-1">{formErrors.callbackTime}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#64CB81] text-white hover:bg-[#64CB81]/90 py-3 rounded-lg font-semibold text-base mt-6"
                  >
                    I AM READY FOR THE RESULTS
                  </Button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clarity Call Popup - Responsive Design */}
      <AnimatePresence>
        {showClarityCallPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowClarityCallPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md lg:max-w-lg xl:max-w-xl mx-4"
            >
              <div className="p-6 sm:p-8 lg:p-10 text-center">
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClarityCallPopup(false)}
                    className="rounded-full w-8 h-8 p-0 border-gray-200 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Logo from Navbar */}
                <div className="flex justify-center mb-6">
                  <img src="/Logo.svg?v=6" alt="CuraGo Logo" className="h-12 w-auto lg:h-16" />
                </div>


                <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-4 lg:mb-6">You've Taken a Big Step - Here's Your Next One</h3>
                <p className="text-gray-600 text-sm lg:text-base xl:text-lg mb-6 lg:mb-8 leading-relaxed px-2 lg:px-4">
                  Your results are now clear. If you'd like to understand what your results actually mean and what to do next, our team can guide you.<br /><br />
                  Just book a free clarity call and we will walk you through the whole process. This is the safest next step.
                </p>

                <div className="space-y-3 lg:space-y-4">
                  <Button
                    onClick={() => {
                      trackButtonClick('Book Free Clarity Call', 'popup', 'atm_results_clarity_popup');
                      window.location.href = '/contact';
                      setShowClarityCallPopup(false);
                    }}
                    className="w-full bg-[#64CB81] text-white cursor-pointer hover:bg-green-600 py-3 lg:py-4 rounded-lg font-semibold text-sm lg:text-base xl:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Phone className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                    Book Free Clarity Call
                  </Button>

                  <Button
                    onClick={() => {
                      trackButtonClick('Mental Health Team', 'popup', 'atm_results_clarity_popup');
                      window.location.href = '/team';
                      setShowClarityCallPopup(false);
                    }}
                    className="w-full bg-white border cursor-pointer border-gray-300 text-gray-800 hover:bg-gray-50 py-3 lg:py-4 rounded-lg font-medium text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Mental Health Team
                  </Button>

                  <Button
                    onClick={() => {
                      trackButtonClick('Book Appointment', 'popup', 'atm_results_clarity_popup');
                      window.location.href = '/contact';
                      setShowClarityCallPopup(false);
                    }}
                    className="w-full bg-white border cursor-pointer border-gray-300 text-gray-800 hover:bg-gray-50 py-3 lg:py-4 rounded-lg font-medium text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Book Appointment
                  </Button>

                  <Button
                    onClick={() => {
                      trackButtonClick('Chat on WhatsApp', 'popup', 'atm_results_clarity_popup');
                      window.open('https://wa.me/917021227203?text=' + encodeURIComponent('Hi! I completed my ATM assessment and would like to chat.'), '_blank', 'noopener,noreferrer');
                      setShowClarityCallPopup(false);
                    }}
                    className="w-full py-3 lg:py-4 rounded-lg font-medium text-sm lg:text-base bg-white border border-gray-300 text-gray-800 cursor-pointer hover:bg-gray-50 transition-all duration-300"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-2.462-.96-4.779-2.705-6.526-1.746-1.746-4.065-2.711-6.526-2.713-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.092-.634zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414l-.005.009z"/>
                    </svg>
                    Chat on WhatsApp
                  </Button>
                </div>

                {/* Additional Contact Options for Large Screens */}
                <div className="hidden lg:block mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-500 text-sm mb-4">Or contact us directly:</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => {
                        trackButtonClick('Chat Now on WhatsApp', 'popup', 'atm_results_clarity_popup');
                        window.open('https://wa.me/917021227203?text=' + encodeURIComponent('Hi! I completed my ATM assessment and would like to chat.'), '_blank', 'noopener,noreferrer');
                        setShowClarityCallPopup(false);
                      }}
                      variant="outline"
                      className="flex-1 py-2.5 rounded-lg font-medium text-sm border-green-300 text-green-600 hover:bg-green-50 transition-all duration-300"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={() => {
                        trackPhoneClick('atm_results_clarity_popup');
                        window.open('tel:+917021227203', '_self');
                        setShowClarityCallPopup(false);
                      }}
                      variant="outline"
                      className="flex-1 py-2.5 rounded-lg font-medium text-sm border-blue-300 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Acknowledgment Popup */}
      <AnimatePresence>
        {showAcknowledgmentPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Thank You</h3>
              <div className="space-y-3 text-gray-700">
                <p>You will receive the <strong>ATM Tool Analysis Report PDF</strong> on your mail/WhatsApp number.</p>
                <p>Sit tight and our CuraGo Care Expert will call you at your preferred time.</p>
                <p className="text-sm italic mt-4">*If you haven't received the PDF, do reach out to us</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Buttons */}
      <FloatingButtons onBookNow={handleBookNow} hideButtons={showFormPopup || showClarityCallPopup} />
    </div>
      )}
    </>
  );
}