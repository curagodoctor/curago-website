import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, CheckCircle2 } from 'lucide-react';

interface AnalyzingScreenProps {
  userName: string;
}

export default function AnalyzingScreen({ userName }: AnalyzingScreenProps) {
  const [stage, setStage] = useState(0);

  const stages = [
    'Processing your responses...',
    'Analyzing anxiety patterns...',
    'Mapping trigger architecture...',
    'Calculating loop dynamics...',
    'Generating your report...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl p-8 md:p-12 border-2 border-[#096b17]/20 shadow-2xl">
          <div className="text-center space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <Brain className="w-16 h-16 text-[#096b17]" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                Analyzing Your Responses
              </h2>
              <p className="text-lg" style={{ color: '#096b17' }}>
                Hi {userName}, we're creating your personalized CALM report
              </p>
            </div>

            {/* Progress Stages */}
            <div className="space-y-3">
              {stages.map((text, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= stage ? 1 : 0.3,
                    x: 0
                  }}
                  className="flex items-center gap-3 text-left"
                >
                  {index < stage ? (
                    <CheckCircle2 className="w-5 h-5 text-[#096b17] flex-shrink-0" />
                  ) : index === stage ? (
                    <Loader2 className="w-5 h-5 text-[#096b17] flex-shrink-0 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#096b17]/30 flex-shrink-0" />
                  )}
                  <span className={`text-sm md:text-base ${
                    index <= stage ? 'font-medium' : ''
                  }`} style={{ color: index <= stage ? '#096b17' : 'rgba(9, 107, 23, 0.5)' }}>
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Loading Bar */}
            <div className="relative">
              <div className="w-full h-2 bg-[#F5F5DC] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#096b17] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((stage + 1) / stages.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Info Text */}
            <p className="text-sm" style={{ color: 'rgba(9, 107, 23, 0.7)' }}>
              This usually takes 5-10 seconds. Please don't close this window.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
