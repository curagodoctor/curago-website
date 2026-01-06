// types/gbsi.ts - Gut Brain Sensitivity Index types

export type AgeRange = 'under18' | '18-40' | '41-50' | 'over50';

export type AlarmingSign =
  | 'weightLoss'
  | 'bloodInStool'
  | 'difficultySwallowing'
  | 'persistentVomiting'
  | 'nightSymptoms'
  | 'none';

export type FamilyHistory =
  | 'colorectalCancer'
  | 'ibd'
  | 'celiac'
  | 'none';

export type PainFrequency =
  | 'lessThanWeekly'
  | 'onceWeekly'
  | '2-3TimesWeekly'
  | 'daily';

export type ReliefFactor = 'yes' | 'no';

export type BristolType =
  | 'type1' // Separate hard lumps
  | 'type2' // Sausage-shaped but lumpy
  | 'type3' // Like a sausage with cracks
  | 'type4' // Smooth and soft
  | 'type5' // Soft blobs
  | 'type6' // Fluffy pieces/mushy
  | 'type7'; // Watery liquid

export type RefluxFrequency = 'never' | 'occasionally' | 'dailyNightly';

export type FullnessFactor = 'yes' | 'no';

export type FattyLiver = 'yes' | 'no' | 'dontKnow';

export type BrainFog = 'yesFrequently' | 'no';

export interface DietaryHabits {
  lateNightDinners: boolean;
  highCaffeine: boolean;
  frequentJunk: boolean;
  skipBreakfast: boolean;
}

export interface GbsiAnswers {
  age: AgeRange;
  alarmingSigns: AlarmingSign[];
  familyHistory: FamilyHistory[];
  painFrequency: PainFrequency;
  reliefFactor: ReliefFactor;
  bristolType: BristolType;
  refluxFrequency: RefluxFrequency;
  fullnessFactor: FullnessFactor;
  fattyLiver: FattyLiver;
  stressLevel: number; // 1-10
  brainFog: BrainFog;
  dietaryHabits: DietaryHabits;
}

export type ResultType =
  | 'clinicalPriority'
  | 'brainGutOverdrive'
  | 'mechanicalMetabolic'
  | 'allClear';

export type IBSType = 'IBS-C' | 'IBS-D' | 'IBS-M' | 'none';

export interface GbsiResult {
  resultType: ResultType;
  ibsType?: IBSType;
  hasRedFlags: boolean;
  brainGutSensitivity: 'low' | 'medium' | 'high';
  axisScore: number; // 0-3
}

export interface GbsiUserInfo {
  name: string;
  email?: string;
  whatsapp: string; // 10 digits (India) without +91
}
