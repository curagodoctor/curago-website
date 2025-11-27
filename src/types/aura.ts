// types/aura.ts
export type QuizAnswers = {
  awareness: number;     // 1..5
  understanding: number; // 1..5
  regulation: number;    // 1..5
  alignment: number;     // 1..5
  reflection: number;    // 1..5
  intellect: number;     // 1..5
  self: number;          // 1..5
  emotion: number;       // 1..5
};

export type UserInfo = {
  name: string;
  email: string;
  whatsapp: string; // 10 digits (India) without +91
};

export type AuraScores = {
  awareness: number;
  understanding: number;
  regulation: number;
  alignment: number;
  reflection: number;
  intellect: number;
  self: number;
  emotion: number;
  overall: number;
};
