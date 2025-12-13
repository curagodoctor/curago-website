import { useRef } from 'react';
import { motion } from 'framer-motion';

interface QualificationScreenProps {
  onNavigateToActual: () => void;  // Navigate to actual quiz
  onNavigateToDummy: () => void;   // Navigate to dummy quiz
}

// Helper function for event ID generation
function simpleHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  const base36 = Math.abs(h).toString(36);
  return base36.slice(0, 6).padEnd(6, '0');
}

interface QualificationOption {
  id: number;
  text: string;
  destination: 'dummy' | 'actual';
  event: string;
  value: number;
}

export default function QualificationScreen({ onNavigateToActual, onNavigateToDummy }: QualificationScreenProps) {
  const eventIdRef = useRef(simpleHash(Date.now().toString()));

  const qualificationOptions: QualificationOption[] = [
    {
      id: 1,
      text: "I'm just exploring or taking this casually.",
      destination: 'dummy',
      event: 'filter_exit',
      value: 0,
    },
    {
      id: 2,
      text: "I feel anxious sometimes, but I can manage it.",
      destination: 'actual',
      event: 'filter_nurture',
      value: 0,
    },
    {
      id: 3,
      text: "I often feel stuck in anxiety loops and want clarity.",
      destination: 'actual',
      event: 'filter_pass',
      value: 10,
    },
  ];

  const handleSelection = (option: QualificationOption) => {
    // Fire tracking event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: option.event,
      proxy_value: option.value,
      currency: 'INR',
      event_id: eventIdRef.current,
      filter_type: 'anxiety_qualification',
      option_id: option.id,
      option_text: option.text,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ ${option.event} event fired with value ₹${option.value}`);

    // Navigate based on destination
    if (option.destination === 'dummy') {
      onNavigateToDummy();
    } else {
      onNavigateToActual();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] flex flex-col items-center justify-center px-4 pt-24 pb-12">
      {/* Decorative background - match landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-white rounded-full opacity-10 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#64CB81] rounded-full opacity-10 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto text-center w-full">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl text-white font-bold leading-tight px-4">
            Which best describes you right now?
          </h2>
        </motion.div>

        {/* Options */}
        <div className="space-y-3 md:space-y-4 w-full max-w-2xl">
          {qualificationOptions.map((option, index) => (
            <motion.button
              key={option.id}
              onClick={() => handleSelection(option)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 sm:p-5 md:p-6 rounded-2xl text-left bg-white/40 backdrop-blur-md border-2 border-white/30 hover:bg-white/50 hover:border-white/40 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 min-w-[2rem] sm:min-w-[2.25rem] rounded-full flex-shrink-0 flex items-center justify-center text-sm sm:text-base font-bold bg-white/30 backdrop-blur-sm text-white border-2 border-white/20">
                  {String.fromCharCode(64 + option.id)}
                </div>
                <p className="text-sm sm:text-base leading-relaxed font-medium text-white flex-1">
                  {option.text}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Optional helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-sm md:text-base text-green-100/80 px-4"
        >
          Choose the option that resonates most with your current experience
        </motion.p>
      </div>
    </div>
  );
}
