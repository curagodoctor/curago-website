import { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { QuizAnswers, UserInfo } from '../../types/aura';

// ---- Types
interface Option { text: string; score: number; }
interface Question {
  id: keyof QuizAnswers;
  scenario: string;
  options: Option[];
  pillar: 'A' | 'U' | 'R' | 'A2';
}

// ---- Questions
const questions: Question[] = [
  {
    id: 'awareness',
    pillar: 'A',
    scenario:
      "You’ve had a long, draining day — a friend messages asking for help. What happens next?",
    options: [
      { text: "I instantly know I’m exhausted, politely postpone, and rest.", score: 5 },
      { text: 'I feel tired but still reply out of obligation.', score: 4 },
      { text: 'I don’t notice my fatigue till halfway through the chat.', score: 3 },
      { text: 'I suppress irritation, help them, and crash later.', score: 2 },
      { text: 'I ghost them — then feel guilty all night.', score: 1 },
    ],
  },
  {
    id: 'understanding',
    pillar: 'U',
    scenario: 'You wake up unusually anxious on a workday. What’s your inner dialogue?',
    options: [
      { text: '“Hmm, must be the presentation — I’ll prepare and calm myself.”', score: 5 },
      { text: '“Not sure why, but I’ll go slow till it passes.”', score: 4 },
      { text: '“Why am I like this again? I can’t afford another off day.”', score: 3 },
      { text: '“Forget it — I’ll just power through.”', score: 2 },
      { text: '“I don’t even try to understand anymore; it’s just how I am now.”', score: 1 },
    ],
  },
  {
    id: 'regulation',
    pillar: 'R',
    scenario: 'A project deadline suddenly gets advanced. What’s your go-to reaction?',
    options: [
      { text: 'I pause, re-plan, and ask for support.', score: 5 },
      { text: 'I feel tense but dive straight into execution.', score: 4 },
      { text: 'I multitask, skip breaks, and push through the panic.', score: 3 },
      { text: 'I snap at others or withdraw silently.', score: 2 },
      { text: 'I freeze and procrastinate till guilt kicks in.', score: 1 },
    ],
  },
  {
    id: 'alignment',
    pillar: 'A2',
    scenario:
      'You’ve been offered a high-paying role that compromises your work–life balance. What’s your instinct?',
    options: [
      { text: 'I reflect calmly, weigh my bandwidth, and decide.', score: 5 },
      { text: 'I consult trusted people before saying yes/no.', score: 4 },
      { text: 'I accept first — figuring I’ll “manage somehow.”', score: 3 },
      { text: 'I say yes instantly, even though I already feel uneasy.', score: 2 },
      { text: 'I accept, then resent myself for it every day.', score: 1 },
    ],
  },
];

interface QuizFlowProps {
  onComplete: (answers: QuizAnswers, userInfo: UserInfo) => void;
}

export default function QuizFlow({ onComplete }: QuizFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const startedRef = useRef(false); // ✅ prevent duplicate start push

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  // ✅ Fire GTM custom event when quiz starts
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'aura_quiz_start',
        page_path: window.location.pathname,
        aura_stage: 'start',
      });
      console.log('🧠 aura_quiz_start event pushed to dataLayer');
    }
  }, []);

  const handleAnswer = (optionIndex: number) => {
    const score = question.options[optionIndex].score;
    const newAnswers = { ...answers, [question.id]: score };
    setAnswers(newAnswers);
    setSelectedValue(optionIndex);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((q) => q + 1);
        setSelectedValue(null);
      } else {
        // Quiz complete - navigate to results (test_finish event fires on ResultScreen)
        const user: UserInfo = { name: '', whatsapp: '', email: '' };
        onComplete(newAnswersAsFull(newAnswers), user);
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
    <div className="min-h-screen bg-gradient-to-br from-[#096b17] via-[#075110] to-[#053d0b] flex flex-col pt-24">
      {/* Sticky Progress */}
      <div className="w-full bg-gradient-to-b from-[#096b17]/60 to-[#075110]/40 backdrop-blur-md border-b border-white/20 p-3 sticky top-16 z-20 shadow-sm">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-white font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="relative">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-[#64CB81] rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #64CB81 0%, #4CAF50 100%)'
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl text-white max-w-2xl mx-auto">
                  {question.scenario}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-4 max-w-2xl mx-auto">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl text-left transition-all duration-300 ${
                      selectedValue === index
                        ? 'bg-[#64CB81] text-white shadow-xl border-2 border-[#64CB81]'
                        : 'bg-white/40 backdrop-blur-md border-2 border-white/30 hover:bg-white/50 hover:border-white/40 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm sm:text-base font-bold transition-all duration-300 ${
                          selectedValue === index
                            ? 'bg-white text-[#64CB81] scale-110 shadow-lg'
                            : 'bg-white/30 backdrop-blur-sm text-white border-2 border-white/20'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-medium text-white`}>
                        {option.text}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-center pt-6">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="rounded-full px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
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

// Helper to coerce partial answers to full record before passing to onComplete
function newAnswersAsFull(a: Partial<QuizAnswers>): QuizAnswers {
  return {
    awareness: a.awareness ?? 0,
    understanding: a.understanding ?? 0,
    regulation: a.regulation ?? 0,
    alignment: a.alignment ?? 0,
    reflection: a.reflection ?? 0,
    intellect: a.intellect ?? 0,
    self: a.self ?? 0,
    emotion: a.emotion ?? 0,
  };
}
