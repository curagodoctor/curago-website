import React from 'react';
import { Button } from '../components/ui/button';
import './index.css';
import './styles/globals.css';

interface LandingPageProps {
  onStart: () => void;
  onNavigateToWindDown?: () => void;
  onNavigateToDummy?: () => void;
}

export default function LandingPage({ onStart, onNavigateToWindDown, onNavigateToDummy }: LandingPageProps) {
  const handleSkipToTest = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'curiosity_exit',
      proxy_value: 0,
      currency: 'INR',
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    console.log('⏭️ curiosity_exit event fired');
    if (onNavigateToDummy) onNavigateToDummy();
  };

  const handleFollowRecommendation = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'curiosity_pass',
      proxy_value: 0,
      currency: 'INR',
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ curiosity_pass event fired');
    if (onNavigateToWindDown) onNavigateToWindDown();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b]">
      {/* Hero - Centered and Clean */}
      <section className="container mx-auto px-4 sm:px-6 pt-32 md:pt-40 lg:pt-48 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            {/* Content with Sequential Animations */}
            <div className="space-y-6 sm:space-y-8">
              {/* Main Headline - Appears First */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white font-bold animate-[fadeInUp_0.8s_ease-out_0.1s_both]">
                If you are feeling anxious even on normal days...
              </h1>

              {/* Subline - Appears Second */}
              <p className="text-base sm:text-lg md:text-xl text-green-100 leading-relaxed max-w-2xl mx-auto animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
                it is our medical recommendation that you take a short wind-down so your answers are accurate
              </p>

              {/* CTAs - Appear Third - Both Same Style with Beige Background */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
                <Button
                  onClick={handleSkipToTest}
                  size="lg"
                  className="w-full sm:w-auto bg-white hover:bg-[#FFFDBD] text-[#096b17] px-6 sm:px-8 h-12 sm:h-14 rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl border-2 border-white/50 text-sm sm:text-base"
                >
                  Skip and Go to the test
                </Button>

                <Button
                  onClick={handleFollowRecommendation}
                  size="lg"
                  className="w-full sm:w-auto bg-white hover:bg-[#FFFDBD] text-[#096b17] px-6 sm:px-8 h-12 sm:h-14 rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl border-2 border-white/50 text-sm sm:text-base"
                >
                  Follow CuraGo's recommendation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}