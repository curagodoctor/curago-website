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
      text: "I am exploring",
      destination: 'dummy',
      event: 'filter_exit',
      value: 0,
    },
    {
      id: 2,
      text: "I often feel stuck in anxiety loops and want clarity",
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
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] flex flex-col items-center justify-start px-4 pt-32 md:pt-40 pb-12">
      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto text-center w-full">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-white font-bold leading-tight px-4">
            Which best describes you right now?
          </h2>
        </motion.div>

        {/* Options - No labels, just buttons */}
        <div className="space-y-4 md:space-y-5 w-full max-w-xl">
          {qualificationOptions.map((option, index) => (
            <motion.button
              key={option.id}
              onClick={() => handleSelection(option)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-5 sm:p-6 md:p-7 rounded-2xl text-center bg-white/15 backdrop-blur-md border-2 border-white/30 hover:bg-white/25 hover:border-white/50 text-white shadow-lg hover:shadow-2xl transition-all duration-700 ease-in-out cursor-pointer"
            >
              <p className="text-base sm:text-lg md:text-xl leading-relaxed font-medium text-white">
                {option.text}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
          className="mt-12 text-sm md:text-base text-green-100/70 px-4"
        >
          Choose the option that resonates most with your current experience
        </motion.p>
      </div>
    </div>
  );
}
