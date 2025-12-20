// CALM 1.0 Scoring Logic and Results Generator

export interface CalmScores {
  AC: number; // Anticipatory/Cognitive Loop
  CO: number; // Control-Seeking Loop
  RD: number; // Reassurance Loop
  AL: number; // Avoidance Loop
  PS: number; // Physiological/Somatic Loop
  CL: number; // Cognitive Load/Overload Loop
  RC: number; // Recovery Capacity
}

export interface CalmResults {
  scores: CalmScores;
  loopPattern: {
    type: 'single' | 'dual';
    primary: LoopType;
    secondary?: LoopType;
  };
  triggerArchitecture: TriggerPattern;
  reinforcementPattern: ReinforcementPattern;
  loadVsRecovery: LoadPattern;
  stabilityRisk: StabilityPattern;
}

export type LoopType = 'AC' | 'CO' | 'RD' | 'AL' | 'PS' | 'CL';
export type TriggerPattern = 'internal' | 'external' | 'mixed';
export type ReinforcementPattern = 'control' | 'reassurance' | 'avoidance' | 'neutral';
export type LoadPattern = 'overloaded' | 'strained' | 'balanced';
export type StabilityPattern = 'stable' | 'fluctuating' | 'escalation-prone';

// Calculate total scores from user answers
export function calculateScores(answers: Record<string, string>, questions: any[]): CalmScores {
  const scores: CalmScores = {
    AC: 0,
    CO: 0,
    RD: 0,
    AL: 0,
    PS: 0,
    CL: 0,
    RC: 0,
  };

  // Process each answer
  Object.entries(answers).forEach(([questionId, optionId]) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const selectedOption = question.options.find((opt: any) => opt.id === optionId);
    if (!selectedOption) return;

    // Add scores from the selected option
    selectedOption.scores.forEach((scoreItem: any) => {
      const variable = scoreItem.variable as keyof CalmScores;
      scores[variable] += scoreItem.points;
    });
  });

  return scores;
}

// Determine primary and secondary loops
export function determineLoopPattern(scores: CalmScores): {
  type: 'single' | 'dual';
  primary: LoopType;
  secondary?: LoopType;
} {
  // Sort scores to find top 2
  const loopScores = [
    { type: 'AC' as LoopType, score: scores.AC },
    { type: 'CO' as LoopType, score: scores.CO },
    { type: 'RD' as LoopType, score: scores.RD },
    { type: 'AL' as LoopType, score: scores.AL },
    { type: 'PS' as LoopType, score: scores.PS },
    { type: 'CL' as LoopType, score: scores.CL },
  ].sort((a, b) => b.score - a.score);

  const primary = loopScores[0].type;
  const secondary = loopScores[1];

  // Dual loop if secondary is within 70% of primary
  if (secondary.score >= loopScores[0].score * 0.7) {
    return {
      type: 'dual',
      primary,
      secondary: secondary.type,
    };
  }

  return {
    type: 'single',
    primary,
  };
}

// Determine trigger architecture
export function determineTriggerPattern(scores: CalmScores): TriggerPattern {
  // Internal triggers: AC, CL, PS (when body-first)
  const internalScore = scores.AC + scores.CL + scores.PS * 0.5;

  // External triggers: CO (control needs), situational responses
  const externalScore = scores.CO;

  if (Math.abs(internalScore - externalScore) < 3) {
    return 'mixed';
  }

  return internalScore > externalScore ? 'internal' : 'external';
}

// Determine reinforcement pattern
export function determineReinforcementPattern(scores: CalmScores): ReinforcementPattern {
  const patterns = [
    { type: 'control' as ReinforcementPattern, score: scores.CO },
    { type: 'reassurance' as ReinforcementPattern, score: scores.RD },
    { type: 'avoidance' as ReinforcementPattern, score: scores.AL },
  ].sort((a, b) => b.score - a.score);

  // If highest score is below threshold, it's neutral/adaptive
  if (patterns[0].score < 5) {
    return 'neutral';
  }

  return patterns[0].type;
}

// Determine load vs recovery capacity
export function determineLoadPattern(scores: CalmScores): LoadPattern {
  // High RC + high PS/CL = overloaded
  // Medium RC = strained
  // Low RC with manageable load = balanced

  const recoveryImpairment = scores.RC;
  const cognitiveLoad = scores.CL;
  const physicalLoad = scores.PS;

  const totalLoad = cognitiveLoad + physicalLoad;

  if (recoveryImpairment >= 8 || totalLoad >= 16) {
    return 'overloaded';
  }

  if (recoveryImpairment >= 4 || totalLoad >= 10) {
    return 'strained';
  }

  return 'balanced';
}

// Determine stability and escalation risk
export function determineStabilityPattern(scores: CalmScores): StabilityPattern {
  const recoveryImpairment = scores.RC;
  const totalAnxietyLoad = scores.AC + scores.CO + scores.RD + scores.AL + scores.PS + scores.CL;

  // Escalation-prone: High recovery impairment + high overall scores
  if (recoveryImpairment >= 8 && totalAnxietyLoad >= 25) {
    return 'escalation-prone';
  }

  // Fluctuating: Medium recovery issues or variable patterns
  if (recoveryImpairment >= 4 || totalAnxietyLoad >= 15) {
    return 'fluctuating';
  }

  // Stable: Low recovery impairment, manageable patterns
  return 'stable';
}

// Generate complete CALM results
export function generateCalmResults(answers: Record<string, string>, questions: any[]): CalmResults {
  const scores = calculateScores(answers, questions);

  return {
    scores,
    loopPattern: determineLoopPattern(scores),
    triggerArchitecture: determineTriggerPattern(scores),
    reinforcementPattern: determineReinforcementPattern(scores),
    loadVsRecovery: determineLoadPattern(scores),
    stabilityRisk: determineStabilityPattern(scores),
  };
}

// Get loop name for display
export function getLoopName(loopType: LoopType): string {
  const names: Record<LoopType, string> = {
    AC: 'Anticipatory Loop',
    CO: 'Control-Seeking Loop',
    RD: 'Reassurance Loop',
    AL: 'Avoidance Loop',
    PS: 'Somatic Sensitivity Loop',
    CL: 'Cognitive Overload Loop',
  };
  return names[loopType];
}

// Get loop description for display
export function getLoopDescription(loopType: LoopType): string {
  const descriptions: Record<LoopType, string> = {
    AC: 'Your anxiety is driven by future-oriented thinking. You tend to mentally rehearse possible outcomes in advance, which creates a sense of preparedness but also keeps anxiety active.',
    CO: 'Your anxiety is shaped by a need to stabilise or control uncertainty. Attempts to manage or neutralise discomfort provide short-term relief but keep attention fixed on the problem.',
    RD: 'Your anxiety is reinforced through reassurance-seeking. External validation eases anxiety briefly, but over time increases dependence and sensitivity to doubt.',
    AL: 'Your anxiety persists through avoidance patterns. Avoiding discomfort reduces anxiety momentarily, but teaches the system that anxiety requires withdrawal.',
    PS: 'Your anxiety is strongly influenced by bodily sensations. Physical signals become interpreted as threats, which amplifies awareness and fear.',
    CL: 'Your anxiety emerges from sustained mental load. Prolonged thinking without recovery reduces cognitive buffer, allowing anxiety to surface during routine stress.',
  };
  return descriptions[loopType];
}
