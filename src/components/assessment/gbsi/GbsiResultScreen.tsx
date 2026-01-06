import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { AlertCircle, Brain, Activity, CheckCircle2, ArrowRight, Phone, Calendar } from 'lucide-react';
import type { GbsiResult, GbsiAnswers } from '../../../types/gbsi';
import { getAlarmingSignsText } from './scoringEngine';

interface GbsiResultScreenProps {
  result: GbsiResult;
  answers: GbsiAnswers;
  userName: string;
  onRetake: () => void;
}

export default function GbsiResultScreen({
  result,
  answers,
  userName,
  onRetake,
}: GbsiResultScreenProps) {
  const renderResultContent = () => {
    switch (result.resultType) {
      case 'clinicalPriority':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                  Urgent Surgical Evaluation Recommended
                </h2>
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <Card className="p-8 bg-white border-2 border-[#096b17]/20">
              <div className="space-y-4" style={{ color: '#096b17' }}>
                <p className="text-lg leading-relaxed">
                  Based on your reports of{' '}
                  <span className="font-bold">
                    {getAlarmingSignsText(answers.alarmingSigns)}
                  </span>
                  {answers.age === 'over50' && ' and your age'}
                  {answers.familyHistory.includes('colorectalCancer') &&
                    ' and your family history'}, we cannot categorize this as simple IBS.
                </p>

                <p className="text-lg leading-relaxed">
                  As a Surgical Gastroenterologist, I recommend a physical examination and likely
                  an Endoscopy/Colonoscopy to rule out structural issues immediately.
                </p>

                <Card className="mt-6 p-4 bg-red-50 border-2 border-red-200">
                  <p className="text-sm font-semibold text-red-700">
                    ⚠️ This assessment does not replace professional medical advice. Please seek
                    immediate medical attention.
                  </p>
                </Card>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/bookconsultation"
                className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              >
                Book Urgent Consultation
              </a>
              <button
                onClick={onRetake}
                className="inline-block bg-white hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 shadow-md"
                style={{ color: '#096b17', borderColor: '#096b1733' }}
              >
                Retake Assessment
              </button>
            </div>
          </motion.div>
        );

      case 'brainGutOverdrive':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                  Your Axis is Hypersensitive
                </h2>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              {result.ibsType && (
                <p className="text-xl font-semibold" style={{ color: '#096b17' }}>Type: {result.ibsType}</p>
              )}
            </div>

            <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
              <div className="space-y-4 text-white group-hover:text-white">
                <p className="text-lg leading-relaxed">
                  You meet the Rome IV criteria for IBS. Your{' '}
                  {answers.brainFog === 'yesFrequently' && '"Brain Fog" and '}
                  {answers.stressLevel > 7 && 'high stress levels '}
                  suggest your Vagus nerve is in a state of hyper-vigilance.
                </p>

                <p className="text-lg leading-relaxed">
                  Your reports are likely "Normal" because the issue is{' '}
                  <span className="font-bold">communication, not anatomy</span>.
                </p>

                <div className="mt-6 space-y-3">
                  <h3 className="text-xl font-bold">Your Brain-Gut Axis Score</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-white/30 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${(result.axisScore / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold">
                      {result.axisScore}/3
                    </span>
                  </div>
                  <p className="text-sm">
                    Brain-Gut Sensitivity: <span className="font-bold capitalize">{result.brainGutSensitivity}</span>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white border-2 border-[#096b17]/20">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#096b17' }}>Recommended Next Steps</h3>
              <ul className="space-y-3" style={{ color: '#096b17' }}>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Start the 12-Month Gut-Brain Recalibration Program</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Learn vagus nerve regulation techniques</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Personalized dietary modifications based on your triggers</span>
                </li>
              </ul>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/bookconsultation"
                className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#096b17', color: '#ffffff' }}
              >
                Apply for Founder's Membership (₹999)
              </a>
              <button
                onClick={onRetake}
                className="inline-block bg-white hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 shadow-md"
                style={{ color: '#096b17', borderColor: '#096b1733' }}
              >
                Retake Assessment
              </button>
            </div>
          </motion.div>
        );

      case 'mechanicalMetabolic':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                  Upper GI Dysfunction & Metabolic Load
                </h2>
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
              <div className="space-y-4 text-white group-hover:text-white">
                <p className="text-lg leading-relaxed">
                  Your symptoms point toward{' '}
                  <span className="font-bold">
                    Functional Dyspepsia or GERD
                  </span>
                  {answers.fattyLiver === 'yes' && ', complicated by Fatty Liver'}.
                </p>

                <p className="text-lg leading-relaxed">
                  {answers.fattyLiver === 'yes' &&
                    'Your liver is struggling to process the metabolic load, which is why you may feel sluggish. '}
                  {answers.refluxFrequency === 'dailyNightly' &&
                    'Your frequent reflux needs to be addressed to prevent complications. '}
                  {answers.fullnessFactor === 'yes' &&
                    'The early fullness suggests your digestive motility may be affected.'}
                </p>

                <Card className="mt-6 p-4 bg-white/20 border-2 border-white/30">
                  <h4 className="font-bold mb-2">Key Issues Identified:</h4>
                  <ul className="space-y-1 text-sm">
                    {answers.refluxFrequency === 'dailyNightly' && (
                      <li>• Daily/Nightly Reflux or Acidity</li>
                    )}
                    {answers.fullnessFactor === 'yes' && (
                      <li>• Early Satiety (Uncomfortable Fullness)</li>
                    )}
                    {answers.fattyLiver === 'yes' && <li>• Fatty Liver Disease</li>}
                  </ul>
                </Card>
              </div>
            </Card>

            <Card className="p-8 bg-white border-2 border-[#096b17]/20">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#096b17' }}>Recommended Treatment Plan</h3>
              <ul className="space-y-3" style={{ color: '#096b17' }}>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Custom Diet & Lifestyle Protocol for upper GI health</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Metabolic load management strategies</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>
                    {answers.fattyLiver === 'yes'
                      ? 'Liver health optimization program'
                      : 'Digestive health monitoring'}
                  </span>
                </li>
              </ul>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/bookconsultation"
                className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#096b17', color: '#ffffff' }}
              >
                Book Online Consultation
              </a>
              <button
                onClick={onRetake}
                className="inline-block bg-white hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 shadow-md"
                style={{ color: '#096b17', borderColor: '#096b1733' }}
              >
                Retake Assessment
              </button>
            </div>
          </motion.div>
        );

      case 'allClear':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#096b17' }}>
                  You're Doing Great!
                </h2>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xl font-semibold" style={{ color: '#096b17' }}>But Watch the Habits</p>
            </div>

            <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
              <div className="space-y-4 text-white group-hover:text-white">
                <p className="text-lg leading-relaxed">
                  You don't meet the criteria for IBS or serious pathology. Your symptoms are
                  likely{' '}
                  <span className="font-bold">"Lifestyle Gastritis"</span> caused
                  by:
                </p>

                {(answers.dietaryHabits.lateNightDinners ||
                  answers.dietaryHabits.highCaffeine ||
                  answers.dietaryHabits.frequentJunk ||
                  answers.dietaryHabits.skipBreakfast) && (
                  <Card className="mt-4 p-4 bg-white/20 border-2 border-white/30">
                    <h4 className="font-bold mb-2">
                      Habits to Watch Out For:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {answers.dietaryHabits.lateNightDinners && (
                        <li>• Late night dinners</li>
                      )}
                      {answers.dietaryHabits.highCaffeine && <li>• High caffeine intake</li>}
                      {answers.dietaryHabits.frequentJunk && (
                        <li>• Frequent junk/processed food</li>
                      )}
                      {answers.dietaryHabits.skipBreakfast && <li>• Skipping breakfast</li>}
                    </ul>
                  </Card>
                )}

                <p className="text-lg leading-relaxed mt-4">
                  Small adjustments to these habits can help you maintain optimal gut health and
                  prevent future issues.
                </p>
              </div>
            </Card>

            <Card className="p-8 bg-white border-2 border-[#096b17]/20">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#096b17' }}>
                Preventive Care Recommendations
              </h3>
              <ul className="space-y-3" style={{ color: '#096b17' }}>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Maintain regular meal times</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Moderate caffeine and processed food intake</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" style={{ color: '#096b17' }} />
                  <span>Continue monitoring stress levels</span>
                </li>
              </ul>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => alert('Guide download coming soon!')}
                className="inline-block px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: '#096b17', color: '#ffffff' }}
              >
                Download Free Gut Guide
              </button>
              <button
                onClick={onRetake}
                className="inline-block bg-white hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 shadow-md"
                style={{ color: '#096b17', borderColor: '#096b1733' }}
              >
                Retake Assessment
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] pt-24 pb-12 px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#096b17' }}>
            Your Gut-Brain Sensitivity Index Report
          </h1>
          {userName && (
            <p className="text-xl font-semibold" style={{ color: '#096b17' }}>
              Results for {userName}
            </p>
          )}
        </motion.div>

        {renderResultContent()}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-white/80 border border-[#096b17]/20">
            <p className="text-sm text-center italic" style={{ color: '#096b17' }}>
              <strong>Disclaimer:</strong> This assessment is for informational purposes only and does not constitute medical
              advice. Please consult with a healthcare professional for proper diagnosis and treatment.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
