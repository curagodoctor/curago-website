// CALM 1.0 Result Screen Component
import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Brain,
  Target,
  Shield
} from 'lucide-react';
import type { CalmResult, LoopType } from '../../../types/calm';

interface ResultScreenProps {
  result: CalmResult;
  userName: string;
}

// Loop descriptions for Section 1
const LOOP_DESCRIPTIONS: Record<LoopType, { description: string; pattern: string }> = {
  'Anticipatory Loop': {
    description: 'Your anxiety primarily stems from anticipating future events, replaying scenarios, and attempting to predict outcomes before they occur.',
    pattern: 'Trigger → Anticipatory thinking → Cognitive rehearsal → Anxiety escalation → Relief-seeking → Pattern repeats',
  },
  'Control-Seeking Loop': {
    description: 'Your anxiety is driven by the need for certainty and control. Uncertainty triggers planning, checking, and attempts to eliminate unpredictability.',
    pattern: 'Uncertainty → Control attempt → Brief relief → New uncertainty → Increased control behavior → Pattern repeats',
  },
  'Reassurance Loop': {
    description: 'You rely on external validation or reassurance to reduce anxiety, but this creates a dependency that weakens internal confidence.',
    pattern: 'Doubt → Seek reassurance → Temporary relief → Doubt returns → Increased need for reassurance → Pattern repeats',
  },
  'Avoidance Loop': {
    description: 'Anxiety leads to avoidance of situations, which provides short-term relief but reinforces fear and narrows your comfort zone over time.',
    pattern: 'Trigger → Avoid situation → Relief → Fear strengthens → Expanded avoidance → Pattern repeats',
  },
  'Somatic Sensitivity Loop': {
    description: 'Physical sensations in your body are interpreted as threatening, creating a feedback loop between bodily awareness and anxiety escalation.',
    pattern: 'Physical sensation → Misinterpretation as danger → Anxiety → More physical symptoms → Hypervigilance → Pattern repeats',
  },
  'Cognitive Overload Loop': {
    description: 'Mental strain and overthinking accumulate without resolution, leading to exhaustion, reduced capacity, and increased vulnerability to anxiety.',
    pattern: 'Mental load → Overthinking → Cognitive fatigue → Reduced capacity → More overwhelm → Pattern repeats',
  },
  'Balanced / Adaptive Pattern': {
    description: 'Your responses show flexibility and resilience. While some anxiety may be present, you demonstrate adaptive coping and recovery capacity.',
    pattern: 'Healthy response patterns with adequate regulation and recovery',
  },
};

// Trigger descriptions for Section 2
const TRIGGER_DESCRIPTIONS = {
  Internal: 'Your anxiety is primarily triggered by internal experiences: thoughts, physical sensations, or emotional states. External events play a secondary role.',
  External: 'Your anxiety is primarily triggered by external events, situations, or environmental factors. Internal experiences play a secondary role.',
  Mixed: 'Your anxiety is triggered by both internal and external factors in relatively equal measure, creating a bidirectional sensitivity.',
};

// Load capacity descriptions for Section 4
const LOAD_DESCRIPTIONS = {
  Overloaded: 'Your current mental/emotional load significantly exceeds your recovery capacity. This creates chronic strain and elevated vulnerability.',
  Strained: 'Your load and capacity are imbalanced. You may manage day-to-day, but reserves are limited and recovery is incomplete.',
  Balanced: 'Your load and capacity are relatively well-matched. You have some buffer to handle stress without chronic depletion.',
};

// Stability descriptions for Section 5
const STABILITY_DESCRIPTIONS = {
  'Stable': 'Your anxiety patterns are relatively consistent and predictable. Recovery capacity is adequate, allowing for resilience.',
  'Fluctuating': 'Your anxiety intensity and recovery vary. Some periods are manageable, while others feel overwhelming.',
  'Escalation-Prone': 'Your patterns show high vulnerability to escalation. Small triggers can rapidly intensify, and recovery is difficult.',
};

export default function ResultScreen({ result, userName }: ResultScreenProps) {
  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4"
      style={{
        background: 'linear-gradient(to bottom right, #075110, #096b17, #064d12)',
        minHeight: '100vh'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Your CALM 1.0 Report</h1>
        </motion.div>

        {/* Section 1: Loop Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-8 shadow-2xl mb-8"
          style={{ backgroundColor: '#FFFDBD' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="w-8 h-8 text-[#096b17]" />
            <h2 className="text-2xl font-bold text-[#075110]">Section 1: Loop Map</h2>
          </div>

          <div className="space-y-6">
            {/* Primary Loop */}
            <div>
              <h3 className="text-xl font-semibold text-[#64CB81] mb-3">Primary Loop</h3>
              <div className="bg-white/80 rounded-lg p-5 border border-[#096b17]/30">
                <p className="text-2xl font-bold text-[#075110] mb-3">{result.primaryLoop}</p>
                <p className="text-gray-800 mb-4">
                  {LOOP_DESCRIPTIONS[result.primaryLoop].description}
                </p>
                <div className="bg-[#075110]/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-mono">
                    {LOOP_DESCRIPTIONS[result.primaryLoop].pattern}
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary Loop */}
            {result.secondaryLoop && (
              <div>
                <h3 className="text-xl font-semibold text-[#096b17] mb-3">Secondary Loop</h3>
                <div className="bg-white/80 rounded-lg p-5 border border-[#096b17]/30">
                  <p className="text-xl font-bold text-[#075110] mb-2">{result.secondaryLoop}</p>
                  <p className="text-gray-800">
                    {LOOP_DESCRIPTIONS[result.secondaryLoop].description}
                  </p>
                </div>
              </div>
            )}

            {/* Loop Scores */}
            <div>
              <h3 className="text-lg font-semibold text-[#075110] mb-3">Loop Intensity Scores</h3>
              <div className="space-y-2">
                {Object.entries(result.loopScores).map(([key, score]) => {
                  const percentage = (score / 20) * 100;
                  const loopName = key.replace(/([A-Z])/g, ' $1').trim();
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                        <span className="capitalize">{loopName}</span>
                        <span>{score}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#64CB81] rounded-full transition-all"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Trigger Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-8 shadow-2xl mb-8"
          style={{ backgroundColor: '#FFFDBD' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-[#096b17]" />
            <h2 className="text-2xl font-bold text-[#075110]">Section 2: Trigger Architecture</h2>
          </div>

          <div className="bg-white/80 rounded-lg p-6 border border-[#096b17]/30">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-[#096b17]" />
              <p className="text-2xl font-bold text-[#075110]">{result.triggerType} Triggers</p>
            </div>
            <p className="text-gray-800">
              {TRIGGER_DESCRIPTIONS[result.triggerType]}
            </p>
          </div>
        </motion.div>

        {/* Section 3: Reinforcement Mechanism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-8 shadow-2xl mb-8"
          style={{ backgroundColor: '#FFFDBD' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-[#096b17]" />
            <h2 className="text-2xl font-bold text-[#075110]">Section 3: Reinforcement Mechanism</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 rounded-lg p-6 border border-[#64CB81]/30">
              <p className="text-lg text-gray-700 mb-2">Primary Reinforcement:</p>
              <p className="text-2xl font-bold text-[#64CB81]">{result.reinforcement}</p>
            </div>

            <div className="bg-white/80 rounded-lg p-6">
              <p className="text-lg text-gray-700 mb-3">Top Reinforcement Behaviors:</p>
              <div className="flex flex-wrap gap-3">
                {result.topReinforcers.map((reinforcer, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-[#64CB81]/20 text-[#64CB81] rounded-full font-semibold"
                  >
                    {reinforcer}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Load vs Capacity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-8 shadow-2xl mb-8"
          style={{ backgroundColor: '#FFFDBD' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-8 h-8 text-[#096b17]" />
            <h2 className="text-2xl font-bold text-[#075110]">Section 4: Load vs Capacity</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 rounded-lg p-6 border border-[#64CB81]/30">
              <p className="text-lg text-gray-700 mb-2">Current Status:</p>
              <p className="text-2xl font-bold text-[#64CB81] mb-4">{result.loadCapacityBand}</p>
              <p className="text-gray-800">{LOAD_DESCRIPTIONS[result.loadCapacityBand]}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Load Score</p>
                <p className="text-2xl font-bold text-[#075110]">{result.loadScore}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Capacity Deficit</p>
                <p className="text-2xl font-bold text-[#075110]">{result.capacityDeficit}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Imbalance Ratio</p>
                <p className="text-2xl font-bold text-[#075110]">{result.imbalanceRatio.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 5: Stability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-8 shadow-2xl mb-8"
          style={{ backgroundColor: '#FFFDBD' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-[#096b17]" />
            <h2 className="text-2xl font-bold text-[#075110]">Section 5: Stability Pattern</h2>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-[#64CB81]/30">
            <p className="text-2xl font-bold text-[#64CB81] mb-4">{result.stability}</p>
            <p className="text-gray-800">{STABILITY_DESCRIPTIONS[result.stability]}</p>
          </div>
        </motion.div>

        {/* Section 6: Clinical Pathways */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-8 shadow-2xl mb-8"
          style={{ backgroundColor: '#FFFDBD' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-[#096b17]" />
            <h2 className="text-2xl font-bold text-[#075110]">Section 6: Clinical Pathways</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* What Helps */}
            <div className="bg-white/80 rounded-lg p-6 border border-[#64CB81]/30">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-[#64CB81]" />
                <h3 className="text-xl font-semibold text-[#64CB81]">What Helps</h3>
              </div>
              <ul className="space-y-3">
                {result.clinicalPathway.helps.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#64CB81] rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Less Helpful */}
            <div className="bg-white/80 rounded-lg p-6 border border-red-400/30">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-semibold text-red-400">Less Helpful</h3>
              </div>
              <ul className="space-y-3">
                {result.clinicalPathway.lessHelpful.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#64CB81]/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-[#64CB81] shadow-2xl text-center"
        >
          <AlertCircle className="w-12 h-12 text-[#64CB81] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">Ready for Next Steps?</h3>
          <p className="text-white mb-6 max-w-2xl mx-auto">
            This assessment provides a snapshot of your anxiety patterns. A trained clinician can help you understand these results in depth and create a personalized intervention plan.
          </p>
          <button
            onClick={() => window.location.href = '/book-consultation'}
            className="px-8 py-3 bg-[#64CB81] text-[#075110] font-semibold rounded-lg hover:bg-[#FFFDBD] transition-all hover:scale-105"
          >
            Schedule Consultation
          </button>
        </motion.div>
      </div>
    </div>
  );
}
