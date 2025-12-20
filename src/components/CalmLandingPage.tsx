import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import RazorpayButton from './RazorpayButton';
import {
  Brain,
  Shield,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  Lock,
  AlertCircle,
  Activity,
  Lightbulb,
  X,
} from 'lucide-react';

interface CalmLandingPageProps {
  onStartAssessment?: () => void;
}

export default function CalmLandingPage({ onStartAssessment }: CalmLandingPageProps) {
  const [price] = React.useState(299);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] relative overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-[-10%] w-96 h-96 bg-[#096b17] rounded-full opacity-5 blur-3xl"
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
          className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#64CB81] rounded-full opacity-5 blur-3xl"
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
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#096b17] rounded-full opacity-5 blur-3xl animate-[pulse_12s_ease-in-out_infinite]" />
      </div>

      {/* FRAME 1 — HERO / ENTRY */}
      <section className="container mx-auto px-4 sm:px-6 pt-32 md:pt-36 lg:pt-40 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h1 className="leading-tight font-bold animate-[fadeInUp_0.8s_ease-out_0.1s_both]" style={{ color: '#096b17' }}>
                  <span className="text-5xl md:text-6xl lg:text-7xl">CALM</span>{' '}
                  <span className="text-3xl md:text-4xl lg:text-5xl">1.0</span>
                </h1>

                <p className="text-lg md:text-xl font-medium animate-[fadeInUp_0.8s_ease-out_0.2s_both]" style={{ color: '#096b17' }}>
                  Curago's Anxiety Loop Mapping
                </p>

                <h2 className="text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto animate-[fadeInUp_0.8s_ease-out_0.3s_both]" style={{ color: '#096b17' }}>
                  A clear starting point for people who feel anxious but don't know what to do next.
                </h2>

                <p className="text-base animate-[fadeInUp_0.8s_ease-out_0.4s_both]" style={{ color: '#096b17' }}>
                  No diagnosis. No pressure. No obligation to therapy.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
                <RazorpayButton />

                <Button
                  onClick={() => scrollToSection('what-you-get')}
                  variant="outline"
                  size="lg"
                  className="bg-[#096b17] text-white hover:bg-[#075110] border-2 border-[#096b17] px-8 h-14 rounded-xl font-semibold transition-all duration-300"
                >
                  What exactly will I receive?
                </Button>
              </div>

              <p className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2 animate-[fadeInUp_0.8s_ease-out_0.6s_both]" style={{ color: '#096b17' }}>
                <Clock className="w-6 h-6" />
                Takes ~10 minutes
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FRAME 2 — USER MIRRORING */}
      <section className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Fixed Heading */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center bg-[#096b17] py-6 px-8 rounded-t-2xl">
              If you're here, this might sound familiar
            </h2>

            {/* Scrollable Content Box */}
            <div className="bg-[#096b17] rounded-b-2xl p-8 md:p-12 max-h-[500px] overflow-y-auto border-t-4 border-white/20">
              <div className="space-y-5 text-white leading-relaxed">
                <p className="text-base">You've been feeling anxious — maybe for weeks, maybe for years.</p>
                <p className="text-base">You've read articles. You've watched videos. You've spoken to people.</p>

                <p className="pt-4 font-semibold text-lg">And yet the questions keep looping:</p>

                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  {[
                    'Is this really anxiety or something else?',
                    'Do I need therapy?',
                    'Do I need medication?',
                    'Am I overthinking this?',
                    'Who should I even talk to first?'
                  ].map((question, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{question}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 space-y-4 border-t border-white/30 mt-8">
                  <p className="text-base">There are hundreds of therapists and platforms.</p>
                  <p className="text-base">Prices range from ₹99 to ₹10,000.</p>
                  <p className="text-base">Everyone claims to help.</p>
                  <p className="pt-3 text-xl font-bold">
                    But where do you start — without guessing?
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FRAME 3 — WHY CALM EXISTS */}
      <section className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#096b17' }}>
                  Why CALM
                </h2>
                <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#096b17' }}>
                  1.0 exists
                </h2>
              </div>

              <div className="text-center space-y-6" style={{ color: '#096b17' }}>
                <p className="text-base">CALM is designed to do one thing well:</p>

                <p className="text-2xl md:text-3xl font-bold py-4">
                  Help you understand whether you need a consultation at all — and if yes, what kind.
                </p>
              </div>

              {/* Scrollable Cards Container */}
              <div className="relative">
                <div className="overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="flex gap-4 min-w-min">
                    {[
                      { icon: Target, text: 'Your anxiety pattern' },
                      { icon: Activity, text: 'The triggers that sustain it' },
                      { icon: TrendingUp, text: 'How stable or escalatory it is' },
                      { icon: CheckCircle2, text: 'What usually helps this pattern' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#F5F5DC] rounded-xl p-5 border-2 border-[#096b17]/20 min-w-[280px] md:min-w-[320px] flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-[#096b17] flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-left font-medium" style={{ color: '#096b17' }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 space-y-3" style={{ color: '#096b17' }}>
                <p className="font-semibold text-lg">This is not motivational content.</p>
                <p className="font-semibold text-lg">This is not generic advice.</p>
                <p className="text-xl font-bold">This is structured clinical insight.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FRAME 4 — WHAT YOU GET */}
      <section id="what-you-get" className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <div className="text-center space-y-6">
              <Badge className="px-4 py-2 bg-[#096b17] text-white border-2 border-[#096b17]">
                Your Personalized Report
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                What you get
              </h2>
              <div className="max-w-2xl mx-auto space-y-4" style={{ color: '#096b17' }}>
                <p className="text-lg">
                  The CALM 1.0 assessment takes about 10 minutes.
                </p>
                <p className="text-lg">
                  At the end, you receive a personalised clinical report covering:
                </p>
              </div>
            </div>

            {/* Scrollable Cards Container */}
            <div className="relative mt-8">
              <div className="overflow-x-auto pb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="flex gap-8 min-w-min px-2">
                  {[
                    {
                      icon: Brain,
                      title: 'Your Anxiety Loop Map',
                      description: 'How your anxiety forms, repeats, and sustains itself.'
                    },
                    {
                      icon: Target,
                      title: 'Trigger Architecture',
                      description: 'Why anxiety spikes "without reason" on some days.'
                    },
                    {
                      icon: Activity,
                      title: 'Reinforcement Mechanisms',
                      description: 'What unintentionally keeps the loop active. (This is where most people have their "oh" moment.)'
                    },
                    {
                      icon: TrendingUp,
                      title: 'Load vs Capacity Index',
                      description: 'Whether anxiety is driven by overload, recovery failure, or both.'
                    },
                    {
                      icon: Shield,
                      title: 'Stability & Escalation Risk',
                      description: 'Whether your pattern is stable, fluctuating, or likely to worsen.'
                    },
                    {
                      icon: Lightbulb,
                      title: 'Clinical Pathways',
                      description: 'What approaches usually work for this pattern — and what usually doesn\'t.'
                    }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="min-w-[280px] md:min-w-[320px] flex-shrink-0"
                    >
                      <Card className="p-6 bg-[#096b17] border-2 border-[#075110] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-[#096b17] h-full rounded-2xl group">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white mb-4">
                          <item.icon className="w-7 h-7 text-[#096b17]" />
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-white mb-3">
                          {item.title}
                        </h3>
                        <p className="text-sm text-white group-hover:text-white leading-relaxed">
                          {item.description}
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-6 space-y-2" style={{ color: '#096b17' }}>
              <p className="text-base">No instructions. No pressure. No pushing.</p>
              <p className="text-xl font-bold">Just clarity.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FRAME 5 — WHY IT IS PAID */}
      <section className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#096b17' }}>
                Why CALM is a paid assessment
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#096b17' }}>
                We charge a small fee to maintain independence and clinical neutrality
              </p>
            </div>

            {/* Side-by-side comparison - always 2 columns even on mobile */}
            <div className="grid grid-cols-2 gap-3 md:gap-6">
              {/* Free Tools Card */}
              <Card className="p-4 md:p-8 bg-[#096b17] border-2 border-[#075110] rounded-2xl hover:bg-[#096b17] group">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-500/30 flex items-center justify-center flex-shrink-0">
                    <X className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white" />
                  </div>
                  <h3 className="text-sm md:text-xl font-bold text-white group-hover:text-white">
                    Free tools are designed to:
                  </h3>
                </div>
                <ul className="space-y-2 md:space-y-4">
                  {[
                    'Maximise completion',
                    'Increase engagement',
                    'Push everyone toward the same outcome'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 md:gap-3 text-white group-hover:text-white">
                      <span className="text-base md:text-xl flex-shrink-0">•</span>
                      <span className="text-xs md:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* CALM Card */}
              <div className="p-4 md:p-8 rounded-2xl border-2 border-[#075110] shadow-xl hover:bg-[#096b17] group" style={{ backgroundColor: '#096b17' }}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white" />
                  </div>
                  <h3 className="text-sm md:text-xl font-bold text-white group-hover:text-white">
                    CALM is designed to:
                  </h3>
                </div>
                <ul className="space-y-2 md:space-y-4">
                  {[
                    'Be honest',
                    'Say "you don\'t need a consultation" when that\'s true',
                    'Avoid bias toward therapy or medication'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 md:gap-3 text-white group-hover:text-white">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5 text-white group-hover:text-white" />
                      <span className="text-xs md:text-base font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Card className="bg-[#096b17] border-2 border-[#075110] p-6 rounded-2xl hover:bg-[#096b17] group">
                <p className="text-white group-hover:text-white text-lg">
                  Charging for the assessment allows us to keep the report <span className="font-semibold">independent and clinically neutral.</span>
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FRAME 6 — PRICING & SAFETY NET */}
      <section className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              className="relative overflow-hidden border-2 shadow-2xl p-8 md:p-12"
              style={{ backgroundColor: '#FFFDBD', borderColor: '#096b17' }}
            >
              <div className="text-center space-y-8">
                <div>
                  <Badge className="px-4 py-2 mb-4" style={{ backgroundColor: '#096b17', color: 'white' }}>
                    <Sparkles className="w-3 h-3 mr-2" />
                    Clinical Assessment
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#096b17' }}>
                    CALM 1.0 Assessment
                  </h2>
                </div>

                {/* Features as a list */}
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="flex items-center gap-3 justify-start" style={{ color: '#096b17' }}>
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <p className="text-base"><span className="font-semibold">Time required:</span> 10 minutes</p>
                  </div>
                  <div className="flex items-center gap-3 justify-start" style={{ color: '#096b17' }}>
                    <Brain className="w-5 h-5 flex-shrink-0" />
                    <p className="text-base"><span className="font-semibold">Output:</span> Clinical report</p>
                  </div>
                  <div className="flex items-center gap-3 justify-start" style={{ color: '#096b17' }}>
                    <Lock className="w-5 h-5 flex-shrink-0" />
                    <p className="text-base"><span className="font-semibold">Privacy:</span> 100% Safe</p>
                  </div>
                </div>

                <div className="py-4">
                  <p className="text-5xl md:text-6xl font-bold" style={{ color: '#096b17' }}>
                    ₹{price}
                  </p>
                </div>

                <div className="bg-[#096b17] border-2 border-[#075110] rounded-xl p-6 hover:bg-[#096b17] group">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-white group-hover:text-white" />
                    <p className="text-sm text-white group-hover:text-white leading-relaxed text-left">
                      <strong className="text-base">Special Offer:</strong> If you book a consult with Curago within 7 days,
                      <span className="font-bold"> 20% of the amount (₹{(price * 0.2).toFixed(2)}) will be adjusted</span> against your consultation cost
                    </p>
                  </div>
                </div>

                <p className="text-sm" style={{ color: '#096b17' }}>
                  One-time assessment • No subscriptions
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-20 pb-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative overflow-hidden border-2 border-[#075110] shadow-2xl bg-[#096b17] rounded-2xl hover:bg-[#096b17] group">
              <div className="p-12 md:p-16 text-center text-white group-hover:text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm mb-6">
                  <Sparkles className="w-4 h-4 group-hover:text-white" />
                  <span className="group-hover:text-white">Start Your Journey Today</span>
                </div>

                <h2 className="text-3xl md:text-5xl mb-6 leading-tight font-bold group-hover:text-white">
                  This is the safest place to start<br />
                  when you don't know where to start.
                </h2>

                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto group-hover:text-white">
                  Gain clarity on your anxiety pattern in just 10 minutes.
                </p>

                <div className="flex justify-center mb-6">
                  <RazorpayButton />
                </div>

                <p className="text-sm flex items-center justify-center gap-2 font-medium flex-wrap group-hover:text-white">
                  <CheckCircle2 className="w-4 h-4 group-hover:text-white" />
                  <span>Takes ~10 minutes</span>
                  <span>•</span>
                  <span>No obligation</span>
                  <span>•</span>
                  <span>Clinically grounded</span>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
