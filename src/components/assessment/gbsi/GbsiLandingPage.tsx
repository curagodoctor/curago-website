import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { motion } from 'framer-motion';
import {
  Brain,
  Activity,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Shield,
  Lightbulb,
} from 'lucide-react';

interface GbsiLandingPageProps {
  onStart: () => void;
}

export default function GbsiLandingPage({ onStart }: GbsiLandingPageProps) {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] relative">
      {/* HERO SECTION */}
      <section className="container mx-auto px-4 sm:px-6 pt-32 md:pt-36 lg:pt-40 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Gut-Brain Sensitivity Index
                </h1>

                <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed">
                  Understand your digestive symptoms through the lens of surgical gastroenterology
                </p>

                <p className="text-lg text-white max-w-2xl mx-auto">
                  Is it IBS? Is it serious? Should you worry? Get clarity on your gut health with
                  our evidence-based assessment tool designed by a Surgical Gastroenterologist.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full px-8 sm:px-4">
                  <Button
                    onClick={onStart}
                    size="lg"
                    className="bg-[#64CB81] hover:bg-[#4CAF50] text-white px-8 h-12 rounded-full text-base font-bold shadow-2xl transform hover:scale-105 transition-all w-full sm:w-auto"
                  >
                    Start Free Assessment
                  </Button>

                  <Button
                    onClick={() => scrollToSection('how-it-works')}
                    variant="outline"
                    size="lg"
                    className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 px-8 h-12 rounded-full font-semibold w-full sm:w-auto"
                  >
                    How It Works
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">5-7 minutes</span>
                  </div>
                  <div className="w-px h-6 bg-white/30"></div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">100% Free</span>
                  </div>
                  <div className="w-px h-6 bg-white/30"></div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Confidential</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT WE ASSESS */}
      <section className="py-20 bg-black/10" id="how-it-works">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                What This Assessment Evaluates
              </h2>
              <p className="text-xl text-white max-w-2xl mx-auto">
                A comprehensive evaluation across three critical dimensions
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <AlertCircle className="w-8 h-8" />,
                  title: 'Red Flag Detection',
                  description:
                    'Identifies alarming symptoms that require immediate medical attention',
                  color: 'red',
                },
                {
                  icon: <Brain className="w-8 h-8" />,
                  title: 'Brain-Gut Axis',
                  description:
                    'Evaluates the communication between your nervous system and digestive tract',
                  color: 'purple',
                },
                {
                  icon: <Activity className="w-8 h-8" />,
                  title: 'Metabolic Profile',
                  description:
                    'Assesses mechanical and metabolic factors affecting your gut health',
                  color: 'orange',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 h-full hover:bg-white/15 transition-all">
                    <div
                      className={`w-14 h-14 rounded-xl bg-${item.color}-500/20 flex items-center justify-center mb-4 text-${item.color}-400`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-20" id="what-you-get">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Your Personalized Results Include
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Stethoscope className="w-6 h-6" />,
                  title: 'Clinical Priority Assessment',
                  description: 'Immediate guidance if urgent evaluation is needed',
                },
                {
                  icon: <Target className="w-6 h-6" />,
                  title: 'IBS Classification',
                  description: 'Rome IV criteria-based diagnosis (IBS-C, IBS-D, IBS-M)',
                },
                {
                  icon: <TrendingUp className="w-6 h-6" />,
                  title: 'Brain-Gut Sensitivity Score',
                  description: 'Your Axis Weighting score (0-3) with interpretation',
                },
                {
                  icon: <Lightbulb className="w-6 h-6" />,
                  title: 'Actionable Next Steps',
                  description: 'Personalized recommendations based on your specific profile',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover:bg-white/15 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#64CB81]/20 flex items-center justify-center text-[#64CB81] flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-white text-sm">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="py-20 bg-black/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                This Assessment Is For You If...
              </h2>
            </motion.div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
              <div className="space-y-4">
                {[
                  'You have recurring abdominal pain or discomfort',
                  'Your test results keep coming back "normal" but you still have symptoms',
                  'You experience bloating, gas, or irregular bowel movements',
                  'You notice your gut symptoms worsen with stress',
                  'You want to understand if you need urgent medical attention',
                  'You\'re confused about whether it\'s IBS, GERD, or something else',
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#64CB81] flex-shrink-0 mt-0.5" />
                    <span className="text-white">{item}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Ready to Understand Your Gut Health?
                </h2>
                <p className="text-xl text-white max-w-2xl mx-auto">
                  Take the first step towards clarity with our evidence-based assessment
                </p>
              </div>

              <Button
                onClick={onStart}
                size="lg"
                className="bg-[#64CB81] hover:bg-[#4CAF50] text-white px-8 h-12 rounded-full text-base font-bold shadow-2xl transform hover:scale-105 transition-all"
              >
                Start Free Assessment Now
              </Button>

              <p className="text-sm text-white/60 max-w-md mx-auto">
                This assessment is for informational purposes only and does not replace
                professional medical advice.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
