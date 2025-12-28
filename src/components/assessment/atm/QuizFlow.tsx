import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { AtmAnswers, UserInfo } from '../../../types/atm';

// ---- Types
interface Option {
  text: string;
  value: number;
}
interface Question {
  id: keyof AtmAnswers;
  text: string;
  options: Option[];
}

// ---- Questions
const questions: Question[] = [
  {
    id: 'q1',
    text: 'Where does your anxiety usually begin?',
    options: [
      { text: 'Overthinking, mental loops, imagining scenarios', value: 1 },
      { text: 'Tight chest, heavy stomach, shaky feeling', value: 2 },
      { text: 'Sudden fear, sadness, irritability', value: 3 },
      { text: 'Fear of making the wrong choice', value: 4 },
      { text: "I'm not sure", value: 5 },
    ],
  },
  {
    id: 'q2',
    text: 'What usually triggers it first?',
    options: [
      { text: 'High expectations', value: 1 },
      { text: 'Fear of making a wrong decision', value: 2 },
      { text: 'Feeling “not good enough”', value: 3 },
      { text: 'Sudden change or situational uncertainty', value: 4 },
      { text: 'A past memory', value: 5 },
      { text: "I can't identify it", value: 6 },
    ],
  },
  {
    id: 'q3',
    text: 'How do you react in the first 2 minutes?',
    options: [
      { text: 'My mind spirals out of control', value: 1 },
      { text: 'I act normal but panic inside', value: 2 },
      { text: 'My body reacts with chest tightness, sweating, aches and so on', value: 3 },
      { text: 'I just freeze', value: 4 },
      { text: 'I try to quickly fix everything', value: 5 },
    ],
  },
  {
    id: 'q4',
    text: 'What is the biggest cost of your anxiety right now?',
    options: [
      { text: 'My focus suffers', value: 1 },
      { text: 'My sleep is disrupted', value: 2 },
      { text: 'My confidence takes a hit', value: 3 },
      { text: 'Relationships get affected', value: 4 },
      { text: 'My health gets affected', value: 5 },
    ],
  },
  {
    id: 'q5',
    text: 'What is the one relief you wish you had?',
    options: [
      { text: '“I wish my mind would stop overthinking.”', value: 1 },
      { text: '“I wish my body would calm down faster.”', value: 2 },
      { text: '“I wish I didn’t react emotionally so fast.”', value: 3 },
      { text: '“I wish I didn’t judge myself.”', value: 4 },
      { text: '“I wish I didn’t spiral from small triggers.”', value: 5 },
      { text: '“I wish I understood what’s happening.”', value: 6 },
    ],
  },
];

interface QuizFlowProps {
  onComplete: (answers: AtmAnswers, userInfo: UserInfo) => void;
}

export default function QuizFlow({ onComplete }: QuizFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<AtmAnswers>>({});
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const startedRef = useRef(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'atm_quiz_start',
        page_path: window.location.pathname,
        atm_stage: 'start',
      });
      console.log('🧠 atm_quiz_start event pushed to dataLayer');
    }
  }, []);

  const handleAnswer = (optionValue: number) => {
    const newAnswers = { ...answers, [question.id]: optionValue };
    setAnswers(newAnswers);
    setSelectedValue(optionValue);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((q) => q + 1);
        setSelectedValue(null);
      } else {
        // Quiz complete - navigate to results (test_finish event fires on ResultScreen)
        const user: UserInfo = { name: '', whatsapp: '', email: '' };
        onComplete(newAnswers as AtmAnswers, user);
      }
    }, 450);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
      setSelectedValue(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF5] to-[#FFFFFF] flex flex-col pt-24">
      <div className="w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] p-3 sticky top-16 z-20 shadow-sm">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#0A0A0A] font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-[#0A0A0A] font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="relative">
            <div className="w-full h-3 bg-[#E5E7EB] rounded-full overflow-hidden shadow-inner border border-[#D1D5DB]">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{
                  background: 'linear-gradient(to right, #0284C7, #0369A1)',
                  width: `${progress}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-16 md:py-20">
        <div className="max-w-2xl sm:max-w-3xl md:max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="space-y-8 sm:space-y-10 md:space-y-12"
            >
              <div className="text-center space-y-4 md:space-y-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#0A0A0A] font-bold max-w-3xl mx-auto leading-tight px-4">
                  {question.text}
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option.value)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={selectedValue === option.value ? {
                      background: 'linear-gradient(to right, #0284C7, #0369A1)',
                      borderColor: '#0284C7'
                    } : {}}
                    className={`w-full p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl text-left transition-all duration-300 ${
                      selectedValue === option.value
                        ? 'shadow-xl border-2'
                        : 'bg-white border-2 border-[#E5E7EB] hover:bg-[#F8F9FA] hover:border-[#0284C7] text-[#0A0A0A] shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm sm:text-base font-bold transition-all duration-300 ${
                          selectedValue === option.value
                            ? 'bg-white text-[#0284C7] scale-110 shadow-lg'
                            : 'bg-[#E0F2FE] text-[#0284C7] border-2 border-[#E5E7EB]'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${selectedValue === option.value ? 'text-white' : 'text-[#0A0A0A]'}`}>
                        {option.text}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center pt-6 md:pt-8">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="bg-white border-2 border-[#E5E7EB] hover:bg-[#F8F9FA] hover:border-[#0A0A0A] text-[#0A0A0A] font-semibold rounded-xl md:rounded-2xl px-6 sm:px-8 md:px-10 py-2 sm:py-3 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Previous
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}