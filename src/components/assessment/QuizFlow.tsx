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
        // ✅ On complete, push custom GTM signal
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'aura_quiz_complete',
          aura_stage: 'complete',
          page_path: window.location.pathname,
        });
        console.log('✅ aura_quiz_complete event pushed to dataLayer');

        // FINISHED: directly complete without any form
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
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-teal-50)] via-[var(--brand-violet-50)] to-[var(--brand-rose-50)] flex flex-col pt-24">
      {/* Sticky Progress */}
      <div className="w-full glass p-4 sticky top-16 z-20 backdrop-blur-md shadow-sm">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700 font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-700 font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 rounded-full transition-all duration-500" />

          {/* A • U • R • A (chips) */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {questions.map((q, i) => (
              <span
                key={q.id as string}
                className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                  i === currentQuestion
                    ? 'bg-[#096b17] text-white border-[#096b17]'
                    : 'bg-white/80 text-gray-700 border-gray-300'
                }`}
                title={
                  q.pillar === 'A'
                    ? 'Awareness'
                    : q.pillar === 'U'
                    ? 'Understanding'
                    : q.pillar === 'R'
                    ? 'Regulation'
                    : 'Alignment'
                }
              >
                {q.pillar === 'A2' ? 'A' : q.pillar}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <div className="inline-block px-4 py-2 glass rounded-full text-sm text-gray-700">
                  {question.pillar === 'A'
                    ? 'Awareness'
                    : question.pillar === 'U'
                    ? 'Understanding'
                    : question.pillar === 'R'
                    ? 'Regulation'
                    : 'Alignment'}{' '}
                  · Scenario {currentQuestion + 1}
                </div>
                <h2 className="text-2xl md:text-3xl text-gray-800 max-w-2xl mx-auto">
                  {question.scenario}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-4 max-w-2xl mx-auto">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full p-6 rounded-2xl text-left transition-all duration-300 ${
                      selectedValue === index
                        ? 'bg-gradient-to-r from-[var(--brand-teal-500)] to-[var(--brand-violet-500)] text-white shadow-xl'
                        : 'glass hover:bg-white text-gray-800 shadow-md hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm transition-all duration-300 ${
                          selectedValue === index
                            ? 'bg-white/30 text-white scale-110'
                            : 'bg-gradient-to-br from-[var(--brand-teal-100)] to-[var(--brand-violet-100)] text-gray-700'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <p className={selectedValue === index ? 'text-white' : 'text-gray-800'}>
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
