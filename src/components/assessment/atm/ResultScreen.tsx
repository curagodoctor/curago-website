import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { AtmAnswers, UserInfo, AnxietyPattern } from '../../../types/atm';
import { trackButtonClick, trackPhoneClick, trackFormSubmission } from '../../../utils/tracking';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap, Brain, Shield, Target, Clock, AlertTriangle, MessageCircle, X, Phone, User, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { FloatingButtons } from '../../FloatingButtons';
import { sendAtmResultsToGoogleSheets } from '../../../utils/googleSheets';

// ---------- GTM tracking helpers ----------
function simpleHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  const base36 = Math.abs(h).toString(36);
  return base36.slice(0, 6).padEnd(6, '0');
}
const now = () => Date.now();
const secs = (ms: number) => Math.round(ms / 1000);

const dlPush = (obj: Record<string, any>) => {
  try {
    // GTM DataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      page_path: window.location.pathname + window.location.search + window.location.hash,
      timestamp: new Date().toISOString(),
      ...obj,
    });
    
    // Meta Pixel equivalent
    if ((window as any).fbq && obj.event) {
      const eventName = obj.event.replace('atm_results_', '').replace('atm_', '');
      const metaEventName = `ATM_${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;
      
      (window as any).fbq('trackCustom', metaEventName, {
        atm_event_id: obj.atm_event_id,
        event_type: obj.event,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...obj,
      });
      
      console.log('✅ Meta Pixel: ATM event sent -', metaEventName, obj.atm_event_id);
    }
  } catch (e) {
    console.warn('❌ ATM tracking error:', e);
  }
};

interface ResultScreenProps {
  answers: AtmAnswers;
  userInfo: UserInfo;
  onRetake: () => void;
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

// ---- Analyzing Animation Component ----
function AnalyzingAnimation({ userName }: { userName: string }) {
  const [stage, setStage] = useState(0);

  const stages = [
    'Processing your responses...',
    'Analyzing anxiety patterns...',
    'Mapping trigger architecture...',
    'Calculating loop dynamics...',
    'Generating your report...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F5F5DC', fontFamily: 'Poppins, sans-serif' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl p-8 md:p-12 border-2 shadow-2xl" style={{ borderColor: 'rgba(9, 107, 23, 0.2)' }}>
          <div className="text-center space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Brain className="w-16 h-16 text-[#096b17]" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#096b17]">
                Analyzing Your Responses
              </h2>
              <p className="text-lg text-[#096b17]">
                Hi {userName}, we're creating your personalized ATM report
              </p>
            </div>

            {/* Progress Stages */}
            <div className="space-y-3">
              {stages.map((text, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= stage ? 1 : 0.3,
                    x: 0
                  }}
                  className="flex items-center gap-3 text-left"
                >
                  {index < stage ? (
                    <CheckCircle2 className="w-5 h-5 text-[#096b17] flex-shrink-0" />
                  ) : index === stage ? (
                    <Loader2 className="w-5 h-5 text-[#096b17] flex-shrink-0 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: 'rgba(9, 107, 23, 0.3)' }} />
                  )}
                  <span
                    className={`text-sm md:text-base ${index <= stage ? 'font-medium' : ''}`}
                    style={{ color: index <= stage ? '#096b17' : 'rgba(9, 107, 23, 0.5)' }}
                  >
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Loading Bar */}
            <div className="relative">
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F5F5DC' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(to right, #096b17, #075110)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${((stage + 1) / stages.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Info Text */}
            <p className="text-sm" style={{ color: 'rgba(9, 107, 23, 0.7)' }}>
              This usually takes 5-10 seconds. Please don't close this window.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResultScreen({ answers, userInfo, onRetake }: ResultScreenProps) {
  const result = useMemo(() => determineAnxietyPattern(answers), [answers]);
  const details = patternDetails[result.pattern];
  const { Icon, color } = details;

  // GTM tracking state
  const eventIdRef = useRef(simpleHash(JSON.stringify(answers) + Date.now()));
  const startTimeRef = useRef(now());
  const scrollTrackedRef = useRef(new Set<number>());
  const lastHeartbeatRef = useRef(now());

  // Form and popup states
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [showClarityCallPopup, setShowClarityCallPopup] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
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

  // GTM tracking effects
  useEffect(() => {
    // ✅ Test Finish Event - Comprehensive payload with assessment data (₹0 value)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'test_finish',
      test_type: 'atm_tool',
      proxy_value: 0,
      currency: 'INR',
      // REQUIRED: Unique event ID for deduplication
      event_id: eventIdRef.current,
      // REQUIRED FOR HIGH MATCH RATE: User data for CAPI matching (will be populated after form submission)
      user_data: {
        email_address: '',
        phone_number: '',
        external_id: eventIdRef.current
      },
      // Assessment Results
      atm_event_id: eventIdRef.current,
      pattern: result.pattern,
      confidence: result.confidence,
      // Detailed Information
      explanation: details.explanation,
      neurological: details.neurological,
      impact: details.impact.join(', '),
      micro_action_title: details.microAction.title,
      micro_action_description: details.microAction.description,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ test_finish event pushed to dataLayer (ATM, ₹10) with full results');

    // Heartbeat tracking
    const heartbeatInterval = setInterval(() => {
      dlPush({
        event: 'atm_results_heartbeat',
        atm_event_id: eventIdRef.current,
        elapsed_s: secs(now() - startTimeRef.current),
      });
      lastHeartbeatRef.current = now();
    }, 30000);

    // Scroll tracking
    const handleScroll = () => {
      const scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      const milestones = [25, 50, 75, 90];
      
      for (const milestone of milestones) {
        if (scrollPct >= milestone && !scrollTrackedRef.current.has(milestone)) {
          scrollTrackedRef.current.add(milestone);
          dlPush({
            event: 'atm_results_scroll',
            atm_event_id: eventIdRef.current,
            scroll_pct: milestone,
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('scroll', handleScroll);
      
      // Time spent tracking
      dlPush({
        event: 'atm_results_time_spent',
        atm_event_id: eventIdRef.current,
        total_time_s: secs(now() - startTimeRef.current),
        max_scroll_pct: Math.max(...Array.from(scrollTrackedRef.current), 0),
      });
    };
  }, [result.pattern, result.confidence]);

  // Show first popup after 1 second
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

  // Show clarity call popup 10 seconds after form submission (result unlock)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isFormSubmitted) {
      // Start timer immediately when form is submitted
      timer = setTimeout(() => {
        setShowClarityCallPopup(true);
      }, 10000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFormSubmitted]);

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

      // Send webhook with form data and ATM results - FIRES FIRST
      try {
        const webhookPayload = {
          action: "atm_assessment",
          contact: {
            name: formData.name,
            whatsapp: formData.whatsapp.startsWith('+91') ? formData.whatsapp : `+91${formData.whatsapp}`,
            email: formData.email || ""
          },
          assessment: {
            type: "ATM",
            pattern: result.pattern,
            confidence: result.confidence,
            answers: answers,
            explanation: details.explanation,
            neurological: details.neurological,
            impact: details.impact,
            microAction: details.microAction,
            cta: details.cta
          },
          timestamp: new Date().toISOString()
        };

        await fetch('https://server.wylto.com/webhook/vSO7svt3bkRXqvZWUa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });

        console.log('✅ ATM assessment webhook sent successfully');
      } catch (error) {
        console.error('❌ Failed to send ATM assessment webhook:', error);
      }

      // Send to Google Sheets and trigger email (email is now required)
      sendAtmResultsToGoogleSheets({
        testType: 'atm_tool',
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
        eventId: eventIdRef.current,
      }).catch(err => {
        console.error('❌ Failed to send to Google Sheets:', err);
        // Don't block user experience if Google Sheets fails
      });

      // Track form submission - FIRES SECOND (₹0 value for preview/dummy flow)
      trackFormSubmission('lead', {
        name: formData.name,
        phone: formData.whatsapp,
        email: formData.email,
        source: 'ATM Assessment Results',
        value: 0.00,
        currency: 'INR',
      });

      // Track button click - FIRES THIRD
      trackButtonClick('ATM Form Submitted', 'form', 'atm_results');

      // Small delay to ensure other events fire first
      setTimeout(() => {
        // ✅ Result Unlock Event (₹0 value) - High-value signal - FIRES LAST
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'guard_rail_unlock',
          test_type: 'atm_tool_form_submit',
          proxy_value: 0,
          currency: 'INR',
          // PII Data for Advanced Matching
          userEmail: formData.email || '',
          userPhone: formData.whatsapp.startsWith('+91') ? formData.whatsapp.slice(3) : formData.whatsapp,
          transactionId: `GR-ATM-${Date.now()}`,
          page_path: window.location.pathname,
          atm_event_id: eventIdRef.current,
          pattern: result.pattern,
        });
        console.log('✅ guard_rail_unlock event pushed to dataLayer (ATM, ₹350) - FINAL EVENT');
      }, 100);
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
      {showLoadingAnimation && <AnalyzingAnimation userName={userInfo.name} />}

      {!showLoadingAnimation && (
    <div className="min-h-screen bg-[#F5F5DC] pt-20" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <header className="container mx-auto px-4 sm:px-6 py-4 flex justify-end items-center">
        <Button
          onClick={() => {
            dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Retake' });
            trackButtonClick('Retake ATM', 'cta', 'atm_results_header');
            onRetake();
          }}
          variant="outline"
          size="sm"
          className="rounded-xl bg-white border-2 border-[#096b17]/20 hover:bg-[#F5F5DC] hover:border-[#096b17] shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium px-4 py-2" style={{ color: '#096b17' }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake Quiz
        </Button>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 text-center bg-white border border-[#E5E7EB] shadow-xl rounded-2xl sm:rounded-3xl">
            <Badge className="mb-4 sm:mb-6 text-white bg-gradient-to-r from-[#096b17] to-[#075110] border-none px-4 py-2 text-sm font-medium rounded-full">
              Your Anxiety Pattern
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A0A0A] mb-4 sm:mb-6 leading-tight">{result.pattern}</h1>
            <p className="text-base sm:text-lg md:text-xl text-[#3A3A3A] max-w-3xl mx-auto leading-relaxed">{details.explanation}</p>
          </Card>
        </motion.div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card className="p-4 sm:p-6 h-full bg-white border border-[#E5E7EB] rounded-xl sm:rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#096b17] to-[#075110] flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="font-bold text-[#0A0A0A] text-lg sm:text-xl">Why It Happens</h3>
              </div>
              <p className="text-sm sm:text-base text-[#3A3A3A] leading-relaxed">{details.neurological}</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Card className="p-4 sm:p-6 h-full bg-white border border-[#E5E7EB] rounded-xl sm:rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#096b17] to-[#075110] flex items-center justify-center">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="font-bold text-[#0A0A0A] text-lg sm:text-xl">Common Impacts</h3>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {details.impact.map((item, index) => (
                  <Badge
                    key={index}
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium bg-[#F5F5DC] text-[#096b17] border border-[#E5E7EB]"
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
          <Card className="p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 bg-white border border-[#E5E7EB] rounded-xl sm:rounded-2xl shadow-lg relative">
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#096b17] to-[#075110] flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-lg sm:text-xl font-bold text-white">💡</span>
              </div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3">{details.microAction.title}</h3>
                <p className="text-sm sm:text-base lg:text-lg text-[#3A3A3A] leading-relaxed">{details.microAction.description}</p>
              </div>
            </div>
          </Card>

          {/* Unlock Overlay */}
          {!isFormSubmitted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-lg rounded-xl sm:rounded-2xl">
              <Card className="p-8 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg border-2 border-white/40 rounded-2xl shadow-2xl max-w-md mx-4 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#096b17] to-[#075110] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-xl mb-3 leading-tight">Unlock Your Micro Action</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">Submit your details to reveal your personalized strategy for managing anxiety</p>
                  <Button
                    onClick={() => {
                      setShowFormPopup(true);
                    }}
                    className="w-full bg-[#096b17] text-white hover:bg-[#075110] rounded-xl py-3 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Submit Details to Unlock
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
          <Card className="p-6 sm:p-8 lg:p-10 text-center bg-white border border-[#E5E7EB] rounded-xl sm:rounded-2xl shadow-lg">
            <p className="text-lg sm:text-xl lg:text-2xl text-[#0A0A0A] mb-6 sm:mb-8 font-medium leading-relaxed">{details.cta}</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl text-[#0A0A0A] mb-6 sm:mb-8 font-bold">Ready to take your next step?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
              <Button
                onClick={() => {
                  dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Book Free Clarity Call' });
                  trackButtonClick('Book Free Clarity Call', 'cta', 'atm_results_bottom');
                  window.location.href = '/contact';
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-[#096b17] text-white hover:bg-[#075110] shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm sm:text-base"
              >
                Book Free Clarity Call
              </Button>
              <Button
                onClick={() => {
                  dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Chat Now on WhatsApp' });
                  trackButtonClick('Chat Now on WhatsApp', 'cta', 'atm_results_bottom');
                  window.open('https://wa.me/917021227203?text=' + encodeURIComponent('Hi! I completed my ATM assessment and would like to chat.'), '_blank', 'noopener,noreferrer');
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-white border-2 border-[#096b17]/20 hover:bg-[#F5F5DC] hover:border-[#096b17] transition-all duration-300 font-semibold text-sm sm:text-base" style={{ color: '#096b17' }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Chat
              </Button>
              <Button
                onClick={() => {
                  dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Our Mental Health Team' });
                  trackButtonClick('Our Mental Health Team', 'cta', 'atm_results_bottom');
                  const el = document.getElementById('team');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.location.assign('/#mental-health-team');
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-white border-2 border-[#096b17]/20 hover:bg-[#F5F5DC] hover:border-[#096b17] transition-all duration-300 font-semibold text-sm sm:text-base" style={{ color: '#096b17' }}
              >
                Our Team
              </Button>
              <Button
                onClick={() => {
                  dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Book Consultation Now' });
                  trackButtonClick('Book Consultation Now', 'cta', 'atm_results_bottom');
                  const el = document.getElementById('home');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.location.assign('/#home');
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-white border-2 border-[#096b17]/20 hover:bg-[#F5F5DC] hover:border-[#096b17] transition-all duration-300 font-semibold text-sm sm:text-base" style={{ color: '#096b17' }}
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
                      className={`w-full px-4 py-3 border  focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
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
                        className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
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
                      className={`w-full px-4 py-3 border  focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
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
                      className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
                        formErrors.callbackTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Morning 10-12, Evening 5-7"
                    />
                    {formErrors.callbackTime && <p className="text-red-500 text-sm mt-1">{formErrors.callbackTime}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#096b17] text-white hover:bg-[#075110] py-3 rounded-xl font-semibold text-base mt-6"
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

                <h3 className="text-2xl md:text-3xl font-bold text-[#0A0A0A] mb-8">
                  Are you ready for the full assessment?
                </h3>

                <div className="space-y-4">
                  {/* Yes, start assessment - Razorpay Button */}
                  <Button
                    onClick={() => {
                      // Track initiate checkout event
                      window.dataLayer = window.dataLayer || [];
                      window.dataLayer.push({
                        event: 'initiatecheckout',
                        test_type: 'atm_tool',
                        amount: 299,
                        currency: 'INR',
                        page_path: window.location.pathname,
                        timestamp: new Date().toISOString(),
                      });
                      console.log('✅ initiatecheckout event pushed to dataLayer (ATM Tool, ₹299)');

                      // Open Razorpay payment link
                      const paymentUrl = 'https://razorpay.com/payment-button/pl_Rtue8bSVIson8p/view/?amount=29900';
                      window.open(paymentUrl, '_blank');
                    }}
                    size="lg"
                    className="w-full bg-[#096b17] text-white hover:bg-[#075110] border-0 px-8 h-14 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Yes, start assessment
                  </Button>

                  {/* Chat with us Button */}
                  <Button
                    onClick={() => {
                      trackButtonClick('Chat with us', 'popup', 'atm_results_clarity_popup');
                      window.open('https://wa.me/917021227203?text=' + encodeURIComponent('Hi! I completed my ATM assessment and would like to chat.'), '_blank', 'noopener,noreferrer');
                    }}
                    variant="outline"
                    size="lg"
                    className="w-full bg-white hover:bg-[#F5F5DC] border-2 border-[#096b17]/20 hover:border-[#096b17] px-8 h-14 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl" style={{ color: '#096b17' }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat with us
                  </Button>
                </div>
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