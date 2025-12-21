// CALM 1.0 Questions and Scoring Data - FINAL HUMAN-LANGUAGE VERSION

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
    text: 'Imagine your anxiety starting up, what do you usually notice before it actually becomes worse?',
    options: [
      { id: 'A', text: 'A random thought suddenly throwing me off and I go into spirals', scores: [{ variable: 'AC', points: 2 }, { variable: 'CL', points: 1 }] },
      { id: 'B', text: 'I start thinking about something that\'s coming up and I lose control', scores: [{ variable: 'AC', points: 3 }] },
      { id: 'C', text: 'It starts with my body, like increasing heartbeat or breathing or sweating', scores: [{ variable: 'PS', points: 3 }] },
      { id: 'D', text: 'I can\'t point to anything specific — it just slowly creeps in', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },
  {
    id: 'q2',
    dimension: 'TRIGGER INITIATION',
    text: 'When anxiety begins, how does it usually start?',
    options: [
      { id: 'A', text: 'It hits me suddenly and strongly', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'B', text: 'It builds slowly in the background and I usually don\'t notice until it worsens', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'C', text: 'It shows up after I\'ve been thinking about the same thing again and again', scores: [{ variable: 'AC', points: 3 }, { variable: 'CL', points: 1 }] },
      { id: 'D', text: 'It comes up when I\'m already tired or drained', scores: [{ variable: 'RC', points: 2 }, { variable: 'CL', points: 1 }] },
    ],
  },
  {
    id: 'q3',
    dimension: 'TRIGGER INITIATION',
    text: 'Anxiety is more likely to start when you are in which of the following situations?',
    options: [
      { id: 'A', text: 'I don\'t feel sure or in control of what\'s going on, then anxiety starts', scores: [{ variable: 'CO', points: 3 }] },
      { id: 'B', text: 'I feel judged, evaluated, or watched, then anxiety starts', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'C', text: 'My regular routine gets disturbed, then anxiety starts', scores: [{ variable: 'CO', points: 2 }] },
      { id: 'D', text: 'I\'m alone with my thoughts for too long, then anxiety starts', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },
  {
    id: 'q4',
    dimension: 'TRIGGER INITIATION',
    text: 'Once anxiety has started, what feels most dominant for you?',
    options: [
      { id: 'A', text: 'My thoughts completely take over my senses and I have no control over it', scores: [{ variable: 'CL', points: 2 }] },
      { id: 'B', text: 'Something in my body feels uncomfortable and uneasy', scores: [{ variable: 'PS', points: 3 }] },
      { id: 'C', text: 'I feel emotionally unsettled or confused', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'D', text: 'I just feel "off", but can\'t clearly explain why', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },

  // DIMENSION 2: COGNITIVE LOOPING
  {
    id: 'q5',
    dimension: 'COGNITIVE LOOPING',
    text: 'When you are anxious, what does your mind usually do?',
    options: [
      { id: 'A', text: 'It keeps replaying the same situations again and again', scores: [{ variable: 'AC', points: 3 }] },
      { id: 'B', text: 'It jumps between many different worries or fears', scores: [{ variable: 'CL', points: 2 }] },
      { id: 'C', text: 'It gets stuck on one question or a problem and I can\'t resolve it', scores: [{ variable: 'CO', points: 2 }, { variable: 'CL', points: 1 }] },
      { id: 'D', text: 'It just feels blank, but I feel tense underneath', scores: [{ variable: 'PS', points: 2 }] },
    ],
  },
  {
    id: 'q6',
    dimension: 'COGNITIVE LOOPING',
    text: 'When you try to think your way out of anxiety, what usually happens?',
    options: [
      { id: 'A', text: 'The more I think, the worse it gets', scores: [{ variable: 'CL', points: 3 }] },
      { id: 'B', text: 'It helps for a short while, then the anxiety returns', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'C', text: 'I feel stuck and unable to move forward', scores: [{ variable: 'CO', points: 2 }] },
      { id: 'D', text: 'Thinking doesn\'t really change much', scores: [{ variable: 'CL', points: 1 }] },
    ],
  },
  {
    id: 'q7',
    dimension: 'COGNITIVE LOOPING',
    text: 'When someone tells you "it will be okay" while you\'re anxious, what happens for you?',
    options: [
      { id: 'A', text: 'I feel calmer for a bit, but it doesn\'t last', scores: [{ variable: 'RD', points: 2 }] },
      { id: 'B', text: 'I feel better, but soon need reassurance again', scores: [{ variable: 'RD', points: 3 }] },
      { id: 'C', text: 'It doesn\'t really change how I feel', scores: [{ variable: 'CO', points: 1 }] },
      { id: 'D', text: 'Sometimes it makes me doubt myself even more', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },
  {
    id: 'q8',
    dimension: 'COGNITIVE LOOPING',
    text: 'When anxiety is active, what are your thoughts like?',
    options: [
      { id: 'A', text: 'My brain goes into "get out this anxiety" mode', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'B', text: 'My mind gets stuck in a loop and goes in circles', scores: [{ variable: 'CL', points: 3 }] },
      { id: 'C', text: 'Too many thoughts come at once and I lose control', scores: [{ variable: 'CL', points: 3 }] },
      { id: 'D', text: 'Everything feel scattered or disconnected', scores: [{ variable: 'PS', points: 2 }] },
    ],
  },

  // DIMENSION 3: BEHAVIOURAL REINFORCEMENT
  {
    id: 'q9',
    dimension: 'BEHAVIOURAL REINFORCEMENT',
    text: 'When anxiety shows up, what do you usually end up doing?',
    options: [
      { id: 'A', text: 'I avoid certain situations', scores: [{ variable: 'AL', points: 3 }] },
      { id: 'B', text: 'I reach out to someone for reassurance', scores: [{ variable: 'RD', points: 3 }] },
      { id: 'C', text: 'I over-prepare or double-check things', scores: [{ variable: 'CO', points: 2 }] },
      { id: 'D', text: 'I mentally withdraw or shut down', scores: [{ variable: 'AL', points: 2 }] },
    ],
  },
  {
    id: 'q10',
    dimension: 'BEHAVIOURAL REINFORCEMENT',
    text: 'When you avoid things because of anxiety, what tends to happen over time?',
    options: [
      { id: 'A', text: 'It helps in the moment', scores: [{ variable: 'AL', points: 2 }] },
      { id: 'B', text: 'Anxiety comes back stronger later', scores: [{ variable: 'AL', points: 3 }] },
      { id: 'C', text: 'It doesn\'t really change much', scores: [{ variable: 'AL', points: 1 }] },
      { id: 'D', text: 'Avoiding slowly becomes my default habit', scores: [{ variable: 'AL', points: 3 }] },
    ],
  },
  {
    id: 'q11',
    dimension: 'BEHAVIOURAL REINFORCEMENT',
    text: 'To prevent anxiety, what do you find yourself doing most often?',
    options: [
      { id: 'A', text: 'Checking things again and again', scores: [{ variable: 'CO', points: 3 }] },
      { id: 'B', text: 'Planning far more than necessary', scores: [{ variable: 'CO', points: 2 }] },
      { id: 'C', text: 'Looking for certainty or confirmation', scores: [{ variable: 'RD', points: 2 }] },
      { id: 'D', text: 'Cutting down or restricting activities', scores: [{ variable: 'AL', points: 3 }] },
    ],
  },
  {
    id: 'q12',
    dimension: 'BEHAVIOURAL REINFORCEMENT',
    text: 'After an anxious episode passes, what usually happens next for you?',
    options: [
      { id: 'A', text: 'I keep thinking about why it happened', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'B', text: 'I feel relieved, but completely drained', scores: [{ variable: 'RC', points: 2 }] },
      { id: 'C', text: 'I worry about it happening again', scores: [{ variable: 'AC', points: 2 }] },
      { id: 'D', text: 'I try to push it out of my mind', scores: [{ variable: 'AL', points: 1 }] },
    ],
  },

  // DIMENSION 4: PHYSIOLOGICAL LOAD
  {
    id: 'q13',
    dimension: 'PHYSIOLOGICAL LOAD',
    text: 'During anxious periods, what physical issue do you notice most?',
    options: [
      { id: 'A', text: 'My sleep gets disturbed', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'B', text: 'I have stomach or digestive discomfort', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'C', text: 'My muscles feel tight or tense', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'D', text: 'My breathing feels different or uncomfortable', scores: [{ variable: 'PS', points: 3 }] },
    ],
  },
  {
    id: 'q14',
    dimension: 'PHYSIOLOGICAL LOAD',
    text: 'Anxiety tends to get worse for you when which of these happens?',
    options: [
      { id: 'A', text: 'I haven\'t slept well', scores: [{ variable: 'PS', points: 3 }] },
      { id: 'B', text: 'I\'ve had more caffeine than usual', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'C', text: 'My meals are irregular', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'D', text: 'I\'m physically inactive', scores: [{ variable: 'PS', points: 2 }] },
    ],
  },
  {
    id: 'q15',
    dimension: 'PHYSIOLOGICAL LOAD',
    text: 'When anxiety hits, how do physical sensations and thoughts relate for you?',
    options: [
      { id: 'A', text: 'The body reacts first, then the thoughts follow', scores: [{ variable: 'PS', points: 3 }] },
      { id: 'B', text: 'The thoughts start first, then the body reacts', scores: [{ variable: 'CL', points: 2 }] },
      { id: 'C', text: 'Both happen together', scores: [{ variable: 'PS', points: 2 }, { variable: 'CL', points: 1 }] },
      { id: 'D', text: 'It feels unpredictable', scores: [{ variable: 'PS', points: 2 }] },
    ],
  },
  {
    id: 'q16',
    dimension: 'PHYSIOLOGICAL LOAD',
    text: 'When you rest or sleep, what effect does it usually have on your anxiety?',
    options: [
      { id: 'A', text: 'It clearly reduces it', scores: [{ variable: 'RC', points: 2 }] },
      { id: 'B', text: 'It helps a little', scores: [{ variable: 'RC', points: 1 }] },
      { id: 'C', text: 'It doesn\'t help much', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'D', text: 'Sometimes it actually makes it worse', scores: [{ variable: 'PS', points: 3 }] },
    ],
  },

  // DIMENSION 5: RECOVERY CAPACITY
  {
    id: 'q17',
    dimension: 'RECOVERY CAPACITY',
    text: 'After stressful periods, how does recovery usually feel for you?',
    options: [
      { id: 'A', text: 'I don\'t feel fully recovered', scores: [{ variable: 'RC', points: 3 }] },
      { id: 'B', text: 'I recover, but very slowly', scores: [{ variable: 'RC', points: 2 }] },
      { id: 'C', text: 'Recovery feels difficult', scores: [{ variable: 'RC', points: 3 }] },
      { id: 'D', text: 'It feels like I never really recover', scores: [{ variable: 'RC', points: 3 }] }, // cap at 3
    ],
  },
  {
    id: 'q18',
    dimension: 'RECOVERY CAPACITY',
    text: 'On most days, what best describes how you feel overall?',
    options: [
      { id: 'A', text: 'I am just mentally tired', scores: [{ variable: 'CL', points: 2 }] },
      { id: 'B', text: 'I feel motionally flat', scores: [{ variable: 'RC', points: 2 }] },
      { id: 'C', text: 'I am always physically exhausted', scores: [{ variable: 'PS', points: 2 }] },
      { id: 'D', text: 'I feel overstimulated', scores: [{ variable: 'CL', points: 2 }] },
    ],
  },
  {
    id: 'q19',
    dimension: 'RECOVERY CAPACITY',
    text: 'How do your energy levels usually feel these days?',
    options: [
      { id: 'A', text: 'Mostly okay, but easily drained', scores: [{ variable: 'RC', points: 1 }] },
      { id: 'B', text: 'Low energy on most days', scores: [{ variable: 'RC', points: 3 }] },
      { id: 'C', text: 'Energy goes up and down', scores: [{ variable: 'RC', points: 2 }] },
      { id: 'D', text: 'Almost always depleted', scores: [{ variable: 'RC', points: 3 }] }, // cap at 3
    ],
  },
  {
    id: 'q20',
    dimension: 'RECOVERY CAPACITY',
    text: 'Compared to a few years ago, how do you handle stress now?',
    options: [
      { id: 'A', text: 'I handle stress worse than before', scores: [{ variable: 'RC', points: 3 }] },
      { id: 'B', text: 'About the same as before', scores: [] }, // 0 points
      { id: 'C', text: 'It depends on the situation', scores: [{ variable: 'RC', points: 1 }] },
      { id: 'D', text: 'It feels unpredictable', scores: [{ variable: 'RC', points: 2 }] },
    ],
  },
];
