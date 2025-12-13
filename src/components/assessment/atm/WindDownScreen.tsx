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
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const startTime = useRef(Date.now());
  const completedRef = useRef(false);
  const eventIdRef = useRef(simpleHash(Date.now().toString()));

  // Breathing sequence: Let us start → Breathe in → Breathe out → Pause → Breathe in → Breathe out → Pause
  const breathingPhases = [
    { text: "Let us start", duration: 2000 },      // 0-2s
    { text: "Breathe in....", duration: 2500 },    // 2-4.5s
    { text: "Breathe out....", duration: 2500 },   // 4.5-7s
    { text: "", duration: 2000 },                  // 7-9s (pause)
    { text: "Breathe in....", duration: 2500 },    // 9-11.5s
    { text: "Breathe out....", duration: 2500 },   // 11.5-14s
    { text: "", duration: 2000 },                  // 14-16s (pause)
  ];

  useEffect(() => {
    // Sequential animations for title and instruction
    setTimeout(() => setShowTitle(true), 200);
    setTimeout(() => setShowInstruction(true), 800);

    // Timer - update every 100ms for smooth UI
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime.current);
    }, 100);

    // Breathing phase progression
    let phaseStartTime = Date.now();
    let currentPhaseIndex = 0;

    const phaseTimer = setInterval(() => {
      const phaseElapsed = Date.now() - phaseStartTime;

      if (currentPhaseIndex < breathingPhases.length && phaseElapsed >= breathingPhases[currentPhaseIndex].duration) {
        currentPhaseIndex++;
        setCurrentPhase(currentPhaseIndex);
        phaseStartTime = Date.now();
      }
    }, 100);

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
      if (currentElapsed < 16000 && !completedRef.current) {
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
  }, []);

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

  // Skip button appears after first "Breathe in" (after phase 0 "Let us start")
  const isSkipVisible = currentPhase >= 1;
  // Ready button appears after all phases complete (16 seconds)
  const isReadyVisible = elapsed >= 16000;

  // Determine breathing circle animation based on current phase
  const getCircleScale = () => {
    if (currentPhase === 1 || currentPhase === 4) {
      // Breathe in - expand
      return [1, 1.2, 1.2];
    } else if (currentPhase === 2 || currentPhase === 5) {
      // Breathe out - contract
      return [1.2, 1, 1];
    }
    return [1, 1, 1]; // Static for "Let us start" and pauses
  };

  const getCircleDuration = () => {
    if (currentPhase === 1 || currentPhase === 4 || currentPhase === 2 || currentPhase === 5) {
      return 2.5; // Breathe in/out duration
    }
    return 2; // Let us start or pause
  };

  const currentText = currentPhase < breathingPhases.length ? breathingPhases[currentPhase].text : "";
  const isBreathingText = currentText.includes("Breathe");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] flex flex-col items-center justify-center px-4 pt-24">
      {/* Decorative background - calm and peaceful */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#64CB81] rounded-full opacity-5 blur-3xl animate-[pulse_15s_ease-in-out_infinite]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto text-center">
        {/* Title - Appears First */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : -20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-3xl md:text-4xl lg:text-5xl text-white font-bold mb-6"
        >
          Wind down for accurate results
        </motion.h1>

        {/* Instruction - Appears Second */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: showInstruction ? 1 : 0, y: showInstruction ? 0 : -10 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-xl md:text-2xl text-green-100 mb-12 font-medium"
        >
          Follow the cue on the screen
        </motion.p>

        {/* Breathing Circle */}
        <motion.div
          className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-[#64CB81] to-[#096b17] shadow-2xl mb-12 flex items-center justify-center my-8"
          animate={{
            scale: getCircleScale(),
          }}
          transition={{
            duration: getCircleDuration(),
            ease: "easeInOut",
          }}
        >
          {/* Inner circle for depth */}
          <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-white/20 backdrop-blur-sm" />
        </motion.div>

        {/* Breathing Text - Prominent and Animated */}
        <div className="h-24 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            {currentText && (
              <motion.p
                key={currentPhase}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className={`font-semibold ${
                  isBreathingText
                    ? 'text-4xl md:text-5xl lg:text-6xl text-[#FFFDBD]'
                    : 'text-2xl md:text-3xl text-green-100'
                }`}
              >
                {currentText}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="mt-8 space-y-4 flex flex-col items-center">
          {/* Skip button - visible after "Breathe in" appears, hidden when Ready appears */}
          {isSkipVisible && !isReadyVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <Button
                onClick={handleSkip}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30 px-10 py-4 rounded-2xl cursor-pointer transition-all duration-700 ease-in-out text-base"
              >
                Skip and continue
              </Button>
            </motion.div>
          )}

          {/* Ready button - visible after all phases complete */}
          {isReadyVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <Button
                onClick={handleReady}
                size="lg"
                className="bg-white text-[#096b17] hover:bg-green-50 px-12 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700 ease-in-out font-semibold cursor-pointer"
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
