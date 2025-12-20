import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';

interface RazorpayButtonProps {
  buttonId?: string;
  className?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayButton({ buttonId = 'pl_Rtue8bSVIson8p', className }: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = () => {
    setIsLoading(true);

    // Open Razorpay payment link
    const paymentUrl = `https://razorpay.com/payment-button/${buttonId}/view/?amount=29900`;
    window.open(paymentUrl, '_blank');

    setIsLoading(false);
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      size="lg"
      className={className || "bg-[#096b17] text-white hover:bg-[#075110] border-2 border-[#096b17] px-8 h-14 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"}
    >
      <Sparkles className="w-5 h-5 mr-2" />
      {isLoading ? 'Opening...' : 'Start CALM 1.0'}
    </Button>
  );
}
