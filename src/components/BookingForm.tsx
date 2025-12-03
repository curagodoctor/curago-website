import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { CalendarIcon } from 'lucide-react';
import { trackFormSubmission } from '../utils/tracking';
import { WhatsAppConfirmDialog } from './WhatsAppConfirmDialog';

export function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '+91',
    email: '',
    consultant: '',
    date: undefined as Date | undefined,
    time: '',
    message: ''
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  const consultants = [
    'Dr. Charan Kumar Pottem - Consultant Psychiatrist',
    'Dr. Ekaansh Sharmad - Consultant Psychiatrist',
    'Dr. Harshali Sunil More- Consultant Psychiatrist',
    'Dr. Utkarsh Mestri - Consultant Psychiatrist',
    'Simaral Kamal - Clinical Psychologist',
    'Dr. Sourabh Pal - Consultant Psychiatrist',
    'Dr. Yeshwant Solanki - Consultant Psychiatrist',
    'Any Available Consultant'
  ];

  const timeSlots = [
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM',
    '08:30 PM',
    '09:00 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Import Wylto utility
      const { submitToWylto } = await import('../utils/wylto');
      
      // Submit to Wylto with proper flags
      const result = await submitToWylto({
        name: formData.name,
        phoneNumber: formData.phone,
        email: formData.email,
        formType: 'appointment',
        consultant: formData.consultant,
        date: formData.date?.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: formData.time,
        message: formData.message,
      });

      if (result.success) {
        // Track conversion across all platforms (GTM, Meta Pixel, GA4)
        trackFormSubmission('appointment', {
          ...formData,
          consultant: formData.consultant,
          date: formData.date?.toLocaleDateString('en-IN'),
        });
        
        setShowSuccessDialog(true);
        
        // Reset form
        setFormData({
          name: '',
          phone: '+91',
          email: '',
          consultant: '',
          date: undefined,
          time: '',
          message: ''
        });
      } else {
        console.error('Wylto submission failed:', result.message);
        alert('Something went wrong. Please try again or contact us on WhatsApp.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again or contact us on WhatsApp.');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace(/^\+91/, '');
    }
    setFormData({ ...formData, phone: value });
  };

  const handleWhatsAppClick = () => {
    setShowWhatsAppDialog(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-[#096b17]/10" style={{ backgroundColor: '#FFFDBD' }}>
        <div className="mb-6">
          <h3 className="text-2xl mb-2" style={{ color: '#096b17' }}>Booking Form</h3>
          <p className="text-sm mb-1" style={{ color: '#096b17' }}>
            Consultation starts at ₹1200
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#096b17' }}>
            ₹1200 = 1 Video Consultation of minimum 45 mins duration 
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" style={{ color: '#096b17' }}>
              Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1.5 border-[#096b17]/30 focus:border-[#096b17] bg-white"
              style={{ color: '#096b17' }}
            />
          </div>

          <div>
            <Label htmlFor="phone" style={{ color: '#096b17' }}>
              WhatsApp Phone Number <span className="text-red-600">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="+91"
              className="mt-1.5 border-[#096b17]/30 focus:border-[#096b17] bg-white"
              style={{ color: '#096b17' }}
            />
          </div>

          <div>
            <Label htmlFor="email" style={{ color: '#096b17' }}>
              Email ID <span className="text-red-600">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1.5 border-[#096b17]/30 focus:border-[#096b17] bg-white"
              style={{ color: '#096b17' }}
            />
          </div>

          <div>
            <Label htmlFor="consultant" style={{ color: '#096b17' }}>
              Consultant Name
            </Label>
            <Select value={formData.consultant} onValueChange={(value) => setFormData({ ...formData, consultant: value })}>
              <SelectTrigger className="mt-1.5 border-[#096b17]/30 bg-white" style={{ color: '#096b17' }}>
                <SelectValue placeholder="Select a consultant" />
              </SelectTrigger>
              <SelectContent>
                {consultants.map((consultant) => (
                  <SelectItem key={consultant} value={consultant}>
                    {consultant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date" style={{ color: '#096b17' }}>
              Date of Consultation <span className="text-red-600">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1.5 justify-start text-left border-[#096b17]/30 bg-white"
                  style={{ color: '#096b17' }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? formData.date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date })}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="time" style={{ color: '#096b17' }}>
              Time of Consultation <span className="text-red-600">*</span>
            </Label>
            <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
              <SelectTrigger className="mt-1.5 border-[#096b17]/30 bg-white" style={{ color: '#096b17' }}>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message" style={{ color: '#096b17' }}>
              Message
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="mt-1.5 border-[#096b17]/30 focus:border-[#096b17] min-h-[80px] bg-white"
              style={{ color: '#096b17' }}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-white hover:opacity-90 transition-all duration-300"
            style={{ backgroundColor: '#096b17' }}
          >
            Book Now
          </Button>

          <div className="space-y-1 text-center">
            <p className="text-xs" style={{ color: '#096b17' }}>
              ✓ Pay after appointment confirmation only
            </p>
            <p className="text-xs" style={{ color: '#096b17' }}>
              ✓ Same day booking available
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-2 hover:opacity-90 transition-all duration-300"
            style={{ borderColor: '#096b17', color: '#096b17' }}
            onClick={handleWhatsAppClick}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Say 'hi' on WhatsApp
          </Button>
        </form>
      </div>

      {/* Success Dialog with Pixel Tracking */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-center">Thank You! 🎉</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-center text-base space-y-3 py-4">
                <p>Your appointment request has been received successfully!</p>
                <p>Our team will contact you shortly to confirm your consultation.</p>
                <p className="text-sm text-gray-600">
                  You will receive a confirmation via WhatsApp and Email.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-[#096b17] hover:bg-[#075110] text-white px-8"
            >
              Got it!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* WhatsApp Confirmation Dialog */}
      <WhatsAppConfirmDialog
        isOpen={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        source="booking_form"
        message="Hi! I want to book a consultation. Please help me with the booking process."
      />
    </>
  );
}
