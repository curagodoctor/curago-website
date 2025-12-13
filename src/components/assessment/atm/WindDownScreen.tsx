import { useState, useEffect, useRef } from 'react';
import { Button } from '../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface WindDownScreenProps {
  onComplete: () => void;  // Navigate to qualification
  onSkip: () => void;      // Navigate to dummy quiz
}

// Helper function for event ID generation
function simpleHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  const base36 = Math.abs(h).toString(36);
  return base36.slice(0, 6).padEnd(6, '0');
}

export default function WindDownScreen({ onComplete, onSkip }: WindDownScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const startTime = useRef(Date.now());
  const completedRef = useRef(false);
  const eventIdRef = useRef(simpleHash(Date.now().toString()));

  const breathingPhases = ["Breathe in....", "Breathe out...."];

  useEffect(() => {
    // Timer - update every 100ms for smooth UI
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime.current);
    }, 100);

    // Breathing phase alternation - every 2 seconds
    const phaseTimer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % 2);
    }, 2000);

    // Heartbeat tracking - every 30 seconds
    const heartbeat = setInterval(() => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'atm_winddown_heartbeat',
        elapsed_s: Math.round((Date.now() - startTime.current) / 1000),
        event_id: eventIdRef.current,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
      console.log('💓 atm_winddown_heartbeat event fired');
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(phaseTimer);
      clearInterval(heartbeat);

      // Abandon event if user leaves before completion
      const currentElapsed = Date.now() - startTime.current;
      if (currentElapsed < 6000 && !completedRef.current) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'winddown_abandon',
          proxy_value: 0,
          currency: 'INR',
          elapsed_s: Math.round(currentElapsed / 1000),
          event_id: eventIdRef.current,
          page_path: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
        console.log('🔄 winddown_abandon event fired');
      }
    };
  }, []); // Run only once on mount

  const handleSkip = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'winddown_exit',
      proxy_value: 0,
      currency: 'INR',
      elapsed_s: Math.round(elapsed / 1000),
      event_id: eventIdRef.current,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    console.log('⏭️ winddown_exit event fired');
    onSkip();
  };

  const handleReady = () => {
    completedRef.current = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'winddown_pass',
      proxy_value: 0,
      currency: 'INR',
      event_id: eventIdRef.current,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ winddown_pass event fired');
    onComplete();
  };

  const isSkipVisible = elapsed >= 1000;  // 1 second
  const isReadyVisible = elapsed >= 6000; // 6 seconds

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] flex flex-col items-center justify-center px-4 pt-24">
      {/* Decorative background - match landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-white rounded-full opacity-10 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#64CB81] rounded-full opacity-10 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-4">
          Wind down for accurate results
        </h2>

        {/* Instructions */}
        <p className="text-lg md:text-xl text-green-100 mb-2">
          Follow the cue on the screen
        </p>

        {/* Breathing Circle */}
        <motion.div
          className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-[#64CB81] to-[#096b17] shadow-2xl mb-8 flex items-center justify-center my-8"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Inner circle for depth */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-sm" />
        </motion.div>

        {/* Breathing Text - Animated */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phaseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-xl md:text-2xl text-white font-semibold mb-8"
          >
            {breathingPhases[phaseIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Buttons */}
        <div className="mt-12 space-y-4 flex flex-col items-center">
          {/* Skip button - visible after 1s, hidden when Ready appears */}
          {isSkipVisible && !isReadyVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Button
                onClick={handleSkip}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 px-8 py-3 rounded-xl cursor-pointer"
              >
                Skip and continue
              </Button>
            </motion.div>
          )}

          {/* Ready button - visible after 6s */}
          {isReadyVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <Button
                onClick={handleReady}
                size="lg"
                className="bg-white text-[#096b17] hover:bg-gray-100 px-10 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold cursor-pointer"
              >
                I'm ready to begin
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
