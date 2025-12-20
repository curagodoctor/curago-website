// CALM 1.0 - Clinical Anxiety Loop Mapping Types

export interface CalmAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q11: string;
  q12: string;
  q13: string;
  q14: string;
  q15: string;
  q16: string;
  q17: string;
  q18: string;
  q19: string;
  q20: string;
}

// Latent Variables (Internal Scoring)
export interface LatentScores {
  AC: number; // Anticipatory Cognition
  CO: number; // Control Orientation
  RD: number; // Reassurance Dependence
  AL: number; // Avoidance Load
  PS: number; // Physiological Sensitivity
  CL: number; // Cognitive Load
  RC: number; // Recovery Capacity (inverse scored)
}

// Loop Types
export type LoopType =
  | 'Anticipatory Loop'
  | 'Control-Seeking Loop'
  | 'Reassurance Loop'
  | 'Avoidance Loop'
  | 'Somatic Sensitivity Loop'
  | 'Cognitive Overload Loop'
  | 'Balanced / Adaptive Pattern';

// Loop Scores (Composite)
export interface LoopScores {
  anticipatory: number;
  control: number;
  reassurance: number;
  avoidance: number;
  somatic: number;
  cognitiveOverload: number;
}

// Trigger Type
export type TriggerType = 'Internal' | 'External' | 'Mixed';

// Load vs Capacity
export type LoadCapacityBand = 'Overloaded' | 'Strained' | 'Balanced';

// Stability
export type StabilityType = 'Stable' | 'Fluctuating' | 'Escalation-Prone';

// Top Reinforcement Mechanisms
export type ReinforcementMechanism = 'Control' | 'Reassurance' | 'Avoidance' | 'Neutral';

// Complete CALM Result
export interface CalmResult {
  // Section 1: Loop Map
  primaryLoop: LoopType;
  secondaryLoop: LoopType | null;
  loopScores: LoopScores;

  // Section 2: Trigger Architecture
  triggerType: TriggerType;

  // Section 3: Reinforcement Mechanism
  reinforcement: ReinforcementMechanism;
  topReinforcers: string[];

  // Section 4: Load vs Capacity
  loadCapacityBand: LoadCapacityBand;
  loadScore: number;
  capacityDeficit: number;
  imbalanceRatio: number;

  // Section 5: Stability
  stability: StabilityType;

  // Section 6: Clinical Pathways
  clinicalPathway: {
    helps: string[];
    lessHelpful: string[];
  };

  // Internal data
  latentScores: LatentScores;
}

// User Info
export interface CalmUserInfo {
  name: string;
  whatsapp: string;
  email?: string;
}
