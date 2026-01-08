import React from 'react';
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
    <div className="min-h-screen bg-white relative">
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


                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: '#096b17' }}>
                  Gut-Brain Sensitivity Index
                </h1>

                <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#000000' }}>
                  Understand your digestive symptoms through the lens of surgical gastroenterology
                </p>

                <p className="text-lg max-w-2xl mx-auto" style={{ color: '#333333' }}>
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
                    className="bg-[#096b17] hover:bg-[#075110] text-white px-8 h-12 rounded-full text-base font-bold shadow-2xl transform hover:scale-105 transition-all w-full sm:w-auto"
                  >
                    Start Free Assessment
                  </Button>

                  <Button
                    onClick={() => scrollToSection('how-it-works')}
                    variant="outline"
                    size="lg"
                    className="bg-white border-2 border-[#096b17] hover:bg-[#F5F5DC] px-8 h-12 rounded-full font-semibold w-full sm:w-auto"
                    style={{ color: '#096b17' }}
                  >
                    How It Works
                  </Button>
                </div>

                <div className="flex items-center gap-6" style={{ color: '#096b17' }}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">5-7 minutes</span>
                  </div>
                  <div className="w-px h-6 bg-[#096b17]/30"></div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">100% Free</span>
                  </div>
                  <div className="w-px h-6 bg-[#096b17]/30"></div>
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
      <section className="py-20 bg-[#F5F5DC]" id="how-it-works">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#096b17' }}>
                What This Assessment Evaluates
              </h2>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: '#000000' }}>
                A comprehensive evaluation across three critical dimensions
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#096b17] border-[#096b17]/20 p-8 hover:bg-[#075110] transition-all">
                <div className="space-y-6">
                  {[
                    {
                      icon: <AlertCircle className="w-8 h-8" />,
                      title: 'Red Flag Detection',
                      description:
                        'Identifies alarming symptoms that require immediate medical attention',
                    },
                    {
                      icon: <Brain className="w-8 h-8" />,
                      title: 'Brain-Gut Axis',
                      description:
                        'Evaluates the communication between your nervous system and digestive tract',
                    },
                    {
                      icon: <Activity className="w-8 h-8" />,
                      title: 'Metabolic Profile',
                      description:
                        'Assesses mechanical and metabolic factors affecting your gut health',
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-white">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-20 bg-white" id="what-you-get">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#096b17' }}>
                Your Personalized Results Include
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#096b17] border-[#096b17]/20 p-8 hover:bg-[#075110] transition-all">
                <div className="space-y-6">
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
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-white text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="py-20 bg-[#F5F5DC]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#096b17' }}>
                This Assessment Is For You If...
              </h2>
            </motion.div>

            <Card className="bg-white border-[#096b17]/20 p-8">
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
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#64CB81' }} />
                    <span style={{ color: '#000000' }}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                  Ready to Understand Your Gut Health?
                </h2>
                <p className="text-xl max-w-2xl mx-auto" style={{ color: '#000000' }}>
                  Take the first step towards clarity with our evidence-based assessment
                </p>
              </div>

              <Button
                onClick={onStart}
                size="lg"
                className="bg-[#096b17] hover:bg-[#075110] text-white px-8 h-12 rounded-full text-base font-bold shadow-2xl transform hover:scale-105 transition-all"
              >
                Start Free Assessment Now
              </Button>

              <p className="text-sm max-w-md mx-auto" style={{ color: '#666666' }}>
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
