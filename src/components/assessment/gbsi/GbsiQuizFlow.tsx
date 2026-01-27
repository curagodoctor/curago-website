import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import RcSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, Mail, Phone, Copy, Download, Share2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import type { GbsiAnswers, GbsiUserInfo, AgeRange, AlarmingSign, FamilyHistory, PainFrequency, ReliefFactor, BristolType, RefluxFrequency, FullnessFactor, FattyLiver, BrainFog } from '../../../types/gbsi';

interface GbsiQuizFlowProps {
  onComplete: (answers: GbsiAnswers, userInfo: GbsiUserInfo, paymentId: string) => void;
}

export default function GbsiQuizFlow({ onComplete }: GbsiQuizFlowProps) {
  const [showCredentialsScreen, setShowCredentialsScreen] = useState(true);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [userInfo, setUserInfo] = useState<GbsiUserInfo>({ name: '', whatsapp: '', email: '' });
  const [formErrors, setFormErrors] = useState({ name: '', whatsapp: '', email: '' });

  // Payment verification states
  const [hasValidUUID, setHasValidUUID] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<{ email: string; contact: string } | null>(null);
  const [quizAlreadyTaken, setQuizAlreadyTaken] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string>('');

  // Valid UUID for accessing the quiz
  const VALID_UUID = 'gbsi-2024-f3c9b8e4-a2d4-4c6a-9f21-8c7e5b2d1a94';

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<GbsiAnswers>>({
    alarmingSigns: [],
    familyHistory: [],
    dietaryHabits: {
      lateNightDinners: false,
      highCaffeine: false,
      frequentJunk: false,
      skipBreakfast: false,
    },
  });
  const startedRef = useRef(false);

  const totalQuestions = 12;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Check for UUID and payment_id in URL params and verify payment
  useEffect(() => {
    const verifyAccessAndPayment = async () => {
      // Parse URL parameters
      const urlString = window.location.href;
      const queryStart = urlString.indexOf('?');

      if (queryStart === -1) {
        setHasValidUUID(false);
        setIsVerifyingPayment(false);
        return;
      }

      // Get everything after first '?' and replace additional '?' with '&'
      const queryString = urlString.substring(queryStart + 1).replace(/\?/g, '&');
      const urlParams = new URLSearchParams(queryString);

      const uuid = urlParams.get('uuid');
      const paymentId = urlParams.get('payment_id');

      console.log('URL params:', { uuid, paymentId });

      // Check UUID first
      if (uuid !== VALID_UUID) {
        setHasValidUUID(false);
        setIsVerifyingPayment(false);
        return;
      }

      setHasValidUUID(true);

      // Check if payment_id is provided
      if (!paymentId) {
        setPaymentError('Payment ID not found. Please complete the payment first.');
        setIsVerifyingPayment(false);
        return;
      }

      setCurrentPaymentId(paymentId);

      // Check if quiz has already been completed with this payment_id
      try {
        const completionCheckResponse = await fetch('/api/google-sheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'check_completion',
            payment_id: paymentId
          }),
        });

        const completionData = await completionCheckResponse.json();
        console.log('Completion check response:', completionData);

        if (completionData.success && completionData.completed) {
          console.log('⚠️ Quiz already completed with this payment_id');
          setQuizAlreadyTaken(true);
          setIsVerifyingPayment(false);
          return;
        }
      } catch (error) {
        console.error('Error checking quiz completion:', error);
        // Continue with payment verification even if completion check fails
      }

      // Verify payment with backend
      try {
        console.log('Verifying payment:', paymentId);

        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ payment_id: paymentId }),
        });

        const data = await response.json();

        console.log('Payment verification response:', data);

        if (data.success && data.valid) {
          setPaymentVerified(true);
          // Store payment details for validation
          if (data.payment?.email && data.payment?.contact) {
            setPaymentDetails({
              email: data.payment.email,
              contact: data.payment.contact
            });
          }
          console.log('✅ Payment verified successfully');
        } else {
          setPaymentError(
            data.payment?.status === 'failed'
              ? 'Payment failed. Please try again.'
              : 'Payment not completed. Please complete the payment to access the quiz.'
          );
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentError('Unable to verify payment. Please try again or contact support.');
      } finally {
        setIsVerifyingPayment(false);
      }
    };

    verifyAccessAndPayment();
  }, []);

  // Fire GTM event when quiz starts
  useEffect(() => {
    if (!startedRef.current && !showUserInfoForm && !showCredentialsScreen) {
      startedRef.current = true;
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'gbsi_quiz_start',
        page_path: window.location.pathname,
        gbsi_stage: 'start',
      });
      console.log('🧠 gbsi_quiz_start event pushed to dataLayer');
    }
  }, [showUserInfoForm, showCredentialsScreen]);

  // Form validation
  const validateUserInfoForm = (): boolean => {
    const errors = { name: '', whatsapp: '', email: '' };
    let isValid = true;

    if (!userInfo.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!userInfo.whatsapp.trim()) {
      errors.whatsapp = 'WhatsApp number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(userInfo.whatsapp.trim())) {
      errors.whatsapp = 'Please enter a valid 10-digit number';
      isValid = false;
    }

    if (!userInfo.email || !userInfo.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email.trim())) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUserInfoForm()) {
      setShowUserInfoForm(false);
      // Start the quiz directly
    }
  };

  const handleStartTest = () => {
    setShowCredentialsScreen(false);
    setShowUserInfoForm(true);
  };

  const handleStartLater = () => {
    window.location.href = '/gbsi';
  };

  const handleInputChange = (field: keyof GbsiUserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = () => {
    const testUrl = window.location.href;

    navigator.clipboard.writeText(testUrl).then(() => {
      alert('Access link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy. Please copy manually.');
    });
  };

  // Download credentials as text file
  const handleDownloadCredentials = () => {
    const testUrl = window.location.href;
    const credentials = `${testUrl}`;

    const blob = new Blob([credentials], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GBSI-Access-Link.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Share credentials using Web Share API
  const handleShareCredentials = async () => {
    const testUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GBSI Assessment Access Link',
          text: `Access your GBSI Assessment here: ${testUrl}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Sharing is not supported on this browser. Please use Copy or Download instead.');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Quiz complete - submit with payment_id
      setIsSubmitting(true);
      onComplete(answers as GbsiAnswers, userInfo, currentPaymentId);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSingleAnswer = (callback: () => void) => {
    callback();
    setTimeout(() => {
      handleNext();
    }, 450);
  };

  const isQuestionAnswered = (): boolean => {
    switch (currentQuestion) {
      case 0: return !!answers.age;
      case 1: return answers.alarmingSigns && answers.alarmingSigns.length > 0;
      case 2: return answers.familyHistory && answers.familyHistory.length > 0;
      case 3: return !!answers.painFrequency;
      case 4: return !!answers.reliefFactor;
      case 5: return !!answers.bristolType;
      case 6: return !!answers.refluxFrequency;
      case 7: return !!answers.fullnessFactor;
      case 8: return !!answers.fattyLiver;
      case 9: return answers.stressLevel !== undefined && answers.stressLevel > 0;
      case 10: return !!answers.brainFog;
      case 11: return true; // Dietary habits - optional checkboxes
      default: return false;
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 0:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                What is your age range?
              </h2>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'under18', label: 'Under 18' },
                { value: '18-40', label: '18-40' },
                { value: '41-50', label: '41-50' },
                { value: 'over50', label: 'Over 50' },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSingleAnswer(() => setAnswers({ ...answers, age: option.value as AgeRange }))}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.age === option.value
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.age === option.value ? 'text-white' : ''
                  }`} style={answers.age === option.value ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                Do you have any of these alarming signs?
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Check all that apply</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'weightLoss', label: 'Unintended weight loss (>5kg in 6 months)' },
                { value: 'bloodInStool', label: 'Blood in stool or black/tarry stool' },
                { value: 'difficultySwallowing', label: 'Difficulty swallowing or feeling food "stuck"' },
                { value: 'persistentVomiting', label: 'Persistent vomiting' },
                { value: 'nightSymptoms', label: 'Symptoms that wake you up from deep sleep' },
                { value: 'none', label: 'None of the above' },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => {
                    const current = answers.alarmingSigns || [];
                    if (option.value === 'none') {
                      setAnswers({ ...answers, alarmingSigns: ['none'] });
                    } else {
                      const filtered = current.filter((s) => s !== 'none');
                      const updated = current.includes(option.value as AlarmingSign)
                        ? filtered.filter((s) => s !== option.value)
                        : [...filtered, option.value as AlarmingSign];
                      setAnswers({ ...answers, alarmingSigns: updated.length > 0 ? updated : ['none'] });
                    }
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.alarmingSigns?.includes(option.value as AlarmingSign)
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.alarmingSigns?.includes(option.value as AlarmingSign) ? 'text-white' : ''
                  }`} style={answers.alarmingSigns?.includes(option.value as AlarmingSign) ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                Family History
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Does any immediate family member have:</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'colorectalCancer', label: 'Colorectal Cancer' },
                { value: 'ibd', label: 'IBD (Ulcerative Colitis/Crohn\'s)' },
                { value: 'celiac', label: 'Celiac Disease' },
                { value: 'none', label: 'None' },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => {
                    const current = answers.familyHistory || [];
                    if (option.value === 'none') {
                      setAnswers({ ...answers, familyHistory: ['none'] });
                    } else {
                      const filtered = current.filter((h) => h !== 'none');
                      const updated = current.includes(option.value as FamilyHistory)
                        ? filtered.filter((h) => h !== option.value)
                        : [...filtered, option.value as FamilyHistory];
                      setAnswers({ ...answers, familyHistory: updated.length > 0 ? updated : ['none'] });
                    }
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.familyHistory?.includes(option.value as FamilyHistory)
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.familyHistory?.includes(option.value as FamilyHistory) ? 'text-white' : ''
                  }`} style={answers.familyHistory?.includes(option.value as FamilyHistory) ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                Pain Frequency
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>How often have you had abdominal pain in the last 3 months?</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'lessThanWeekly', label: 'Less than once a week' },
                { value: 'onceWeekly', label: 'Once a week' },
                { value: '2-3TimesWeekly', label: '2-3 times a week' },
                { value: 'daily', label: 'Daily' },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSingleAnswer(() => setAnswers({ ...answers, painFrequency: option.value as PainFrequency }))}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.painFrequency === option.value
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.painFrequency === option.value ? 'text-white' : ''
                  }`} style={answers.painFrequency === option.value ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                The Relief Factor
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Is your pain related to passing stool?</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'yes', label: 'Yes, it gets better/worse after' },
                { value: 'no', label: 'No relation' },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSingleAnswer(() => setAnswers({ ...answers, reliefFactor: option.value as ReliefFactor }))}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.reliefFactor === option.value
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.reliefFactor === option.value ? 'text-white' : ''
                  }`} style={answers.reliefFactor === option.value ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                Bristol Stool Chart
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Which best describes your typical stool?</p>
            </div>
            <div className="space-y-3 sm:space-y-4 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'type1', label: 'Type 1: Separate hard lumps (Severe Constipation)', image: '/type1.png' },
                { value: 'type2', label: 'Type 2: Sausage-like but lumpy (Mild Constipation)', image: '/type2.png' },
                { value: 'type3', label: 'Type 3: Like a sausage with cracks (Normal)', image: '/type3.png' },
                { value: 'type4', label: 'Type 4: Smooth and soft (Ideal)', image: '/type4.png' },
                { value: 'type5', label: 'Type 5: Soft blobs with clear edges (Lacking Fiber)', image: '/type5.png' },
                { value: 'type6', label: 'Type 6: Mushy with ragged edges (Mild Diarrhea)', image: '/type6.png' },
                { value: 'type7', label: 'Type 7: Watery, no solid pieces (Severe Diarrhea)', image: '/type7.png' },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSingleAnswer(() => setAnswers({ ...answers, bristolType: option.value as BristolType }))}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-3 sm:p-4 md:p-5 rounded-xl md:rounded-2xl transition-all duration-300 ${
                    answers.bristolType === option.value
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Image */}
                    <div className="shrink-0">
                      <img
                        src={option.image}
                        alt={option.label}
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                      />
                    </div>
                    {/* Label */}
                    <p className={`text-xs sm:text-sm md:text-base leading-relaxed font-medium text-left ${
                      answers.bristolType === option.value ? 'text-white' : ''
                    }`} style={answers.bristolType === option.value ? {} : { color: '#096b17' }}>
                      {option.label}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                Reflux/Acidity
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Do you experience burning in chest or a sour taste in mouth?</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'never', label: 'Never' },
                { value: 'occasionally', label: 'Occasionally' },
                { value: 'dailyNightly', label: 'Daily/Nightly' },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSingleAnswer(() => setAnswers({ ...answers, refluxFrequency: option.value as RefluxFrequency }))}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.refluxFrequency === option.value
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.refluxFrequency === option.value ? 'text-white' : ''
                  }`} style={answers.refluxFrequency === option.value ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                The Fullness Factor
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Do you feel "uncomfortably full" after a normal-sized meal?</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSingleAnswer(() => setAnswers({ ...answers, fullnessFactor: option.value as FullnessFactor }))}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.fullnessFactor === option.value
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.fullnessFactor === option.value ? 'text-white' : ''
                  }`} style={answers.fullnessFactor === option.value ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                Liver Health
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Have you been diagnosed with Fatty Liver (Grade 1/2/3)?</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'dontKnow', label: "I don't know" },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSingleAnswer(() => setAnswers({ ...answers, fattyLiver: option.value as FattyLiver }))}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.fattyLiver === option.value
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.fattyLiver === option.value ? 'text-white' : ''
                  }`} style={answers.fattyLiver === option.value ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                Stress Level
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Rate your current life/work stress (1-10)</p>
            </div>
            <div className="max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-xl border-2 border-[#096b17]/20">
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-block bg-[#096b17] text-white rounded-full w-20 h-20 flex items-center justify-center mb-4">
                      <span className="font-bold text-4xl">{answers.stressLevel || 5}</span>
                    </div>
                    <p className="text-lg font-semibold" style={{ color: '#096b17' }}>
                      {answers.stressLevel <= 3 ? 'Low Stress' : answers.stressLevel <= 6 ? 'Moderate Stress' : 'High Stress'}
                    </p>
                  </div>
                  <div className="w-full px-6 py-4">
                    <style>{`
                      .stress-slider .rc-slider-rail {
                        background-color: #d1d5db;
                        height: 12px;
                      }
                      .stress-slider .rc-slider-track {
                        background-color: #096b17;
                        height: 12px;
                      }
                      .stress-slider .rc-slider-handle {
                        width: 28px;
                        height: 28px;
                        margin-top: -8px;
                        background-color: #096b17;
                        border: 4px solid white;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        opacity: 1;
                      }
                      .stress-slider .rc-slider-handle:hover,
                      .stress-slider .rc-slider-handle:active,
                      .stress-slider .rc-slider-handle:focus {
                        border-color: white;
                        box-shadow: 0 4px 16px rgba(9, 107, 23, 0.5);
                      }
                    `}</style>
                    <RcSlider
                      value={answers.stressLevel || 5}
                      onChange={(value) => setAnswers({ ...answers, stressLevel: value as number })}
                      min={1}
                      max={10}
                      step={1}
                      className="stress-slider"
                    />
                  </div>
                  <div className="flex justify-between text-sm font-medium" style={{ color: '#096b17' }}>
                    <span>1 (Low)</span>
                    <span>10 (High)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                Cognitive Link
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Do you experience "Brain Fog," fatigue, or low mood during a gut flare?</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { value: 'yesFrequently', label: 'Yes, frequently' },
                { value: 'no', label: 'No' },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSingleAnswer(() => setAnswers({ ...answers, brainFog: option.value as BrainFog }))}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.brainFog === option.value
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.brainFog === option.value ? 'text-white' : ''
                  }`} style={answers.brainFog === option.value ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                Dietary Habits
              </h2>
              <p className="text-sm mt-2" style={{ color: '#096b17' }}>Check all that apply to you:</p>
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
              {[
                { key: 'lateNightDinners', label: 'Late night dinners' },
                { key: 'highCaffeine', label: 'High Caffeine' },
                { key: 'frequentJunk', label: 'Frequent Junk/Processed Food' },
                { key: 'skipBreakfast', label: 'Skip Breakfast' },
              ].map((option, index) => (
                <motion.button
                  key={option.key}
                  onClick={() => {
                    const current = answers.dietaryHabits || {
                      lateNightDinners: false,
                      highCaffeine: false,
                      frequentJunk: false,
                      skipBreakfast: false,
                    };
                    setAnswers({
                      ...answers,
                      dietaryHabits: {
                        ...current,
                        [option.key]: !current[option.key as keyof typeof current],
                      },
                    });
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                    answers.dietaryHabits?.[option.key as keyof typeof answers.dietaryHabits]
                      ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                      : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                    answers.dietaryHabits?.[option.key as keyof typeof answers.dietaryHabits] ? 'text-white' : ''
                  }`} style={answers.dietaryHabits?.[option.key as keyof typeof answers.dietaryHabits] ? {} : { color: '#096b17' }}>
                    {option.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading screen while verifying payment
  if (isVerifyingPayment) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 pt-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl p-8 border-2 border-[#096b17]/20 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#096b17]"></div>
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#096b17' }}>Verifying Payment</h2>
            <p style={{ color: '#096b17' }}>
              Please wait while we verify your payment...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show access denied if no valid UUID
  if (!hasValidUUID) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 pt-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl p-8 border-2 border-[#096b17]/20 shadow-2xl">
            <AlertCircle className="w-16 h-16 text-[#096b17] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#096b17' }}>Access Denied</h2>
            <p className="mb-6" style={{ color: '#096b17' }}>
              You need a valid assessment link to access this quiz. Please check your email or contact support for assistance.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-[#096b17] text-white font-semibold hover:bg-[#075110] transition-all rounded-xl"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show quiz already taken message
  if (quizAlreadyTaken) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 pt-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl p-8 border-2 border-[#096b17]/20 shadow-2xl">
            <AlertCircle className="w-16 h-16 text-[#096b17] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#096b17' }}>Quiz Already Completed</h2>
            <p className="mb-6" style={{ color: '#096b17' }}>
              This assessment has already been completed with this payment. Each payment allows for one quiz attempt only.
            </p>
            <p className="mb-6 text-sm" style={{ color: '#096b17' }}>
              Please check your email for the results. If you need to retake the assessment, please make a new payment.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = '/gbsi'}
                className="px-6 py-3 bg-[#096b17] text-white font-semibold hover:bg-[#075110] transition-all rounded-xl"
              >
                Return to Home
              </button>
              <a
                href="https://wa.me/917021227203?text=I%20need%20help%20with%20my%20GBSI%20assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-[#096b17] font-semibold border-2 border-[#096b17] hover:bg-[#F5F5DC] transition-all rounded-xl inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show payment error if payment verification failed
  if (paymentError || !paymentVerified) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 pt-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl p-8 border-2 border-[#096b17]/20 shadow-2xl">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#096b17' }}>Payment Verification Failed</h2>
            <p className="mb-6" style={{ color: '#096b17' }}>
              {paymentError || 'Unable to verify your payment. Please complete the payment to access the quiz.'}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = '/gbsi'}
                className="px-6 py-3 bg-[#096b17] text-white font-semibold hover:bg-[#075110] transition-all rounded-xl"
              >
                Go to Payment Page
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white text-[#096b17] font-semibold border-2 border-[#096b17] hover:bg-[#F5F5DC] transition-all rounded-xl"
              >
                Retry Verification
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show credentials confirmation screen
  if (showCredentialsScreen) {
    const testUrl = window.location.href;

    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 pt-16" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-[#096b17]/20">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center" style={{ color: '#096b17' }}>
              Ready to Begin Your Assessment
            </h2>

            <p className="text-center mb-6 text-sm" style={{ color: '#096b17' }}>
              Please save your secure access link below. You'll need it to access the assessment again if you choose to start later.
            </p>

            {/* Credentials Box */}
            <div className="bg-[#F5F5DC] border-2 border-[#096b17]/20 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="w-5 h-5" style={{ color: '#096b17' }} />
                <h3 className="font-semibold text-lg" style={{ color: '#096b17' }}>Secure Access Link</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="bg-white p-3 rounded border border-[#096b17]/20 break-all text-xs" style={{ color: '#096b17' }}>
                    {testUrl}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Copy, Download, Share */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={handleCopyCredentials}
                className="flex flex-col items-center gap-2 p-3 bg-white border-2 border-[#096b17]/20 rounded-xl hover:border-[#096b17] hover:bg-[#F5F5DC] transition-all"
              >
                <Copy className="w-5 h-5" style={{ color: '#096b17' }} />
                <span className="text-xs font-medium" style={{ color: '#096b17' }}>Copy</span>
              </button>

              <button
                onClick={handleDownloadCredentials}
                className="flex flex-col items-center gap-2 p-3 bg-white border-2 border-[#096b17]/20 rounded-xl hover:border-[#096b17] hover:bg-[#F5F5DC] transition-all"
              >
                <Download className="w-5 h-5" style={{ color: '#096b17' }} />
                <span className="text-xs font-medium" style={{ color: '#096b17' }}>Download</span>
              </button>

              <button
                onClick={handleShareCredentials}
                className="flex flex-col items-center gap-2 p-3 bg-white border-2 border-[#096b17]/20 rounded-xl hover:border-[#096b17] hover:bg-[#F5F5DC] transition-all"
              >
                <Share2 className="w-5 h-5" style={{ color: '#096b17' }} />
                <span className="text-xs font-medium" style={{ color: '#096b17' }}>Share</span>
              </button>
            </div>

            {/* Important Notice */}
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-xs font-medium text-yellow-800">
                ⚠️ Important: Save this access link now! You'll need it if you want to access this assessment later.
              </p>
            </div>

            {/* Start Test Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartTest}
                className="flex-1 bg-[#096b17] text-white hover:bg-[#075110] py-4 rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-xl"
              >
                Start Test Now
              </button>

              <button
                onClick={handleStartLater}
                className="flex-1 bg-white text-[#096b17] border-2 border-[#096b17] hover:bg-[#F5F5DC] py-4 rounded-xl font-semibold text-base transition-all"
              >
                Start Later
              </button>
            </div>

            {/* Help Link */}
            <div className="mt-6 text-center">
              <a
                href="https://wa.me/917021227203?text=I%20need%20help%20with%20my%20GBSI%20assessment%20access%20link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-all"
                style={{ color: '#096b17' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Need help? Contact Support
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show user info form
  if (showUserInfoForm) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 pt-16" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-[#096b17]/20">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>Gut-Brain Sensitivity Index</h2>

            {/* Email Confirmation Message */}
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-1">Payment Successful!</p>
                  <p className="text-xs text-green-700 leading-relaxed">
                    We've sent you an email with your invoice and assessment access link. Please check your inbox (and spam folder if needed).
                  </p>
                </div>
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed" style={{ color: '#096b17' }}>
              Please provide your details to receive the comprehensive assessment results via email and WhatsApp. Your information will be kept confidential.
            </p>

            <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 mr-2" style={{ color: '#096b17' }} />
                    <label className="text-sm font-medium" style={{ color: '#096b17' }}>Full Name *</label>
                  </div>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
                      formErrors.name ? 'border-red-500' : 'border-[#096b17]/20'
                    }`}
                    placeholder="Enter your full name"
                    style={{ color: '#096b17' }}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                {/* WhatsApp Field */}
                <div>
                  <div className="flex items-center mb-2">
                    <Phone className="w-4 h-4 mr-2" style={{ color: '#096b17' }} />
                    <label className="text-sm font-medium" style={{ color: '#096b17' }}>WhatsApp Number *</label>
                  </div>
                  <div className="flex rounded-lg overflow-hidden">
                    <span className="inline-flex items-center px-3 py-3 border border-r-0 bg-[#F5F5DC] text-sm font-medium" style={{ color: '#096b17', borderColor: formErrors.whatsapp ? '#ef4444' : 'rgba(9, 107, 23, 0.2)' }}>
                      +91
                    </span>
                    <input
                      type="text"
                      value={userInfo.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
                        formErrors.whatsapp ? 'border-red-500' : 'border-[#096b17]/20'
                      }`}
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      style={{ color: '#096b17' }}
                    />
                  </div>
                  {formErrors.whatsapp && <p className="text-red-500 text-sm mt-1">{formErrors.whatsapp}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <div className="flex items-center mb-2">
                    <Mail className="w-4 h-4 mr-2" style={{ color: '#096b17' }} />
                    <label className="text-sm font-medium" style={{ color: '#096b17' }}>Email Address *</label>
                  </div>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
                      formErrors.email ? 'border-red-500' : 'border-[#096b17]/20'
                    }`}
                    placeholder="Enter your email address"
                    style={{ color: '#096b17' }}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

              <button
                type="submit"
                className="w-full bg-[#096b17] text-white hover:bg-[#075110] py-3 rounded-xl font-semibold text-base mt-6 transition-all shadow-lg hover:shadow-xl"
              >
                Begin Assessment
              </button>

              <div className="mt-4 text-center">
                <a
                  href="https://wa.me/917021227203?text=I%20am%20unable%20to%20start%20my%20GBSI%20assessment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-all"
                  style={{ color: '#096b17' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Trouble starting your test? Chat with us
                </a>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex flex-col pt-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Sticky Progress */}
      <div className="w-full bg-white border-b-2 border-[#096b17]/20 p-3 sticky top-16 z-20 shadow-sm">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: '#096b17' }}>
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#096b17' }}>{Math.round(progress)}%</span>
          </div>
          <div className="relative">
            <div className="w-full h-2 bg-[#F5F5DC] rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-[#096b17] rounded-full transition-all duration-500 ease-out shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderQuestion()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation - only show for multi-select questions */}
          {currentQuestion > 0 && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 hover:shadow-lg"
                style={{ borderColor: '#096b17', color: '#096b17' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Previous</span>
              </button>
            </div>
          )}
          {/* Show Next button only for multi-select questions (1, 2, 11) and slider (9) */}
          {[1, 2, 9, 11].includes(currentQuestion) && isQuestionAnswered() && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-xl"
                style={{ backgroundColor: '#096b17' }}
              >
                {currentQuestion === totalQuestions - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
