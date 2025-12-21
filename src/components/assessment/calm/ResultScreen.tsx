import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion } from 'framer-motion';
import { WhatsAppConfirmDialog } from '../../WhatsAppConfirmDialog';
import type { CalmResult, LoopType, TriggerType, LoadCapacityBand, StabilityType, ReinforcementMechanism } from '../../../types/calm';

interface ResultScreenProps {
  result: CalmResult;
  userName: string;
}

export default function ResultScreen({ result, userName }: ResultScreenProps) {
  const { primaryLoop, secondaryLoop, triggerType, reinforcement, loadCapacityBand, stability } = result;
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  const handleWhatsAppClick = () => {
    setShowWhatsAppDialog(true);
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
            Your CALM 1.0 Report
          </h1>
          <p className="text-xl font-semibold" style={{ color: '#096b17' }}>
            Personalised Assessment
          </p>
          <div className="max-w-2xl mx-auto space-y-4 mt-4">
            <p className="text-base font-medium" style={{ color: '#096b17' }}>
              Please read the report thoroughly
            </p>
            <p className="text-sm" style={{ color: '#096b17' }}>
              We are here to help you understand the report. If needed, check your email inbox/spam for the PDF version of this report.
            </p>

            {/* Help Options */}
            <div className="mt-6 space-y-4">
              <p className="text-base" style={{ color: '#096b17' }}>
                Need help to understand the result?{' '}
                <button
                  onClick={handleWhatsAppClick}
                  className="underline font-semibold hover:text-[#075110] transition-colors"
                >
                  Chat with us on WhatsApp
                </button>
                {', or '}
                <a
                  href="/contact"
                  className="underline font-semibold hover:text-[#075110] transition-colors"
                >
                  take a free clarity call
                </a>
              </p>

              <div className="flex justify-center">
                <a
                  href="/bookconsultation"
                  className="inline-block bg-[#096b17] text-white hover:bg-[#075110] px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Book a Session
                </a>
              </div>
              <p className="text-sm italic" style={{ color: '#096b17' }}>
                If you feel like needing any formal help
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 1: Anxiety Loop Map */}
        <Section number={1} title="YOUR ANXIETY LOOP MAP">
          <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
            <h3 className="text-2xl font-bold text-white group-hover:text-white mb-4">
              {secondaryLoop ? 'Dual Loop' : 'Single Loop'}
            </h3>

            {!secondaryLoop ? (
              <div className="space-y-4 text-white group-hover:text-white">
                <p className="text-lg">
                  Your anxiety follows a <strong>{primaryLoop}</strong> pattern.
                </p>
                <p>
                  {getLoopDescription(primaryLoop)}
                </p>
                <p>
                  This means anxiety tends to repeat through a familiar pathway rather than appearing randomly.
                </p>
                <p>
                  Over time, it's the repetition of this pattern, not intensity, that keeps anxiety present.
                </p>
                <ul className="space-y-2 ml-6 list-disc">
                  <li>You may notice that anxiety feels predictable in hindsight, even if it feels sudden in the moment.</li>
                  <li>This pattern often gives the impression that anxiety has a "mind of its own," when it is actually following the same route each time.</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4 text-white group-hover:text-white">
                <p className="text-lg">
                  Your anxiety follows a <strong>{primaryLoop}</strong> pattern,
                  with a <strong>{secondaryLoop}</strong> influence.
                </p>
                <p>
                  {getLoopDescription(primaryLoop)}
                </p>
                {secondaryLoop && (
                  <p>
                    {getLoopDescription(secondaryLoop)}
                  </p>
                )}
                <p>The primary loop explains how anxiety usually begins for you.</p>
                <p>The secondary loop explains why it tends to continue or return.</p>
                <ul className="space-y-2 ml-6 list-disc">
                  <li>This can feel like anxiety starts for one reason, but stays for another.</li>
                  <li>You may recognise that even when the original trigger settles, anxiety doesn't fully switch off.</li>
                </ul>
              </div>
            )}
          </Card>
        </Section>

        {/* Section 2: Trigger Architecture */}
        <Section number={2} title="TRIGGER ARCHITECTURE">
          <TriggerContent pattern={triggerType} />
        </Section>

        {/* Section 3: What Keeps the Loop Going */}
        <Section number={3} title="WHAT KEEPS THE LOOP GOING">
          <ReinforcementContent pattern={reinforcement} />
        </Section>

        {/* Section 4: Load vs Recovery Capacity */}
        <Section number={4} title="LOAD VS RECOVERY CAPACITY">
          <LoadContent pattern={loadCapacityBand} />
        </Section>

        {/* Section 5: Stability & Escalation Risk */}
        <Section number={5} title="STABILITY & ESCALATION RISK">
          <StabilityContent pattern={stability} />
        </Section>

        {/* Section 6: Clinical Pathways */}
        <Section number={6} title="CLINICAL PATHWAYS">
          <Card className="p-8 bg-white border-2 border-[#096b17]/20">
            <div className="space-y-4" style={{ color: '#096b17' }}>
              <p>
                Patterns like yours tend to respond best when the underlying loop is addressed rather than symptoms alone.
              </p>
              <p className="text-sm italic">
                This section is informational, not prescriptive.
              </p>
              <ul className="space-y-2 ml-6 list-disc text-sm">
                <li>Different approaches work differently depending on the pattern involved.</li>
                <li>What helps others may not always help you — and that's expected.</li>
              </ul>
            </div>
          </Card>
        </Section>

        {/* Section 7: Next Step */}
        <Section number={7} title="NEXT STEP">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
              <h3 className="text-xl font-bold text-white group-hover:text-white mb-4">
                When Support May Help
              </h3>
              <p className="text-white group-hover:text-white">
                If you want help applying this map to your specific situation, a clinical consultation can help translate insight into action.
              </p>
              <p className="text-white group-hover:text-white text-sm mt-4 italic">
                This step is about applying understanding, not about urgency.
              </p>
            </Card>

            <Card className="p-6 bg-white border-2 border-[#096b17]/20">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#096b17' }}>
                Neutral Path
              </h3>
              <p style={{ color: '#096b17' }}>
                If this report reflects your experience and feels manageable, continuing your current coping strategies may be sufficient.
              </p>
              <p className="text-sm mt-4 italic" style={{ color: '#096b17' }}>
                Understanding your pattern alone can sometimes reduce confusion and self-doubt.
              </p>
            </Card>
          </div>
        </Section>

        {/* Book Consultation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="relative overflow-hidden border-2 border-[#075110] shadow-2xl bg-[#096b17] rounded-2xl">
            <div className="p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Take the Next Step?
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Book a consultation with our clinical team to discuss your CALM results and create a personalized plan.
              </p>
              <a
                href="/bookconsultation"
                className="inline-block bg-white text-[#096b17] hover:bg-[#F5F5DC] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Book Your Consultation
              </a>
            </div>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <Card className="p-6 bg-white/80 border border-[#096b17]/20">
            <p className="text-sm text-center italic" style={{ color: '#096b17' }}>
              <strong>Disclaimer:</strong> This report offers structured insight into your experience.
              It is not a diagnosis and does not substitute clinical evaluation.
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Sticky WhatsApp Button */}
      <motion.button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 left-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        aria-label="Get help with your CALM results on WhatsApp"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </motion.button>

      {/* WhatsApp Confirmation Dialog */}
      <WhatsAppConfirmDialog
        isOpen={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        source="calm_results_page"
        message="Hi, I just finished CALM 1.0. I need help with my results"
      />
    </div>
  );
}

// Helper Functions

function getLoopDescription(loopType: LoopType): string {
  const descriptions: Record<LoopType, string> = {
    'Anticipatory Loop': 'Your anxiety is driven by future-oriented thinking. You tend to mentally rehearse possible outcomes in advance, which creates a sense of preparedness but also keeps anxiety active.',
    'Control-Seeking Loop': 'Your anxiety is shaped by a need to stabilise or control uncertainty. Attempts to manage or neutralise discomfort provide short-term relief but keep attention fixed on the problem.',
    'Reassurance Loop': 'Your anxiety is reinforced through reassurance-seeking. External validation eases anxiety briefly, but over time increases dependence and sensitivity to doubt.',
    'Avoidance Loop': 'Your anxiety persists through avoidance patterns. Avoiding discomfort reduces anxiety momentarily, but teaches the system that anxiety requires withdrawal.',
    'Somatic Sensitivity Loop': 'Your anxiety is strongly influenced by bodily sensations. Physical signals become interpreted as threats, which amplifies awareness and fear.',
    'Cognitive Overload Loop': 'Your anxiety emerges from sustained mental load. Prolonged thinking without recovery reduces cognitive buffer, allowing anxiety to surface during routine stress.',
    'Balanced / Adaptive Pattern': 'Your coping responses reduce anxiety without strongly reinforcing it. This suggests your system is managing stress without locking into a repeating loop.',
  };

  return descriptions[loopType] || descriptions['Balanced / Adaptive Pattern'];
}

// Helper Components

function Section({ number, title, children }: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#096b17' }}>
          Section {number}: {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

function TriggerContent({ pattern }: { pattern: TriggerType }) {
  const content: Record<TriggerType, { title: string; description: string; points: string[] }> = {
    'Internal': {
      title: 'Internal Trigger Pattern',
      description: 'Your anxiety is mostly triggered internally — through thoughts, mental scenarios, or subtle body signals. This explains why anxiety can appear even on days that look calm from the outside.',
      points: [
        'You may have noticed anxiety arriving without a clear external reason.',
        'This can make it harder to explain to others — or even to yourself — why you feel anxious.',
      ],
    },
    'External': {
      title: 'External Trigger Pattern',
      description: 'Your anxiety is mainly triggered by situations or environments, with internal reactions following. This means anxiety usually makes sense in context, even if the reaction feels stronger than expected.',
      points: [
        'You may find that anxiety eases once the situation passes.',
        'Certain environments or demands may consistently stand out as difficult for you.',
      ],
    },
    'Mixed': {
      title: 'Mixed / Neutral Trigger Pattern',
      description: 'Your anxiety shifts between internal and situational triggers. Some days, external stressors play a bigger role. On other days, anxiety seems to arise internally.',
      points: [
        'This can make anxiety feel inconsistent or hard to predict.',
        'You may notice that your experience changes depending on context rather than one fixed cause.',
      ],
    },
  };

  const { title, description, points } = content[pattern];

  return (
    <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
      <h3 className="text-2xl font-bold text-white group-hover:text-white mb-4">{title}</h3>
      <p className="text-white group-hover:text-white mb-4">{description}</p>
      <ul className="space-y-2 ml-6 list-disc text-white group-hover:text-white">
        {points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    </Card>
  );
}

function ReinforcementContent({ pattern }: { pattern: ReinforcementMechanism }) {
  const content: Record<ReinforcementMechanism, { title: string; description: string; points: string[] }> = {
    'Control': {
      title: 'Control Pattern',
      description: 'When anxiety appears, you tend to respond by trying to manage or stabilise it. This usually brings short-term relief, but keeps attention focused on the problem.',
      points: [
        'You may feel more alert or "on guard" even after anxiety settles.',
        'It can feel like you\'re always one step away from needing to intervene again.',
      ],
    },
    'Reassurance': {
      title: 'Reassurance Pattern',
      description: 'Reassurance reduces anxiety briefly, but over time increases dependence on external confirmation. This explains why reassurance often needs repeating.',
      points: [
        'You may notice relief fading faster than it used to.',
        'Anxiety can feel quieter when someone else confirms things — but louder when you\'re alone.',
      ],
    },
    'Avoidance': {
      title: 'Avoidance Pattern',
      description: 'Avoiding discomfort reduces anxiety in the moment, but teaches the system to withdraw. Over time, this can reduce tolerance.',
      points: [
        'You may feel immediate relief after stepping away from a situation.',
        'Later, similar situations may start to feel harder than before.',
      ],
    },
    'Neutral': {
      title: 'Neutral / Adaptive Pattern',
      description: 'Your coping responses reduce anxiety without strongly reinforcing it. This suggests your system is managing stress without locking into a repeating loop.',
      points: [
        'You may recognise anxiety without feeling overtaken by it.',
        'Anxiety tends to pass without leaving a strong after-effect.',
      ],
    },
  };

  const { title, description, points } = content[pattern];

  return (
    <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
      <h3 className="text-2xl font-bold text-white group-hover:text-white mb-4">{title}</h3>
      <p className="text-white group-hover:text-white mb-4">{description}</p>
      <ul className="space-y-2 ml-6 list-disc text-white group-hover:text-white">
        {points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    </Card>
  );
}

function LoadContent({ pattern }: { pattern: LoadCapacityBand }) {
  const content: Record<LoadCapacityBand, { title: string; description: string; points: string[] }> = {
    'Overloaded': {
      title: 'Overloaded',
      description: 'Your current mental and physical demands exceed your recovery capacity. This reduces buffer, making anxiety more likely during routine stress.',
      points: [
        'You may feel that even small demands take more effort than before.',
        'Anxiety may show up more often when rest has been inconsistent.',
      ],
    },
    'Strained': {
      title: 'Strained',
      description: 'You are functioning, but with limited margin. Anxiety increases when stress accumulates or recovery is delayed.',
      points: [
        'You may feel "mostly okay" until several things pile up at once.',
        'There may be less room for error or unexpected demands.',
      ],
    },
    'Balanced': {
      title: 'Balanced',
      description: 'Your load and recovery are reasonably matched. Anxiety is more likely linked to specific situations than exhaustion.',
      points: [
        'You may notice anxiety comes and goes without lingering.',
        'Recovery generally restores your baseline.',
      ],
    },
  };

  const { title, description, points } = content[pattern];

  return (
    <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
      <h3 className="text-2xl font-bold text-white group-hover:text-white mb-4">{title}</h3>
      <p className="text-white group-hover:text-white mb-4">{description}</p>
      <ul className="space-y-2 ml-6 list-disc text-white group-hover:text-white">
        {points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    </Card>
  );
}

function StabilityContent({ pattern }: { pattern: StabilityType }) {
  const content: Record<StabilityType, { title: string; description: string; points: string[] }> = {
    'Stable': {
      title: 'Stable',
      description: 'Anxiety appears, but settles when conditions improve. Your system returns to baseline without much carry-over.',
      points: [
        'Anxiety feels contained rather than spreading.',
        'Stressful periods don\'t permanently shift how you feel.',
      ],
    },
    'Fluctuating': {
      title: 'Fluctuating',
      description: 'Anxiety varies with stress and recovery balance. It\'s not fixed, but it can feel unpredictable.',
      points: [
        'Some weeks feel manageable, others feel unexpectedly harder.',
        'Changes in routine or rest may strongly influence how you feel.',
      ],
    },
    'Escalation-Prone': {
      title: 'Escalation-Prone',
      description: 'Anxiety intensifies when recovery remains insufficient over time. This reflects narrowing capacity, not worsening anxiety itself.',
      points: [
        'You may notice anxiety lingering longer than it used to.',
        'Stress seems to accumulate rather than reset fully.',
      ],
    },
  };

  const { title, description, points } = content[pattern];

  return (
    <Card className="p-8 bg-[#096b17] border-2 border-[#075110] hover:bg-[#096b17] group">
      <h3 className="text-2xl font-bold text-white group-hover:text-white mb-4">{title}</h3>
      <p className="text-white group-hover:text-white mb-4">{description}</p>
      <ul className="space-y-2 ml-6 list-disc text-white group-hover:text-white">
        {points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    </Card>
  );
}
