// CALM 1.0 Scoring Engine - Deterministic Pattern Classification

import type {
  CalmAnswers,
  CalmResult,
  LatentScores,
  LoopScores,
  LoopType,
  TriggerType,
  LoadCapacityBand,
  StabilityType,
  ReinforcementMechanism,
} from '../../../types/calm';
import { CALM_QUESTIONS } from './questionsData';

const MAX_RC = 15; // Maximum possible Recovery Capacity score

// Calculate latent scores from answers
export function calculateLatentScores(answers: CalmAnswers): LatentScores {
  const scores: LatentScores = {
    AC: 0,
    CO: 0,
    RD: 0,
    AL: 0,
    PS: 0,
    CL: 0,
    RC: 0,
  };

  // Process each answer
  Object.entries(answers).forEach(([questionId, answerId]) => {
    const question = CALM_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    const option = question.options.find(opt => opt.id === answerId);
    if (!option) return;

    // Add points to each variable
    option.scores.forEach(({ variable, points }) => {
      scores[variable] += points;
    });
  });

  return scores;
}

// Calculate loop scores from latent variables
export function calculateLoopScores(latent: LatentScores): LoopScores {
  return {
    anticipatory: latent.AC + latent.CL,
    control: latent.CO + latent.PS,
    reassurance: latent.RD,
    avoidance: latent.AL + (MAX_RC - latent.RC),
    somatic: latent.PS,
    cognitiveOverload: latent.CL + (MAX_RC - latent.RC),
  };
}

// Determine primary and secondary loops
export function determineLoops(loopScores: LoopScores): {
  primary: LoopType;
  secondary: LoopType | null;
} {
  // Create array of [name, score] pairs
  const loops: [LoopType, number][] = [
    ['Anticipatory Loop', loopScores.anticipatory],
    ['Control-Seeking Loop', loopScores.control],
    ['Reassurance Loop', loopScores.reassurance],
    ['Avoidance Loop', loopScores.avoidance],
    ['Somatic Sensitivity Loop', loopScores.somatic],
    ['Cognitive Overload Loop', loopScores.cognitiveOverload],
  ];

  // Sort by score descending
  loops.sort((a, b) => b[1] - a[1]);

  const primary = loops[0][0];
  const primaryScore = loops[0][1];
  const secondaryScore = loops[1][1];

  // Secondary loop only if >= 80% of primary
  const secondary = (secondaryScore / primaryScore) >= 0.80 ? loops[1][0] : null;

  return { primary, secondary };
}

// Determine trigger architecture
export function determineTriggerType(latent: LatentScores): TriggerType {
  const internalWeight = latent.PS + latent.CL;
  const externalWeight = latent.AC + latent.CO;

  const diff = Math.abs(internalWeight - externalWeight);
  const maxWeight = Math.max(internalWeight, externalWeight);
  const diffPercent = (diff / maxWeight) * 100;

  if (diffPercent <= 10) {
    return 'Mixed';
  }

  return internalWeight > externalWeight ? 'Internal' : 'External';
}

// Determine reinforcement mechanism
export function determineReinforcement(latent: LatentScores): {
  mechanism: ReinforcementMechanism;
  topReinforcers: string[];
} {
  const reinforcers: [string, number][] = [
    ['Reassurance', latent.RD],
    ['Avoidance', latent.AL],
    ['Control', latent.CO],
  ];

  // Sort descending
  reinforcers.sort((a, b) => b[1] - a[1]);

  const top1 = reinforcers[0];
  const top2 = reinforcers[1];
  const top3 = reinforcers[2];

  // Check if top value is clearly higher
  const isClearlyHigher = top1[1] > (top3[1] * 1.3);

  if (!isClearlyHigher) {
    return {
      mechanism: 'Neutral',
      topReinforcers: [top1[0], top2[0]],
    };
  }

  return {
    mechanism: top1[0] as ReinforcementMechanism,
    topReinforcers: [top1[0], top2[0]],
  };
}

// Calculate load vs capacity
export function calculateLoadCapacity(latent: LatentScores): {
  band: LoadCapacityBand;
  loadScore: number;
  capacityDeficit: number;
  imbalanceRatio: number;
} {
  const loadScore = latent.CL + latent.PS + latent.AL;
  const capacityDeficit = MAX_RC - latent.RC;
  const imbalanceRatio = latent.RC > 0 ? (loadScore - latent.RC) / latent.RC : 99;

  let band: LoadCapacityBand;
  if (imbalanceRatio >= 0.30) {
    band = 'Overloaded';
  } else if (imbalanceRatio >= 0.10) {
    band = 'Strained';
  } else {
    band = 'Balanced';
  }

  return { band, loadScore, capacityDeficit, imbalanceRatio };
}

// Determine stability
export function determineStability(latent: LatentScores, answers: CalmAnswers): StabilityType {
  const capacityDeficit = MAX_RC - latent.RC;

  // Calculate answer variance (simple measure)
  const answerValues = Object.values(answers);
  const uniqueAnswers = new Set(answerValues).size;
  const variance = uniqueAnswers / answerValues.length;

  if (capacityDeficit > 8 && variance < 0.6) {
    return 'Escalation-Prone';
  } else if (capacityDeficit > 4) {
    return 'Fluctuating';
  } else {
    return 'Stable';
  }
}

// Get clinical pathways based on primary loop
export function getClinicalPathways(primaryLoop: LoopType): {
  helps: string[];
  lessHelpful: string[];
} {
  const pathways: Record<LoopType, { helps: string[]; lessHelpful: string[] }> = {
    'Anticipatory Loop': {
      helps: ['Structured thinking work', 'Response flexibility'],
      lessHelpful: ['Reassurance-only', 'Excess calming'],
    },
    'Control-Seeking Loop': {
      helps: ['Response flexibility', 'Uncertainty tolerance'],
      lessHelpful: ['Excess calming', 'Avoidance strategies'],
    },
    'Reassurance Loop': {
      helps: ['Dependency reduction', 'Self-validation work'],
      lessHelpful: ['Validation-only', 'Reassurance provision'],
    },
    'Avoidance Loop': {
      helps: ['Gradual engagement', 'Exposure work'],
      lessHelpful: ['Avoidance strategies', 'Withdrawal permission'],
    },
    'Somatic Sensitivity Loop': {
      helps: ['Body regulation', 'Interoceptive exposure'],
      lessHelpful: ['Cognitive-only', 'Distraction techniques'],
    },
    'Cognitive Overload Loop': {
      helps: ['Load reduction', 'Recovery protocols'],
      lessHelpful: ['Additional cognitive work', 'Over-analysis'],
    },
    'Balanced / Adaptive Pattern': {
      helps: ['Maintenance', 'Awareness practices'],
      lessHelpful: ['Over-intervention', 'Pathologizing'],
    },
  };

  return pathways[primaryLoop] || pathways['Balanced / Adaptive Pattern'];
}

// Main scoring function - calculates complete CALM result
export function calculateCalmResult(answers: CalmAnswers): CalmResult {
  // Step 1: Calculate latent scores
  const latentScores = calculateLatentScores(answers);

  // Step 2: Calculate loop scores
  const loopScores = calculateLoopScores(latentScores);

  // Step 3: Determine primary and secondary loops
  const { primary, secondary } = determineLoops(loopScores);

  // Step 4: Determine trigger type
  const triggerType = determineTriggerType(latentScores);

  // Step 5: Determine reinforcement
  const { mechanism, topReinforcers } = determineReinforcement(latentScores);

  // Step 6: Calculate load vs capacity
  const loadCapacity = calculateLoadCapacity(latentScores);

  // Step 7: Determine stability
  const stability = determineStability(latentScores, answers);

  // Step 8: Get clinical pathways
  const clinicalPathway = getClinicalPathways(primary);

  return {
    primaryLoop: primary,
    secondaryLoop: secondary,
    loopScores,
    triggerType,
    reinforcement: mechanism,
    topReinforcers,
    loadCapacityBand: loadCapacity.band,
    loadScore: loadCapacity.loadScore,
    capacityDeficit: loadCapacity.capacityDeficit,
    imbalanceRatio: loadCapacity.imbalanceRatio,
    stability,
    clinicalPathway,
    latentScores,
  };
}
