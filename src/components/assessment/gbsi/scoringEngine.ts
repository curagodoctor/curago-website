// scoringEngine.ts - GBSI Scoring Logic

import type { GbsiAnswers, GbsiResult, ResultType, IBSType } from '../../../types/gbsi';

export function calculateGbsiResult(answers: GbsiAnswers): GbsiResult {
  // LOGIC A: THE EMERGENCY OVERRIDE (Red Flag Logic)
  const hasRedFlags = checkRedFlags(answers);

  if (hasRedFlags) {
    return {
      resultType: 'clinicalPriority',
      hasRedFlags: true,
      brainGutSensitivity: 'low',
      axisScore: 0,
    };
  }

  // LOGIC B: THE IBS CLASSIFIER (Rome IV Logic)
  const ibsType = classifyIBS(answers);

  // LOGIC C: THE AXIS WEIGHTING
  const axisScore = calculateAxisScore(answers);
  const brainGutSensitivity = determineBrainGutSensitivity(axisScore);

  // Determine result type based on IBS classification and other factors
  const resultType = determineResultType(answers, ibsType, axisScore);

  return {
    resultType,
    ibsType: ibsType !== 'none' ? ibsType : undefined,
    hasRedFlags: false,
    brainGutSensitivity,
    axisScore,
  };
}

// Check for red flags (alarming signs, age, family history)
function checkRedFlags(answers: GbsiAnswers): boolean {
  // Check age
  if (answers.age === 'over50') {
    return true;
  }

  // Check alarming signs (any sign other than 'none')
  const hasAlarmingSigns = answers.alarmingSigns.some(
    (sign) => sign !== 'none'
  );
  if (hasAlarmingSigns && answers.alarmingSigns.length > 0) {
    return true;
  }

  // Check family history of cancer
  if (answers.familyHistory.includes('colorectalCancer')) {
    return true;
  }

  return false;
}

// Classify IBS type based on Rome IV criteria
function classifyIBS(answers: GbsiAnswers): IBSType {
  // IBS requires pain frequency >= 1/week
  const hasFrequentPain =
    answers.painFrequency === 'onceWeekly' ||
    answers.painFrequency === '2-3TimesWeekly' ||
    answers.painFrequency === 'daily';

  if (!hasFrequentPain) {
    return 'none';
  }

  // Classify based on Bristol type
  // Type 1-2: Constipation
  if (answers.bristolType === 'type1' || answers.bristolType === 'type2') {
    return 'IBS-C';
  }
  // Type 5-7: Diarrhea
  else if (answers.bristolType === 'type5' || answers.bristolType === 'type6' || answers.bristolType === 'type7') {
    return 'IBS-D';
  }
  // Type 3-4: Normal (but with pain, so could be IBS-M)
  else if (answers.bristolType === 'type3' || answers.bristolType === 'type4') {
    return 'IBS-M';
  }

  return 'none';
}

// Calculate Axis Score (0-3)
function calculateAxisScore(answers: GbsiAnswers): number {
  let score = 0;

  // 1 point for high stress (>7)
  if (answers.stressLevel > 7) {
    score++;
  }

  // 1 point for brain fog
  if (answers.brainFog === 'yesFrequently') {
    score++;
  }

  // 1 point for relief factor = yes
  if (answers.reliefFactor === 'yes') {
    score++;
  }

  return score;
}

// Determine brain-gut sensitivity based on axis score
function determineBrainGutSensitivity(axisScore: number): 'low' | 'medium' | 'high' {
  if (axisScore === 3) {
    return 'high';
  } else if (axisScore >= 1) {
    return 'medium';
  }
  return 'low';
}

// Determine the final result type
function determineResultType(
  answers: GbsiAnswers,
  ibsType: IBSType,
  axisScore: number
): ResultType {
  // If IBS is present AND high brain-gut sensitivity -> Brain-Gut Overdrive
  if (ibsType !== 'none' && axisScore === 3) {
    return 'brainGutOverdrive';
  }

  // If there are upper GI issues or fatty liver -> Mechanical/Metabolic
  if (
    answers.refluxFrequency === 'dailyNightly' ||
    answers.fullnessFactor === 'yes' ||
    answers.fattyLiver === 'yes'
  ) {
    return 'mechanicalMetabolic';
  }

  // If IBS is present but not high brain-gut sensitivity -> still Brain-Gut Overdrive
  if (ibsType !== 'none') {
    return 'brainGutOverdrive';
  }

  // No significant issues -> All Clear
  return 'allClear';
}

// Helper to get alarming signs as readable text
export function getAlarmingSignsText(signs: string[]): string {
  const mapping: Record<string, string> = {
    weightLoss: 'Unintended weight loss',
    bloodInStool: 'Blood in stool',
    difficultySwallowing: 'Difficulty swallowing',
    persistentVomiting: 'Persistent vomiting',
    nightSymptoms: 'Symptoms that wake you up',
  };

  return signs
    .filter((sign) => sign !== 'none')
    .map((sign) => mapping[sign] || sign)
    .join(', ');
}
