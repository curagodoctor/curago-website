import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import RcSlider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, Mail, Phone } from 'lucide-react';
import type { GbsiAnswers, GbsiUserInfo, AgeRange, AlarmingSign, FamilyHistory, PainFrequency, ReliefFactor, BristolType, RefluxFrequency, FullnessFactor, FattyLiver, BrainFog } from '../../../types/gbsi';

interface GbsiQuizFlowProps {
  onComplete: (answers: GbsiAnswers, userInfo: GbsiUserInfo) => void;
}

export default function GbsiQuizFlow({ onComplete }: GbsiQuizFlowProps) {
  const [showUserInfoForm, setShowUserInfoForm] = useState(true);
  const [userInfo, setUserInfo] = useState<GbsiUserInfo>({ name: '', whatsapp: '', email: '' });
  const [formErrors, setFormErrors] = useState({ name: '', whatsapp: '', email: '' });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

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

  // Fire GTM event when quiz starts
  useEffect(() => {
    if (!startedRef.current && !showUserInfoForm) {
      startedRef.current = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'gbsi_quiz_start',
        page_path: window.location.pathname,
        gbsi_stage: 'start',
      });
      console.log('🧠 gbsi_quiz_start event pushed to dataLayer');
    }
  }, [showUserInfoForm]);

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

  // Send OTP via WhatsApp only
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUserInfoForm()) return;

    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          whatsapp: userInfo.whatsapp,
          name: userInfo.name,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowOtpInput(true);
        setOtpError('');
      } else {
        setOtpError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          whatsapp: userInfo.whatsapp,
          otp: otp,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowUserInfoForm(false);
        setOtpError('');
      } else {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleInputChange = (field: keyof GbsiUserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Quiz complete
      onComplete(answers as GbsiAnswers, userInfo);
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

  // Show user info form if needed
  if (showUserInfoForm) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-[#096b17]/20">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#096b17' }}>
              Gut-Brain Sensitivity Index
            </h2>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: '#000000' }}>
              Please provide your details to begin the assessment. You'll receive an OTP on WhatsApp for verification.
            </p>

            {!showOtpInput ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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

                {otpError && <p className="text-red-500 text-sm">{otpError}</p>}

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full bg-[#096b17] text-white hover:bg-[#075110] py-3 rounded-xl font-semibold text-base mt-6 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    OTP sent to your WhatsApp. Please enter the 6-digit code to continue.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#096b17' }}>
                    Enter OTP *
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setOtpError('');
                    }}
                    className="w-full px-4 py-3 border border-[#096b17]/20 rounded-lg focus:ring-2 focus:ring-[#096b17] focus:border-[#096b17] outline-none transition-colors text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    style={{ color: '#096b17' }}
                  />
                  {otpError && <p className="text-red-500 text-sm mt-1">{otpError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full bg-[#096b17] text-white hover:bg-[#075110] py-3 rounded-xl font-semibold text-base mt-6 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowOtpInput(false)}
                  className="w-full text-[#096b17] hover:underline text-sm mt-2"
                >
                  Change Details
                </button>
              </form>
            )}
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
