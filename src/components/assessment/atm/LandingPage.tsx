import React, { useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Shield,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
  Zap,
  AlertTriangle,
  Phone,
} from 'lucide-react';
import './index.css';
import './styles/globals.css';
import { trackCTA, trackSectionView, trackButtonClick } from '../../../utils/tracking';
import { FloatingButtons } from '../../FloatingButtons';

interface LandingPageProps {
  onStart: () => void;
  onNavigateToWindDown?: () => void;
  onNavigateToDummy?: () => void;
}

export default function LandingPage({ onStart, onNavigateToWindDown, onNavigateToDummy }: LandingPageProps) {
  const whatHowRef = useRef<HTMLElement | null>(null);
  const whatHowTrackedRef = useRef(false);

  // Track "What & How" section when it actually becomes visible (once)
  useEffect(() => {
    const el = document.getElementById('what-how') as HTMLElement | null;
    whatHowRef.current = el;
    if (!el || whatHowTrackedRef.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !whatHowTrackedRef.current) {
          whatHowTrackedRef.current = true;
          trackSectionView('atm_landing_what_how');
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.25 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleStartTop = () => {
    trackCTA('Start ATM Assessment', 'atm_landing');
    onStart();
  };

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
    trackCTA('Skip to Test', 'atm_landing');
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
    trackCTA('Follow Recommendation', 'atm_landing');
    if (onNavigateToWindDown) onNavigateToWindDown();
  };

  const handleStartBottom = () => {
    trackCTA('Take the Assessment', 'atm_landing_bottom_cta');
    onStart();
  };

  const goToWhatHow = () => {
    trackCTA('What & How', 'atm_landing');
    document.getElementById('what-how')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBookClarityCall = () => {
    trackCTA('Book Free Clarity Call', 'atm_landing');
    // Navigate to contact page
    window.location.href = '/contact';
  };

  const handleBookNow = () => {
    trackButtonClick('Book Now', 'floating_cta', 'atm_landing');
    // Navigate to booking page
    history.pushState(null, '', '/');
    window.location.hash = '#booking';
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] relative overflow-hidden">
      {/* Decorative background - matching home page style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-white rounded-full opacity-10 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#64CB81] rounded-full opacity-10 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl animate-[pulse_12s_ease-in-out_infinite]" />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-32 md:pt-36 lg:pt-40 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {/* Content */}
            <div className="space-y-8 text-white max-w-4xl mx-auto">
              <div className="space-y-6">
                <Badge className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/20 animate-[fadeInUp_0.6s_ease-out]">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Your Anxiety Mapping Journey Starts Here
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight animate-[fadeInUp_0.8s_ease-out_0.1s_both]">
                  <span className="block">Feeling anxious even on normal days?</span>
                </h1>

                <p className="text-lg md:text-xl text-green-50 leading-relaxed max-w-xl mx-auto md:mx-0 animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
                  Before the test, it is our medical recommendation that you take a short
                  wind-down so your answers are accurate.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
                <Button
                  onClick={handleSkipToTest}
                  variant="outline"
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 px-6 h-12 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                >
                  Skip and Go to the test
                </Button>

                <Button
                  onClick={handleFollowRecommendation}
                  size="lg"
                  className="bg-white text-xl text-[#096b17] hover:bg-gray-100 px-6 h-12 rounded-xl shadow-sm font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  Follow CuraGo's recommendation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={goToWhatHow}
                  variant="outline"
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 px-6 h-12 rounded-xl font-semibold transition-all duration-300"
                >
                  What &amp; How
                </Button>

                <Button
                  onClick={handleBookClarityCall}
                  variant="outline"
                  size="lg"
                  className="bg-[#64CB81] text-[#64CB81]/90 border border-[#64CB81]/20 px-6 h-12 rounded-xl font-semibold shadow-sm transition-all duration-300"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Book Free Clarity Call
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 pt-4 animate-[fadeInUp_0.8s_ease-out_0.4s_both] justify-center">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#64CB81] to-[#096b17] border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-200 border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#075110] to-[#053d0b] border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white flex items-center justify-center text-white text-xs">
                    +5k
                  </div>
                </div>
                <div className="text-sm text-white">
                  <div className="flex items-center gap-1">
                    <span className="text-[#64CB81]">★★★★★</span>
                    <span className="ml-1">4.8 Overall Rating</span>
                  </div>
                  <p className="mt-1">Trusted by 5,000+ people</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-6 py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white/20 backdrop-blur-sm border border-white/20 p-12 animate-[fadeInUp_0.6s_ease-out]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl text-white mb-1">5,000+</div>
                <div className="text-sm text-green-100">People helped</div>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl text-white mb-1">89%</div>
                <div className="text-sm text-green-100">Better understanding</div>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl text-white mb-1">2 min</div>
                <div className="text-sm text-green-100">Quick assessment</div>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl text-white mb-1">100%</div>
                <div className="text-sm text-green-100">Confidential</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* What & How */}
      <section id="what-how" className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <Badge className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/20">
              Your Personalized Insights
            </Badge>
            <h2 className="text-3xl md:text-4xl text-white">
              What You'll <span className="text-[#64CB81]">Discover</span>
            </h2>
            <p className="text-base md:text-lg text-green-100 max-w-md md:max-w-2xl mx-auto">
              A comprehensive view of your anxiety triggers and personalized coping strategies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: 'Trigger Identification', description: 'Discover the specific situations and thoughts that spark your anxiety' },
              { icon: Target, title: 'Pattern Mapping', description: 'Understand how your triggers connect and influence each other' },
              { icon: Shield, title: 'Coping Strategies', description: 'Receive personalized tools to manage and reduce anxiety responses' },
            ].map((item, idx) => (
              <Card key={idx} className="p-6 bg-white/20 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#64CB81] to-[#096b17] mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-green-100">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border border-white/20 shadow-2xl bg-white/30 backdrop-blur-md">
            <div className="p-12 md:p-16 text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm border border-white/20 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Start Your Journey Today</span>
              </div>

              <h2 className="text-4xl md:text-5xl mb-6 leading-tight font-bold">
                Ready to map your<br />anxiety triggers?
              </h2>

              <p className="text-lg md:text-xl mb-8 text-white max-w-2xl mx-auto">
                Gain clarity in just 2 minutes. Your personalized anxiety map awaits.
              </p>

              <div className="flex justify-center">
                <Button
                  onClick={handleStartBottom}
                  size="lg"
                  className="bg-white text-[#096b17] hover:bg-gray-50 px-10 py-7 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group font-semibold"
                >
                  Take the Assessment
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <p className="text-xs text-white mt-6 flex items-center justify-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                100% free • 2 minutes
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Floating Buttons */}
      <FloatingButtons onBookNow={handleBookNow} />
    </div>
  );
}