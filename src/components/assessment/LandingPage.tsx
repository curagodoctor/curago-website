// src/components/assessment/LandingPage.tsx
import { useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import {
  Brain,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
  Zap,
} from 'lucide-react';
import './index.css';
import './styles/globals.css';

// ✅ tracking helpers
import { trackCTA, trackSectionView } from '../../utils/tracking';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
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
          trackSectionView('aura_landing_what_how');
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.25 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleStartTop = () => {
    trackCTA('Start AURA Index Assessment', 'aura_landing');
    onStart();
  };

  const handleStartBottom = () => {
    trackCTA('Take the Assessment', 'aura_landing_bottom_cta');
    onStart();
  };

  const goToWhatHow = () => {
    trackCTA('What & How', 'aura_landing');
    document.getElementById('what-how')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-teal-50)] via-white to-[var(--brand-violet-50)] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-gradient-to-br from-[var(--brand-teal-200)] to-[var(--brand-violet-200)] rounded-full opacity-20 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-tr from-[var(--brand-rose-200)] to-[var(--brand-violet-200)] rounded-full opacity-20 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-[var(--brand-violet-200)] to-[var(--brand-teal-200)] rounded-full opacity-10 blur-3xl animate-[pulse_12s_ease-in-out_infinite]" />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-32 md:pt-36 lg:pt-40 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="space-y-8 text-center md:text-left">
              <div className="space-y-6">
                <Badge className="px-4 py-2 bg-gradient-to-r from-[var(--brand-teal-100)] to-[var(--brand-violet-100)] text-[var(--brand-teal-700)] border-none animate-[fadeInUp_0.6s_ease-out]">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Your Emotional Fitness Journey Starts Here
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight animate-[fadeInUp_0.8s_ease-out_0.1s_both]">
                  <span className="block text-[#096b17]">AURA Index</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto md:mx-0 animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
                  A quick 3-minute self assessment to help high-performing professionals understand
                  their mental energy, focus and emotional balance.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
                <Button
                  onClick={handleStartTop}
                  size="lg"
                  className="bg-white text-[#096b17] hover:bg-gray-100 border border-black/10 px-8 h-12 rounded-xl shadow-sm"
                >
                  Start AURA Index Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={goToWhatHow}
                  variant="outline"
                  size="lg"
                  className="bg-white text-[#096b17] hover:bg-gray-100 border border-black/10 px-8 h-12 rounded-xl"
                >
                  What &amp; How
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 pt-4 animate-[fadeInUp_0.8s_ease-out_0.4s_both] justify-center md:justify-start">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-teal-400)] to-[var(--brand-teal-600)] border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-violet-400)] to-[var(--brand-violet-600)] border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-rose-400)] to-[var(--brand-rose-600)] border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white flex items-center justify-center text-white text-xs">
                    +5k
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="ml-1">4.8 Overall Rating</span>
                  </div>
                  <p className="mt-1">Trusted by 5,000+ people</p>
                </div>
              </div>
            </div>

            {/* Right cards */}
            <div className="relative animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
              <div className="relative">
                <Card className="absolute top-0 right-0 w-56 p-6 glass border-[var(--brand-teal-200)] shadow-xl rotate-3 hover:rotate-6 transition-transform duration-500 z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--brand-teal-400)] to-[var(--brand-teal-600)] flex items-center justify-center mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg mb-2 text-gray-800">Awareness</h4>
                  <p className="text-sm text-gray-600">Recognize emotions as they arise</p>
                </Card>

                <Card className="absolute top-20 left-0 w-56 p-6 glass border-[var(--brand-violet-200)] shadow-xl -rotate-3 hover:-rotate-6 transition-transform duration-500 z-20">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--brand-violet-400)] to-[var(--brand-violet-600)] flex items-center justify-center mb-3">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg mb-2 text-gray-800">Understanding</h4>
                  <p className="text-sm text-gray-600">Know why emotions emerge</p>
                </Card>

                <Card className="absolute bottom-0 right-10 w-56 p-6 glass border-[var(--brand-rose-200)] shadow-xl rotate-2 hover:rotate-4 transition-transform duration-500 z-30">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--brand-rose-400)] to-[var(--brand-rose-600)] flex items-center justify-center mb-3">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg mb-2 text-gray-800">Regulation</h4>
                  <p className="text-sm text-gray-600">Manage emotional responses</p>
                </Card>

                <div className="w-full h-[400px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-6 py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Card className="glass border-[var(--brand-teal-100)] p-12 animate-[fadeInUp_0.6s_ease-out]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--brand-teal-100)] to-[var(--brand-teal-200)] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-[var(--brand-teal-700)]" />
                </div>
                <div className="text-3xl bg-gradient-to-r from-[var(--brand-teal-600)] to-[var(--brand-violet-600)] bg-clip-text text-transparent mb-1">5,000+</div>
                <div className="text-sm text-gray-600">High-performing professionals</div>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--brand-violet-100)] to-[var(--brand-violet-200)] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-[var(--brand-violet-700)]" />
                </div>
                <div className="text-3xl bg-gradient-to-r from-[var(--brand-teal-600)] to-[var(--brand-violet-600)] bg-clip-text text-transparent mb-1">92%</div>
                <div className="text-sm text-gray-600">Improved awareness</div>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--brand-rose-100)] to-[var(--brand-rose-200)] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-[var(--brand-rose-700)]" />
                </div>
                <div className="text-3xl bg-gradient-to-r from-[var(--brand-teal-600)] to-[var(--brand-violet-600)] bg-clip-text text-transparent mb-1">3 min</div>
                <div className="text-sm text-gray-600">Quick assessment</div>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--brand-teal-100)] to-[var(--brand-violet-100)] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-7 h-7 text-[var(--brand-teal-700)]" />
                </div>
                <div className="text-3xl bg-gradient-to-r from-[var(--brand-teal-600)] to-[var(--brand-violet-600)] bg-clip-text text-transparent mb-1">100%</div>
                <div className="text-sm text-gray-600">Confidential</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* What & How */}
      <section id="what-how" className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <Badge className="px-4 py-2 bg-gradient-to-r from-[var(--brand-violet-100)] to-[var(--brand-rose-100)] text-[var(--brand-violet-700)] border-none">
              Your Personalized Insights
            </Badge>
            <h2 className="text-3xl md:text-4xl text-gray-900">
              What You’ll <span className="bg-gradient-to-r from-[var(--brand-teal-600)] to-[var(--brand-violet-600)] bg-clip-text text-transparent">Discover</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-md md:max-w-2xl mx-auto">
              A compact view of your emotional fitness across four core pillars.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Awareness', description: 'How well you recognize and name emotions as they arise' },
              { icon: Brain, title: 'Understanding', description: 'Your ability to identify root causes of emotional responses' },
              { icon: Heart, title: 'Regulation', description: 'How effectively you manage emotions in challenging moments' },
              { icon: Sparkles, title: 'Alignment', description: 'The harmony between your thoughts, emotions, and actions' },
            ].map((item, idx) => (
              <Card key={idx} className="p-6 glass border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--brand-teal-500)] to-[var(--brand-violet-500)] mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-14">
            <div className="text-center mb-8 space-y-2">
              <Badge className="px-4 py-2 bg-gradient-to-r from-[var(--brand-teal-100)] to-[var(--brand-violet-100)] text-[var(--brand-teal-700)] border-none">
                Simple Process
              </Badge>
              <h2 className="text-3xl md:text-4xl text-gray-900">
                How It <span className="bg-gradient-to-r from-[var(--brand-teal-600)] to-[var(--brand-violet-600)] bg-clip-text text-transparent">Works</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Answer Reflective Scenarios', icon: CheckCircle2 },
                { step: '02', title: 'Get Your Personalized Score', icon: Target },
                { step: '03', title: 'Receive Actionable Insights', icon: Sparkles },
              ].map((item, i) => (
                <Card key={i} className="p-6 glass border-transparent text-center hover:shadow-xl transition">
                  <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--brand-teal-500)] to-[var(--brand-violet-500)]">
                    <item.icon className="w-9 h-9 text-white" />
                  </div>
                  <div className="inline-block text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[var(--brand-teal-100)] to-[var(--brand-violet-100)] text-[var(--brand-teal-700)] mb-2">
                    Step {item.step}
                  </div>
                  <h3 className="text-lg text-gray-800">{item.title}</h3>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-transparent shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-teal-600)] via-[var(--brand-violet-600)] to-[var(--brand-rose-500)] opacity-95" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10 p-12 md:p-16 text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Start Your Journey Today</span>
              </div>

              <h2 className="text-4xl md:text-5xl mb-6 leading-tight">
                Ready to discover your<br />emotional fitness score?
              </h2>

              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Gain clarity in minutes. Your personalized insights await.
              </p>

              <div className="flex justify-center">
                <Button
                  onClick={handleStartBottom}
                  size="lg"
                  className="bg-white text-[var(--brand-violet-700)] hover:bg-gray-50 px-10 py-7 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                  Take the Assessment
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <p className="text-xs text-white/80 mt-6 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                100% free • 3 minutes
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
