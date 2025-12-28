import { useState, useEffect, useRef } from 'react';
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

// ---- Questions (same as actual quiz)
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
      { text: 'Feeling "not good enough"', value: 3 },
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
      { text: '"I wish my mind would stop overthinking."', value: 1 },
      { text: '"I wish my body would calm down faster."', value: 2 },
      { text: '"I wish I didn\'t react emotionally so fast."', value: 3 },
      { text: '"I wish I didn\'t judge myself."', value: 4 },
      { text: '"I wish I didn\'t spiral from small triggers."', value: 5 },
      { text: '"I wish I understood what\'s happening."', value: 6 },
    ],
  },
];

interface QuizFlowProps {
  onComplete: (answers: AtmAnswers, userInfo: UserInfo) => void;
}

export default function DummyQuizFlow({ onComplete }: QuizFlowProps) {
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
        event: 'dummy_quiz_start',
        page_path: window.location.pathname,
        atm_stage: 'dummy_start',
      });
      console.log('🧠 dummy_quiz_start event pushed to dataLayer');
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
        // Quiz complete - navigate to dummy results (dummy_done event fires on DummyResultScreen)
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
    <div className="min-h-screen bg-[#F5F5DC] flex flex-col pt-24" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="w-full bg-white border-b-2 border-[#096b17]/20 p-3 sticky top-16 z-20 shadow-sm">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: '#096b17' }}>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#096b17' }}>{Math.round(progress)}%</span>
          </div>
          <div className="relative">
            <div className="w-full h-2 bg-[#F5F5DC] rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-[#096b17] rounded-full transition-all duration-500 ease-out shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
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
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto leading-tight px-4" style={{ color: '#096b17' }}>
                  {question.text}
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
                {question.options.map((option, index) => {
                  const isSelected = selectedValue === option.value;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(option.value)}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 sm:p-5 md:p-8 rounded-2xl md:rounded-3xl text-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#096b17] text-white shadow-xl border-2 border-[#096b17]'
                          : 'bg-white border-2 border-[#096b17]/20 hover:border-[#096b17]/40 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium ${
                        isSelected ? 'text-white' : ''
                      }`} style={isSelected ? {} : { color: '#096b17' }}>
                        {option.text}
                      </p>
                    </motion.button>
                  );
                })}
              </div>

              {currentQuestion > 0 && (
                <div className="flex justify-center mt-8 sm:mt-12">
                  <button
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-white text-[#096b17] hover:bg-[#F5F5DC] border-2 border-[#096b17]/20 shadow-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Previous Question</span>
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
