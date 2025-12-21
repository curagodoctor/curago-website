import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import RazorpayButton from './RazorpayButton';
import { WhatsAppConfirmDialog } from './WhatsAppConfirmDialog';
import {
  Brain,
  Shield,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  Lock,
  AlertCircle,
  Activity,
  Lightbulb,
} from 'lucide-react';

interface CalmLandingPageProps {
  onStartAssessment?: () => void;
}

export default function CalmLandingPage({ onStartAssessment }: CalmLandingPageProps) {
  const [price] = useState(299);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleWhatsAppClick = () => {
    setShowWhatsAppDialog(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                  A clear starting point at just ₹299 for people who feel anxious but don't know what to do next.
                </h2>

                <p className="text-base animate-[fadeInUp_0.8s_ease-out_0.4s_both]" style={{ color: '#096b17' }}>
                  No diagnosis. No pressure. No obligation to therapy.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col items-center justify-center gap-6 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

                <p className="text-xs text-center max-w-md" style={{ color: '#096b17' }}>
                  By clicking Start CALM 1.0, you are agreeing to our{' '}
                  <a
                    href="/calm/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#075110] transition-colors"
                  >
                    terms and conditions
                  </a>
                </p>
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
            {/* Fixed Text Box */}
            <div className="bg-[#096b17] rounded-2xl shadow-2xl border-4 border-[#075110] overflow-hidden">
              {/* Fixed Heading */}
              <div className="bg-[#075110] py-6 px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                  If you're here, this might sound familiar
                </h2>
              </div>

              {/* Scrollable Content Box with Fixed Height */}
              <div className="p-8 md:p-12 h-[500px] overflow-y-auto">
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* FRAME 3 — WHY CALM EXISTS */}
      <section className="bg-[#FFFDBD] py-20 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#096b17' }}>
                  Why CALM 1.0 exists
                </h2>
              </div>

              <div className="text-center space-y-6" style={{ color: '#096b17' }}>
                <p className="text-base">CALM is designed to do one thing well:</p>

                <p className="text-2xl md:text-3xl font-bold py-4">
                  Help you understand whether you need a consultation at all — and if yes, what kind.
                </p>
              </div>

              {/* Auto-scrolling Cards Container - Marquee */}
              <div className="relative w-full overflow-hidden">
                <style>{`
                  @keyframes scroll-left {
                    0% {
                      transform: translateX(0);
                    }
                    100% {
                      transform: translateX(-50%);
                    }
                  }
                  .animate-scroll {
                    animation: scroll-left 30s linear infinite;
                  }
                  .animate-scroll:hover {
                    animation-play-state: paused;
                  }
                `}</style>
                <div className="flex gap-4 animate-scroll" style={{ width: 'max-content' }}>
                  {/* First set of cards */}
                  {[
                    { icon: Target, text: 'Your anxiety pattern' },
                    { icon: Activity, text: 'The triggers that sustain it' },
                    { icon: TrendingUp, text: 'How stable or escalatory it is' },
                    { icon: CheckCircle2, text: 'What usually helps this pattern' },
                  ].map((item, idx) => (
                    <div key={`set1-${idx}`} className="flex flex-col items-center justify-center gap-3 bg-[#F5F5DC] rounded-xl p-5 border-2 border-[#096b17]/20 w-[200px] h-[200px] flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-[#096b17] flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-center font-medium text-sm leading-tight" style={{ color: '#096b17' }}>{item.text}</span>
                    </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {[
                    { icon: Target, text: 'Your anxiety pattern' },
                    { icon: Activity, text: 'The triggers that sustain it' },
                    { icon: TrendingUp, text: 'How stable or escalatory it is' },
                    { icon: CheckCircle2, text: 'What usually helps this pattern' },
                  ].map((item, idx) => (
                    <div key={`set2-${idx}`} className="flex flex-col items-center justify-center gap-3 bg-[#F5F5DC] rounded-xl p-5 border-2 border-[#096b17]/20 w-[200px] h-[200px] flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-[#096b17] flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-center font-medium text-sm leading-tight" style={{ color: '#096b17' }}>{item.text}</span>
                    </div>
                  ))}
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
        </div>
      </section>

      {/* FRAME 4 — WHAT YOU GET */}
      <section id="what-you-get" className="container mx-auto px-4 sm:px-6 py-20 relative z-10 overflow-x-hidden">
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

            {/* Auto-scrolling Cards Container - Marquee */}
            <div className="relative w-full overflow-hidden mt-8">
              <style>{`
                @keyframes scroll-left-slow {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
                .animate-scroll-slow {
                  animation: scroll-left-slow 40s linear infinite;
                }
                .animate-scroll-slow:hover {
                  animation-play-state: paused;
                }
              `}</style>
              <div className="flex gap-6 animate-scroll-slow pb-6" style={{ width: 'max-content' }}>
                {/* First set of cards */}
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
                    description: 'What unintentionally keeps the loop active.'
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
                    description: 'What approaches usually work for this pattern.'
                  }
                ].map((item, idx) => (
                  <Card key={`set1-${idx}`} className="p-6 bg-[#096b17] border-2 border-[#075110] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-[#096b17] rounded-2xl group w-[280px] h-[280px] flex flex-col flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white mb-4 flex-shrink-0">
                      <item.icon className="w-7 h-7 text-[#096b17]" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white group-hover:text-white leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                ))}
                {/* Duplicate set for seamless loop */}
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
                    description: 'What unintentionally keeps the loop active.'
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
                    description: 'What approaches usually work for this pattern.'
                  }
                ].map((item, idx) => (
                  <Card key={`set2-${idx}`} className="p-6 bg-[#096b17] border-2 border-[#075110] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-[#096b17] rounded-2xl group w-[280px] h-[280px] flex flex-col flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white mb-4 flex-shrink-0">
                      <item.icon className="w-7 h-7 text-[#096b17]" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white group-hover:text-white leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                ))}
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
      <section className="bg-[#FFFDBD] py-20">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
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
              <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#096b17' }}>
                We charge a small fee to maintain independence and clinical neutrality
              </p>
            </div>

            {/* Table with visible borders */}
            <div className="bg-[#096b17] rounded-2xl shadow-2xl border-4 border-[#075110] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-6 md:p-8 border-2 border-white text-white text-lg md:text-2xl font-bold text-center">
                      Free tools are designed to:
                    </th>
                    <th className="p-6 md:p-8 border-2 border-white text-white text-lg md:text-2xl font-bold text-center">
                      CALM 1.0 is designed to:
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-6 md:p-8 border-2 border-white text-white text-base md:text-lg text-center">
                      Maximise completion
                    </td>
                    <td className="p-6 md:p-8 border-2 border-white text-white text-base md:text-lg font-semibold italic text-center">
                      Be honest
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 md:p-8 border-2 border-white text-white text-base md:text-lg text-center">
                      Increase engagement
                    </td>
                    <td className="p-6 md:p-8 border-2 border-white text-white text-base md:text-lg font-semibold italic text-center">
                      Help people who really need clarity
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 md:p-8 border-2 border-white text-white text-base md:text-lg text-center">
                      Push everyone towards therapy or a consultation
                    </td>
                    <td className="p-6 md:p-8 border-2 border-white text-white text-base md:text-lg font-semibold italic text-center">
                      Say "you don't need a consultation" when that's true
                    </td>
                  </tr>
                </tbody>
              </table>
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
                      <strong className="text-base">Special Offer:</strong> If you book a consult with CuraGo within 7 days
                      <span className="font-bold"> 50% (₹150)</span> of the amount will be adjusted with your consultation fee 
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
      <section className="bg-[#FFFDBD] py-20 pb-32">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
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

                  <div className="flex flex-col items-center gap-4 mb-6">
                    <RazorpayButton
                      className="bg-white text-[#096b17] hover:bg-white border-4 border-white px-12 py-8 h-auto rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-all duration-300"
                    />

                    <p className="text-xs text-white text-center max-w-md group-hover:text-white">
                      By clicking Start CALM 1.0, you are agreeing to our{' '}
                      <a
                        href="/calm/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80 transition-opacity"
                      >
                        terms and conditions
                      </a>
                    </p>
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
        </div>
      </section>

      {/* Sticky WhatsApp Button */}
      <motion.button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 left-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        aria-label="Contact us on WhatsApp"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </motion.button>

      {/* WhatsApp Confirmation Dialog */}
      <WhatsAppConfirmDialog
        isOpen={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        source="calm_landing_page"
        message="Hi, I want to know more about CALM 1.0"
      />
    </div>
  );
}
