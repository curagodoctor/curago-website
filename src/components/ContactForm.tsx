import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { trackFormSubmission } from '../utils/tracking';
import { WhatsAppConfirmDialog } from './WhatsAppConfirmDialog';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '+91',
    email: '',
    callbackTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.phone || !formData.email || !formData.callbackTime) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Import Wylto utility
      const { submitToWylto } = await import('../utils/wylto');
      
      // Submit to Wylto with proper flags
      const result = await submitToWylto({
        name: formData.name,
        phoneNumber: formData.phone,
        email: formData.email,
        formType: 'contact',
        callbackTime: formData.callbackTime,
      });

      if (result.success) {
        // Track conversion across all platforms (GTM, Meta Pixel, GA4)
        trackFormSubmission('contact', {
          ...formData,
          callbackTime: formData.callbackTime,
        });
        
        setShowSuccessDialog(true);
        
        // Reset form
        setFormData({
          name: '',
          phone: '+91',
          email: '',
          callbackTime: ''
        });
      } else {
        console.error('Wylto submission failed:', result.message);
        alert('Something went wrong. Please try again or contact us on WhatsApp.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again or contact us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    setShowWhatsAppDialog(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace(/^\+91/, '');
    }
    setFormData({ ...formData, phone: value });
  };

  return (
    <>
      <div className="rounded-2xl flex flex-col justify-center items-center shadow-2xl p-6 md:p-10 max-w-2xl w-full mx-auto" style={{ backgroundColor: '#FFFDBD' }}>
        <div className="mb-4 text-center w-full">
          <h3 className="text-2xl mb-3" style={{ color: '#096b17' }}>Request a Callback</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-lg">
          <div>
            <Label htmlFor="name" className="mb-2 block" style={{ color: '#096b17' }}>
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-white h-12 rounded-lg transition-all duration-300 text-black placeholder:text-black border-[#096b17] focus:border-[#096b17] focus:ring-[#096b17]"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="mb-2 block" style={{ color: '#096b17' }}>
              WhatsApp Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="bg-white h-12 rounded-lg transition-all duration-300 text-black placeholder:text-black border-[#096b17] focus:border-[#096b17] focus:ring-[#096b17]"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-2 block" style={{ color: '#096b17' }}>
              Email ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-white h-12 rounded-lg transition-all duration-300 text-black placeholder:text-black border-[#096b17] focus:border-[#096b17] focus:ring-[#096b17]"
              required
            />
          </div>

          <div>
            <Label htmlFor="callbackTime" className="mb-2 block" style={{ color: '#096b17' }}>
              Call Back Time <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.callbackTime} 
              onValueChange={(value) => setFormData({...formData, callbackTime: value})}
            >
              <SelectTrigger className="w-full bg-white h-12 rounded-lg transition-all duration-300 text-black border-[#096b17] focus:border-[#096b17] focus:ring-[#096b17]">
                <SelectValue placeholder="Select preferred time" className="text-black placeholder:text-black" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12 PM - 3 PM)</SelectItem>
                <SelectItem value="evening">Evening (3 PM - 6 PM)</SelectItem>
                <SelectItem value="night">Night (6 PM - 9 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ backgroundColor: '#096b17' }}
            >
              {isSubmitting ? 'Submitting...' : 'Request a Callback'}
            </Button>
            
            <Button 
              type="button"
              onClick={handleWhatsApp}
              className="w-full h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Send a 'Hi' on WhatsApp
            </Button>
          </div>
        </form>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-center">Thank You! 🎉</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-center text-base space-y-3 py-4">
                <p>Your request has been received successfully!</p>
                <p>Our team will contact you at your preferred time - either the same day or the next day.</p>
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
        source="contact_form"
        message="Hi! I want to get in touch regarding CuraGo services."
      />
    </>
  );
}
