// CuraGo's Anxiety Loop Assessment Tool 1.0 Quiz Flow Component
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, AlertCircle, User, Mail, Phone, Copy, Download, Share2, ExternalLink, CheckCircle } from 'lucide-react';
import { CALM_QUESTIONS } from './questionsData';
import type { CalmAnswers, CalmUserInfo } from '../../../types/calm';

interface QuizFlowProps {
  onComplete: (userInfo: CalmUserInfo, answers: CalmAnswers, paymentId: string) => void;
}

export default function QuizFlow({ onComplete }: QuizFlowProps) {
  const [showDecisionScreen, setShowDecisionScreen] = useState(true); // NEW: Take test now or later
  const [showUserInfoForm, setShowUserInfoForm] = useState(false); // Changed to false initially
  const [showCredentialsScreen, setShowCredentialsScreen] = useState(false);
  const [userInfo, setUserInfo] = useState<CalmUserInfo>({ name: '', whatsapp: '', email: '' });
  const [formErrors, setFormErrors] = useState({ name: '', whatsapp: '', email: '' });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<CalmAnswers>>({});
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [hasValidUUID, setHasValidUUID] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<{ email: string; contact: string } | null>(null);
  const [quizAlreadyTaken, setQuizAlreadyTaken] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string>('');

  // Valid UUID for accessing the quiz
  const VALID_UUID = '7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94';

  // Check for UUID and payment_id in URL params and verify payment
  useEffect(() => {
    const verifyAccessAndPayment = async () => {
      // Parse URL parameters - handle malformed URLs with multiple '?'
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

  const totalQuestions = CALM_QUESTIONS.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Form validation and submission
  const validateUserInfoForm = (): boolean => {
    const errors = { name: '', whatsapp: '', email: '' };
    let isValid = true;

    if (!userInfo.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    // Basic format validation for phone
    if (!userInfo.whatsapp.trim()) {
      errors.whatsapp = 'WhatsApp number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(userInfo.whatsapp.trim())) {
      errors.whatsapp = 'Please enter a valid 10-digit number';
      isValid = false;
    }

    // Basic format validation for email
    if (!userInfo.email || !userInfo.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email.trim())) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // REMOVED: Payment details validation
    // Users can now enter any email and phone number

    setFormErrors(errors);
    return isValid;
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUserInfoForm()) {
      setShowUserInfoForm(false);
      setShowCredentialsScreen(true);
    }
  };

  const handleStartTest = () => {
    setShowCredentialsScreen(false);
  };

  const handleTakeTestNow = () => {
    setShowDecisionScreen(false);
    setShowUserInfoForm(true);
  };

  const handleTakeTestLater = () => {
    // Save the current URL for the user to access later
    const currentUrl = window.location.href;

    // Copy to clipboard
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert('Test link copied to clipboard! You can take this test anytime by using this link.');
    }).catch(() => {
      alert('Please save this link to take the test later: ' + currentUrl);
    });

    // Redirect to CALA landing page
    setTimeout(() => {
      window.location.href = '/cala';
    }, 1000);
  };

  const handleStartLater = () => {
    window.location.href = '/cala';
  };

  const handleInputChange = (field: keyof CalmUserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = () => {
    const testUrl = window.location.href;
    const credentials = `CuraGo's Anxiety Loop Assessment Tool 1.0

Test URL: ${testUrl}

Login Credentials:
Name: ${userInfo.name}
Email: ${userInfo.email}
WhatsApp: +91 ${userInfo.whatsapp}

Please save these credentials to access your assessment.`;

    navigator.clipboard.writeText(credentials).then(() => {
      alert('Credentials copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy. Please copy manually.');
    });
  };

  // Download credentials as text file
  const handleDownloadCredentials = () => {
    const testUrl = window.location.href;
    const credentials = `CuraGo's Anxiety Loop Assessment Tool 1.0

Test URL: ${testUrl}

Login Credentials:
Name: ${userInfo.name}
Email: ${userInfo.email}
WhatsApp: +91 ${userInfo.whatsapp}

Please save these credentials to access your assessment.`;

    const blob = new Blob([credentials], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CALA-Credentials.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Share credentials using Web Share API
  const handleShareCredentials = async () => {
    const testUrl = window.location.href;
    const credentials = `CuraGo's Anxiety Loop Assessment Tool 1.0

Test URL: ${testUrl}

Login Credentials:
Name: ${userInfo.name}
Email: ${userInfo.email}
WhatsApp: +91 ${userInfo.whatsapp}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CALA Test Credentials',
          text: credentials,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Sharing is not supported on this browser. Please use Copy or Download instead.');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (questionId: string, answerId: string) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);
    setSelectedValue(answerId);

    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion((q) => q + 1);
        setSelectedValue(null);
      } else {
        // Quiz complete - submit with payment_id
        setIsSubmitting(true);
        onComplete(userInfo, newAnswers as CalmAnswers, currentPaymentId);
      }
    }, 450);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
      setSelectedValue(null);
    }
  };

  const currentQuestionData = CALM_QUESTIONS[currentQuestion];

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
              className="px-6 py-3 bg-[#096b17] text-white font-semibold hover:bg-[#075110] transition-all"
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
                onClick={() => window.location.href = '/cala'}
                className="px-6 py-3 bg-[#096b17] text-white font-semibold hover:bg-[#075110] transition-all rounded-xl"
              >
                Return to Home
              </button>
              <a
                href="https://wa.me/917021227203?text=I%20need%20help%20with%20my%20CALM%20assessment"
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
                onClick={() => window.location.href = '/cala'}
                className="px-6 py-3 bg-[#096b17] text-white font-semibold hover:bg-[#075110] transition-all"
              >
                Go to Payment Page
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white text-[#096b17] font-semibold border-2 border-[#096b17] hover:bg-[#F5F5DC] transition-all"
              >
                Retry Verification
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show decision screen: Take test now or later
  if (showDecisionScreen) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 pt-16" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-[#096b17]/20">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-3" style={{ color: '#096b17' }}>
              Payment Successful!
            </h2>

            {/* Subtitle */}
            <p className="text-center text-gray-600 mb-6">
              Your CALA 1.0 Assessment is now unlocked
            </p>

            {/* Email Confirmation Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">Check Your Email</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    We've sent you an email with your invoice and a unique test access link. You can use this link to take the test anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="text-center mb-6">
              <p className="text-lg font-semibold mb-2" style={{ color: '#096b17' }}>
                Would you like to take the test now?
              </p>
              <p className="text-sm text-gray-600">
                The assessment takes approximately 10-15 minutes
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Take Test Now Button */}
              <button
                onClick={handleTakeTestNow}
                className="w-full px-6 py-4 bg-[#096b17] text-white font-semibold rounded-xl hover:bg-[#075110] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Yes, Take Test Now</span>
                </div>
              </button>

              {/* Take Test Later Button */}
              <button
                onClick={handleTakeTestLater}
                className="w-full px-6 py-4 bg-white text-[#096b17] font-semibold border-2 border-[#096b17] rounded-xl hover:bg-[#F5F5DC] transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  <span>I'll Take It Later</span>
                </div>
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 leading-relaxed">
                <strong>Note:</strong> If you choose to take the test later, the link will be copied to your clipboard.
                You can also find it in the email we sent you. This link is valid for one-time use only.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show user info form (validation screen)
  if (showUserInfoForm) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 pt-16" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-[#096b17]/20">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>CuraGo's Anxiety Loop Assessment Tool 1.0</h2>

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
                  className={`w-full px-4 py-3 border  focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
                    formErrors.name ? 'border-red-500' : 'border-[#096b17]/20'
                  }`}
                  placeholder="Enter your full name"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              {/* WhatsApp Field */}
              <div>
                <div className="flex items-center mb-2">
                  <Phone className="w-4 h-4 mr-2" style={{ color: '#096b17' }} />
                  <label className="text-sm font-medium" style={{ color: '#096b17' }}>WhatsApp Number *</label>
                </div>
                <div className="flex  overflow-hidden">
                  <span className="inline-flex items-center px-3 py-3 border border-r-0 bg-[#F5F5DC] text-sm font-medium" style={{ color: '#096b17', borderColor: formErrors.whatsapp ? '#ef4444' : 'rgba(9, 107, 23, 0.2)' }}>
                    +91
                  </span>
                  <input
                    type="text"
                    value={userInfo.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    className={`w-full px-4 py-3 border focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
                      formErrors.whatsapp ? 'border-red-500' : 'border-[#096b17]/20'
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
                  <Mail className="w-4 h-4 mr-2" style={{ color: '#096b17' }} />
                  <label className="text-sm font-medium" style={{ color: '#096b17' }}>Email Address *</label>
                </div>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border  focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors ${
                    formErrors.email ? 'border-red-500' : 'border-[#096b17]/20'
                  }`}
                  placeholder="Enter your email address"
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
                  href="https://wa.me/917021227203?text=I%20am%20unable%20to%20start%20my%20CALM%20assessment"
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
              Please save your test credentials below. You'll need them to access the assessment again if you choose to start later.
            </p>

            {/* Credentials Box */}
            <div className="bg-[#F5F5DC] border-2 border-[#096b17]/20 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="w-5 h-5" style={{ color: '#096b17' }} />
                <h3 className="font-semibold text-lg" style={{ color: '#096b17' }}>Test URL & Credentials</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1" style={{ color: '#096b17' }}>Test URL:</p>
                  <p className="bg-white p-2 rounded border border-[#096b17]/20 break-all text-xs" style={{ color: '#096b17' }}>
                    {testUrl}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium mb-1" style={{ color: '#096b17' }}>Name:</p>
                    <p className="bg-white p-2 rounded border border-[#096b17]/20" style={{ color: '#096b17' }}>
                      {userInfo.name}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1" style={{ color: '#096b17' }}>Email:</p>
                    <p className="bg-white p-2 rounded border border-[#096b17]/20 break-all text-xs" style={{ color: '#096b17' }}>
                      {userInfo.email}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-1" style={{ color: '#096b17' }}>WhatsApp:</p>
                  <p className="bg-white p-2 rounded border border-[#096b17]/20" style={{ color: '#096b17' }}>
                    +91 {userInfo.whatsapp}
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
                ⚠️ Important: Save these credentials now! You'll need them if you want to access this assessment later.
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
                href="https://wa.me/917021227203?text=I%20need%20help%20with%20my%20CALM%20assessment%20credentials"
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

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex flex-col pt-16" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Progress Bar */}
      <div className="w-full bg-white border-b-2 border-[#096b17]/20 p-3 sticky top-0 z-20 shadow-sm">
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

      {/* Quiz Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-16 md:py-20">
        <div className="max-w-2xl sm:max-w-3xl md:max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="space-y-8 sm:space-y-10 md:space-y-12"
            >
              {/* Question */}
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                  {currentQuestionData.text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
                {currentQuestionData.options.map((option, index) => {
                  const isSelected = selectedValue === option.id;

                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleAnswer(currentQuestionData.id, option.id)}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                          : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                        isSelected ? 'text-white' : ''
                      }`} style={isSelected ? {} : { color: '#096b17' }}>
                        {option.text}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Previous Button - Centered at bottom */}
          {currentQuestion > 0 && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-white text-[#096b17] hover:bg-[#F5F5DC] border-2 border-[#096b17]/20 shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous Question</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
