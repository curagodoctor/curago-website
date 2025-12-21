// CALM 1.0 Quiz Flow Component
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, AlertCircle, User, Mail, Phone } from 'lucide-react';
import { CALM_QUESTIONS } from './questionsData';
import type { CalmAnswers, CalmUserInfo } from '../../../types/calm';

interface QuizFlowProps {
  onComplete: (userInfo: CalmUserInfo, answers: CalmAnswers) => void;
}

export default function QuizFlow({ onComplete }: QuizFlowProps) {
  const [showUserInfoForm, setShowUserInfoForm] = useState(true);
  const [userInfo, setUserInfo] = useState<CalmUserInfo>({ name: '', whatsapp: '', email: '' });
  const [formErrors, setFormErrors] = useState({ name: '', whatsapp: '', email: '' });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<CalmAnswers>>({});
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [hasValidUUID, setHasValidUUID] = useState(false);

  // Valid UUID for accessing the quiz
  const VALID_UUID = '7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94';

  // Check for UUID in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uuid = urlParams.get('uuid');

    if (uuid === VALID_UUID) {
      setHasValidUUID(true);
    } else {
      setHasValidUUID(false);
    }
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

    if (!userInfo.whatsapp.trim()) {
      errors.whatsapp = 'WhatsApp number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(userInfo.whatsapp.trim())) {
      errors.whatsapp = 'Please enter a valid 10-digit number';
      isValid = false;
    }

    if (!userInfo.email.trim()) {
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
    }
  };

  const handleInputChange = (field: keyof CalmUserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
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
        // Quiz complete - submit with collected user info
        setIsSubmitting(true);
        onComplete(userInfo, newAnswers as CalmAnswers);
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
              className="px-6 py-3 bg-[#096b17] text-white font-semibold  hover:bg-[#075110] transition-all"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show user info form first
  if (showUserInfoForm) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4 pt-16" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-[#096b17]/20">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>CALM 1.0 Assessment</h2>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: '#096b17' }}>
              We need your information to send you the detailed assessment results via email and WhatsApp. Your information will be kept confidential.
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
            </form>
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
