import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
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
  const [price] = React.useState(499);

  const handleStartAssessment = () => {
    // Redirect to Razorpay payment link
    window.location.href = 'https://rzp.io/rzp/startcalm';
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-[-10%] w-96 h-96 bg-white rounded-full opacity-10 blur-3xl"
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
          className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#64CB81] rounded-full opacity-10 blur-3xl"
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
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl animate-[pulse_12s_ease-in-out_infinite]" />
      </div>

      {/* FRAME 1 — HERO / ENTRY */}
      <section className="container mx-auto px-4 sm:px-6 pt-32 md:pt-36 lg:pt-40 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-white"
            >
              <div className="space-y-6">
                <Badge className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/20 animate-[fadeInUp_0.6s_ease-out]">
                  <Brain className="w-3 h-3 mr-2" />
                  Clinical Anxiety Loop Mapping
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight font-bold animate-[fadeInUp_0.8s_ease-out_0.1s_both]">
                  CALM 1.0
                </h1>

                <h2 className="text-xl md:text-2xl text-green-50 leading-relaxed max-w-2xl mx-auto animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
                  A clear starting point for people who feel anxious but don't know what to do next.
                </h2>

                <p className="text-sm text-green-100 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
                  No diagnosis. No pressure. No obligation to therapy.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
                <Button
                  onClick={handleStartAssessment}
                  size="lg"
                  className="bg-white text-[#096b17] hover:bg-gray-100 px-8 h-14 rounded-xl shadow-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
                >
                  Start CALM 1.0
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={() => scrollToSection('what-you-get')}
                  variant="outline"
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 px-8 h-14 rounded-xl font-semibold transition-all duration-300"
                >
                  What exactly will I receive?
                </Button>
              </div>

              <p className="text-sm text-green-100 flex items-center justify-center gap-2 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
                <Clock className="w-4 h-4" />
                Takes ~10 minutes • You can stop anytime
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
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                If you're here, this might sound familiar
              </h2>

              <div className="space-y-5 text-green-50 leading-relaxed">
                <p className="text-base">You've been feeling anxious — maybe for weeks, maybe for years.</p>
                <p className="text-base">You've read articles. You've watched videos. You've spoken to people.</p>

                <p className="pt-4 text-white font-semibold text-lg">And yet the questions keep looping:</p>

                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  {[
                    'Is this really anxiety or something else?',
                    'Do I need therapy?',
                    'Do I need medication?',
                    'Am I overthinking this?',
                    'Who should I even talk to first?'
                  ].map((question, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-green-100">
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#64CB81]" />
                      <span className="text-sm">{question}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 space-y-4 border-t border-white/20 mt-8">
                  <p className="text-base">There are hundreds of therapists and platforms.</p>
                  <p className="text-base">Prices range from ₹99 to ₹10,000.</p>
                  <p className="text-base">Everyone claims to help.</p>
                  <p className="pt-3 text-xl text-white font-bold">
                    But where do you start — without guessing?
                  </p>
                </div>
              </div>
            </Card>
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
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-12">
              <div className="text-center mb-8">
                <Badge className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/20">
                  <Lightbulb className="w-3 h-3 mr-2" />
                  Our Approach
                </Badge>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                Why CALM 1.0 exists
              </h2>

              <div className="space-y-8 text-green-50 leading-relaxed text-center">
                <p className="text-lg">
                  Before consultations, before therapy, before medication,<br />
                  CuraGo uses a clinical-grade psychometric tool called CALM 1.0.
                </p>

                <p className="text-base">CALM is designed to do one thing well:</p>

                <p className="text-2xl md:text-3xl font-bold text-white py-6">
                  Help you understand whether you need a consultation at all — and if yes, what kind.
                </p>

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: Target, text: 'Your anxiety pattern' },
                    { icon: Activity, text: 'The triggers that sustain it' },
                    { icon: TrendingUp, text: 'How stable or escalatory it is' },
                    { icon: CheckCircle2, text: 'What usually helps this pattern' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#64CB81] to-[#096b17] flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-left font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 space-y-3">
                  <p className="text-white font-semibold text-lg">This is not motivational content.</p>
                  <p className="text-white font-semibold text-lg">This is not generic advice.</p>
                  <p className="text-white text-xl font-bold">This is structured clinical insight.</p>
                </div>
              </div>
            </Card>
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
            <div className="text-center space-y-4">
              <Badge className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/20">
                Your Personalized Report
              </Badge>
              <h2 className="text-3xl md:text-4xl text-white font-bold">
                What you get
              </h2>
              <p className="text-green-100 max-w-2xl mx-auto text-lg">
                The CALM 1.0 assessment takes about 10 minutes.<br />
                At the end, you receive a personalised clinical report covering:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                >
                  <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#64CB81] to-[#096b17] mb-4">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-green-100 leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center pt-6 space-y-2 text-green-50">
              <p className="text-base">No instructions. No pressure. No pushing.</p>
              <p className="text-xl font-bold text-white">Just clarity.</p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why CALM is a paid assessment
              </h2>
              <p className="text-green-100 text-lg max-w-2xl mx-auto">
                We charge a small fee to maintain independence and clinical neutrality
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Tools Card */}
              <Card className="p-8 bg-white/10 backdrop-blur-sm border-2 border-red-400/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Free tools are designed to:
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Maximise completion',
                    'Increase engagement',
                    'Push everyone toward the same outcome'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-green-100">
                      <span className="text-red-400 text-xl flex-shrink-0">•</span>
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* CALM Card */}
              <div className="p-8 rounded-xl border-2 border-[#64CB81] shadow-xl" style={{ backgroundColor: '#096b17' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    CALM is designed to:
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Be honest',
                    'Say "you don\'t need a consultation" when that\'s true',
                    'Avoid bias toward therapy or medication'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
                      <span className="text-base font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <p className="text-green-50 text-lg">
                  Charging for the assessment allows us to keep the report <span className="text-white font-semibold">independent and clinically neutral.</span>
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

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-2 bg-white/80 rounded-xl p-5 border-2 border-[#096b17]/20">
                    <Clock className="w-6 h-6" style={{ color: '#096b17' }} />
                    <p className="text-xs text-gray-600 font-medium">Time required</p>
                    <p className="font-bold text-gray-900 text-lg">~10 minutes</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-white/80 rounded-xl p-5 border-2 border-[#096b17]/20">
                    <Brain className="w-6 h-6" style={{ color: '#096b17' }} />
                    <p className="text-xs text-gray-600 font-medium">Output</p>
                    <p className="font-bold text-gray-900 text-lg">Clinical report</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-white/80 rounded-xl p-5 border-2 border-[#096b17]/20">
                    <Lock className="w-6 h-6" style={{ color: '#096b17' }} />
                    <p className="text-xs text-gray-600 font-medium">Privacy</p>
                    <p className="font-bold text-gray-900 text-lg">100% Safe</p>
                  </div>
                </div>

                <div className="py-4">
                  <p className="text-5xl md:text-6xl font-bold" style={{ color: '#096b17' }}>
                    ₹{price}
                  </p>
                </div>

                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-green-600" />
                    <p className="text-sm text-gray-800 leading-relaxed text-left">
                      <strong className="text-base">Special Offer:</strong> If you choose to consult with CuraGo later,
                      <span className="font-bold text-green-700"> 50% of this amount (₹{price / 2}) is adjusted</span> against your consultation
                      if you book within 7 days of CALM 1.0 purchase
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  One-time assessment • No subscriptions
                </p>

                <Button
                  onClick={handleStartAssessment}
                  size="lg"
                  className="w-full md:w-auto px-10 py-7 text-lg rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#096b17', color: 'white' }}
                >
                  Start CALM 1.0 Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  You can pause or stop anytime
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FRAME 7 — WHO IT IS / IS NOT FOR */}
      <section className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <Card className="p-8 bg-gradient-to-br from-[#64CB81]/30 to-[#096b17]/30 backdrop-blur-sm border-2 border-[#64CB81]/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#64CB81]/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[#64CB81]" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  CALM is for you if:
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  'You want clarity before committing to therapy or medication',
                  'You don\'t want to guess your next step',
                  'You prefer understanding over reassurance',
                  'You value structured insight over generic advice'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#64CB81]" />
                    <span className="text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 bg-white/10 backdrop-blur-sm border-2 border-red-400/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  CALM is not for:
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  'People looking for instant relief',
                  'Casual curiosity',
                  'Entertainment quizzes'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-green-100">
                    <span className="text-red-400 flex-shrink-0 mt-0.5 text-xl">✗</span>
                    <span className="text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FRAME 8 — PRIVACY */}
      <section className="container mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-[#64CB81] flex-shrink-0 mt-1" />
                <div className="text-sm text-green-100 space-y-2">
                  <p>Your data is confidential.</p>
                  <p>Your report is securely linked to your contact details.</p>
                  <p>We do not sell or share your information.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FRAME 9 — FINAL CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-20 pb-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative overflow-hidden border border-white/20 shadow-2xl bg-white/30 backdrop-blur-md">
              <div className="p-12 md:p-16 text-center text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm border border-white/20 text-sm mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>Start Your Journey Today</span>
                </div>

                <h2 className="text-3xl md:text-5xl mb-6 leading-tight font-bold">
                  This is the safest place to start<br />
                  when you don't know where to start.
                </h2>

                <p className="text-lg md:text-xl mb-8 text-green-50 max-w-2xl mx-auto">
                  Gain clarity on your anxiety pattern in just 10 minutes.
                </p>

                <div className="flex justify-center mb-6">
                  <Button
                    onClick={handleStartAssessment}
                    size="lg"
                    className="bg-white text-[#096b17] hover:bg-gray-50 px-10 py-7 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group font-semibold"
                  >
                    Start CALM 1.0 Assessment
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <p className="text-sm text-white flex items-center justify-center gap-2 font-medium flex-wrap">
                  <CheckCircle2 className="w-4 h-4" />
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
