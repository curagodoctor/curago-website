
export interface AtmAnswers {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
}

export type AnxietyPattern =
  | 'Overthinking Loop Anxiety'
  | 'Somatic Spike Anxiety'
  | 'Emotional Reactivity Anxiety'
  | 'Control/Perfection Anxiety'
  | 'Memory Reactivation Anxiety'
  | 'Mixed-pattern Anxiety';

export interface AtmResult {
  pattern: AnxietyPattern;
  confidence: number;
}

export interface UserInfo {
  name: string;
  whatsapp: string;
  email?: string;
}
