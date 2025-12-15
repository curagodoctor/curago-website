// Team Members Data -
export interface TeamMember {
  name: string;
  designation: string;
  institute: string;
  qualification: string;
  expertise: string[];
  languages: string[];
  registrationNumber: string;
  image: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: "Dr. Charan Kumar Pottem",
    designation: "Consultant Psychiatrist",
    institute: "NIMHANS, Bangalore",
    qualification: "MBBS, MD Psychiatry",
    expertise: [
      "General Psychiatry",
      "Mood Disorders",
      "Behavioural Disorders",
      "Anxiety Disorders",
    ],
    languages: ["Hindi", "Telugu", "Kannada", "English"],
    registrationNumber: "MCI-12345",
    image: "/image.png",
  },
  {
    name: "Dr. Sucheta Saha",
    designation: "Consultant Psychiatrist",
    institute: "LGBRIMH, Tezpur | AIIMS Rishikesh",
    qualification: "MBBS, MD Psychiatry",
    expertise: [
      "General Psychiatry",
      "Anxiety Disorder",
      "Burnout Management",
      "Deaddiction",
      "Child and Adolescent Psychiatry",
      "Neuropsychiatry",
    ],
    languages: ["English", "Bengali", "Assamese", "Kannada"],
    registrationNumber: "MCI-01234",
    image: "/Dr Sucheta Saha.jpg",
  },
  {
    name: "Dr. Ekaansh Sharmad",
    designation: "Consultant Psychiatrist",
    institute: "RMCH, Bareilly | IHBAS",
    qualification: "MBBS, MD Psychiatry",
    expertise: [
      "Geriatric Psychiatry",
      "Deaddiction",
      "Psychotherapy (CBT, DBT)",
      "Depression",
      "Psychosis",
      "Anxiety Disorders",
      "Sexual Disorders",
    ],
    languages: ["Hindi", "English"],
    registrationNumber: "MCI-23456",
    image: "/image1.png",
  },
  {
    name: "Dr. Harshali Sunil More",
    designation: "Consultant Psychiatrist",
    institute: "JJ Hospital, Mumbai",
    qualification: "MBBS, MD Psychiatry",
    expertise: [
      "Mood Disorders",
      "Anxiety Disorders",
      "Psychotic Spectrum Disorders",
      "Neurocognitive Disorders",
      "Substance Use Disorders",
      "Child Psychiatry",
    ],
    languages: ["Hindi", "Marathi", "English"],
    registrationNumber: "MCI-45678",
    image: "/drharshali.png",
  },
  {
    name: "Dr. Utkarsh Mestri",
    designation: "Consultant Psychiatrist",
    institute: "KEMH, Mumbai",
    qualification: "MBBS, MD Psychiatry",
    expertise: [
      "General Psychiatry",
      "Mood Disorders",
      "Deaddiction",
      "Sexual Medicine",
    ],
    languages: ["Hindi", "Marathi", "English"],
    registrationNumber: "MCI-56789",
    image: "/drutkarsh.png",
  },
  {
    name: "Simral Kamal",
    designation: "Clinical Psychologist",
    institute: "Jain University",
    qualification: "MD Clinical Psychology",
    expertise: ["CBT", "REBT", "NLP", "Therapy", "Counselling"],
    languages: ["Hindi", "Urdu", "Kannada", "English", "French"],
    registrationNumber: "RCI-67890",
    image: "/simral.png",
  },
  {
    name: "Dr. Sourabh Pal",
    designation: "Consultant Psychiatrist",
    institute: "KEMH, Mumbai",
    qualification: "MBBS, MD Psychiatry",
    expertise: [
      "OCD and Depression Treatment",
      "Cognitive Behavioral Therapy",
      "Bipolar Disorder Treatment",
      "Schizophrenia and Psychosis Care",
      "Sexual Disorder Treatment and Counseling",
    ],
    languages: ["Hindi", "Marathi", "English"],
    registrationNumber: "MCI-89012",
    image: "/sourabh.png",
  },
  {
    name: "Dr. Yeshwant Solanki",
    designation: "Consultant Psychiatrist",
    institute: "JJ Hospital, Mumbai",
    qualification: "MBBS, MD Psychiatry",
    expertise: [
      "Adult Psychiatry",
      "Deaddiction Psychiatry",
      "Child Psychiatry",
    ],
    languages: ["Hindi", "Marathi", "English"],
    registrationNumber: "MCI-90123",
    image: "/yeshwant.png",
  },
];
