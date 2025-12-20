// CALM 1.0 Questions and Scoring Data

export interface QuestionOption {
  id: string;
  text: string;
  scores: {
    variable: 'AC' | 'CO' | 'RD' | 'AL' | 'PS' | 'CL' | 'RC';
    points: number;
  }[];
}

export interface CalmQuestion {
  id: string;
  dimension: string;
  text: string;
  options: QuestionOption[];
}

export const CALM_QUESTIONS: CalmQuestion[] = [
  // DIMENSION 1: TRIGGER INITIATION
  {
    id: 'q1',
    dimension: 'TRIGGER INITIATION',
    text: 'When anxiety starts, it is usually triggered by:',
    options: [
      { id: 'A', text: 'A sudden thought or realization', scores: [{ variable: 'AC', points: 2 }, { variable: 'CL', points: 1 }] },
      { id: 'B', text: 'Anticipating something upcoming', scores: [{ variable: 'AC', points: 3 }] },
      { id: 'C', text: 'A physical sensation in the body', scores: [{ variable: 'PS', points: 3 }] },
      { id: 'D', text: 'It builds without a clear starting point', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },
  {
    id: 'q2',
    dimension: 'TRIGGER INITIATION',
    text: 'Anxiety usually begins:',
    options: [
      { id: 'A', text: 'Immediately and sharply', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'B', text: 'Gradually over time', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'C', text: 'Only after thinking about it repeatedly', scores: [{ variable: 'AC', points: 3 }, { variable: 'CL', points: 1 }] },
      { id: 'D', text: 'When I\'m already tired or drained', scores: [{ variable: 'RC', points: 2 }, { variable: 'CL', points: 1 }] },
    ],
  },
  {
    id: 'q3',
    dimension: 'TRIGGER INITIATION',
    text: 'My anxiety is more likely to start when:',
    options: [
      { id: 'A', text: 'I lose certainty or control', scores: [{ variable: 'CO', points: 3 }] },
      { id: 'B', text: 'I feel evaluated or judged', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'C', text: 'My routine is disrupted', scores: [{ variable: 'CO', points: 2 }] },
      { id: 'D', text: 'I\'m alone with my thoughts', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },
  {
    id: 'q4',
    dimension: 'TRIGGER INITIATION',
    text: 'Once triggered, anxiety feels:',
    options: [
      { id: 'A', text: 'Mentally dominant', scores: [{ variable: 'CL', points: 2 }] },
      { id: 'B', text: 'Physically overwhelming', scores: [{ variable: 'PS', points: 3 }] },
      { id: 'C', text: 'Emotionally confusing', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'D', text: 'Hard to localize', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },

  // DIMENSION 2: COGNITIVE LOOPING
  {
    id: 'q5',
    dimension: 'COGNITIVE LOOPING',
    text: 'When anxious, my mind tends to:',
    options: [
      { id: 'A', text: 'Replay scenarios repeatedly', scores: [{ variable: 'AC', points: 3 }] },
      { id: 'B', text: 'Jump between multiple worries', scores: [{ variable: 'CL', points: 2 }] },
      { id: 'C', text: 'Fixate on one unresolved question', scores: [{ variable: 'CO', points: 2 }, { variable: 'CL', points: 1 }] },
      { id: 'D', text: 'Go blank but feel tense', scores: [{ variable: 'PS', points: 2 }] },
    ],
  },
  {
    id: 'q6',
    dimension: 'COGNITIVE LOOPING',
    text: 'Trying to "figure it out" usually:',
    options: [
      { id: 'A', text: 'Increases my anxiety', scores: [{ variable: 'CL', points: 3 }] },
      { id: 'B', text: 'Briefly helps, then worsens it', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'C', text: 'Makes me feel stuck', scores: [{ variable: 'CO', points: 2 }] },
      { id: 'D', text: 'Doesn\'t change much', scores: [{ variable: 'CL', points: 1 }] },
    ],
  },
  {
    id: 'q7',
    dimension: 'COGNITIVE LOOPING',
    text: 'Reassurance from others:',
    options: [
      { id: 'A', text: 'Helps only temporarily', scores: [{ variable: 'RD', points: 2 }] },
      { id: 'B', text: 'Makes me seek more reassurance', scores: [{ variable: 'RD', points: 3 }] },
      { id: 'C', text: 'Rarely helps', scores: [{ variable: 'CO', points: 1 }] },
      { id: 'D', text: 'Sometimes increases doubt', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },
  {
    id: 'q8',
    dimension: 'COGNITIVE LOOPING',
    text: 'My thoughts during anxiety feel:',
    options: [
      { id: 'A', text: 'Urgent', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'B', text: 'Circular', scores: [{ variable: 'CL', points: 3 }] },
      { id: 'C', text: 'Overloaded', scores: [{ variable: 'CL', points: 3 }] },
      { id: 'D', text: 'Disconnected', scores: [{ variable: 'PS', points: 2 }] },
    ],
  },

  // DIMENSION 3: BEHAVIOURAL REINFORCEMENT
  {
    id: 'q9',
    dimension: 'BEHAVIOURAL REINFORCEMENT',
    text: 'When anxious, I most often:',
    options: [
      { id: 'A', text: 'Avoid situations', scores: [{ variable: 'AL', points: 3 }] },
      { id: 'B', text: 'Seek reassurance', scores: [{ variable: 'RD', points: 3 }] },
      { id: 'C', text: 'Over-prepare', scores: [{ variable: 'CO', points: 2 }] },
      { id: 'D', text: 'Withdraw mentally', scores: [{ variable: 'AL', points: 2 }] },
    ],
  },
  {
    id: 'q10',
    dimension: 'BEHAVIOURAL REINFORCEMENT',
    text: 'Avoidance usually:',
    options: [
      { id: 'A', text: 'Reduces anxiety short-term', scores: [{ variable: 'AL', points: 2 }] },
      { id: 'B', text: 'Leads to anxiety returning stronger', scores: [{ variable: 'AL', points: 3 }] },
      { id: 'C', text: 'Doesn\'t help much', scores: [{ variable: 'AL', points: 1 }] },
      { id: 'D', text: 'Becomes a habit', scores: [{ variable: 'AL', points: 3 }] },
    ],
  },
  {
    id: 'q11',
    dimension: 'BEHAVIOURAL REINFORCEMENT',
    text: 'I change my behaviour to prevent anxiety by:',
    options: [
      { id: 'A', text: 'Constant checking', scores: [{ variable: 'CO', points: 3 }] },
      { id: 'B', text: 'Planning excessively', scores: [{ variable: 'CO', points: 2 }] },
      { id: 'C', text: 'Seeking certainty', scores: [{ variable: 'RD', points: 2 }] },
      { id: 'D', text: 'Restricting activities', scores: [{ variable: 'AL', points: 3 }] },
    ],
  },
  {
    id: 'q12',
    dimension: 'BEHAVIOURAL REINFORCEMENT',
    text: 'After anxiety passes, I:',
    options: [
      { id: 'A', text: 'Analyze why it happened', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'B', text: 'Feel relief but exhaustion', scores: [{ variable: 'RC', points: 2 }] },
      { id: 'C', text: 'Fear it returning', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'D', text: 'Try to forget it', scores: [{ variable: 'AL', points: 1 }] },
    ],
  },

  // DIMENSION 4: PHYSIOLOGICAL LOAD
  {
    id: 'q13',
    dimension: 'PHYSIOLOGICAL LOAD',
    text: 'During anxious periods, I notice:',
    options: [
      { id: 'A', text: 'Sleep disruption', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'B', text: 'Digestive discomfort', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'C', text: 'Muscle tension', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'D', text: 'Breathing changes', scores: [{ variable: 'PS', points: 3 }] },
    ],
  },
  {
    id: 'q14',
    dimension: 'PHYSIOLOGICAL LOAD',
    text: 'My anxiety worsens when:',
    options: [
      { id: 'A', text: 'Sleep is poor', scores: [{ variable: 'PS', points: 3 }] },
      { id: 'B', text: 'Caffeine is higher', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'C', text: 'Meals are irregular', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'D', text: 'I\'m physically inactive', scores: [{ variable: 'PS', points: 2 }] },
    ],
  },
  {
    id: 'q15',
    dimension: 'PHYSIOLOGICAL LOAD',
    text: 'Physical sensations during anxiety feel:',
    options: [
      { id: 'A', text: 'Primary (body first)', scores: [{ variable: 'PS', points: 3 }] },
      { id: 'B', text: 'Secondary (mind first)', scores: [{ variable: 'CL', points: 2 }] },
      { id: 'C', text: 'Mixed', scores: [{ variable: 'PS', points: 2 }, { variable: 'CL', points: 1 }] },
      { id: 'D', text: 'Unpredictable', scores: [{ variable: 'PS', points: 2 }] },
    ],
  },
  {
    id: 'q16',
    dimension: 'PHYSIOLOGICAL LOAD',
    text: 'Rest or sleep:',
    options: [
      { id: 'A', text: 'Reduces anxiety noticeably', scores: [{ variable: 'RC', points: -2 }] }, // inverse
      { id: 'B', text: 'Helps only slightly', scores: [{ variable: 'RC', points: -1 }] }, // inverse
      { id: 'C', text: 'Has no effect', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'D', text: 'Sometimes worsens it', scores: [{ variable: 'PS', points: 3 }] },
    ],
  },

  // DIMENSION 5: RECOVERY CAPACITY
  {
    id: 'q17',
    dimension: 'RECOVERY CAPACITY',
    text: 'After stressful periods, recovery feels:',
    options: [
      { id: 'A', text: 'Incomplete', scores: [{ variable: 'RC', points: 3 }] },
      { id: 'B', text: 'Slow', scores: [{ variable: 'RC', points: 2 }] },
      { id: 'C', text: 'Difficult', scores: [{ variable: 'RC', points: 3 }] },
      { id: 'D', text: 'Non-existent', scores: [{ variable: 'RC', points: 3 }] }, // cap at 3
    ],
  },
  {
    id: 'q18',
    dimension: 'RECOVERY CAPACITY',
    text: 'I often feel:',
    options: [
      { id: 'A', text: 'Mentally drained', scores: [{ variable: 'CL', points: 2 }] },
      { id: 'B', text: 'Emotionally flat', scores: [{ variable: 'RC', points: 2 }] },
      { id: 'C', text: 'Physically exhausted', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'D', text: 'Overstimulated', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },
  {
    id: 'q19',
    dimension: 'RECOVERY CAPACITY',
    text: 'My energy reserves feel:',
    options: [
      { id: 'A', text: 'Adequate but fragile', scores: [{ variable: 'RC', points: 1 }] },
      { id: 'B', text: 'Frequently depleted', scores: [{ variable: 'RC', points: 3 }] },
      { id: 'C', text: 'Inconsistent', scores: [{ variable: 'RC', points: 2 }] },
      { id: 'D', text: 'Low most of the time', scores: [{ variable: 'RC', points: 3 }] }, // cap at 3
    ],
  },
  {
    id: 'q20',
    dimension: 'RECOVERY CAPACITY',
    text: 'Compared to earlier years, my stress tolerance:',
    options: [
      { id: 'A', text: 'Has reduced', scores: [{ variable: 'RC', points: 3 }] },
      { id: 'B', text: 'Is unchanged', scores: [] }, // 0 points
      { id: 'C', text: 'Depends on context', scores: [{ variable: 'RC', points: 1 }] },
      { id: 'D', text: 'Feels unpredictable', scores: [{ variable: 'RC', points: 2 }] },
    ],
  },
];
