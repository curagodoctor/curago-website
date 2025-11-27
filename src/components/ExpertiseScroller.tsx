import { useEffect, useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';

const expertiseData = [
  {
    title: 'Anxiety',
    description: 'Comprehensive care for generalized anxiety, panic attacks, and phobias using evidence-based therapies and medications.',
    highlights: ['Medication Management', 'Cognitive Behavioral Therapy (CBT)', 'Relaxation & Breathing Techniques']
  },
  {
    title: 'Stress',
    description: 'Personalized stress management plans to help balance emotions, reduce burnout, and restore mental calm.',
    highlights: ['Mindfulness & Relaxation Training', 'Lifestyle Counseling', 'Sleep & Routine Optimization']
  },
  {
    title: 'Depression',
    description: 'Structured evaluation and treatment for depression, low mood, and loss of motivation through proven interventions.',
    highlights: ['Psychiatric Assessment', 'Therapeutic Counseling', 'Medication & Monitoring']
  },
  {
    title: 'ADHD',
    description: 'Targeted management for attention, focus, and behavioral challenges in children and adults.',
    highlights: ['Behavioral Assessments', 'Skill-Building Programs', 'Parent/Family Counseling']
  },
  {
    title: 'Mood & Behavioral Disorders',
    description: 'Comprehensive care for irritability, anger, and mood instability to improve emotional control and relationships.',
    highlights: ['Mood Stabilization Therapy', 'Behavioral Modification Plans', 'Ongoing Progress Review']
  },
  {
    title: 'OCD (Obsessive Compulsive Disorder)',
    description: 'Focused therapy and medication for obsessive thoughts and compulsive behaviors that affect daily life.',
    highlights: ['Exposure & Response Prevention (ERP)', 'Cognitive Therapy', 'Medication Support']
  },
  {
    title: 'Bipolar Disorder',
    description: 'Holistic management of mood swings, mania, and depression through long-term stabilization plans.',
    highlights: ['Mood Tracking & Monitoring', 'Medication Management', 'Psychosocial Support']
  },
  {
    title: 'Relationship & Marriage Counselling',
    description: 'Guidance for couples and families to resolve conflicts, rebuild trust, and strengthen communication.',
    highlights: ['Couple Therapy', 'Family Counseling', 'Conflict Resolution Sessions']
  },
  {
    title: 'Autism Spectrum Disorder',
    description: 'Early diagnosis and supportive care for children with autism to improve communication and social skills.',
    highlights: ['Developmental Assessments', 'Behavioral Therapy', 'Parent Guidance Programs']
  },
  {
    title: 'Child & Adolescent Psychiatry',
    description: 'Specialized care for emotional, behavioral, and academic concerns in growing children and teens.',
    highlights: ['Play & Expressive Therapy', 'Academic & Emotional Support', 'Parent Counseling']
  },
  {
    title: 'Deaddiction Services',
    description: 'Compassionate support for alcohol, drug, and behavioral addictions with structured recovery programs.',
    highlights: ['Detox & Medication-Assisted Care', 'Relapse Prevention', 'Family Support']
  },
  {
    title: 'Geriatric Psychiatry',
    description: 'Focused care for seniors facing memory loss, depression, or emotional changes related to aging.',
    highlights: ['Memory & Cognitive Screening', 'Mood & Sleep Management', 'Family Education & Support']
  },
  {
    title: 'Neuropsychiatry',
    description: 'Expert evaluation for mental health issues linked to brain and neurological disorders.',
    highlights: ['Cognitive Assessments', 'Brain–Mind Disorder Management', 'Neurobehavioral Therapy']
  },
  {
    title: 'Life Coaching & Motivation',
    description: 'Personal growth programs to build confidence, overcome self-doubt, and achieve emotional balance.',
    highlights: ['Goal Setting & Mindset Training', 'Positive Psychology Tools', 'Performance Enhancement']
  },
  {
    title: 'Sexual Wellness',
    description: 'Confidential guidance for sexual health, performance anxiety, and relationship intimacy concerns.',
    highlights: ['Sexual Health Counseling', 'Performance Anxiety Therapy', 'Couple Intimacy Support']
  }
];

export function ExpertiseScroller() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.25; // Reduced speed - pixels per frame (was 0.5)
    let isUserScrolling = false;
    let userScrollTimeout: NodeJS.Timeout;

    const scroll = () => {
      if (isPaused || isUserScrolling) return;

      scrollPosition += scrollSpeed;
      
      // Calculate the total scrollable width
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      
      // Reset to start when reaching the end
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
    };

    // Handle manual scrolling
    const handleScroll = () => {
      isUserScrolling = true;
      clearTimeout(userScrollTimeout);
      userScrollTimeout = setTimeout(() => {
        isUserScrolling = false;
        scrollPosition = scrollContainer.scrollLeft;
      }, 150);
    };

    // Add touch support
    const handleTouchStart = () => {
      setIsPaused(true);
    };

    const handleTouchEnd = () => {
      setIsPaused(false);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    scrollContainer.addEventListener('touchstart', handleTouchStart);
    scrollContainer.addEventListener('touchend', handleTouchEnd);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start scrolling
    intervalRef.current = setInterval(scroll, 30); // Update every 30ms for smooth scrolling

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(userScrollTimeout);
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPaused]);

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: '#FFFDBD' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4">
            Our Expertise
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive mental healthcare services - 100% online consultations
          </p>
        </div>

        {/* Auto-scrolling container */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-6 scrollbar-hide touch-pan-x"
            style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex gap-4 sm:gap-6 px-2 sm:px-4" style={{ width: 'max-content' }}>
              {/* Duplicate cards for seamless loop */}
              {[...expertiseData, ...expertiseData].map((item, index) => {
                return (
                  <div
                    key={index}
                    className="bg-[#096b17] rounded-2xl p-7 shadow-lg hover:shadow-2xl transition-all duration-500 group w-80 flex-shrink-0 cursor-pointer hover:scale-105"
                  >
                    <h4 className="text-2xl text-white mb-4">{item.title}</h4>
                    
                    <p className="text-white/90 mb-5 leading-relaxed text-sm">
                      {item.description}
                    </p>
                    
                    <div className="space-y-1.5">
                      <p className="text-xs text-white/70 uppercase tracking-wide mb-3">Highlights:</p>
                      <ul className="space-y-2.5">
                        {item.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-white text-sm">
                            <CheckCircle className="h-4 w-4 text-[#64CB81] flex-shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            <span className="hidden sm:inline">Hover over the cards to pause auto-scroll</span>
            <span className="sm:hidden">Touch and drag to scroll manually</span>
          </p>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
