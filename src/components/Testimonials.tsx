import React from "react";
import { Star, Quote } from "lucide-react";

type Testimonial = {
  id: number;
  quote: string;
  name: string;
  title: string;
};

const CURAGO_GREEN = "#096b17";

/** ─────────────────────────────────────────────────────────────
 *  Row data: Testimonials from Indian professionals
 *  ────────────────────────────────────────────────────────────*/
const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "Working 12-hour days in banking was breaking me mentally. CuraGo's doctor understood the pressure and gave me practical tools to handle stress. I sleep better now and don't dread Mondays anymore.",
    name: "Arjun Singh",
    title: "34, Investment Banker (Mumbai)",
  },
  {
    id: 2,
    quote:
      "As a working mother, I was juggling too much. CuraGo sessions helped me set boundaries and find time for myself. The doctor's advice was so relatable to Indian family dynamics.",
    name: "Deepika Agarwal",
    title: "31, Marketing Manager (Pune)",
  },
  {
    id: 3,
    quote:
      "Job hunting after layoffs was crushing my confidence. My CuraGo therapist helped me rebuild self-worth and tackle interviews with clarity. Got placed within 2 months!",
    name: "Vikas Gupta",
    title: "29, Business Analyst (Hyderabad)",
  },
  {
    id: 4,
    quote:
      "Teaching during COVID while managing home felt impossible. CuraGo's counselor gave me coping strategies that actually work with kids. I'm calmer and my students notice the difference.",
    name: "Sunita Rao",
    title: "38, School Teacher (Bangalore)",
  },
  {
    id: 5,
    quote:
      "Long shifts at the hospital plus family expectations were overwhelming. CuraGo's psychiatrist helped me manage both professional burnout and personal stress. Finally feeling balanced.",
    name: "Dr. Ramesh Kumar",
    title: "42, Physician (AIIMS Delhi)",
  },
  {
    id: 6,
    quote:
      "Running my startup was consuming every waking moment. CuraGo's therapy sessions taught me to prioritize mental health alongside business goals. My team says I'm less stressed now.",
    name: "Nisha Jindal",
    title: "33, Startup Founder (Gurgaon)",
  },
  {
    id: 7,
    quote:
      "CA exams and work pressure had me anxious all the time. CuraGo's counselor helped me develop study strategies and manage exam stress. Cleared CA Final on first attempt!",
    name: "Abhishek Jain",
    title: "26, Chartered Accountant (Delhi)",
  },
  {
    id: 8,
    quote:
      "Marriage issues plus work deadlines had me spiraling. The therapist at CuraGo helped me communicate better at home and set realistic expectations at work. Relationship is much stronger now.",
    name: "Pooja Mehta",
    title: "30, HR Manager (Chennai)",
  },
  {
    id: 9,
    quote:
      "IIT pressure and placement stress were too much to handle alone. CuraGo's counselor understood academic anxiety and helped me build confidence. Now working at Microsoft!",
    name: "Karthik Iyer",
    title: "23, Software Engineer (IIT Madras)",
  },
  {
    id: 10,
    quote:
      "Managing a team of 50+ while dealing with personal loss was impossible. CuraGo's psychiatrist helped me grieve healthily and lead effectively. My team's performance improved too.",
    name: "Shreya Mishra",
    title: "37, Operations Head (Kolkata)",
  },
  {
    id: 11,
    quote:
      "Night shifts in IT support plus family responsibilities were draining me. CuraGo's flexible timings and practical advice helped me find work-life balance. Sleep quality improved dramatically.",
    name: "Rajesh Patel",
    title: "35, IT Support Manager (Ahmedabad)",
  },
  {
    id: 12,
    quote:
      "Being a single mother in consulting was overwhelming. CuraGo's therapist helped me manage guilt and stress while advancing my career. Got promoted to Senior Consultant!",
    name: "Anita Reddy",
    title: "32, Management Consultant (Bangalore)",
  }
];

// Split into two rows (helps balance)
const testimonialsRowA = testimonials.slice(0, 6);
const testimonialsRowB = testimonials.slice(6);

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="w-[85vw] sm:w-[320px] md:w-[360px] lg:w-[380px] flex-shrink-0">
      <div className="h-full rounded-2xl bg-white ring-1 ring-black/5 shadow-md hover:shadow-lg transition p-5 sm:p-6 md:p-7">
        <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
        <p
          className="mt-3 sm:mt-4 text-gray-800 text-sm sm:text-base leading-relaxed whitespace-normal break-words"
          style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
        >
          “{t.quote}”
        </p>
        <div className="mt-5 sm:mt-6">
          <div>
            <p className="font-medium text-gray-900 text-sm sm:text-base">{t.name}</p>
            <p className="text-xs sm:text-sm text-gray-500">{t.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  speed = 36, // slower default
  direction = "left",
}: {
  items: Testimonial[];
  speed?: number; // seconds for one loop
  direction?: "left" | "right";
}) {
  return (
    <div className="marquee overflow-hidden relative">
      <div
        className={`marquee-track ${
          direction === "left" ? "marquee-anim-left" : "marquee-anim-right"
        }`}
        style={{ ["--marquee-duration" as any]: `${speed}s` }}
      >
        {[...items, ...items].map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsMarquee() {
  return (
    <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
      <div
        className="mx-auto max-w-7xl rounded-[24px] bg-white/95 ring-1 ring-black/5 p-5 sm:p-8 md:p-10 relative overflow-hidden"
        style={{ boxShadow: "0 30px 80px -40px rgba(0,0,0,0.25)" }}
      >
        {/* Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs sm:text-sm shadow">
            <span
              className="flex items-center justify-center h-5 w-5 rounded-full"
              style={{ background: CURAGO_GREEN, boxShadow: "0 0 4px rgba(0,0,0,0.3)" }}
            >
              <Star className="h-3.5 w-3.5 text-white" fill="white" strokeWidth={0} />
            </span>
            <span className="relative top-[0.5px]">Rated 4.8/5 by 10k+ users</span>
          </span>
        </div>

        {/* Header */}
        <div className="text-center mt-6 sm:mt-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900">
            Words of praise for CuraGo
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base md:text-lg">
            Real stories of better sleep, calmer days, and healthier routines.
          </p>
        </div>

        {/* Rows */}
        <div className="mt-10 sm:mt-14 space-y-6 sm:space-y-8">
          {/* Slightly different speeds; both slower than before */}
          <MarqueeRow items={testimonialsRowA} speed={36} direction="right" />
          <MarqueeRow items={testimonialsRowB} speed={40} direction="left" />
        </div>

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* Marquee + mobile wrapping fixes */}
      <style>
        {`
          .marquee-track {
            display: flex;
            width: max-content;
            gap: 1.5rem;
            will-change: transform;
          }
          /* Ensure NO nowrap inside cards (fix for single-line text) */
          .marquee-track, .marquee-track * {
            white-space: normal !important;
          }

          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-anim-left {
            animation: marquee-left var(--marquee-duration, 36s) linear infinite;
          }
          .marquee-anim-right {
            animation: marquee-right var(--marquee-duration, 36s) linear infinite;
          }
          .marquee:hover .marquee-anim-left,
          .marquee:hover .marquee-anim-right {
            animation-play-state: paused;
          }

          @media (max-width: 640px) {
            .marquee-track { gap: 1rem; }
            /* Even slower on phones for readability */
            .marquee-anim-left,
            .marquee-anim-right {
              animation-duration: calc(var(--marquee-duration, 36s) * 1.4);
            }
            /* No pause-on-hover on touch */
            .marquee:hover .marquee-anim-left,
            .marquee:hover .marquee-anim-right {
              animation-play-state: running;
            }
          }
        `}
      </style>
    </section>
  );
}
