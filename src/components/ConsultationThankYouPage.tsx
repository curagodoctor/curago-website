import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const consultants = [
  'Dr. Shweta Sharma',
  'Dr. Pallavi Joshi',
  'Dr. Kamna Chhibber',
  'Dr. Samir Parikh',
  'Dr. Achal Bhagat',
  'Dr. Rajesh Sagar',
  'Dr. Alok Bajpai',
  'Ms. Priya Kumar (Psychologist)',
  'Any Available',
];

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM',
];

export default function ConsultationThankYouPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    whatsappNumber: '+91',
    email: '',
    consultantName: '',
    dateOfConsultation: undefined as Date | undefined,
    preferredTime: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit to Wylto webhook
      const payload = {
        name: formData.fullName,
        phoneNumber: formData.whatsappNumber,
        email: formData.email,
        age: formData.age,
        consultant: formData.consultantName,
        date: formData.dateOfConsultation?.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: formData.preferredTime,
        formType: 'consultation_confirmation',
        formSource: 'CuraGo Website - Post Payment',
        submittedAt: new Date().toISOString(),
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct',
          currentUrl: window.location.href,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timestamp: Date.now(),
        }
      };

      const response = await fetch('https://server.wylto.com/webhook/k224WX6y6exVpUZAM0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Track form submission
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'form_submission',
          formType: 'consultation_confirmation',
          formName: 'Consultation Confirmation Form',
          formValue: 0,
          userData: {
            hasName: true,
            hasEmail: true,
            hasPhone: true,
          }
        });
      }

      setIsSubmitting(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      alert('There was an error submitting the form. Please try again or contact us directly.');
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showSuccess) {
    return (
      <section className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] relative overflow-hidden">
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

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-20 h-20 md:w-24 md:h-24 mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#096b17' }}
          >
            <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#096b17' }}
          >
            All Set! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-700 mb-8"
          >
            Our team will contact you shortly to confirm the appointment and share the video consultation link.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => window.location.href = '/'}
              className="text-lg px-8 py-6 h-14 rounded-xl"
              style={{ backgroundColor: '#096b17' }}
            >
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pt-20 md:pt-32 pb-8 md:pb-16 bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] relative overflow-hidden">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 md:mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full mb-4 md:mb-6"
            style={{ backgroundColor: '#FFFDBD' }}
          >
            <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12" style={{ color: '#096b17' }} />
          </motion.div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 px-4">
            Your Consultation Booking Is Confirmed
          </h1>

          <p className="text-base md:text-xl text-green-100 max-w-2xl mx-auto px-4">
            Please fill the details below so we can prepare for your session and schedule it smoothly.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl p-4 md:p-10"
          style={{ backgroundColor: '#FFFDBD' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="text-base font-semibold mb-2 block" style={{ color: '#096b17' }}>
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  className="h-12 min-h-[48px] text-base border-2 border-gray-200 focus:border-[#096b17] bg-white px-3"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Age */}
              <div>
                <Label htmlFor="age" className="text-base font-semibold mb-2 block" style={{ color: '#096b17' }}>
                  Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', e.target.value)}
                  className="h-12 min-h-[48px] text-base border-2 border-gray-200 focus:border-[#096b17] bg-white px-3"
                  placeholder="Enter your age"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* WhatsApp Number */}
              <div>
                <Label htmlFor="whatsappNumber" className="text-base font-semibold mb-2 block" style={{ color: '#096b17' }}>
                  WhatsApp Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (!value.startsWith('+91')) {
                      value = '+91' + value.replace(/^\+91/, '');
                    }
                    updateFormData('whatsappNumber', value);
                  }}
                  className="h-12 min-h-[48px] text-base border-2 border-gray-200 focus:border-[#096b17] bg-white px-3"
                  placeholder="+91 XXXXX XXXXX"
                  maxLength={13}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-base font-semibold mb-2 block" style={{ color: '#096b17' }}>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="h-12 min-h-[48px] text-base border-2 border-gray-200 focus:border-[#096b17] bg-white px-3"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Consultant Name */}
            <div>
              <Label htmlFor="consultantName" className="text-base font-semibold mb-2 block" style={{ color: '#096b17' }}>
                Consultant Name <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.consultantName}
                onValueChange={(value) => updateFormData('consultantName', value)}
                required
              >
                <SelectTrigger className="h-12 min-h-[48px] text-base border-2 border-gray-200 focus:border-[#096b17] bg-white px-3">
                  <SelectValue placeholder="Select a consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant} value={consultant} className="text-base">
                      {consultant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Date of Consultation */}
              <div>
                <Label className="text-base font-semibold mb-2 block" style={{ color: '#096b17' }}>
                  Date of Consultation <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full h-12 min-h-[48px] text-base justify-start text-left font-normal border-2 border-gray-200 hover:border-[#096b17] bg-white px-3"
                    >
                      <Calendar className="mr-2 h-5 w-5 flex-shrink-0" style={{ color: '#096b17' }} />
                      {formData.dateOfConsultation ? (
                        formData.dateOfConsultation.toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      ) : (
                        <span className="text-gray-500">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.dateOfConsultation}
                      onSelect={(date) => updateFormData('dateOfConsultation', date)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Preferred Time */}
              <div>
                <Label htmlFor="preferredTime" className="text-base font-semibold mb-2 block" style={{ color: '#096b17' }}>
                  Preferred Time <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(value) => updateFormData('preferredTime', value)}
                  required
                >
                  <SelectTrigger className="h-12 min-h-[48px] text-base border-2 border-gray-200 focus:border-[#096b17] bg-white px-3">
                    <Clock className="mr-2 h-5 w-5 flex-shrink-0" style={{ color: '#096b17' }} />
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time} className="text-base">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-white/80 border-2 border-[#096b17]/20 rounded-xl p-3 md:p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" style={{ color: '#096b17' }} />
                <p className="text-gray-700 italic text-xs md:text-base">
                  "This helps our expert to understand your situation better."
                </p>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="mt-0.5 w-5 h-5 flex-shrink-0 text-[#096b17] bg-white border-gray-300 rounded focus:ring-[#096b17] focus:ring-2 cursor-pointer"
                />
                <span className="text-sm md:text-base text-gray-800 group-hover:text-gray-900 leading-snug">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-[#096b17] underline hover:text-[#064d11]">
                    terms and conditions
                  </a>{' '}
                  of CuraGo <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !termsAccepted}
              className="w-full h-12 md:h-14 text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#096b17' }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </div>
              ) : (
                'Submit Details'
              )}
            </Button>
          </form>

          {/* Confirmation Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 md:mt-8 p-4 md:p-5 rounded-2xl text-center shadow-lg"
            style={{ backgroundColor: '#096b17', color: 'white' }}
          >
            <p className="text-sm md:text-lg leading-relaxed">
              Our team will contact you shortly to confirm the appointment and share the video consultation link.
            </p>
          </motion.div>
        </motion.div>

        {/* Additional Info Cards */}
        <motion.div
          className="mt-6 md:mt-10 text-center text-white space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xl md:text-2xl mb-1 font-semibold">45+ mins</p>
              <p className="text-sm text-green-100">Consultation Duration</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xl md:text-2xl mb-1 font-semibold">100% Online</p>
              <p className="text-sm text-green-100">Video Consultation</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xl md:text-2xl mb-1 font-semibold">100% Private</p>
              <p className="text-sm text-green-100">Safe & Confidential</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
