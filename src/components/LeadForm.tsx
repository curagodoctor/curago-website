import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { trackFormSubmission } from '../utils/tracking';

export function LeadForm() {
  const [formData, setFormData] = useState({
    service: '',
    name: '',
    email: '',
    phone: '+91 ',
    area: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.service || !formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Import Wylto utility
      const { submitToWylto } = await import('../utils/wylto');
      
      // Submit to Wylto with proper flags
      const result = await submitToWylto({
        name: formData.name,
        phoneNumber: formData.phone.trim(),
        email: formData.email,
        formType: 'lead',
        service: formData.service,
        area: formData.area,
        message: formData.message,
      });

      if (result.success) {
        // Track conversion across all platforms (GTM, Meta Pixel, GA4)
        trackFormSubmission('lead', {
          ...formData,
          service: formData.service,
        });
        
        toast.success('Thank you! We\'ll contact you within 24 hours.');
        
        // Reset form
        setFormData({
          service: '',
          name: '',
          email: '',
          phone: '+91 ',
          area: '',
          message: ''
        });
      } else {
        console.error('Wylto submission failed:', result.message);
        toast.error('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-8 md:p-10 max-w-2xl w-full backdrop-blur-sm"
      whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Fill this form -</h2>
        <p className="text-gray-600">We'll take it from there!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="service" className="text-gray-700 mb-2.5 block text-sm">
            Services
          </Label>
          <Select 
            value={formData.service} 
            onValueChange={(value) => setFormData({...formData, service: value})}
          >
            <SelectTrigger className="w-full bg-white border-gray-300 h-12 rounded-lg transition-all duration-300 focus:border-[#096b17] focus:ring-2 focus:ring-[#096b17]/20">
              <SelectValue placeholder="Select your Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="psychiatry">Psychiatric Consultation</SelectItem>
              <SelectItem value="psychology">Psychological Counseling</SelectItem>
              <SelectItem value="anxiety-depression">Anxiety & Depression</SelectItem>
              <SelectItem value="adhd">ADHD & Behavioral Issues</SelectItem>
              <SelectItem value="therapy">Couple/Family Therapy</SelectItem>
              <SelectItem value="deaddiction">Deaddiction Services</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="name" className="text-gray-700 mb-2.5 block text-sm">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-white border-gray-300 h-12 rounded-lg transition-all duration-300 focus:border-[#096b17] focus:ring-2 focus:ring-[#096b17]/20"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700 mb-2.5 block text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-white border-gray-300 h-12 rounded-lg transition-all duration-300 focus:border-[#096b17] focus:ring-2 focus:ring-[#096b17]/20"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="phone" className="text-gray-700 mb-2.5 block text-sm">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value;
                // Ensure +91 always stays at the beginning
                if (!value.startsWith('+91 ')) {
                  setFormData({...formData, phone: '+91 '});
                } else {
                  setFormData({...formData, phone: value});
                }
              }}
              className="bg-white border-gray-300 h-12 rounded-lg transition-all duration-300 focus:border-[#096b17] focus:ring-2 focus:ring-[#096b17]/20"
              required
            />
          </div>

          <div>
            <Label htmlFor="area" className="text-gray-700 mb-2.5 block text-sm">
              Area
            </Label>
            <Input
              id="area"
              type="text"
              placeholder="Enter your area"
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
              className="bg-white border-gray-300 h-12 rounded-lg transition-all duration-300 focus:border-[#096b17] focus:ring-2 focus:ring-[#096b17]/20"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="message" className="text-gray-700 mb-2.5 block text-sm">
            Message
          </Label>
          <Textarea
            id="message"
            placeholder="Enter your Message"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="bg-white border-gray-300 min-h-[110px] rounded-lg resize-none transition-all duration-300 focus:border-[#096b17] focus:ring-2 focus:ring-[#096b17]/20"
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto px-10 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
