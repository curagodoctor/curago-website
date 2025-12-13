import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { AtmAnswers, UserInfo, AnxietyPattern } from '../../../types/atm';
import { trackButtonClick, trackPhoneClick, trackFormSubmission } from '../../../utils/tracking';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap, Brain, Shield, Target, Clock, AlertTriangle, MessageCircle, X, Phone, User, Mail } from 'lucide-react';
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

  // GTM tracking state
  const eventIdRef = useRef(simpleHash(JSON.stringify(answers) + Date.now()));
  const startTimeRef = useRef(now());
  const scrollTrackedRef = useRef(new Set<number>());
  const lastHeartbeatRef = useRef(now());

  // Form and popup states
  const [showFormPopup, setShowFormPopup] = useState(false); // Always false for dummy - no form popup
  const [showClarityCallPopup, setShowClarityCallPopup] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formPopupClosedTime, setFormPopupClosedTime] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: ''
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
    // ✅ Test Finish Event - Comprehensive payload with assessment data (₹10 value)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'dummy_done',
      test_type: 'atm_preview',
      proxy_value: 0.00,
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
    console.log('✅ dummy_done event pushed to dataLayer (ATM Preview, ₹0) with full results');

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

  // Show first popup after 0.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFormPopup(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Show clarity call popup 8 seconds after first popup is closed (or after 8 seconds if not opened)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (formPopupClosedTime) {
      // If form popup was closed, start timer from that moment
      timer = setTimeout(() => {
        setShowClarityCallPopup(true);
      }, 8000);
    } else {
      // If form popup was never opened, show after 8 seconds total
      timer = setTimeout(() => {
        if (!showFormPopup && !isFormSubmitted) {
          setShowClarityCallPopup(true);
        }
      }, 8000);
    }

    return () => clearTimeout(timer);
  }, [formPopupClosedTime, showFormPopup, isFormSubmitted]);

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

    // Email is optional, but validate format if provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsFormSubmitted(true);
      setShowFormPopup(false);
      setFormPopupClosedTime(Date.now());

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
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] pt-20">
      <header className="container mx-auto px-4 sm:px-6 py-4 flex justify-end items-center gap-3">
        {onUpgradeToFull && (
          <Button
            onClick={() => {
              dlPush({ event: 'dummy_upgrade_click', atm_event_id: eventIdRef.current });
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
            dlPush({ event: 'dummy_results_retake_click', atm_event_id: eventIdRef.current });
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
                  dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Book Free Clarity Call' });
                  trackButtonClick('Book Free Clarity Call', 'cta', 'atm_results_bottom');
                  window.location.href = '/contact';
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-[#64CB81] text-white hover:bg-[#64CB81]/90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm sm:text-base"
              >
                Book Free Clarity Call
              </Button>
              <Button
                onClick={() => {
                  dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Chat Now on WhatsApp' });
                  trackButtonClick('Chat Now on WhatsApp', 'cta', 'atm_results_bottom');
                  window.open('https://wa.me/918062179639?text=' + encodeURIComponent('Hi! I completed my ATM assessment and would like to chat.'), '_blank', 'noopener,noreferrer');
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-white text-[#096b17] border border-white/20 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base"
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
                className="w-full h-12 sm:h-14 rounded-xl bg-white text-[#096b17] border border-white/20 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 sm:p-5">
                <div className="mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">Unlock Your Full Analysis</h3>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-snug">
                  Your assessment is complete and your personal report is ready.
                  <br /><br />
                  To deliver your detailed result securely and privately, we link it to your WhatsApp number and email. This allows us to send you your complete PDF report and ensures you can access it again anytime.
                  <br /><br />
                  <span className="font-semibold">Your information is safe with us</span>
                  <br /><br />
                  Enter your details below to unlock your full result.
                </p>

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
                        Email Address
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
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
                      // ✅ Clarity Call CTA Click (₹350 value intent)
                      window.dataLayer = window.dataLayer || [];
                      window.dataLayer.push({
                        event: 'contact_form_submission',
                        form_type: 'clarity_call_cta_click',
                        proxy_value: 350.00,
                        currency: 'INR',
                        page_path: window.location.pathname,
                        source: 'atm_clarity_popup',
                        atm_event_id: eventIdRef.current,
                        pattern: result.pattern,
                      });
                      console.log('✅ contact_form_submission event (CTA click) pushed to dataLayer (₹350)');

                      dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Book Free Clarity Call (popup)' });
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
                      dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Mental Health Team (popup)' });
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
                      dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Book Appointment (popup)' });
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
                      dlPush({ event: 'atm_results_cta_click', atm_event_id: eventIdRef.current, label: 'Chat on WhatsApp (popup)' });
                      trackButtonClick('Chat on WhatsApp', 'popup', 'atm_results_clarity_popup');
                      window.open('https://wa.me/918062179639?text=' + encodeURIComponent('Hi! I completed my ATM assessment and would like to chat.'), '_blank', 'noopener,noreferrer');
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
                        window.open('https://wa.me/918062179639?text=' + encodeURIComponent('Hi! I completed my ATM assessment and would like to chat.'), '_blank', 'noopener,noreferrer');
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
                        window.open('tel:+918062179639', '_self');
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
      
      {/* Floating Buttons */}
      <FloatingButtons onBookNow={handleBookNow} hideButtons={showFormPopup || showClarityCallPopup} />
    </div>
  );
}